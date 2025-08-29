package redisstore

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	clusterv3 "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	endpointv3 "github.com/envoyproxy/go-control-plane/envoy/config/endpoint/v3"
	listenerv3 "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	tlsv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/transport_sockets/tls/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	resourcev3 "github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	xdshelpers "github.com/kaasops/envoy-xds-controller/internal/xds/cache"
	"github.com/redis/go-redis/v9"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

const (
	defaultNamespace = "xds"
	defaultVersion   = "1"

	fieldVersion   = "version"
	fieldClusters  = "clusters"
	fieldRoutes    = "routes"
	fieldListeners = "listeners"
	fieldEndpoints = "endpoints"
	fieldSecrets   = "secrets"
	fieldMetadata  = "metadata"
)

// Redis key helpers
func (c *Client) nodesKey() string { return fmt.Sprintf("%s:nodes", c.ns) }
func (c *Client) snapshotKey(nodeID string) string {
	return fmt.Sprintf("%s:snapshot:%s", c.ns, nodeID)
}

// Options holds configuration for Redis connection and key namespace.
type Options struct {
	Addr      string
	Password  string
	DB        int
	Namespace string
	Timeout   time.Duration
}

// Client provides methods to load/save XDS snapshots in Redis.
type Client struct {
	rdb *redis.Client
	ns  string
	to  time.Duration
}

// New creates a new Client using provided options.
func New(opts Options) *Client {
	rdb := redis.NewClient(&redis.Options{Addr: opts.Addr, Password: opts.Password, DB: opts.DB})
	timeout := opts.Timeout
	if timeout == 0 {
		timeout = 2 * time.Second
	}
	ns := opts.Namespace
	if ns == "" {
		ns = defaultNamespace
	}
	return &Client{rdb: rdb, ns: ns, to: timeout}
}

// NewFromEnv creates a new Client using environment variables.
// Env vars: REDIS_ADDR, REDIS_PASSWORD, REDIS_DB, XDS_REDIS_NS, XDS_REDIS_TIMEOUT_MS
func NewFromEnv() *Client {
	addr := getenvDefault("REDIS_ADDR", "127.0.0.1:6379")
	password := os.Getenv("REDIS_PASSWORD")
	db := getenvIntDefault("REDIS_DB", 0)
	ns := getenvDefault("XDS_REDIS_NS", defaultNamespace)
	timeout := time.Duration(getenvIntDefault("XDS_REDIS_TIMEOUT_MS", 2000)) * time.Millisecond
	return New(Options{Addr: addr, Password: password, DB: db, Namespace: ns, Timeout: timeout})
}

// LoadSnapshots loads all node snapshots from Redis according to the documented schema.
func (c *Client) LoadSnapshots(ctx context.Context) (map[string]*cachev3.Snapshot, error) {
	ctx, cancel := c.withTimeout(ctx)
	defer cancel()

	result := make(map[string]*cachev3.Snapshot)

	nodesKey := c.nodesKey()
	nodes, err := c.rdb.SMembers(ctx, nodesKey).Result()
	if err != nil {
		return result, fmt.Errorf("redis: read nodes from %s: %w", nodesKey, err)
	}
	if len(nodes) == 0 {
		return result, nil
	}

	for _, nodeID := range nodes {
		hashKey := c.snapshotKey(nodeID)
		fields, err := c.rdb.HGetAll(ctx, hashKey).Result()
		if err != nil {
			// skip broken node
			continue
		}
		if len(fields) == 0 {
			continue
		}

		version := fields[fieldVersion]
		if version == "" {
			version = defaultVersion
		}

		clusters, err := decodeClusters(fields[fieldClusters])
		if err != nil {
			continue
		}
		routes, err := decodeRoutes(fields[fieldRoutes])
		if err != nil {
			continue
		}
		listeners, err := decodeListeners(fields[fieldListeners])
		if err != nil {
			continue
		}
		endpoints, err := decodeEndpoints(fields[fieldEndpoints])
		if err != nil {
			continue
		}
		secrets, err := decodeSecrets(fields[fieldSecrets])
		if err != nil {
			continue
		}

		res := map[resourcev3.Type][]types.Resource{
			resourcev3.ClusterType:  clusters,
			resourcev3.RouteType:    routes,
			resourcev3.ListenerType: listeners,
		}
		if len(endpoints) > 0 {
			res[resourcev3.EndpointType] = endpoints
		}
		if len(secrets) > 0 {
			res[resourcev3.SecretType] = secrets
		}
		snap, err := cachev3.NewSnapshot(version, res)
		if err != nil {
			continue
		}
		result[nodeID] = snap
	}

	return result, nil
}

// SaveSnapshot serializes given snapshot and writes it to Redis.
// It stores: version (single string), clusters/routes/listeners/endpoints as Protobuf JSON arrays.
// Also ensures nodeID is present in <ns>:nodes set.
// Additionally, it stores metadata (JSON object) under the "metadata" field with at least:
// - added_at: RFC3339 UTC timestamp
// - hash: snapshot hash calculated via internal/xds/cache/helpers.GetSnapshotHash
func (c *Client) SaveSnapshot(ctx context.Context, nodeID string, snapshot cachev3.ResourceSnapshot) error {
	return c.saveSnapshotInternal(ctx, nodeID, snapshot, nil)
}

// SaveSnapshotWithMetadata does the same as SaveSnapshot but also accepts custom user metadata
// (map[string]string) which will be merged into the stored metadata object.
func (c *Client) SaveSnapshotWithMetadata(ctx context.Context, nodeID string, snapshot cachev3.ResourceSnapshot, userMeta map[string]string) error {
	return c.saveSnapshotInternal(ctx, nodeID, snapshot, userMeta)
}

func (c *Client) saveSnapshotInternal(ctx context.Context, nodeID string, snapshot cachev3.ResourceSnapshot, userMeta map[string]string) error {
	if nodeID == "" || snapshot == nil {
		return fmt.Errorf("invalid input: nodeID and snapshot are required")
	}
	ctx, cancel := c.withTimeout(ctx)
	defer cancel()

	version := firstNonEmpty(
		snapshot.GetVersion(resourcev3.ClusterType),
		snapshot.GetVersion(resourcev3.RouteType),
		snapshot.GetVersion(resourcev3.ListenerType),
		snapshot.GetVersion(resourcev3.EndpointType),
		snapshot.GetVersion(resourcev3.SecretType),
	)
	if version == "" {
		version = defaultVersion
	}

	clustersJSON, err := encodeResourcesJSON(snapshot.GetResources(resourcev3.ClusterType))
	if err != nil {
		return fmt.Errorf("encode clusters: %w", err)
	}
	routesJSON, err := encodeResourcesJSON(snapshot.GetResources(resourcev3.RouteType))
	if err != nil {
		return fmt.Errorf("encode routes: %w", err)
	}
	listenersJSON, err := encodeResourcesJSON(snapshot.GetResources(resourcev3.ListenerType))
	if err != nil {
		return fmt.Errorf("encode listeners: %w", err)
	}
	endpointsJSON, err := encodeResourcesJSON(snapshot.GetResources(resourcev3.EndpointType))
	if err != nil {
		return fmt.Errorf("encode endpoints: %w", err)
	}
	secretsJSON, err := encodeResourcesJSON(snapshot.GetResources(resourcev3.SecretType))
	if err != nil {
		return fmt.Errorf("encode secrets: %w", err)
	}

	// Prepare metadata: added_at + hash + user-provided
	meta := map[string]string{}
	for k, v := range userMeta {
		// copy user meta
		meta[k] = v
	}
	meta["added_at"] = time.Now().UTC().Format(time.RFC3339)

	// Compute snapshot hash using helper
	var snapForHash *cachev3.Snapshot
	if s, ok := snapshot.(*cachev3.Snapshot); ok {
		snapForHash = s
	} else {
		// Reconstruct a *cache.Snapshot with the chosen single version for hashing
		res := map[resourcev3.Type][]types.Resource{}
		if m := snapshot.GetResources(resourcev3.ClusterType); len(m) > 0 {
			arr := make([]types.Resource, 0, len(m))
			for _, r := range m {
				arr = append(arr, r)
			}
			res[resourcev3.ClusterType] = arr
		}
		if m := snapshot.GetResources(resourcev3.RouteType); len(m) > 0 {
			arr := make([]types.Resource, 0, len(m))
			for _, r := range m {
				arr = append(arr, r)
			}
			res[resourcev3.RouteType] = arr
		}
		if m := snapshot.GetResources(resourcev3.ListenerType); len(m) > 0 {
			arr := make([]types.Resource, 0, len(m))
			for _, r := range m {
				arr = append(arr, r)
			}
			res[resourcev3.ListenerType] = arr
		}
		if m := snapshot.GetResources(resourcev3.EndpointType); len(m) > 0 {
			arr := make([]types.Resource, 0, len(m))
			for _, r := range m {
				arr = append(arr, r)
			}
			res[resourcev3.EndpointType] = arr
		}
		if m := snapshot.GetResources(resourcev3.SecretType); len(m) > 0 {
			arr := make([]types.Resource, 0, len(m))
			for _, r := range m {
				arr = append(arr, r)
			}
			res[resourcev3.SecretType] = arr
		}
		if s, err := cachev3.NewSnapshot(version, res); err == nil {
			snapForHash = s
		}
	}
	if snapForHash != nil {
		if h, err := xdshelpers.GetSnapshotHash(snapForHash); err == nil && h != "" {
			meta["hash"] = h
		}
	}

	metaJSON := "{}"
	if b, err := json.Marshal(meta); err == nil {
		metaJSON = string(b)
	}

	hashKey := c.snapshotKey(nodeID)
	pipe := c.rdb.Pipeline()
	// Always set version and arrays (arrays can be [] or omitted if empty, but writing [] is fine)
	pipe.HSet(ctx, hashKey, map[string]interface{}{
		fieldVersion:   version,
		fieldClusters:  clustersJSON,
		fieldRoutes:    routesJSON,
		fieldListeners: listenersJSON,
		fieldEndpoints: endpointsJSON,
		fieldSecrets:   secretsJSON,
		fieldMetadata:  metaJSON,
	})
	// add node to set
	pipe.SAdd(ctx, c.nodesKey(), nodeID)

	if _, err := pipe.Exec(ctx); err != nil {
		return fmt.Errorf("redis pipeline exec: %w", err)
	}
	return nil
}

// helpers

func (c *Client) withTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if deadline, ok := ctx.Deadline(); ok && time.Until(deadline) > 0 {
		// respect existing deadline
		return context.WithCancel(ctx)
	}
	return context.WithTimeout(ctx, c.to)
}

func getenvDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getenvIntDefault(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if iv, err := strconv.Atoi(v); err == nil {
			return iv
		}
	}
	return def
}

// decode helpers (Proto JSON -> resources)

// decodeResourceArray decodes a JSON array of protobuf messages into []types.Resource.
// name is used only for contextual error messages.
func decodeResourceArray(raw string, newMsg func() proto.Message, name string) ([]types.Resource, error) {
	if raw == "" {
		return nil, nil
	}
	var raws []json.RawMessage
	if err := json.Unmarshal([]byte(raw), &raws); err != nil {
		return nil, fmt.Errorf("json unmarshal %s: %w", name, err)
	}
	res := make([]types.Resource, 0, len(raws))
	opts := protojson.UnmarshalOptions{DiscardUnknown: true}
	for _, r := range raws {
		m := newMsg()
		if err := opts.Unmarshal(r, m); err != nil {
			return nil, fmt.Errorf("protojson %s: %w", name, err)
		}
		res = append(res, m)
	}
	return res, nil
}

func decodeClusters(raw string) ([]types.Resource, error) {
	return decodeResourceArray(raw, func() proto.Message { return &clusterv3.Cluster{} }, "clusters")
}

func decodeRoutes(raw string) ([]types.Resource, error) {
	return decodeResourceArray(raw, func() proto.Message { return &routev3.RouteConfiguration{} }, "routes")
}

func decodeListeners(raw string) ([]types.Resource, error) {
	return decodeResourceArray(raw, func() proto.Message { return &listenerv3.Listener{} }, "listeners")
}

func decodeEndpoints(raw string) ([]types.Resource, error) {
	return decodeResourceArray(raw, func() proto.Message { return &endpointv3.ClusterLoadAssignment{} }, "endpoints")
}

func decodeSecrets(raw string) ([]types.Resource, error) {
	return decodeResourceArray(raw, func() proto.Message { return &tlsv3.Secret{} }, "secrets")
}

// encode resources slice to a single JSON array string using Protobuf JSON format
func encodeResourcesJSON(resources map[string]types.Resource) (string, error) {
	if len(resources) == 0 {
		return "[]", nil
	}
	msgs := make([]json.RawMessage, 0, len(resources))
	opts := protojson.MarshalOptions{UseProtoNames: true}
	for _, r := range resources {
		pm, ok := r.(proto.Message)
		if !ok {
			return "", fmt.Errorf("resource does not implement proto.Message")
		}
		b, err := opts.Marshal(pm)
		if err != nil {
			return "", err
		}
		msgs = append(msgs, b)
	}
	out, err := json.Marshal(msgs)
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func firstNonEmpty(vs ...string) string {
	for _, v := range vs {
		if v != "" {
			return v
		}
	}
	return ""
}

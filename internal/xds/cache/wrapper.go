package cache

import (
	"context"
	"fmt"
	"sync"

	"google.golang.org/protobuf/proto"

	clusterv3 "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	listenerv3 "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	tlsv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/transport_sockets/tls/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	resourcev3 "github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	streamv3 "github.com/envoyproxy/go-control-plane/pkg/server/stream/v3"
	"golang.org/x/exp/maps"
)

type SnapshotCache struct {
	cache.SnapshotCache
	mu      sync.RWMutex
	hooksMu sync.RWMutex
	hooks   []Hooks
	nodeIDs map[string]struct{}
}

// Hooks defines optional callbacks invoked before and/or after each method of cache.SnapshotCache.
// All hooks are optional; if nil, they are skipped.
// Hooks must return quickly and must be concurrency-safe; they may be called from multiple goroutines.
type Hooks struct {
	// SetSnapshot hooks
	BeforeSetSnapshot func(ctx context.Context, node string, snapshot cache.ResourceSnapshot)
	AfterSetSnapshot  func(ctx context.Context, node string, snapshot cache.ResourceSnapshot, err error)

	// GetSnapshot hooks
	BeforeGetSnapshot func(node string)
	AfterGetSnapshot  func(node string, snapshot cache.ResourceSnapshot, err error)

	// ClearSnapshot hooks
	BeforeClearSnapshot func(node string)
	AfterClearSnapshot  func(node string)

	// CreateWatch hooks
	BeforeCreateWatch func(req *cache.Request, state streamv3.StreamState)
	AfterCreateWatch  func(req *cache.Request, state streamv3.StreamState, cancel func())

	// CreateDeltaWatch hooks
	BeforeCreateDeltaWatch func(req *cache.DeltaRequest, state streamv3.StreamState)
	AfterCreateDeltaWatch  func(req *cache.DeltaRequest, state streamv3.StreamState, cancel func())

	// Fetch hooks
	BeforeFetch func(ctx context.Context, req *cache.Request)
	AfterFetch  func(ctx context.Context, req *cache.Request, resp cache.Response, err error)

	// GetStatusInfo hooks
	BeforeGetStatusInfo func(node string)
	AfterGetStatusInfo  func(node string, info cache.StatusInfo)

	// GetStatusKeys hooks
	BeforeGetStatusKeys func()
	AfterGetStatusKeys  func(keys []string)
}

// RegisterHooks registers a new set of hooks to be called for subsequent operations.
func (c *SnapshotCache) RegisterHooks(h Hooks) {
	c.hooksMu.Lock()
	defer c.hooksMu.Unlock()
	c.hooks = append(c.hooks, h)
}

func (c *SnapshotCache) getHooks() []Hooks {
	c.hooksMu.RLock()
	defer c.hooksMu.RUnlock()
	// copy slice to avoid holding lock during hook invocation
	res := make([]Hooks, len(c.hooks))
	copy(res, c.hooks)
	return res
}

var _ cache.SnapshotCache = (*SnapshotCache)(nil)

func NewSnapshotCache() *SnapshotCache {
	return &SnapshotCache{
		SnapshotCache: cache.NewSnapshotCache(false, cache.IDHash{}, nil),
		nodeIDs:       make(map[string]struct{}),
	}
}

func (c *SnapshotCache) SetSnapshot(ctx context.Context, nodeID string, snapshot cache.ResourceSnapshot) error {
	// before hooks
	for _, h := range c.getHooks() {
		if h.BeforeSetSnapshot != nil {
			h.BeforeSetSnapshot(ctx, nodeID, snapshot)
		}
	}

	c.mu.Lock()
	c.nodeIDs[nodeID] = struct{}{}
	c.mu.Unlock()

	if err := c.validateCache(snapshot); err != nil {
		for _, h := range c.getHooks() {
			if h.AfterSetSnapshot != nil {
				h.AfterSetSnapshot(ctx, nodeID, snapshot, fmt.Errorf("snapshot is invalid: %w", err))
			}
		}
		return fmt.Errorf("snapshot is invalid: %w", err)
	}
	err := c.SnapshotCache.SetSnapshot(ctx, nodeID, snapshot)
	for _, h := range c.getHooks() {
		if h.AfterSetSnapshot != nil {
			h.AfterSetSnapshot(ctx, nodeID, snapshot, err)
		}
	}
	return err
}

func (c *SnapshotCache) GetSnapshot(nodeID string) (cache.ResourceSnapshot, error) {
	for _, h := range c.getHooks() {
		if h.BeforeGetSnapshot != nil {
			h.BeforeGetSnapshot(nodeID)
		}
	}
	c.mu.RLock()
	s, err := c.SnapshotCache.GetSnapshot(nodeID)
	c.mu.RUnlock()
	for _, h := range c.getHooks() {
		if h.AfterGetSnapshot != nil {
			h.AfterGetSnapshot(nodeID, s, err)
		}
	}
	return s, err
}

func (c *SnapshotCache) ClearSnapshot(nodeID string) {
	for _, h := range c.getHooks() {
		if h.BeforeClearSnapshot != nil {
			h.BeforeClearSnapshot(nodeID)
		}
	}
	c.mu.Lock()
	delete(c.nodeIDs, nodeID)
	c.mu.Unlock()
	c.SnapshotCache.ClearSnapshot(nodeID)
	for _, h := range c.getHooks() {
		if h.AfterClearSnapshot != nil {
			h.AfterClearSnapshot(nodeID)
		}
	}
}

func (c *SnapshotCache) CreateWatch(req *cache.Request, state streamv3.StreamState, value chan cache.Response) func() {
	for _, h := range c.getHooks() {
		if h.BeforeCreateWatch != nil {
			h.BeforeCreateWatch(req, state)
		}
	}
	cancel := c.SnapshotCache.CreateWatch(req, state, value)
	for _, h := range c.getHooks() {
		if h.AfterCreateWatch != nil {
			h.AfterCreateWatch(req, state, cancel)
		}
	}
	return cancel
}

func (c *SnapshotCache) CreateDeltaWatch(req *cache.DeltaRequest, state streamv3.StreamState, value chan cache.DeltaResponse) func() {
	for _, h := range c.getHooks() {
		if h.BeforeCreateDeltaWatch != nil {
			h.BeforeCreateDeltaWatch(req, state)
		}
	}
	cancel := c.SnapshotCache.CreateDeltaWatch(req, state, value)
	for _, h := range c.getHooks() {
		if h.AfterCreateDeltaWatch != nil {
			h.AfterCreateDeltaWatch(req, state, cancel)
		}
	}
	return cancel
}

func (c *SnapshotCache) Fetch(ctx context.Context, req *cache.Request) (cache.Response, error) {
	for _, h := range c.getHooks() {
		if h.BeforeFetch != nil {
			h.BeforeFetch(ctx, req)
		}
	}
	resp, err := c.SnapshotCache.Fetch(ctx, req)
	for _, h := range c.getHooks() {
		if h.AfterFetch != nil {
			h.AfterFetch(ctx, req, resp, err)
		}
	}
	return resp, err
}

func (c *SnapshotCache) GetStatusInfo(node string) cache.StatusInfo {
	for _, h := range c.getHooks() {
		if h.BeforeGetStatusInfo != nil {
			h.BeforeGetStatusInfo(node)
		}
	}
	info := c.SnapshotCache.GetStatusInfo(node)
	for _, h := range c.getHooks() {
		if h.AfterGetStatusInfo != nil {
			h.AfterGetStatusInfo(node, info)
		}
	}
	return info
}

func (c *SnapshotCache) GetStatusKeys() []string {
	for _, h := range c.getHooks() {
		if h.BeforeGetStatusKeys != nil {
			h.BeforeGetStatusKeys()
		}
	}
	keys := c.SnapshotCache.GetStatusKeys()
	for _, h := range c.getHooks() {
		if h.AfterGetStatusKeys != nil {
			h.AfterGetStatusKeys(keys)
		}
	}
	return keys
}

func (c *SnapshotCache) GetNodeIDsAsMap() map[string]struct{} {
	res := make(map[string]struct{}, len(c.nodeIDs))
	c.mu.RLock()
	maps.Copy(res, c.nodeIDs)
	c.mu.RUnlock()
	return res
}

func (c *SnapshotCache) GetNodeIDs() []string {
	res := make([]string, 0, len(c.nodeIDs))
	c.mu.RLock()
	defer c.mu.RUnlock()
	for nodeID := range c.nodeIDs {
		res = append(res, nodeID)
	}
	return res
}

func (c *SnapshotCache) GetClusters(nodeID string) ([]*clusterv3.Cluster, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	snapshot, err := c.SnapshotCache.GetSnapshot(nodeID)
	if err != nil {
		return nil, err
	}
	data := snapshot.GetResources(resourcev3.ClusterType)
	clusters := make([]*clusterv3.Cluster, 0, len(data))
	for _, cluster := range data {
		clusters = append(clusters, cluster.(*clusterv3.Cluster))
	}
	return clusters, nil
}

func (c *SnapshotCache) GetSecrets(nodeID string) ([]*tlsv3.Secret, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	snapshot, err := c.SnapshotCache.GetSnapshot(nodeID)
	if err != nil {
		return nil, err
	}
	data := snapshot.GetResources(resourcev3.SecretType)
	secrets := make([]*tlsv3.Secret, 0, len(data))
	for _, secret := range data {
		tlsSecret := secret.(*tlsv3.Secret)
		copySecret := proto.Clone(tlsSecret).(*tlsv3.Secret)
		secrets = append(secrets, copySecret)
	}
	return secrets, nil
}

func (c *SnapshotCache) GetVersions(nodeID string) (map[string]string, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	snapshot, err := c.SnapshotCache.GetSnapshot(nodeID)
	if err != nil {
		return nil, err
	}
	m := make(map[string]string, 5)
	for typ, typeURL := range map[string]resourcev3.Type{
		"clusters":  resourcev3.ClusterType,
		"routes":    resourcev3.RouteType,
		"listeners": resourcev3.ListenerType,
		"secrets":   resourcev3.SecretType,
	} {
		m[typ] = snapshot.GetVersion(typeURL)
	}
	return m, nil
}

func (c *SnapshotCache) GetRouteConfigurations(nodeID string) ([]*routev3.RouteConfiguration, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	snapshot, err := c.SnapshotCache.GetSnapshot(nodeID)
	if err != nil {
		return nil, err
	}
	data := snapshot.GetResources(resourcev3.RouteType)
	rConfigs := make([]*routev3.RouteConfiguration, 0, len(data))
	for _, rc := range data {
		rConfigs = append(rConfigs, rc.(*routev3.RouteConfiguration))
	}
	return rConfigs, nil
}

func (c *SnapshotCache) GetListeners(nodeID string) ([]*listenerv3.Listener, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	snapshot, err := c.SnapshotCache.GetSnapshot(nodeID)
	if err != nil {
		return nil, err
	}
	return getListenersFromSnapshot(snapshot), nil
}

func (c *SnapshotCache) validateCache(snapshot cache.ResourceSnapshot) error {
	listeners := getListenersFromSnapshot(snapshot)
	addressListener := make(map[string]string, len(listeners))
	for _, listener := range listeners {
		host := listener.GetAddress().GetSocketAddress().GetAddress()
		port := listener.GetAddress().GetSocketAddress().GetPortValue()
		hostPort := fmt.Sprintf("%s:%d", host, port)
		if existListener, ok := addressListener[hostPort]; ok {
			return fmt.Errorf("'%s' has duplicate address '%s' as existing listener '%s'",
				listener.GetName(),
				hostPort,
				existListener,
			)
		}
		addressListener[hostPort] = listener.GetName()
	}
	return nil
}

func getListenersFromSnapshot(snapshot cache.ResourceSnapshot) []*listenerv3.Listener {
	data := snapshot.GetResources(resourcev3.ListenerType)
	listeners := make([]*listenerv3.Listener, 0, len(data))
	for _, listener := range data {
		listeners = append(listeners, listener.(*listenerv3.Listener))
	}
	return listeners
}

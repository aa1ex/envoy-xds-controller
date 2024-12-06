package updater

import (
	"context"
	"errors"
	"fmt"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/helpers"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	wrapped "github.com/kaasops/envoy-xds-controller/internal/xds/cache"
	"github.com/kaasops/envoy-xds-controller/internal/xds/resbuilder"
	"go.uber.org/multierr"
	"golang.org/x/exp/maps"
	"google.golang.org/protobuf/proto"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"strconv"
	"sync"
)

type CacheUpdater struct {
	mx            sync.RWMutex
	snapshotCache *wrapped.SnapshotCache
	store         *store.Store
	usedSecrets   map[helpers.NamespacedName]helpers.NamespacedName
}

func NewCacheUpdater(wsc *wrapped.SnapshotCache) *CacheUpdater {
	return &CacheUpdater{snapshotCache: wsc, usedSecrets: make(map[helpers.NamespacedName]helpers.NamespacedName), store: store.New()}
}

func (c *CacheUpdater) Init(ctx context.Context, cl client.Client) error {
	c.mx.Lock()
	defer c.mx.Unlock()

	if err := c.store.Fill(ctx, cl); err != nil {
		return fmt.Errorf("failed to fill store: %w", err)
	}

	return c.buildCache(ctx)
}

func (c *CacheUpdater) UpdateCache(ctx context.Context, cl client.Client) error {
	c.mx.Lock()
	defer c.mx.Unlock()

	if err := c.store.Fill(ctx, cl); err != nil { // TODO: remove
		return fmt.Errorf("failed to fill store: %w", err)
	}
	return c.buildCache(ctx)
}

func (c *CacheUpdater) buildCache(ctx context.Context) error {
	errs := make([]error, 0)
	tmp := make(map[string]map[resource.Type][]types.Resource)

	// ---------------------------------------------

	usedSecrets := make(map[helpers.NamespacedName]helpers.NamespacedName)

	nodeIDsForCleanup := c.snapshotCache.GetNodeIDsAsMap()
	var commonVirtualSerices []*v1alpha1.VirtualService

	for _, vs := range c.store.VirtualServices {
		vsNodeIDs := vs.GetNodeIDs()
		if isCommonVirtualService(vsNodeIDs) {
			commonVirtualSerices = append(commonVirtualSerices, vs)
			continue
		}

		vsRes, vsUsedSecrets, err := resbuilder.BuildResources(vs, c.store)
		if err != nil {
			errs = append(errs, err)
			continue
		}

		for _, secret := range vsUsedSecrets {
			usedSecrets[secret] = helpers.NamespacedName{Name: vs.Name, Namespace: vs.Namespace}
		}

		for _, nodeID := range vsNodeIDs {
			resources, ok := tmp[nodeID]
			if ok {
				resources[resource.ListenerType] = append(resources[resource.ListenerType], vsRes.Listener)
				resources[resource.RouteType] = append(resources[resource.RouteType], vsRes.RouteConfig)
				for _, cl := range vsRes.Clusters {
					resources[resource.ClusterType] = append(resources[resource.ClusterType], cl)
				}
				for _, secret := range vsRes.Secrets {
					resources[resource.SecretType] = append(resources[resource.SecretType], secret)
				}
			} else {
				tmp[nodeID] = map[resource.Type][]types.Resource{
					resource.ListenerType: {vsRes.Listener},
					resource.RouteType:    {vsRes.RouteConfig},
				}
				if len(vsRes.Clusters) > 0 {
					tmp[nodeID][resource.ClusterType] = make([]types.Resource, len(vsRes.Clusters))
					for i, cl := range vsRes.Clusters {
						tmp[nodeID][resource.ClusterType][i] = cl
					}
				}
				if len(vsRes.Secrets) > 0 {
					tmp[nodeID][resource.SecretType] = make([]types.Resource, len(vsRes.Secrets))
					for i, secret := range vsRes.Secrets {
						tmp[nodeID][resource.SecretType][i] = secret
					}
				}
			}
		}
	}

	if len(commonVirtualSerices) > 0 {
		for _, vs := range commonVirtualSerices {
			vsRes, vsUsedSecrets, err := resbuilder.BuildResources(vs, c.store)
			if err != nil {
				errs = append(errs, err)
				continue
			}
			for _, secret := range vsUsedSecrets {
				usedSecrets[secret] = helpers.NamespacedName{Name: vs.Name, Namespace: vs.Namespace}
			}
			for _, resources := range tmp {
				resources[resource.ListenerType] = append(resources[resource.ListenerType], vsRes.Listener)
				resources[resource.RouteType] = append(resources[resource.RouteType], vsRes.RouteConfig)
				for _, cl := range vsRes.Clusters {
					resources[resource.ClusterType] = append(resources[resource.ClusterType], cl)
				}
				for _, secret := range vsRes.Secrets {
					resources[resource.SecretType] = append(resources[resource.SecretType], secret)
				}
			}
		}
	}

	c.usedSecrets = usedSecrets

	for nodeID, resMap := range tmp {
		var snapshot *cache.Snapshot
		var err error
		var hasChanges bool
		prevSnapshot, _ := c.snapshotCache.GetSnapshot(nodeID)
		if prevSnapshot != nil {
			snapshot, hasChanges, err = updateSnapshot(prevSnapshot, resMap)
			if err != nil {
				errs = append(errs, err)
				continue
			}
		} else {
			hasChanges = true
			snapshot, err = cache.NewSnapshot("1", resMap)
			if err != nil {
				errs = append(errs, err)
				continue
			}
		}
		if hasChanges {
			err = c.snapshotCache.SetSnapshot(ctx, nodeID, snapshot)
			if err != nil {
				errs = append(errs, err)
				continue
			}
		}
		delete(nodeIDsForCleanup, nodeID)
	}

	for nodeID := range nodeIDsForCleanup {
		c.snapshotCache.ClearSnapshot(nodeID)
	}

	if len(errs) > 0 {
		return multierr.Combine(errs...)
	}

	return nil
}

func (c *CacheUpdater) GetUsedSecrets() map[helpers.NamespacedName]helpers.NamespacedName {
	c.mx.RLock()
	defer c.mx.RUnlock()
	return maps.Clone(c.usedSecrets)
}

/////////////////////

func updateSnapshot(prevSnapshot cache.ResourceSnapshot, resources map[resource.Type][]types.Resource) (*cache.Snapshot, bool, error) {
	if prevSnapshot == nil {
		return nil, false, errors.New("snapshot is nil")
	}

	hasChanges := false

	snapshot := cache.Snapshot{}
	for typ, res := range resources {
		index := cache.GetResponseType(typ)
		if index == types.UnknownType {
			return nil, false, errors.New("unknown resource type: " + typ)
		}

		version := prevSnapshot.GetVersion(typ)
		if version == "" {
			version = "0"
		}

		if checkResourcesChanged(prevSnapshot.GetResources(typ), res) {
			hasChanges = true
			vInt, _ := strconv.Atoi(version)
			vInt++
			version = strconv.Itoa(vInt)
		}

		snapshot.Resources[index] = cache.NewResources(version, res)
	}
	return &snapshot, hasChanges, nil
}

func checkResourcesChanged(prevRes map[string]types.Resource, newRes []types.Resource) bool {
	if len(prevRes) != len(newRes) {
		return true
	}
	for _, newR := range newRes {
		if val, ok := prevRes[getName(newR)]; ok {
			if !proto.Equal(val, newR) {
				return true
			}
		} else {
			return true
		}
	}
	return false
}

func getName(msg proto.Message) string {
	msgDesc := msg.ProtoReflect().Descriptor()
	for i := 0; i < msgDesc.Fields().Len(); i++ {
		if msgDesc.Fields().Get(i).Name() == "name" {
			return msg.ProtoReflect().Get(msgDesc.Fields().Get(i)).String()
		}
	}
	return ""
}

func isCommonVirtualService(nodeIDs []string) bool {
	return len(nodeIDs) == 1 && nodeIDs[0] == "*"
}

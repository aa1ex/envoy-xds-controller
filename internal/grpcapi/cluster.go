package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/cluster/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/cluster/v1/clusterv1connect"
)

type ClusterStore struct {
	store *store.Store
	clusterv1connect.ClusterStoreServiceHandler
}

func NewClusterStore(s *store.Store) *ClusterStore {
	return &ClusterStore{
		store: s,
	}
}

func (s *ClusterStore) ListCluster(context.Context, *connect.Request[v1.ListClusterRequest]) (*connect.Response[v1.ListClusterResponse], error) {
	m := s.store.MapClusters()
	list := make([]*v1.ClusterListItem, 0, len(m))
	for _, v := range m {
		item := &v1.ClusterListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListClusterResponse{Items: list}), nil
}

package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/route/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/route/v1/routev1connect"
)

type RouteStore struct {
	store *store.Store
	routev1connect.RouteStoreServiceHandler
}

func NewRouteStore(s *store.Store) *RouteStore {
	return &RouteStore{
		store: s,
	}
}

func (s *RouteStore) ListRoute(context.Context, *connect.Request[v1.ListRouteRequest]) (*connect.Response[v1.ListRouteResponse], error) {
	m := s.store.MapRoutes()
	list := make([]*v1.RouteListItem, 0, len(m))
	for _, v := range m {
		vs := &v1.RouteListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, vs)
	}
	return connect.NewResponse(&v1.ListRouteResponse{Items: list}), nil
}

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

func (s *RouteStore) ListRoutes(ctx context.Context, req *connect.Request[v1.ListRoutesRequest]) (*connect.Response[v1.ListRoutesResponse], error) {
	m := s.store.MapRoutes()
	list := make([]*v1.RouteListItem, 0, len(m))
	authorizer := getAuthorizerFromContext(ctx)

	accessGroup := req.Msg.AccessGroup
	if accessGroup == "" {
		accessGroup = domainGeneral
	}

	for _, v := range m {
		item := &v1.RouteListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		isAllowed, err := authorizer.Authorize(accessGroup, item.Name)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			continue
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListRoutesResponse{Items: list}), nil
}

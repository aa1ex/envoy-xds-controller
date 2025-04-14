package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/http_filter/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/http_filter/v1/http_filterv1connect"
)

type HTTPFilterStore struct {
	store *store.Store
	http_filterv1connect.UnimplementedHTTPFilterStoreServiceHandler
}

func NewHTTPFilterStore(s *store.Store) *HTTPFilterStore {
	return &HTTPFilterStore{
		store: s,
	}
}

func (s *HTTPFilterStore) ListHTTPFilters(ctx context.Context, req *connect.Request[v1.ListHTTPFiltersRequest]) (*connect.Response[v1.ListHTTPFiltersResponse], error) {
	m := s.store.MapHTTPFilters()
	list := make([]*v1.HTTPFilterListItem, 0, len(m))

	authorizer := getAuthorizerFromContext(ctx)

	accessGroup := req.Msg.AccessGroup
	if accessGroup == "" {
		accessGroup = domainGeneral
	}

	for _, v := range m {
		item := &v1.HTTPFilterListItem{
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
	return connect.NewResponse(&v1.ListHTTPFiltersResponse{Items: list}), nil
}

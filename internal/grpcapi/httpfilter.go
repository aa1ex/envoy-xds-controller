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

func (s *HTTPFilterStore) ListHTTPFilter(context.Context, *connect.Request[v1.ListHTTPFilterRequest]) (*connect.Response[v1.ListHTTPFilterResponse], error) {
	m := s.store.MapHTTPFilters()
	list := make([]*v1.HTTPFilterListItem, 0, len(m))

	for _, v := range m {
		vs := &v1.HTTPFilterListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, vs)
	}
	return connect.NewResponse(&v1.ListHTTPFilterResponse{Items: list}), nil
}

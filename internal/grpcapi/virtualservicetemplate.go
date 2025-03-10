package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1/virtual_service_templatev1connect"
)

type VirtualServiceTemplateStore struct {
	store *store.Store
	virtual_service_templatev1connect.UnimplementedVirtualServiceTemplateStoreServiceHandler
}

func NewVirtualServiceTemplateStore(s *store.Store) *VirtualServiceTemplateStore {
	return &VirtualServiceTemplateStore{
		store: s,
	}
}

func (s *VirtualServiceTemplateStore) ListVirtualServiceTemplate(_ context.Context, _ *connect.Request[v1.ListVirtualServiceTemplateRequest]) (*connect.Response[v1.ListVirtualServiceTemplateResponse], error) {
	m := s.store.MapVirtualServiceTemplates()
	list := make([]*v1.VirtualServiceTemplateListItem, 0, len(m))
	for _, v := range m {
		vs := &v1.VirtualServiceTemplateListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, vs)
	}
	return connect.NewResponse(&v1.ListVirtualServiceTemplateResponse{Items: list}), nil
}

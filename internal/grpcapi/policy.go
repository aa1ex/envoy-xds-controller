package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/policy/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/policy/v1/policyv1connect"
)

type PolicyStore struct {
	store *store.Store
	policyv1connect.PolicyStoreServiceHandler
}

func NewPolicyStore(s *store.Store) *PolicyStore {
	return &PolicyStore{
		store: s,
	}
}

func (s *PolicyStore) ListPolicy(context.Context, *connect.Request[v1.ListPolicyRequest]) (*connect.Response[v1.ListPolicyResponse], error) {
	m := s.store.MapPolicies()
	list := make([]*v1.PolicyListItem, 0, len(m))
	for _, v := range m {
		item := &v1.PolicyListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListPolicyResponse{Items: list}), nil
}

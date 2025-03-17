package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/listener/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/listener/v1/listenerv1connect"
)

type ListenerStore struct {
	store *store.Store
	listenerv1connect.ListenerStoreServiceHandler
}

func NewListenerStore(s *store.Store) *ListenerStore {
	return &ListenerStore{
		store: s,
	}
}

func (s *ListenerStore) ListListener(context.Context, *connect.Request[v1.ListListenerRequest]) (*connect.Response[v1.ListListenerResponse], error) {
	m := s.store.MapListeners()
	list := make([]*v1.ListenerListItem, 0, len(m))
	for _, v := range m {
		item := &v1.ListenerListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListListenerResponse{Items: list}), nil
}

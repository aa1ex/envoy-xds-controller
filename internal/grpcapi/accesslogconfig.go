package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_log_config/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_log_config/v1/access_log_configv1connect"
)

type AccessLogConfigStore struct {
	store *store.Store
	access_log_configv1connect.AccessLogConfigStoreServiceHandler
}

func NewAccessLogConfigStore(s *store.Store) *AccessLogConfigStore {
	return &AccessLogConfigStore{
		store: s,
	}
}

func (s *AccessLogConfigStore) ListAccessLogConfig(context.Context, *connect.Request[v1.ListAccessLogConfigRequest]) (*connect.Response[v1.ListAccessLogConfigResponse], error) {
	m := s.store.MapAccessLogs()
	list := make([]*v1.AccessLogConfigListItem, 0, len(m))
	for _, v := range m {
		vs := &v1.AccessLogConfigListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		list = append(list, vs)
	}
	return connect.NewResponse(&v1.ListAccessLogConfigResponse{Items: list}), nil
}

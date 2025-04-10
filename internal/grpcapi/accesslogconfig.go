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

func (s *AccessLogConfigStore) ListAccessLogConfigs(ctx context.Context, _ *connect.Request[v1.ListAccessLogConfigsRequest]) (*connect.Response[v1.ListAccessLogConfigsResponse], error) {
	authorizer := getAuthorizerFromContext(ctx)

	m := s.store.MapAccessLogs()
	list := make([]*v1.AccessLogConfigListItem, 0, len(m))
	for _, v := range m {
		item := &v1.AccessLogConfigListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		isAllowed, err := authorizer.Authorize(domainGeneral, item.Name)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			continue
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListAccessLogConfigsResponse{Items: list}), nil
}

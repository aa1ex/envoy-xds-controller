package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_group/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_group/v1/access_groupv1connect"
)

type AccessGroupStore struct {
	accessGroups []string
	access_groupv1connect.AccessGroupStoreServiceHandler
}

func NewAccessGroupStore(accessGroups []string) *AccessGroupStore {
	return &AccessGroupStore{accessGroups: accessGroups}
}

func (s *AccessGroupStore) ListAccessGroup(ctx context.Context, _ *connect.Request[v1.ListAccessGroupRequest]) (*connect.Response[v1.ListAccessGroupResponse], error) {
	authorizer := getAuthorizerFromContext(ctx)
	availableGroups := authorizer.GetAvailableAccessGroups()
	isAllGroupAvailable := len(availableGroups) == 1 && availableGroups["*"] == true

	list := make([]*v1.AccessGroupListItem, 0, len(s.accessGroups))
	for _, v := range s.accessGroups {
		item := &v1.AccessGroupListItem{
			Name: v,
		}
		if isAllGroupAvailable || availableGroups[v] {
			list = append(list, item)
		}
	}
	return connect.NewResponse(&v1.ListAccessGroupResponse{Items: list}), nil
}

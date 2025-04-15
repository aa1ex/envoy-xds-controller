package grpcapi

import (
	"context"
	"sort"

	"connectrpc.com/connect"
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

func (s *AccessGroupStore) ListAccessGroups(ctx context.Context, _ *connect.Request[v1.ListAccessGroupsRequest]) (*connect.Response[v1.ListAccessGroupsResponse], error) {
	authorizer := GetAuthorizerFromContext(ctx)
	availableGroups := authorizer.GetAvailableAccessGroups()
	isAllGroupAvailable := len(availableGroups) == 1 && availableGroups["*"]

	list := make([]*v1.AccessGroupListItem, 0, len(s.accessGroups))
	for _, v := range s.accessGroups {
		item := &v1.AccessGroupListItem{
			Name: v,
		}
		if isAllGroupAvailable || availableGroups[v] {
			list = append(list, item)
		}
	}
	if isAllGroupAvailable || availableGroups[DomainGeneral] {
		list = append(list, &v1.AccessGroupListItem{
			Name: DomainGeneral,
		})
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].Name < list[j].Name
	})
	return connect.NewResponse(&v1.ListAccessGroupsResponse{Items: list}), nil
}

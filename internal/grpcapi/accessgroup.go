package grpcapi

import (
	"context"
	"sort"

	"connectrpc.com/connect"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_group/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_group/v1/access_groupv1connect"
)

type AccessGroupStore struct {
	accessGroupSvc AccessGroupService
	access_groupv1connect.AccessGroupStoreServiceHandler
}

type AccessGroupService interface {
	GetAccessGroups() []string
}

func NewAccessGroupStore(svc AccessGroupService) *AccessGroupStore {
	return &AccessGroupStore{accessGroupSvc: svc}
}

func (s *AccessGroupStore) ListAccessGroups(ctx context.Context, _ *connect.Request[v1.ListAccessGroupsRequest]) (*connect.Response[v1.ListAccessGroupsResponse], error) {
	authorizer := GetAuthorizerFromContext(ctx)
	availableGroups := authorizer.GetAvailableAccessGroups()
	isAllGroupAvailable := len(availableGroups) == 1 && availableGroups["*"]

	accessGroups := s.accessGroupSvc.GetAccessGroups()

	list := make([]*v1.AccessGroupListItem, 0, len(accessGroups))
	for _, v := range accessGroups {
		item := &v1.AccessGroupListItem{
			Name: v,
		}
		if isAllGroupAvailable || availableGroups[v] {
			list = append(list, item)
		}
	}
	if isAllGroupAvailable || availableGroups[GeneralAccessGroup] {
		list = append(list, &v1.AccessGroupListItem{
			Name: GeneralAccessGroup,
		})
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].Name < list[j].Name
	})
	return connect.NewResponse(&v1.ListAccessGroupsResponse{Items: list}), nil
}

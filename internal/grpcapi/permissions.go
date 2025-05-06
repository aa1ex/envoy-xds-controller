package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"github.com/casbin/casbin/v2"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/permissions/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/permissions/v1/permissionsv1connect"
)

type PermissionsService struct {
	e *casbin.Enforcer
	permissionsv1connect.UnimplementedPermissionsServiceHandler
}

func NewPermissionsService(e *casbin.Enforcer) *PermissionsService {
	return &PermissionsService{e: e}
}

func (p *PermissionsService) ListPermissions(ctx context.Context, req *connect.Request[v1.ListPermissionsRequest]) (*connect.Response[v1.ListPermissionsResponse], error) {
	authorizer := GetAuthorizerFromContext(ctx)
	permissions := make(map[string]map[string]struct{})
	var permItems []*v1.PermissionsItem
	for _, sub := range authorizer.GetSubjects() {
		result := p.e.GetPermissionsForUserInDomain(sub, req.Msg.AccessGroup)
		if len(result) > 0 {
			for _, perm := range result {
				if len(perm) == 4 {
					action := perm[3]
					items := perm[2]
					if permissions[action] == nil {
						permissions[action] = make(map[string]struct{})
						permItems = append(permItems, &v1.PermissionsItem{
							Action: action,
						})
					}
					permissions[action][items] = struct{}{}
				}
			}
		}
	}
	for _, permItem := range permItems {
		vals := permissions[permItem.Action]
		for val, _ := range vals {
			permItem.Objects = append(permItem.Objects, val)
		}
	}
	return connect.NewResponse(&v1.ListPermissionsResponse{Items: permItems}), nil
}

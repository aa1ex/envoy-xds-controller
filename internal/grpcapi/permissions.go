package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"fmt"
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/constant"
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
		result, _ := getPermissionsForUserInDomain(p.e, sub, req.Msg.AccessGroup)
		//result := p.e.GetPermissionsForUserInDomain(sub, req.Msg.AccessGroup)
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
		for val := range vals {
			permItem.Objects = append(permItem.Objects, val)
		}
	}
	return connect.NewResponse(&v1.ListPermissionsResponse{Items: permItems}), nil
}

func getPermissionsForUserInDomain(e *casbin.Enforcer, user string, domain string) ([][]string, error) {
	gtype := "g"
	ptype := "p"

	permission := make([][]string, 0)
	rm := e.GetNamedRoleManager(gtype)
	if rm == nil {
		return nil, fmt.Errorf("role manager %s is not initialized", gtype)
	}

	roles, err := e.GetNamedImplicitRolesForUser(gtype, user, domain)
	if err != nil {
		return nil, err
	}
	policyRoles := make(map[string]struct{}, len(roles)+1)
	policyRoles[user] = struct{}{}
	for _, r := range roles {
		policyRoles[r] = struct{}{}
	}

	domainIndex, err := e.GetFieldIndex(ptype, constant.DomainIndex)
	for _, rule := range e.GetModel()["p"][ptype].Policy {
		ruleDomain := rule[domainIndex]
		if ruleDomain != "*" {
			matched := rm.Match(domain, ruleDomain)
			if !matched {
				continue
			}
		}
		policyRole := rule[0]
		if _, ok := policyRoles[policyRole]; ok {
			newRule := deepCopyPolicy(rule)
			newRule[domainIndex] = domain
			permission = append(permission, newRule)
		}
	}
	return permission, nil
}

func deepCopyPolicy(src []string) []string {
	newRule := make([]string, len(src))
	copy(newRule, src)
	return newRule
}

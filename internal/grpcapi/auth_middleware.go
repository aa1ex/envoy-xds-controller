package grpcapi

import (
	"connectrpc.com/authn"
	"context"
	"github.com/casbin/casbin/v2"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_group/v1/access_groupv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_log_config/v1/access_log_configv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/http_filter/v1/http_filterv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/listener/v1/listenerv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/node/v1/nodev1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/policy/v1/policyv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/route/v1/routev1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1/virtual_servicev1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1/virtual_service_templatev1connect"
	"net/http"
)

const (
	domainGeneral = "_"
)

type AuthMiddleware struct {
	verifier          *oidc.IDTokenVerifier
	wrappedMiddleware *authn.Middleware
	enforcer          *casbin.Enforcer
}

type IAuthorizer interface {
	Authorize(domain string, object any) (bool, error)
	AuthorizeCommonObjectWithAction(object any, action string) (bool, error)
	GetAvailableAccessGroups() map[string]bool
}

type Authorizer struct {
	name     string
	groups   []string
	action   string
	enforcer *casbin.Enforcer
}

func (a *Authorizer) getSubjects() []string {
	return append([]string{a.name}, a.groups...)
}

func (a *Authorizer) GetAvailableAccessGroups() map[string]bool {
	set := make(map[string]bool)
	for _, sub := range a.getSubjects() {
		domains, _ := a.enforcer.GetDomainsForUser(sub)
		if len(domains) == 1 && domains[0] == "*" {
			return map[string]bool{
				"*": true,
			}
		}
		for _, d := range domains {
			set[d] = true
		}
	}
	return set
}

func (a *Authorizer) Authorize(domain string, object any) (bool, error) {
	for _, sub := range a.getSubjects() {
		result, err := a.enforcer.Enforce(sub, domain, object, a.action)
		if err != nil {
			return false, err
		}
		if result {
			return true, nil
		}
	}
	return false, nil
}

func (a *Authorizer) AuthorizeCommonObjectWithAction(object any, action string) (bool, error) {
	for _, sub := range a.getSubjects() {
		result, err := a.enforcer.Enforce(sub, domainGeneral, object, action)
		if err != nil {
			return false, err
		}
		if result {
			return true, nil
		}
	}
	return false, nil
}

func NewAuthMiddleware(issuerURL, clientID string, enf *casbin.Enforcer) (*AuthMiddleware, error) {
	provider, err := oidc.NewProvider(context.Background(), issuerURL)
	if err != nil {
		return nil, err
	}
	m := &AuthMiddleware{}
	m.verifier = provider.Verifier(&oidc.Config{ClientID: clientID})
	m.wrappedMiddleware = authn.NewMiddleware(m.authFunc)
	m.enforcer = enf
	return m, nil
}

func (m *AuthMiddleware) Wrap(handler http.Handler) http.Handler {
	return m.wrappedMiddleware.Wrap(handler)
}

func (m *AuthMiddleware) authFunc(ctx context.Context, req *http.Request) (any, error) {
	token, ok := authn.BearerToken(req)
	if !ok {
		return nil, authn.Errorf("invalid authorization")
	}
	idToken, err := m.verifier.Verify(ctx, token)
	if err != nil {
		return nil, authn.Errorf("failed to verify token: %v", err)
	}
	var claims struct {
		Name   string   `json:"name"`
		Groups []string `json:"groups"`
	}
	if err := idToken.Claims(&claims); err != nil {
		return nil, authn.Errorf("failed to get claims")
	}

	proc, _ := authn.InferProcedure(req.URL)
	action := lookupAction(proc)
	if action == "" {
		return nil, authn.Errorf("unknown action: '%s'", proc)
	}

	authorizer := &Authorizer{
		name:     claims.Name,
		enforcer: m.enforcer,
		groups:   claims.Groups,
		action:   action,
	}

	return authorizer, nil
}

const (
	ActionListVirtualServices         = "list-virtual-services"
	ActionGetVirtualService           = "get-virtual-service"
	ActionCreateVirtualService        = "create-virtual-service"
	ActionUpdateVirtualService        = "update-virtual-service"
	ActionDeleteVirtualService        = "delete-virtual-service"
	ActionListAccessLogConfigs        = "list-access-log-configs"
	ActionListVirtualServiceTemplates = "list-virtual-service-templates"
	ActionListNodes                   = "list-nodes"
	ActionListRoutes                  = "list-routes"
	ActionListHTTPFilters             = "list-http-filters"
	ActionListPolicies                = "list-policies"
	ActionListAccessGroups            = "list-access-groups"
	ActionListListeners               = "list-listeners"
)

func lookupAction(route string) string {
	switch route {
	case virtual_servicev1connect.VirtualServiceStoreServiceListVirtualServiceProcedure:
		return ActionListVirtualServices
	case virtual_servicev1connect.VirtualServiceStoreServiceGetVirtualServiceProcedure:
		return ActionGetVirtualService
	case virtual_servicev1connect.VirtualServiceStoreServiceCreateVirtualServiceProcedure:
		return ActionCreateVirtualService
	case virtual_servicev1connect.VirtualServiceStoreServiceUpdateVirtualServiceProcedure:
		return ActionUpdateVirtualService
	case virtual_servicev1connect.VirtualServiceStoreServiceDeleteVirtualServiceProcedure:
		return ActionDeleteVirtualService
	case access_log_configv1connect.AccessLogConfigStoreServiceListAccessLogConfigProcedure:
		return ActionListAccessLogConfigs
	case virtual_service_templatev1connect.VirtualServiceTemplateStoreServiceListVirtualServiceTemplateProcedure:
		return ActionListVirtualServiceTemplates
	case nodev1connect.NodeStoreServiceListNodeProcedure:
		return ActionListNodes
	case routev1connect.RouteStoreServiceListRouteProcedure:
		return ActionListRoutes
	case http_filterv1connect.HTTPFilterStoreServiceListHTTPFilterProcedure:
		return ActionListHTTPFilters
	case policyv1connect.PolicyStoreServiceListPolicyProcedure:
		return ActionListPolicies
	case access_groupv1connect.AccessGroupStoreServiceListAccessGroupProcedure:
		return ActionListAccessGroups
	case listenerv1connect.ListenerStoreServiceListListenerProcedure:
		return ActionListListeners
	default:
		return ""
	}
}

func getAuthorizerFromContext(ctx context.Context) IAuthorizer {
	tmp := authn.GetInfo(ctx)
	if tmp == nil {
		return stubA
	}
	authorizer, ok := tmp.(*Authorizer)
	if !ok {
		return stubA
	}
	return authorizer
}

var stubA = &stubAuthorizer{}

type stubAuthorizer struct{}

func (a *stubAuthorizer) Authorize(string, any) (bool, error) {
	return true, nil
}

func (a *stubAuthorizer) AuthorizeCommonObjectWithAction(any, string) (bool, error) {
	return true, nil
}

func (a *stubAuthorizer) GetAvailableAccessGroups() map[string]bool {
	return map[string]bool{
		"*": true,
	}
}

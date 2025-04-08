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

type AuthMiddleware struct {
	verifier          *oidc.IDTokenVerifier
	wrappedMiddleware *authn.Middleware
	enforcer          *casbin.Enforcer
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
	for _, group := range a.getSubjects() {
		result, err := a.enforcer.Enforce(group, domain, object, a.action)
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
		return nil, err
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

	authorizer := Authorizer{
		name:     claims.Name,
		enforcer: m.enforcer,
		groups:   claims.Groups,
		action:   action,
	}

	return authorizer, nil
}

func lookupAction(route string) string {
	switch route {
	case virtual_servicev1connect.VirtualServiceStoreServiceListVirtualServiceProcedure:
		return "list-virtual-services"
	case virtual_servicev1connect.VirtualServiceStoreServiceGetVirtualServiceProcedure:
		return "get-virtual-service"
	case virtual_servicev1connect.VirtualServiceStoreServiceCreateVirtualServiceProcedure:
		return "create-virtual-service"
	case virtual_servicev1connect.VirtualServiceStoreServiceUpdateVirtualServiceProcedure:
		return "update-virtual-service"
	case virtual_servicev1connect.VirtualServiceStoreServiceDeleteVirtualServiceProcedure:
		return "delete-virtual-service"
	case access_log_configv1connect.AccessLogConfigStoreServiceListAccessLogConfigProcedure:
		return "list-access-log-config"
	case virtual_service_templatev1connect.VirtualServiceTemplateStoreServiceListVirtualServiceTemplateProcedure:
		return "list-virtual-service-template"
	case nodev1connect.NodeStoreServiceListNodeProcedure:
		return "list-nodes"
	case routev1connect.RouteStoreServiceListRouteProcedure:
		return "list-routes"
	case http_filterv1connect.HTTPFilterStoreServiceListHTTPFilterProcedure:
		return "list-http-filters"
	case policyv1connect.PolicyStoreServiceListPolicyProcedure:
		return "list-policies"
	case access_groupv1connect.AccessGroupStoreServiceListAccessGroupProcedure:
		return "list-access-groups"
	case listenerv1connect.ListenerStoreServiceListListenerProcedure:
		return "list-listeners"
	default:
		return ""
	}
}

func getAuthorizerFromContext(ctx context.Context) Authorizer {
	return authn.GetInfo(ctx).(Authorizer)
}

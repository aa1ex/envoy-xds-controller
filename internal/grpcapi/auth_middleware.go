package grpcapi

import (
	"connectrpc.com/authn"
	"context"
	"github.com/casbin/casbin/v2"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_log_config/v1/access_log_configv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/http_filter/v1/http_filterv1connect"
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
	enforcer          casbin.IEnforcer
}

type AuthorizeFunction func(domain string, object any) (bool, error)

func NewAuthMiddleware(issuerURL, clientID string, enf casbin.IEnforcer) (*AuthMiddleware, error) {
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

	var authorize AuthorizeFunction = func(domain string, object any) (bool, error) {
		for _, group := range claims.Groups {
			result, err := m.enforcer.Enforce(group, domain, object, action) // (r.sub, r.dom, r.obj, r.action
			if err != nil {
				return false, err
			}
			if result {
				return true, nil
			}
		}
		return false, authn.Errorf("forbidden")
	}
	return authorize, nil
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
	default:
		return ""
	}
}

package grpcapi

import (
	"connectrpc.com/authn"
	"context"
	"github.com/coreos/go-oidc/v3/oidc"
	"net/http"
)

type AuthMiddleware struct {
	verifier          *oidc.IDTokenVerifier
	wrappedMiddleware *authn.Middleware
}

func NewAuthMiddleware(issuerURL, clientID string) (*AuthMiddleware, error) {
	provider, err := oidc.NewProvider(context.Background(), issuerURL)
	if err != nil {
		return nil, err
	}
	m := &AuthMiddleware{}
	m.verifier = provider.Verifier(&oidc.Config{ClientID: clientID})
	m.wrappedMiddleware = authn.NewMiddleware(m.authFunc)
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
	return nil, nil
}

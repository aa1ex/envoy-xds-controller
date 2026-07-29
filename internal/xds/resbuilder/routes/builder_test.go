package routes

import (
	"testing"

	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	oauth2v3 "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/http/oauth2/v3"
	routerv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/http/router/v3"
	hcmv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
)

// httpFilter builds an HTTP filter with the given name and typed config,
// the same shape BuildHTTPFilters produces from VirtualService spec.
func httpFilter(t *testing.T, name string, cfg proto.Message) *hcmv3.HttpFilter {
	t.Helper()

	typedConfig, err := anypb.New(cfg)
	require.NoError(t, err)

	return &hcmv3.HttpFilter{
		Name:       name,
		ConfigType: &hcmv3.HttpFilter_TypedConfig{TypedConfig: typedConfig},
	}
}

// assertFilterDisabled asserts the per filter config entry disables the filter.
func assertFilterDisabled(t *testing.T, entry *anypb.Any) {
	t.Helper()

	require.NotNil(t, entry)

	var filterConfig routev3.FilterConfig
	require.NoError(t, entry.UnmarshalTo(&filterConfig))
	assert.True(t, filterConfig.GetDisabled())
}

func TestBuildFallbackVirtualHost(t *testing.T) {
	b := NewBuilder(nil)

	t.Run("returns 421 direct response for any domain", func(t *testing.T) {
		vh, err := b.BuildFallbackVirtualHost(nil)
		require.NoError(t, err)

		assert.Equal(t, "421vh", vh.GetName())
		assert.Equal(t, []string{"*"}, vh.GetDomains())
		require.Len(t, vh.GetRoutes(), 1)
		assert.Equal(t, "/", vh.GetRoutes()[0].GetMatch().GetPrefix())
		assert.Equal(t, uint32(421), vh.GetRoutes()[0].GetDirectResponse().GetStatus())
		assert.NoError(t, vh.ValidateAll())
	})

	t.Run("keeps per filter config empty without oauth2", func(t *testing.T) {
		filters := []*hcmv3.HttpFilter{
			httpFilter(t, "envoy.filters.http.router", &routerv3.Router{}),
		}

		vh, err := b.BuildFallbackVirtualHost(filters)
		require.NoError(t, err)

		assert.Nil(t, vh.GetTypedPerFilterConfig())
	})

	t.Run("disables oauth2 filter", func(t *testing.T) {
		filters := []*hcmv3.HttpFilter{
			httpFilter(t, "envoy.filters.http.oauth2", &oauth2v3.OAuth2{}),
			httpFilter(t, "envoy.filters.http.router", &routerv3.Router{}),
		}

		vh, err := b.BuildFallbackVirtualHost(filters)
		require.NoError(t, err)

		perFilterConfig := vh.GetTypedPerFilterConfig()
		require.Len(t, perFilterConfig, 1)
		assertFilterDisabled(t, perFilterConfig["envoy.filters.http.oauth2"])
		assert.NoError(t, vh.ValidateAll())
	})

	t.Run("disables oauth2 filter under a user defined name", func(t *testing.T) {
		filters := []*hcmv3.HttpFilter{
			httpFilter(t, "sso", &oauth2v3.OAuth2{}),
		}

		vh, err := b.BuildFallbackVirtualHost(filters)
		require.NoError(t, err)

		perFilterConfig := vh.GetTypedPerFilterConfig()
		require.Len(t, perFilterConfig, 1)
		assertFilterDisabled(t, perFilterConfig["sso"])
	})

	t.Run("disables every oauth2 filter of the chain", func(t *testing.T) {
		filters := []*hcmv3.HttpFilter{
			httpFilter(t, "oauth2-internal", &oauth2v3.OAuth2{}),
			httpFilter(t, "oauth2-external", &oauth2v3.OAuth2{}),
			httpFilter(t, "envoy.filters.http.router", &routerv3.Router{}),
		}

		vh, err := b.BuildFallbackVirtualHost(filters)
		require.NoError(t, err)

		perFilterConfig := vh.GetTypedPerFilterConfig()
		require.Len(t, perFilterConfig, 2)
		assertFilterDisabled(t, perFilterConfig["oauth2-internal"])
		assertFilterDisabled(t, perFilterConfig["oauth2-external"])
	})

	t.Run("skips filters without typed config", func(t *testing.T) {
		filters := []*hcmv3.HttpFilter{{Name: "envoy.filters.http.oauth2"}}

		vh, err := b.BuildFallbackVirtualHost(filters)
		require.NoError(t, err)

		assert.Nil(t, vh.GetTypedPerFilterConfig())
	})
}

func TestAddFallbackVirtualHostIfNeeded(t *testing.T) {
	b := NewBuilder(nil)

	tests := []struct {
		name          string
		domains       []string
		isTLSListener bool
		hasPort443    bool
		wantFallback  bool
	}{
		{
			name:          "tls listener on port 443",
			domains:       []string{"exc.kaasops.io"},
			isTLSListener: true,
			hasPort443:    true,
			wantFallback:  true,
		},
		{
			name:          "plain listener",
			domains:       []string{"exc.kaasops.io"},
			isTLSListener: false,
			hasPort443:    true,
			wantFallback:  false,
		},
		{
			name:          "tls listener on another port",
			domains:       []string{"exc.kaasops.io"},
			isTLSListener: true,
			hasPort443:    false,
			wantFallback:  false,
		},
		{
			name:          "virtual host already catches every domain",
			domains:       []string{"*"},
			isTLSListener: true,
			hasPort443:    true,
			wantFallback:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			virtualHost := &routev3.VirtualHost{Name: "vh", Domains: tt.domains}
			routeConfig := &routev3.RouteConfiguration{
				Name:         "default/virtual-service",
				VirtualHosts: []*routev3.VirtualHost{virtualHost},
			}

			err := b.AddFallbackVirtualHostIfNeeded(
				routeConfig, virtualHost, nil, tt.isTLSListener, tt.hasPort443,
			)
			require.NoError(t, err)

			if !tt.wantFallback {
				assert.Len(t, routeConfig.GetVirtualHosts(), 1)
				return
			}

			require.Len(t, routeConfig.GetVirtualHosts(), 2)
			assert.Equal(t, "421vh", routeConfig.GetVirtualHosts()[1].GetName())
		})
	}

	t.Run("propagates oauth2 filters to the fallback virtual host", func(t *testing.T) {
		virtualHost := &routev3.VirtualHost{Name: "vh", Domains: []string{"exc.kaasops.io"}}
		routeConfig := &routev3.RouteConfiguration{
			Name:         "default/virtual-service",
			VirtualHosts: []*routev3.VirtualHost{virtualHost},
		}
		filters := []*hcmv3.HttpFilter{
			httpFilter(t, "envoy.filters.http.oauth2", &oauth2v3.OAuth2{}),
		}

		require.NoError(t, b.AddFallbackVirtualHostIfNeeded(routeConfig, virtualHost, filters, true, true))

		require.Len(t, routeConfig.GetVirtualHosts(), 2)
		fallbackVH := routeConfig.GetVirtualHosts()[1]
		assertFilterDisabled(t, fallbackVH.GetTypedPerFilterConfig()["envoy.filters.http.oauth2"])
		assert.Nil(t, virtualHost.GetTypedPerFilterConfig())
	})
}

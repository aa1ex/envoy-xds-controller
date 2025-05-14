package resbuilder

import (
	"testing"

	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/stretchr/testify/assert"
)

func TestGetWildcardDomain(t *testing.T) {
	tests := []struct {
		name     string
		domain   string
		expected string
	}{
		{
			name:     "Simple domain",
			domain:   "my.example.com",
			expected: "*.example.com",
		},
		{
			name:     "Subdomain",
			domain:   "sub.example.com",
			expected: "*.example.com",
		},
		{
			name:     "Already wildcard",
			domain:   "*.example.com",
			expected: "*.example.com",
		},
		{
			name:     "Empty domain",
			domain:   "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getWildcardDomain(tt.domain)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestCheckAllDomainsUnique(t *testing.T) {
	tests := []struct {
		name        string
		domains     []string
		expectError bool
	}{
		{
			name:        "All unique domains",
			domains:     []string{"example.com", "test.com", "another.com"},
			expectError: false,
		},
		{
			name:        "Duplicate domains",
			domains:     []string{"example.com", "test.com", "example.com"},
			expectError: true,
		},
		{
			name:        "Empty domains",
			domains:     []string{},
			expectError: false,
		},
		{
			name:        "Single domain",
			domains:     []string{"example.com"},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := checkAllDomainsUnique(tt.domains)
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestIsTLSListener(t *testing.T) {
	// Test with nil listener
	result := isTLSListener(nil)
	assert.False(t, result, "nil listener should not be considered a TLS listener")
}

func TestGetTLSType(t *testing.T) {
	tests := []struct {
		name        string
		tlsConfig   *v1alpha1.TlsConfig
		expected    string
		expectError bool
	}{
		{
			name:        "Nil config",
			tlsConfig:   nil,
			expected:    "",
			expectError: true,
		},
		{
			name:        "Empty config",
			tlsConfig:   &v1alpha1.TlsConfig{},
			expected:    "",
			expectError: true,
		},
		{
			name: "SecretRef type",
			tlsConfig: &v1alpha1.TlsConfig{
				SecretRef: &v1alpha1.ResourceRef{
					Name: "test-secret",
				},
			},
			expected:    SecretRefType,
			expectError: false,
		},
		{
			name: "AutoDiscovery type",
			tlsConfig: &v1alpha1.TlsConfig{
				AutoDiscovery: func() *bool { b := true; return &b }(),
			},
			expected:    AutoDiscoveryType,
			expectError: false,
		},
		{
			name: "Both types specified",
			tlsConfig: &v1alpha1.TlsConfig{
				SecretRef: &v1alpha1.ResourceRef{
					Name: "test-secret",
				},
				AutoDiscovery: func() *bool { b := true; return &b }(),
			},
			expected:    "",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := getTLSType(tt.tlsConfig)
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

package gateway

// Plane represents an xDS control-plane entry in the registry.
// JSON tags match the API contract in docs/xds-gateway.md

type Plane struct {
	Address string `json:"address"`
	Port    int    `json:"port"`
	Enabled bool   `json:"enabled"`
	Region  string `json:"region,omitempty"`
	Weight  int    `json:"weight,omitempty"`
}

// ResolveResult holds the outcome of a resolve.

type ResolveResult struct {
	PlaneID      string `json:"resolved"`
	Source       string `json:"source"` // client|cohort|default|unknown
	PlaneEnabled bool   `json:"plane_enabled"`
}

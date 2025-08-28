package resolver

import (
	"context"
	"strings"
	"sync/atomic"
	"time"

	"github.com/kaasops/envoy-xds-controller/internal/gateway"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/cache"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/store"
)

type Resolver struct {
	store            *store.Store
	clientRouteCache *cache.TTLCache[string]
	clientCohortCache *cache.TTLCache[string]
	cohortRouteCache *cache.TTLCache[string]
	planeCache       *cache.TTLCache[gateway.Plane]

	resolvesTotal atomic.Int64
}

func New(s *store.Store, ttl, negTTL time.Duration) *Resolver {
	return &Resolver{
		store:             s,
		clientRouteCache:  cache.NewTTLCache[string](ttl, negTTL),
		clientCohortCache: cache.NewTTLCache[string](ttl, negTTL),
		cohortRouteCache:  cache.NewTTLCache[string](ttl, negTTL),
		planeCache:        cache.NewTTLCache[gateway.Plane](ttl, negTTL),
	}
}

func (r *Resolver) ClearCaches() {
	r.clientRouteCache.Clear()
	r.clientCohortCache.Clear()
	r.cohortRouteCache.Clear()
	r.planeCache.Clear()
}

// Result includes resolve details and the computed cluster header value.

type Result struct {
	Resolved gateway.ResolveResult
	Cluster  string
}

func ensureClusterName(planeID string) string {
	if planeID == "" {
		return ""
	}
	if strings.HasPrefix(planeID, "xds_") {
		return planeID
	}
	return "xds_" + planeID
}

func (r *Resolver) getClientRoute(ctx context.Context, clientKey string) (string, error) {
	if v, ok, neg := r.clientRouteCache.Get(clientKey); ok {
		if neg { return "", nil }
		return v, nil
	}
	v, err := r.store.GetClientRoute(ctx, clientKey)
	if err != nil { return "", err }
	if v == "" { r.clientRouteCache.SetNegative(clientKey) } else { r.clientRouteCache.Set(clientKey, v) }
	return v, nil
}

func (r *Resolver) getClientCohort(ctx context.Context, clientKey string) (string, error) {
	if v, ok, neg := r.clientCohortCache.Get(clientKey); ok {
		if neg { return "", nil }
		return v, nil
	}
	v, err := r.store.GetClientCohort(ctx, clientKey)
	if err != nil { return "", err }
	if v == "" { r.clientCohortCache.SetNegative(clientKey) } else { r.clientCohortCache.Set(clientKey, v) }
	return v, nil
}

func (r *Resolver) getCohortRoute(ctx context.Context, cohort string) (string, error) {
	if v, ok, neg := r.cohortRouteCache.Get(cohort); ok {
		if neg { return "", nil }
		return v, nil
	}
	v, err := r.store.GetCohortRoute(ctx, cohort)
	if err != nil { return "", err }
	if v == "" { r.cohortRouteCache.SetNegative(cohort) } else { r.cohortRouteCache.Set(cohort, v) }
	return v, nil
}

func (r *Resolver) getDefault(ctx context.Context) (string, error) {
	// Not cached because it's a single key; but we can cache with a constant key.
	return r.store.GetDefaultRoute(ctx)
}

func (r *Resolver) getPlane(ctx context.Context, planeID string) (*gateway.Plane, error) {
	if planeID == "" { return nil, nil }
	if p, ok, neg := r.planeCache.Get(planeID); ok {
		if neg { return nil, nil }
		return &p, nil
	}
	p, err := r.store.GetPlane(ctx, planeID)
	if err != nil { return nil, err }
	if p == nil { r.planeCache.SetNegative(planeID) } else { r.planeCache.Set(planeID, *p) }
	return p, nil
}

func (r *Resolver) Resolve(ctx context.Context, clientKey string) (Result, error) {
	r.resolvesTotal.Add(1)
	// Priority 1: client route
	if planeID, err := r.getClientRoute(ctx, clientKey); err == nil && planeID != "" {
		if res, ok, err := r.validateOrFallback(ctx, planeID, "client", clientKey); err == nil && ok {
			return res, nil
		} else if err != nil {
			return Result{}, err
		}
	}
	// Priority 2: cohort route
	if cohort, err := r.getClientCohort(ctx, clientKey); err == nil && cohort != "" {
		if planeID, err := r.getCohortRoute(ctx, cohort); err == nil && planeID != "" {
			if res, ok, err := r.validateOrFallback(ctx, planeID, "cohort", clientKey); err == nil && ok {
				return res, nil
			} else if err != nil {
				return Result{}, err
			}
		}
	}
	// Priority 3: default
	if def, err := r.getDefault(ctx); err == nil && def != "" {
		if res, ok, err := r.validateOrFallback(ctx, def, "default", clientKey); err == nil && ok {
			return res, nil
		} else if err != nil {
			return Result{}, err
		}
	}
	// Unknown -> return empty so extproc fail-open
	return Result{Resolved: gateway.ResolveResult{PlaneID: "", Source: "unknown", PlaneEnabled: false}, Cluster: ""}, nil
}

func (r *Resolver) validateOrFallback(ctx context.Context, planeID, source, clientKey string) (Result, bool, error) {
	p, err := r.getPlane(ctx, planeID)
	if err != nil { return Result{}, false, err }
	if p != nil && p.Enabled {
		return Result{Resolved: gateway.ResolveResult{PlaneID: planeID, Source: source, PlaneEnabled: true}, Cluster: ensureClusterName(planeID)}, true, nil
	}
	// fallback sequence depending on source
	switch source {
	case "client":
		// try cohort
		if cohort, err := r.getClientCohort(ctx, clientKey); err == nil && cohort != "" {
			if pid, err := r.getCohortRoute(ctx, cohort); err == nil && pid != "" {
				if res, ok, err := r.validateOrFallback(ctx, pid, "cohort", clientKey); err != nil {
					return Result{}, false, err
				} else if ok {
					return res, true, nil
				}
			}
		}
		fallthrough
	case "cohort":
		if def, err := r.getDefault(ctx); err == nil && def != "" {
			p2, err := r.getPlane(ctx, def)
			if err != nil { return Result{}, false, err }
			if p2 != nil && p2.Enabled {
				return Result{Resolved: gateway.ResolveResult{PlaneID: def, Source: "default", PlaneEnabled: true}, Cluster: ensureClusterName(def)}, true, nil
			}
		}
	}
	// still unknown
	return Result{Resolved: gateway.ResolveResult{PlaneID: planeID, Source: source, PlaneEnabled: false}, Cluster: ""}, false, nil
}

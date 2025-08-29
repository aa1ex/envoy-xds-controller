# xds-gateway

xds-gateway exposes a gRPC External Processor (ext_proc) service for Envoy and a separate HTTP management API for routing rules (not the ext_proc API). It resolves plane/route using a Redis-backed store with local caches, provides endpoints for management, serves a small embedded UI, and integrates with Envoy via the ext_proc gRPC interface.

## Features
- External Processing (gRPC): Implements Envoy ext_proc service to enrich/modify requests based on resolved routing data.
- Resolver & cache: Resolves target "plane"/route by incoming request attributes using Redis as source of truth with positive/negative TTL caches and live invalidation via Redis pub/sub.
- HTTP API (management): Provides endpoints to manage defaults, inspect state, and set routing rules; optional bearer token auth. Not used by Envoy's ext_proc — Envoy communicates via gRPC only. API base path: `/api/v1`.
- Embedded UI: Serves a static UI from embedded assets at `/` and `/ui` with SPA fallback for non-API routes.
- Configurable via env/flags: Ports, Redis connection, cache TTLs, default plane, and auth token; dev mode enabling verbose logs and Gin debug.

## Usage
Run the gateway binary:

```bash
xds-gateway --grpc-port 8081 --http :8080 --development=false
```

## HTTP endpoints (management)
- Health: `GET /healthz`, `GET /readyz`.
- Planes:
  - `PUT /api/v1/planes/:plane_id` — body: `{ "address": "host", "port": 443, "enabled": true, "region": "...", "weight": 100 }`
  - `GET /api/v1/planes` — list planes
  - `GET /api/v1/planes/:plane_id` — get plane
  - `DELETE /api/v1/planes/:plane_id`
- Client routes:
  - `GET /api/v1/clients` — list client->target mappings
  - `PUT /api/v1/clients/:client_key` — body: `{ "target": "plane-id" }`
  - `DELETE /api/v1/clients/:client_key`
  - `GET /api/v1/clients/:client_key` — resolved info including source, target, cohort
- Cohorts:
  - `GET /api/v1/cohorts`
  - `PUT /api/v1/cohorts/:name` — body: `{ "target": "plane-id" }`
  - `DELETE /api/v1/cohorts/:name`
  - `PUT /api/v1/clients/:client_key/cohort` — body: `{ "name": "cohort" }`
  - `DELETE /api/v1/clients/:client_key/cohort`
- Defaults:
  - `PUT /api/v1/defaults/route` — body: `{ "target": "plane-id" }`
- Resolver helper:
  - `GET /api/v1/resolve/:client_key` — show current resolution for client

Authentication: if `AUTH_TOKEN` is set, all `/api/*` endpoints require header `Authorization: Bearer <token>`.

## Configuration
Environment variables:
- GRPC_PORT (default 8081)
- HTTP_ADDR (default :8080)
- DEBUG (true/false)
- REDIS_ADDR (default 127.0.0.1:6379)
- REDIS_PASSWORD
- REDIS_DB (default 0)
- CACHE_TTL_SECONDS (default 60)
- NEGATIVE_CACHE_TTL_SECONDS (default 10)
- DEFAULT_PLANE_ID (optional)
- AUTH_TOKEN (optional, HTTP API bearer)

## Operational notes
- Starts HTTP API and gRPC servers; graceful shutdown on SIGINT/SIGTERM.
- Performs Redis ping on startup and exits on failure.
- Subscribes to Redis events to invalidate caches with throttling to avoid storms.

## Observability
- Logging via zap (logr/zapr); `--development` or `DEBUG=true` enables dev logging and Gin debug mode.

## Dependencies
- Redis as backing store for routes and events.
- Envoy instances configured to call ext_proc on gRPC port.

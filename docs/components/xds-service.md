# xds-service

xds-service is the main Envoy xDS management server. It reads snapshots from Redis, serves Aggregated xDS (ADS) to Envoy proxies, and exposes lightweight admin/status HTTP endpoints. It uses zap logging (via logr/zapr) and renders a simple HTML admin page with last sync info.

## Features
- xDS server (ADS) backed by a SnapshotCache implementation.
- Snapshot ingestion: initial sync on startup (mandatory), optional periodic auto-sync from Redis, and manual sync via HTTP.
- Callbacks/metrics: track connections, requests, and version updates; JSON/status endpoints to inspect snapshots.
- Health endpoint via a small HTTP server.

## Usage
Run the service binary and expose gRPC and HTTP ports. Example flags:

```bash
xds-service \
  --port 18000 \
  --http :8080 \
  --auto-sync=false \
  --sync-interval=30s \
  --development=false
```

## HTTP endpoints (admin)
- `GET /admin` — HTML page with last sync time, auto-sync state, and interval.
- `GET /admin/sync` — show last sync info (text).
- `POST /admin/sync` — trigger a sync from Redis (timeout 10s).
- `GET /admin/auto-sync` — show current auto-sync state and interval.
- `POST /admin/auto-sync?enable=true|false` — enable/disable auto-sync (requires positive sync-interval).
- `GET /admin/snapshots` — list nodes with snapshot versions and resource counts (JSON).
- `GET /admin/snapshots/:nodeId` — details for a specific node (JSON).
- `GET /healthz` — health check.

## Configuration
Flags and environment (see source for full list):
- --http (default :8080) — HTTP admin server address
- --port (default 18000) — xDS gRPC endpoint
- --auto-sync (bool) and --sync-interval (duration)
- --development (bool) — enable development logging
- REDIS_ADDR (default 127.0.0.1:6379)
- REDIS_PASSWORD
- REDIS_DB (default 0)
- XDS_REDIS_NS (optional; Redis namespace/prefix)
- XDS_REDIS_TIMEOUT_MS (default 2000)

## Operational notes
- On startup performs an initial sync from Redis; exits on failure.
- Optional auto-sync runs on a ticker when enabled; can be toggled via the admin endpoint without restart.
- Graceful HTTP shutdown and xDS server lifecycle on SIGINT/SIGTERM.

## Observability
- Logging via zap (logr/zapr); `--development` enables ISO8601 timestamps and verbose output.
- Built-in admin UI at `/admin` and JSON endpoints at `/admin/*` as listed above.

## Dependencies
- Redis as the snapshot store.
- Envoy proxies connecting to the gRPC xDS port.

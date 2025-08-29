# xds-snap

xds-snap is a CLI utility for interacting with Envoy xDS snapshots. It can fetch snapshots from an ADS server, print or convert them, diff two archives, and load snapshot archives into Redis. Useful for debugging, CI, and operational workflows.

## Features
- fetch: connect to an ADS endpoint and download resources for a given node ID and type URL; save as an archive (.tar.json.gz or similar).
- print: pretty-print a snapshot archive or a DiscoveryResponse.
- convert: convert snapshot archive formats.
- diff: compare two archives and report per-resource diffs based on stable hashing.
- load-redis: load snapshot files into Redis using proper keys and metadata.

## Usage
```bash
xds-snap <command> [flags]
```

## Configuration
Common flags/env:
- --addr: ADS address, e.g. 127.0.0.1:18000
- --node-id: target Envoy node ID
- --type-url: resource type URL (optional for fetch-all modes)
- TLS options: --ca, --cert, --key; or use --insecure
- REDIS_ADDR / REDIS_PASSWORD / REDIS_DB for load-redis

## Operational notes
- Supports TLS and insecure gRPC connections for fetch.
- Archives embed metadata (timestamp, source, node-id) and can be used by CI pipelines.

## Dependencies
- gRPC connectivity to ADS for fetch; Redis for load operations.

# XDS: Loading Snapshots from Redis

This service runs a simple xDS server and, on startup, loads snapshots from Redis. This document describes the data format stored in Redis and the loader configuration.

## Environment variables

- REDIS_ADDR — Redis address (host:port). Default: 127.0.0.1:6379
- REDIS_PASSWORD — password (optional)
- REDIS_DB — Redis database number (int). Default: 0
- XDS_REDIS_NS — namespace (key prefix). Default: xds
- XDS_REDIS_TIMEOUT_MS — timeout for read operations (ms). Default: 2000

## Redis key structure

A dedicated namespace is used (by default, `xds`).

1. Set of nodes (node IDs):
   - Key: `<ns>:nodes`
   - Type: Set
   - Values: list of Envoy node identifiers (strings)

2. Snapshot for each node:
   - Key: `<ns>:snapshot:<nodeID>`
   - Type: Hash
   - Fields:
     - `version` — string snapshot version (required; if missing, "1" is used)
     - `clusters` — JSON array of envoy.config.cluster.v3.Cluster in Protobuf JSON format
     - `routes` — JSON array of envoy.config.route.v3.RouteConfiguration in Protobuf JSON format
     - `listeners` — JSON array of envoy.config.listener.v3.Listener in Protobuf JSON format
     - `endpoints` — JSON array of envoy.config.endpoint.v3.ClusterLoadAssignment (EDS) in Protobuf JSON format (optional)
     - `secrets` — JSON array of envoy.extensions.transport_sockets.tls.v3.Secret in Protobuf JSON format (optional)

An empty or missing field for a collection is treated as an empty list.

Note: parsing is done with `DiscardUnknown=true`, so any unknown extra fields are ignored.

## Example: populating Redis

Example: add node `gateway-1` to the nodes set and store a minimal snapshot.

```
SADD xds:nodes gateway-1
HSET xds:snapshot:gateway-1 \
  version "1" \
  clusters '[
    {
      "name": "example_cluster",
      "connectTimeout": "1s",
      "type": "STATIC",
      "loadAssignment": {
        "clusterName": "example_cluster",
        "endpoints": [
          {
            "lbEndpoints": [
              {"endpoint": {"address": {"socketAddress": {"address": "127.0.0.1", "portValue": 8080}}}}
            ]
          }
        ]
      }
    }
  ]' \
  routes '[
    {
      "name": "local_route",
      "virtualHosts": [
        {
          "name": "local_service",
          "domains": ["*"],
          "routes": [
            {
              "match": {"prefix": "/"},
              "route": {"cluster": "example_cluster"}
            }
          ]
        }
      ]
    }
  ]' \
  listeners '[
    {
      "name": "listener_0",
      "address": {"socketAddress": {"address": "0.0.0.0", "portValue": 10000}},
      "filterChains": [
        {
          "filters": [
            {
              "name": "envoy.filters.network.http_connection_manager",
              "typedConfig": {
                "@type": "type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager",
                "statPrefix": "ingress_http",
                "routeConfig": {"name": "local_route"},
                "httpFilters": [
                  {"name": "envoy.filters.http.router"}
                ]
              }
            }
          ]
        }
      ]
    }
  ]' \
  secrets '[
    {
      "name": "example_validation_context",
      "validationContext": {
        "trustedCa": {"filename": "/etc/ssl/certs/ca.crt"}
      }
    }
  ]'
```

If needed, you can additionally provide `endpoints` and/or `secrets` as separate arrays of `ClusterLoadAssignment` and `Secret` objects.

## Loader behavior

- On startup, the service reads the set `<ns>:nodes` and, for each node, tries to read `HGETALL <ns>:snapshot:<nodeID>`.
- For each collection, it parses the Protobuf JSON array into concrete Envoy v3 types (Clusters, Routes, Listeners and, if present, Endpoints and Secrets) and builds a `cache.Snapshot` with a single version (taken from the `version` field).
- If a node's data is corrupted or cannot be parsed, the service logs a warning and skips that node without stopping.

## Compatibility

- The format uses Protobuf JSON (google.golang.org/protobuf/encoding/protojson).
- Fields and types correspond to Envoy v3 API: Cluster, RouteConfiguration, Listener, ClusterLoadAssignment, Secret.
- Unused/extra fields in JSON are ignored.

## Diagnostics

- If `<ns>:nodes` is empty or missing, snapshots will not be loaded.
- For troubleshooting, check keys and JSON validity:
  - `SMEMBERS <ns>:nodes`
  - `HGETALL <ns>:snapshot:<nodeID>`

## Writing a snapshot to Redis from code

There is a package `internal/xds/redisstore` for applications that encapsulates Redis operations:

- `redisstore.NewFromEnv()` — creates a client based on environment variables (see the "Environment variables" section).
- `client.SaveSnapshot(ctx, nodeID, snapshot)` — writes a node snapshot to Redis according to the schema above and adds `nodeID` to the set `<ns>:nodes`.

Example:

```go
ctx := context.Background()
client := redisstore.NewFromEnv()
// snapshot is a cache.ResourceSnapshot (e.g., *cache.Snapshot)
if err := client.SaveSnapshot(ctx, "gateway-1", snapshot); err != nil {
    log.Fatalf("save snapshot: %v", err)
}
```

Notes:
- A single string `version` is stored in Redis. If the snapshot has different versions by resource type, the first non-empty among: CLUSTER, ROUTE, LISTENER, ENDPOINT, SECRET is used. If all are empty, "1" is used.
- Collections are serialized as Protobuf JSON arrays. Empty collections are saved as `[]`.


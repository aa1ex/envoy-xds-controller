# xds-snap

A simple CLI tool to **fetch, convert, and print Envoy xDS snapshots** for a given `node_id`.

This utility is built with [go-control-plane](https://github.com/envoyproxy/go-control-plane) and [spf13/cobra](https://github.com/spf13/cobra).

---

## Features

- **Fetch** current resources from an xDS Aggregated Discovery Service (ADS) server by `node_id`.
- **Archive** snapshots into a `.tgz` bundle containing `DiscoveryResponse` objects for each resource type.
- **Convert** archives between **protobuf binary** (`.pb`) and **proto-JSON** (`.json`) formats.
- **Print** archive contents in human-readable JSON for inspection or debugging.

---

## Installation

```bash
git clone https://github.com/your-org/xds-snap.git
cd xds-snap

go mod tidy
go build -o xds-snap .
```

Dependencies:
- Go 1.21+
- github.com/spf13/cobra
- github.com/envoyproxy/go-control-plane
- google.golang.org/grpc
- google.golang.org/protobuf

## Usage

### Fetch snapshot

```bash
./xds-snap fetch \
  --xds-addr localhost:18000 \
  --node-id gateway-1 \
  --out snapshot.tgz \
  --format proto
```

This command connects to the ADS server, requests resources for the given node_id, and saves them in a snapshot.tgz archive.

Supported resource types: cds, lds, rds, eds, sds, runtimes.

TLS options:
•	--insecure (default: true) — connect without TLS
•	--cacert, --cert, --key, --sni — for TLS/mTLS connections

### Convert archive

```bash
./xds-snap convert --in snapshot.tgz --out snapshot-json.tgz --to json
./xds-snap convert --in snapshot-json.tgz --out snapshot-proto.tgz --to proto
```
Converts existing archives between binary protobuf and JSON formats.

### Print archive

```bash
# print all resources
./xds-snap print --in snapshot.tgz

# print only CDS resources
./xds-snap print --in snapshot.tgz --type cds
```

Prints resources in full JSON representation.

### Load snapshot to Redis

```bash
./xds-snap load-redis \
  --in snapshot.tgz \
  --node-id gateway-1 \
  --redis-addr 127.0.0.1:6379 \
  --redis-db 0 \
  --redis-namespace xds
```

This command reads a snapshot archive (.tgz) produced by fetch/convert, reconstructs an xDS snapshot and stores it into Redis using the internal redisstore. It also writes metadata indicating it was loaded via xds-snap with the tool version.

Flags default from environment variables when not provided:
- REDIS_ADDR
- REDIS_PASSWORD
- REDIS_DB
- XDS_REDIS_NS

### Version

```bash
./xds-snap version
```

## Archive Structure

Each snapshot archive (.tgz) contains:
- metadata.json — snapshot metadata (node_id, xds_addr, fetch time, format, types)
- One file per resource type, e.g.:
- cds.pb, lds.pb, rds.pb, eds.pb
- or the same files with .json extension (proto-JSON)

Each file contains a full DiscoveryResponse message with:
- version_info
- type_url
- resources[]

## Example Workflow
1.	Fetch snapshot for a node:

```bash
./xds-snap fetch --xds-addr localhost:18000 --node-id test --out snap.tgz --format proto 
```
2. Convert to JSON for inspection:

```bash
./xds-snap convert --in snap.tgz --out snap-json.tgz --to json
```
3. Print all listeners:

```bash
./xds-snap print --in snap-json.tgz --type lds
```
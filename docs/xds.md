# xDS Server Overview

This document explains how the internal xDS server is implemented in `envoy-xds-controller`, including its responsibilities, structure, and integration with Kubernetes.

---

## 📡 What is xDS?

xDS is a set of APIs used by [Envoy Proxy](https://www.envoyproxy.io/) to dynamically receive configuration updates from a control plane. The core xDS APIs used in this controller include:

- **CDS** – Cluster Discovery Service
- **EDS** – Endpoint Discovery Service
- **LDS** – Listener Discovery Service
- **RDS** – Route Discovery Service

---

## ⚙️ Implementation Overview

The controller uses [go-control-plane](https://github.com/envoyproxy/go-control-plane) to implement an xDS server compatible with Envoy v3 APIs.

### Key Packages:

| Package | Description |
|--------|-------------|
| `internal/xds/cache` | Stores xDS snapshots for each Envoy node. |
| `internal/xds/updater` | Listens to Kubernetes events and updates the xDS cache. |
| `internal/xds/api` | Initializes and runs the xDS gRPC server. |

---

## 🧠 Flow of Updates

1. **Watcher**: The controller watches Kubernetes Services, Endpoints, and optionally CRDs.
2. **Updater**: Converts these objects into Envoy resources (clusters, listeners, routes, etc.).
3. **Snapshot Cache**: Updates a per-node cache using go-control-plane APIs.
4. **gRPC Server**: Serves xDS endpoints (`/v3/discovery:endpoint`, etc.) for connected Envoy instances.

---

## 🔄 Dynamic Configuration

The controller supports hot reload of configuration without restarting Envoy. When a watched Kubernetes object changes, the update is propagated to Envoy within milliseconds.

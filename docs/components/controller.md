# controller

Kubernetes controller/operator that watches Envoy custom resources and Kubernetes objects to build and publish xDS snapshots to Redis for the xds-service to consume. It also runs admission webhooks for validating resources and exposes health/metrics endpoints.

Additionally, the controller can act as an xDS Service itself (ADS server). In this mode it serves the Envoy xDS API directly using the snapshots it produces, allowing Envoy proxies to connect to the controller without a separate xds-service component. This is optional and can be enabled by configuration in deployments that prefer an all-in-one control plane.

## Features
- Reconciliation: watches CRDs (e.g., Envoy VirtualService, Listener) and K8s resources, converts them into Envoy xDS resources, and writes versioned snapshots into Redis.
- Webhooks: validating/mutating webhooks for CRDs; certificate management is handled via the init-cert job/binary.
- Manager runtime: controller-runtime Manager with leader election, probes, metrics, and dynamic cache options.
- File watching (optional): watch local files and update store in dev/test mode.
- Optional embedded xDS server (ADS): serve LDS/RDS/CDS/EDS directly to Envoy using internally built snapshots (bypassing standalone xds-service).

## Usage
Run the controller binary (cmd/main.go). Typical deployment is as a Kubernetes Deployment with RBAC, Service, and optional WebhookConfiguration.

When the embedded xDS Service mode is enabled, point Envoy to the controller's xDS gRPC endpoint; otherwise, use the standalone xds-service.

## Configuration
Via envconfig and flags; typical options include:
- NAMESPACE, METRICS_ADDR, HEALTH_PROBE_ADDR
- REDIS_ADDR/REDIS_DB/REDIS_PASSWORD
- WEBHOOK_PORT, ENABLE_WEBHOOKS
- TLS_CERT/TLS_KEY or use init-cert
- DEBUG to enable development logging
- (Optional) xDS gRPC port/flags when running embedded xDS Service (see deployment values/source)

## Operational notes
- Exposes /healthz and /readyz; metrics served on configured address with standard controller-runtime filters.
- Publishes snapshots to Redis consumed by xds-service; can interact with xds-gateway for routing if configured.
- In embedded xDS mode, Envoy connects directly to the controller's gRPC xDS endpoint; Redis remains the snapshot store for consistency and decoupling.

## Observability
- Zap structured logging; Prometheus metrics via controller-runtime.

## Dependencies
- Kubernetes API, Redis; optional cert manager or bundled init-cert. In embedded xDS mode, no separate xds-service is required.

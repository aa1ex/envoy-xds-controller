# C4 Model for Envoy xDS Platform

This directory contains the C4-PlantUML model derived from docs/architecture.puml and aligned with the rest of the documentation in docs/.

Diagrams available in model.puml (multi-diagram file):
- C1_Context — System Context
- C2_Containers — Container Diagram
- C3_xds_gateway_components — Components of xds-gateway
- C3_controller_components — Components of envoy-xds-controller

How to render:
- Use any PlantUML-compatible tool that supports remote includes.
- The file references the C4-PlantUML library via includeurl.

Notes:
- Sources consulted: docs/architecture.puml, docs/architecture.md, docs/overview.md, docs/components/*, docs/xds-gateway.md.
- Redis acts as snapshot/route store with Pub/Sub for cache invalidation.
- Envoy (Gateway) connects to either xds-service or controller (optional embedded xDS) and uses gRPC ExtProc to call xds-gateway.

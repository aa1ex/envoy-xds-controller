# Redis dev manifests

This directory contains simple Kubernetes manifests to run Redis locally for development and testing.

What it provides
- A Deployment with a single Redis pod (redis:8.0.3) with AOF enabled.
- A ClusterIP Service named `redis` exposing port 6379.
- Ephemeral storage via emptyDir (good for local dev; data is lost when the pod restarts or is rescheduled).

Prerequisites
- A running Kubernetes cluster (kind, minikube, Docker Desktop, etc.).
- kubectl configured to point to your cluster.

Deploy
- kubectl apply -f dev/redis/k8s.yaml

Verify
- kubectl get pods -l app=redis
- kubectl logs deploy/redis

Connect from inside the cluster
- Service DNS name: `redis`
- Port: 6379
- Example env for xds-service:
  - REDIS_ADDR=redis:6379
  - REDIS_DB=0 (default)
  - REDIS_PASSWORD unset (no auth enabled in this manifest)

Connect from your machine (port-forward)
- kubectl port-forward svc/redis 6379:6379
- Then use REDIS_ADDR=127.0.0.1:6379

Cleanup
- kubectl delete -f dev/redis/k8s.yaml

Notes
- Persistence: This setup uses emptyDir for simplicity. If you need data persistence across pod restarts, replace the emptyDir volume with a PersistentVolumeClaim and a suitable StorageClass.
- Security: AUTH is disabled for convenience in dev. For non-dev environments, enable a password (e.g., via command args/env and a Secret) and restrict access.

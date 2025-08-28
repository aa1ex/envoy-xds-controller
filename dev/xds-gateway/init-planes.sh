#!/bin/sh

set -eu

curl -fsS --retry 60 --retry-all-errors --retry-delay 1 \
  --connect-timeout 1 http://xds-gateway:8080/healthz >/dev/null

echo "Seeding planes via xds-gateway REST API..."
curl -fsS -X PUT http://xds-gateway:8080/api/v1/planes/default \
  -H 'Content-Type: application/json' \
  -d '{"address":"xds-service-a","port":18000,"enabled":true}'

curl -fsS -X PUT http://xds-gateway:8080/api/v1/planes/b \
  -H 'Content-Type: application/json' \
  -d '{"address":"xds-service-b","port":18000,"enabled":true}'

curl -fsS -X PUT http://xds-gateway:8080/api/v1/defaults/route \
  -H 'Content-Type: application/json' \
  -d '{"target":"default"}'

echo "Init done."

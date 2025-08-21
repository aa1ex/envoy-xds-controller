#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

kubectl create ns redis

kubectl apply -f "${SCRIPT_DIR}/../dev/redis" -n redis
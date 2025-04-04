#!/bin/bash

helm repo add dex https://charts.dexidp.io

helm install dex --wait dex/dex
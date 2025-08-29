# init-cert

init-cert is a helper binary designed to create or rotate TLS certificates for the validating webhook and store them in a Kubernetes Secret. It also patches the ValidatingWebhookConfiguration with the generated CA bundle, enabling secure webhook communication.

## Features
- Generate/refresh webhook server certificate and key, store them in a Secret.
- Decide whether rotation is needed based on expiration/metadata.
- Patch ValidatingWebhookConfiguration to include the current CA bundle.

## Usage
Typically executed as a Kubernetes Job or initContainer.

## Configuration
Environment variables (see cmd/init-cert/main.go):
- NAMESPACE: target namespace
- WEBHOOK_NAME: ValidatingWebhookConfiguration name
- SERVICE_NAME: Service name that fronts the webhook server
- SECRET_NAME: Secret to store TLS material
- RENEW_BEFORE_DAYS: Days before expiry to renew (optional)
- DEBUG: enable development logging

## Operational notes
- Talks to Kubernetes API using in-cluster credentials.
- Idempotent: safe to re-run; updates only when required.

## Dependencies
- Kubernetes API access with permissions to read/write Secrets and patch ValidatingWebhookConfiguration.

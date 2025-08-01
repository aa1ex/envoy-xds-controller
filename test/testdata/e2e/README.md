# E2E Test Data Directory Structure

This directory contains test data used by the end-to-end (e2e) tests. The directories are organized by test scenario to make it easier to understand how they correspond to the tests.

## Directory Structure

| Directory | Purpose | Test File | Description |
|-----------|---------|-----------|-------------|
| basic_https_service | Basic HTTPS virtual service | envoy_basic_test.go | Contains configuration for basic HTTPS virtual service tests with TLS |
| virtual_service_templates | Virtual service templates | envoy_templates_test.go | Contains configuration for testing virtual service templates |
| file_access_logging | File access logging | envoy_basic_test.go | Contains configuration for testing file-based access logging |
| tcp_proxy | TCP proxy | envoy_tcp_proxy_test.go | Contains configuration for testing TCP proxy functionality |
| http_service | HTTP service | envoy_basic_test.go | Contains configuration for testing HTTP services without TLS |
| unused_virtual_service | Unused virtual service | - | Contains a single virtual service file, not used in automated tests |
| template_validation | Template validation | envoy_validation_test.go | Contains configuration for testing template validation with multiple root routes |
| grpc | gRPC API | grpc_api_test.go | Contains configuration for testing gRPC API functionality |

## Implementation Plan

To rename the directories from their original names (vs1, vs2, etc.) to the more descriptive names above, follow these steps:

1. Create a backup of the original directories:
   ```bash
   mkdir -p /tmp/e2e_backup_$(date +%Y%m%d%H%M%S)
   cp -r test/testdata/e2e /tmp/e2e_backup_$(date +%Y%m%d%H%M%S)
   ```

2. Rename the directories:
   ```bash
   mv test/testdata/e2e/vs1 test/testdata/e2e/basic_https_service
   mv test/testdata/e2e/vs2 test/testdata/e2e/virtual_service_templates
   mv test/testdata/e2e/vs3 test/testdata/e2e/file_access_logging
   mv test/testdata/e2e/vs4 test/testdata/e2e/tcp_proxy
   mv test/testdata/e2e/vs5 test/testdata/e2e/http_service
   mv test/testdata/e2e/vs6 test/testdata/e2e/unused_virtual_service
   mv test/testdata/e2e/vs7 test/testdata/e2e/template_validation
   ```

3. Update references in the test files:
   ```bash
   # For each test file in test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs1|test/testdata/e2e/basic_https_service|g' test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs2|test/testdata/e2e/virtual_service_templates|g' test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs3|test/testdata/e2e/file_access_logging|g' test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs4|test/testdata/e2e/tcp_proxy|g' test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs5|test/testdata/e2e/http_service|g' test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs6|test/testdata/e2e/unused_virtual_service|g' test/e2e/*.go
   sed -i 's|test/testdata/e2e/vs7|test/testdata/e2e/template_validation|g' test/e2e/*.go
   ```

4. Verify that all tests still work:
   ```bash
   make test-e2e
   ```

## Directory Contents

### basic_https_service (formerly vs1)
- `listener.yaml`: HTTPS listener configuration
- `tls-cert.yaml`: TLS certificate configuration
- `virtual-service.yaml`: Virtual service configuration

### virtual_service_templates (formerly vs2)
- `access-log-config.yaml`: Access log configuration
- `http-filter.yaml`: HTTP filter configuration
- `virtual-service-template.yaml`: Virtual service template configuration
- `virtual-service.yaml`: Virtual service configuration

### file_access_logging (formerly vs3)
- `access-log-config.yaml`: File-based access log configuration

### tcp_proxy (formerly vs4)
- `cluster.yaml`: Cluster configuration for TCP proxy
- `listener.yaml`: TCP listener configuration
- `tcp-echo-server.yaml`: TCP echo server configuration
- `virtual-service.yaml`: Virtual service configuration for TCP proxy

### http_service (formerly vs5)
- `http-listener.yaml`: HTTP listener configuration
- `vs.yaml`: Virtual service configuration for HTTP

### unused_virtual_service (formerly vs6)
- `virtual-service.yaml`: Unused virtual service configuration

### template_validation (formerly vs7)
- `cert.yaml`: Certificate configuration
- `listener.yaml`: Listener configuration
- `route.yaml`: Route configuration
- `virtual-service-template-1.yaml`: First virtual service template
- `virtual-service-template-2.yaml`: Second virtual service template with multiple root routes
- `virtual-service.yaml`: Virtual service configuration
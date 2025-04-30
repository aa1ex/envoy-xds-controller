# Virtual service templates


## Template options

Modifiers:
- merge (by default) - merges object fields, overrides primitive types in existing objects, merges lists
- replace - replaces objects, replaces lists
- delete - deletes a field by key (does not work for list elements)


### Examples

using:
```yaml
apiVersion: envoy.kaasops.io/v1alpha1
kind: VirtualService
metadata:
  name: demo-virtual-service
  annotations:
    envoy.kaasops.io/node-id: test
spec:
  template:
    name: https-template
  templateOptions:
    - field: accessLogConfig
      modifier: delete
    - field: additionalHttpFilters
      modifier: replace
  additionalHttpFilters:
    - my-filter-1
    - my-filter-2
...
```

```yaml
apiVersion: envoy.kaasops.io/v1alpha1
kind: VirtualServiceTemplate
metadata:
  name: https-template
spec:
  listener:
    name: https
  accessLogConfig:
    name: access-log-config
  tlsConfig:
    autoDiscovery: true
  virtualHost:
    name: test-virtual-host
    routes:
      - match:
          prefix: "/"
        direct_response:
          status: 200
          body:
            inline_string: "{\"message\":\"Hello from template\"}"
```

```yaml
apiVersion: envoy.kaasops.io/v1alpha1
kind: VirtualService
metadata:
  name: demo-virtual-service
  annotations:
    envoy.kaasops.io/node-id: test
spec:
  template:
    name: https-template
  accessLogConfig:
    name: access-log-config-2
  virtualHost:
    domains:
      - exc.kaasops.io
```

```yaml
apiVersion: envoy.kaasops.io/v1alpha1
kind: VirtualService
metadata:
  name: demo-virtual-service
  annotations:
    envoy.kaasops.io/node-id: test
spec:
  template:
    name: https-template
  templateOptions:
    - field: accessLogConfig
      modifier: delete
  accessLog:
    name: envoy.access_loggers
    typed_config:
      "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
      log_format:
        json_format:
          message: "%LOCAL_REPLY_BODY%"
          status: "%RESPONSE_CODE%"
          duration: "%DURATION%"
  virtualHost:
    domains:
      - exc.kaasops.io
```



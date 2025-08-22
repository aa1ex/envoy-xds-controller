# xds-gateway — Техническое задание (ТЗ)

## 0. Реквизиты

- Проект: xds-gateway — шлюз маршрутизации Envoy-клиентов к нескольким xDS control‑plane (multi‑plane)
- Версия ТЗ: 1.0 (MVP)
- Ответственные: Архитектор / Ведущий разработчик / DevOps (TBD)
- Цель релиза: безопасные A/B/N-выкатки конфигураций Envoy, адресное и групповое переключение клиентов без изменения их bootstrap

---

## 1. Обзор и цели

xds-gateway предоставляет единую точку входа для Envoy-клиентов и динамически направляет их xDS‑стримы на выбранный control‑plane согласно политикам.

### 1.1 Цели

- Централизованное управление тем, какой Envoy получает конфигурацию от какого control‑plane.
- Поддержка нескольких плоскостей (N ≥ 2): A/B, canary, blue/green, stage/prod.
- Изоляция и быстрый rollback без правки bootstrap клиентов.
- Минимальная добавленная латентность при установлении xDS‑стрима.

### 1.2 Не-цели (MVP)

- Не реализуем UI (веб‑панель) — только REST API.
- Не реализуем тонкие стратегические политики (гео/нагрузка/временные окна) — база под это заложена.
- Не заменяем сами control‑plane — только маршрутизируем к ним.

---

## 2. Термины

- Client / Envoy‑клиент — процесс Envoy, устанавливающий ADS/xDS‑стрим.
- Control‑plane (plane) — xDS‑сервер, отдающий конфигурацию (plane_id ∈ S).
- Front Envoy / Gateway — Envoy‑инстанс, принимающий downstream gRPC/xDS от клиентов и проксирующий upstream на выбранный plane.
- Policy Service — сервис принятия маршрутизирующих решений (ext_proc) + REST API для управления правилами.
- client_key — идентификатор клиента (authority, SPIFFE ID или node.id).

---

## 3. Высокоуровневая архитектура

Компоненты:

1. Front Envoy с фильтром envoy.filters.http.ext_proc и маршрутизацией через `cluster_header`: `x-route-cluster`.
2. Routing Policy Service (Go):
   - gRPC сервер для ExtProc (Envoy External Processing v3)
   - REST API для CRUD правил/реестра
   - Хранилище (Redis) + LRU‑кэш
3. Реестр control‑plane: описание всех доступных плоскостей planes.
4. xds‑planes: `xds_A`, `xds_B`, …, каждый как upstream cluster в Front Envoy.

Поток (simplified):

- Клиент → Front Envoy (HTTP/2 gRPC, ADS).
- Front Envoy → Policy Service (ExtProc RequestHeaders).
- Policy Service → возвращает `x-route-cluster: xds_<plane_id>`.
- Front Envoy → маршрутизирует стрим к соответствующему upstream cluster.

---

## 4. Функциональные требования

1. Единая точка входа для всех Envoy‑клиентов (один DNS/адрес).
2. Адресная маршрутизация: правило per‑client (`client_key → plane_id`).
3. Групповая маршрутизация: `cohort → plane_id` + членство клиента в cohort.
4. Default‑маршрут: глобальный `default_plane_id`.
5. Мульти‑plane: число плоскостей N не ограничено (ограничения — инфраструктурные).
6. Fail‑safe: при недоступности Policy Service — используется маршрут по умолчанию в Envoy (см. §9); при недоступности выбранного plane — fallback (см. §8).
7. mTLS (опционально в MVP) на downstream (клиент↔Front Envoy) и/или upstream.
8. Смена решения без рестарта клиента — применяется при переоткрытии xDS‑стрима; принудительное обновление допускается закрытием стрима (не MVP).
9. Аудит (минимум): логирование изменений правил; полнофункциональный аудит в post‑MVP.

---

## 5. Нефункциональные требования

- Производительность: p95 latency ExtProc Decision ≤ 30 ms при 1k одновременных соединениях; целевое p99 ≤ 50 ms.
- Пропускная способность: 5k установок xDS‑стрима/мин без деградации (MVP мета‑настройка).
- Доступность: SLA 99.9% для Front Envoy и Policy Service (в HA конфигурации).
- Масштабируемость: горизонтальное масштабирование Front Envoy и Policy Service; Redis — кластер/сентинел.
- Наблюдаемость: Prometheus метрики, структурные логи, трассировка (OTLP) — базовая интеграция.
- Безопасность: секреты в Secret‑хранилище, ограниченные network‑политики, минимальные привилегии.

---

## 6. Интерфейсы

### 6.1 gRPC ExtProc (Envoy ↔ Policy Service)

- Режим: обработка RequestHeaders.
- Вход: HTTP/2 заголовки, в т.ч. `:authority`, метаданные TLS (если доступны), дополнительные x‑заголовки.
- Выход: Header Mutation `x-route-cluster: xds_<plane_id>`. При ошибке/таймауте заголовок не устанавливается — отработает статический маршрут по умолчанию в Envoy (см. §9).
- Стабильность: идемпотентно; таймаут ответа ≤ 200 ms; retry в Envoy не используется (fail‑open через маршрут по умолчанию).
- Защита от спуфинга: входящий `x-route-cluster` от клиента удаляется на уровне маршрута/виртуального хоста (см. §9).

### 6.2 REST API (управление)

Base: `/api/v1` (JSON). Авторизация — Bearer Token (MVP).

Плоскости (реестр):

- `PUT /planes/{plane_id}` — создать/изменить.

```json
{ "address": "xds-a.internal", "port": 18000, "enabled": true, "region": "eu", "weight": 100 }
```

- `GET /planes` — список.
- `GET /planes/{plane_id}` — детально.
- `DELETE /planes/{plane_id}` — удалить.

Правила:

- `PUT /clients/{client_key}` → `{ "target": "plane_id" }`.
- `DELETE /clients/{client_key}`.
- `GET /clients/{client_key}` → `{ target?: string, cohort?: string, resolved: string }`.

Когорты:

- `PUT /cohorts/{name}` → `{ "target": "plane_id" }`.
- `DELETE /cohorts/{name}`.
- `PUT /clients/{client_key}/cohort` → `{ "name": "blue" }`.
- `DELETE /clients/{client_key}/cohort`.

Default:

- `PUT /defaults/route` → `{ "target": "plane_id" }`.
- `GET /resolve/{client_key}` → `{ "resolved": "plane_id", "source": "client|cohort|default", "plane_enabled": true }`.

Коды ошибок: 400 (валидация), 401/403 (auth), 404 (not found), 409 (конфликты), 500 (внутренняя ошибка).

---

## 7. Модель данных

### 7.1 Redis (MVP)

Ключи (строки, namespace `xds-gw:`):

- `xds-gw:plane:{plane_id}` → JSON: `{address,port,enabled,region,weight}`
- `xds-gw:route:client:{client_key}` → `plane_id`
- `xds-gw:client:cohort:{client_key}` → `cohort`
- `xds-gw:route:cohort:{cohort}` → `plane_id`
- `xds-gw:route:default` → `plane_id`

Правила формирования ключей:
- `{client_key}` и имена cohort нормализуются (экранируются) для использования в ключах (например, base64url без паддинга).

TTL: отсутствует (постоянные правила).
Кэш в Policy Service: LRU (например, Ristretto) с TTL 60s, размер 50k ключей. Негативное кэширование (отсутствие ключа) — TTL 5–10s.
Инвалидация кэша: через pub/sub канал Redis `xds-gw:events` (тип события: plane/route/cohort/default).

### 7.2 Postgres (post‑MVP, на будущее)

Таблицы: planes, client_rules, cohorts, cohort_rules, client_memberships, defaults, audit_log.

---

## 8. Алгоритм принятия решения (Resolve)

Приоритеты:

1. Если есть `route:client:{client_key}` → `plane_id1`.
2. Иначе, если есть `client:cohort:{client_key}` = C и `route:cohort:{C}` → `plane_id2`.
3. Иначе → `route:default` → `plane_id3`.

Далее проверки:

- Если выбранный plane отсутствует или `enabled=false` — fallback: последовательно по приоритетам (cohort → default → глобальный default‑кластер Envoy).
- Если итоговый plane неизвестен (нет в реестре) — используется маршрут по умолчанию Envoy.
- (Опционально) health‑cache от Front Envoy: учитывать, что plane «красный».

Результат: `plane_id`, `source` (`client|cohort|default`).

---

## 9. Конфигурация Front Envoy (MVP)

Основные настройки:

- Listener: TCP 443, HCM с `http2_protocol_options: {}` и `stream_idle_timeout: 0s`.
- Фильтры: `ext_proc` (RequestHeaders, `failure_mode_allow: true`, `message_timeout` ≤ 200ms), затем `router`.
- Route:
  - Удалять входящий заголовок `x-route-cluster` от клиента (на уровне virtual_host/request_headers_to_remove) для защиты от спуфинга.
  - Две записи:
    1) match: header_present `x-route-cluster` → `route.cluster_header: "x-route-cluster"`.
    2) match: без заголовка → `route.cluster: xds_<default_plane_id>` (статический default).
- Кластеры:
  - `routing_policy_svc`: HTTP/2 gRPC к Policy Service.
  - `xds_<plane_id>`: STRICT_DNS, HTTP/2, grpc_health_check, outlier_detection, circuit_breakers, retry_back_off.
- TLS:
  - Downstream: опциональный mTLS, `require_client_certificate: true` (при включении), список доверенных CA; минимальная версия TLS 1.2/1.3.
  - Upstream: per‑cluster TLS context к плоскостям и Policy Service.

Обновление перечня `xds_<plane_id>`:

- Статически (MVP) — управлять ConfigMap’ом.
- Динамически (post‑MVP) — CDS/EDS для самого Front Envoy на базе реестра planes.

Примечание по fail‑open:
- При недоступности Policy Service ExtProc не выставит заголовок — сработает маршрут №2 на статический default‑кластер.

---

## 10. Безопасность

- Downstream mTLS: идентификация клиента по SAN/SPIFFE — может выступать `client_key`. При использовании — обязателен список доверенных CA и CRL/OCSP (по возможности).
- Upstream TLS: зашифрованные соединения к плоскостям и Policy Service. Минимальная версия TLS и допустимые cipher suites определены политикой.
- Auth REST API: Bearer Token (секрет в Secret-хранилище); позже — OIDC и RBAC. Базовые лимиты RPS/размеров запросов.
- Секреты: хранение в Kubernetes Secrets/External Secrets; ротация.
- Network Policy: ограничить доступ к Policy/Redis только из Front Envoy и админ-подов.
- Header hardening: удаление входящего `x-route-cluster` до ExtProc; downstream не может управлять маршрутизацией.
- Защита от DoS: лимиты на количество одновременных xDS‑стримов, circuit breaking и outlier detection на upstream, basic rate limit на REST.

---

## 11. Наблюдаемость

### 11.1 Метрики (Prometheus)

- Policy Service:
  - `policy_resolve_total{source}`
  - `policy_resolve_latency_ms{quantile}`
  - `policy_cache_hits_total` / `policy_cache_misses_total`
  - `policy_store_errors_total`
  - `policy_active_planes_total`
- Front Envoy (стандартные):
  - `http2.upstream_cx_active{cluster}`
  - `cluster.<name>.upstream_rq_time{quantile}`
  - `cluster.<name>.health_check.*`
  - `listener.downstream_cx_active`

### 11.2 Логи

- Структурные JSON логи Policy Service: запросы API, изменения правил, решения Resolve (сэмплированные).
- Envoy access logs (gRPC) с `:authority`, `x-route-cluster` (без PII).

### 11.3 Трейсинг

- OTLP экспорт (optional) из Policy Service; Envoy tracing (optional) — низкий приоритет в MVP.

---

## 12. Отказоустойчивость и масштабирование

- Front Envoy: ≥2 реплики за L4‑балансировщиком; readiness/liveness пробы.
- Policy Service: ≥2 реплики; stateless; HPA по CPU/RPS; таймауты 200 ms; graceful shutdown.
- Redis: Sentinel/Cluster; резервное копирование снапшотов; ограничение ключей; AOF (минимизация RPO).
- FMEA: при падении Policy — fail‑open на default (см. §9); при падении plane — health‑чек фронта исключит его; circuit breakers ограничат каскадные сбои.

---

## 13. Тестирование

### 13.1 Unit

- Resolve‑логика (все ветки: client/cohort/default, `enabled=false`, unknown plane).
- Валидация входов REST API.

### 13.2 Интеграция

- Контракт ExtProc (RequestHeaders → HeaderMutation).
- Redis + Policy Service (кэш‑инвалидация, ошибки, таймауты).

### 13.3 E2E

- 3 клиента, 3 плоскости: default=A; client‑override → B; cohort=blue → C; отключение B.
- Fail‑open: выключить Policy Service — клиенты идут на default.

### 13.4 Нагрузочные

- 1k/5k одновременных установок xDS‑стрима; измерить p95, p99 ExtProc.

### 13.5 Chaos

- Убийство подов Policy/Redis/plane; проверка корректности фолбэков.

---

## 14. Развёртывание (Kubernetes)

- Образы:
  - `envoyproxy/envoy:v1.31.x` (или актуальная LTS)
  - `org/xds-policy-service:<tag>` (Go 1.23+)
- Манифесты: Deployments, Services, ConfigMaps (`envoy.yaml`), Secrets, HPAs, NetworkPolicy.
- Параметры среды Policy Service:
  - `REDIS_ADDR`
  - `DEFAULT_PLANE_ID` (например, `xds_A`)
  - `AUTH_TOKEN`
  - `CACHE_TTL_SECONDS`
  - `NEGATIVE_CACHE_TTL_SECONDS`
- Probes: `/healthz` (liveness), `/readyz` (readiness) у Policy Service.
- CI/CD: build & push образы; apply манифестов через GitOps.

---

## 15. Миграция (из A/B к N‑plane)

1. Включить реестр planes и добавить текущие A/B как `xds_A`, `xds_B`.
2. Перевести правила на generic `plane_id`.
3. Добавлять новые planes (C, D) без смены конфигурации клиентов.

---

## 16. Риски и меры

- Бутылочное горлышко ExtProc → масштабировать Policy, кэшировать решения, короткие таймауты, fail‑open.
- Несогласованность реестра и фронта → GitOps, атомарные апдейты, алерты при отсутствии кластера `xds_<plane_id>`.
- Ошибки правил → dry‑run endpoint (post‑MVP), сэмпловый анализ, аудит изменений.

---

## 17. Критерии приёмки (MVP)

- Клиенты подключаются к одному endpoint и получают конфиг с нужного plane согласно заданным правилам.
- Переключение клиента между плоскостями через REST API отражается на новом xDS‑стриме без рестартов клиента.
- При остановке Policy Service клиенты продолжают получать конфиг с default plane через статический маршрут по умолчанию (без `x-route-cluster`).
- Заголовок `x-route-cluster` от клиента не влияет на маршрутизацию (удаляется на входе).
- Метрики доступны в Prometheus; логи — структурные.

---

## 18. Приложения

### 18.1 Пример bootstrap клиента (фрагмент)

```yaml
# Полный bootstrap Envoy-клиента, который получает конфигурацию по ADS
# через фронтовой шлюз xds-gateway. Уникальность клиента задаём через
# 'authority' (используется шлюзом для адресной маршрутизации).

node:
  id: "${ENVOY_NODE_ID:-node-123}"          # уникальный ID узла (произвольный)
  cluster: "${ENVOY_NODE_CLUSTER:-default}" # логическая группа (опционально)
  metadata:
    instance: "${HOSTNAME}"

dynamic_resources:
  # All-in-ADS: все xDS (LDS/CDS/RDS/EDS) через ADS
  ads_config:
    api_type: GRPC
    transport_api_version: V3
    grpc_services:
      - envoy_grpc:
          cluster_name: xds_cluster
        # ВАЖНО: authority — то, чем мы идентифицируем клиента на шлюзе
        # (можно генерировать из node.id; главное — уникально/стабильно)
        authority: "${XDS_AUTHORITY:-node-123.xds.company}"

  lds_config: { ads: {} }
  cds_config: { ads: {} }
  # Если используете RDS/EDS, они тоже будут через ADS:
  # rds и eds можно не указывать: Envoy сам запросит их через ADS, когда понадобятся.

static_resources:
  clusters:
    - name: xds_cluster
      type: STRICT_DNS
      connect_timeout: 1s
      http2_protocol_options: {}            # gRPC/xDS требует HTTP/2
      load_assignment:
        cluster_name: xds_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: "${XDS_GATEWAY_HOST:-xds-gateway.company}"
                      port_value: ${XDS_GATEWAY_PORT:-443}
      # Если фронтовой шлюз слушает под TLS — включите upstream TLS:
      transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
          sni: "${XDS_GATEWAY_SNI:-xds-gateway.company}"
          # (опционально) доверенный корневой сертификат шлюза
          # common_tls_context:
          #   validation_context:
          #     trusted_ca:
          #       filename: /etc/ssl/certs/ca-certificates.crt

# Рекомендуется включить бесконечные таймауты для длительных xDS-стримов
# (иначе прокси может закрывать соединение по idle timeout)
layered_runtime:
  layers:
    - name: static_layer
      static_layer:
        upstream:
          # отключить таймауты на HTTP/2 стримах
          http2:
            stream_error_on_invalid_http_message: false

admin:
  address:
    socket_address:
      address: 127.0.0.1
      port_value: ${ENVOY_ADMIN_PORT:-9901}
```

### 18.2 Пример envoy.yaml фронта (фрагмент)

```yaml
# Фронтовой Envoy — единая точка входа для клиентов.
# Ключевая идея: ext_proc запрашивает Policy Service, который возвращает
# куда слать конкретного клиента. Если заголовок не установлен, идём на xds_default.

static_resources:
  listeners:
    - name: xds_grpc_listener
      address:
        socket_address:
          address: 0.0.0.0
          port_value: ${GATEWAY_PORT:-443}
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: xds_hcm
                codec_type: AUTO
                http2_protocol_options: {}                  # gRPC/xDS = HTTP/2
                stream_idle_timeout: 0s                     # не гасить долгоживущие стримы
                common_http_protocol_options:
                  idle_timeout: 0s
                # Чтобы в ext_proc попала информация о клиентском сертификате (при mTLS):
                forward_client_cert_details: APPEND_FORWARD
                set_current_client_cert_details:
                  subject: true
                  cert: true
                  chain: false
                  dns: true
                  uri: true

                route_config:
                  name: xds_routes
                  virtual_hosts:
                    - name: xds_vhost
                      domains: ["*"]
                      routes:
                        # 1) Если ext_proc установил x-route-cluster → роутим по заголовку
                        - match:
                            prefix: "/"
                            headers:
                              - name: "x-route-cluster"
                                present_match: true
                          route:
                            cluster_header: "x-route-cluster"
                            timeout: 0s
                        # 2) Fail-open / дефолт: если заголовка нет → отправить на xds_default
                        - match: { prefix: "/" }
                          route:
                            cluster: xds_default
                            timeout: 0s

                http_filters:
                  - name: envoy.filters.http.ext_proc
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.ext_proc.v3.ExternalProcessor
                      grpc_service:
                        envoy_grpc:
                          cluster_name: routing_policy_svc
                      processing_mode:
                        request_header_mode: SEND     # нам нужны только заголовки запроса
                      # Если Policy Service недоступен → не рвём запрос, пойдём по default
                      failure_mode_allow: true
                      # (опционально) timeout на ответ внешнего сервиса
                      message_timeout: 0.2s

                  - name: envoy.filters.http.router

        # ↓↓↓ TLS НА ВХОДЕ (включить при необходимости)
        # transport_socket:
        #   name: envoy.transport_sockets.tls
        #   typed_config:
        #     "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
        #     common_tls_context:
        #       tls_certificates:
        #         - certificate_chain: { filename: /etc/envoy/tls/tls.crt }
        #           private_key:       { filename: /etc/envoy/tls/tls.key }
        #       # (опционально) доверенные корневые CAs для mTLS:
        #       # validation_context:
        #       #   trusted_ca: { filename: /etc/envoy/tls/ca.crt }
        #     # Требовать клиентский сертификат (mTLS):
        #     # require_client_certificate: true

  clusters:
    # === сервис политик (ext_proc) ===
    - name: routing_policy_svc
      type: STRICT_DNS
      connect_timeout: 0.25s
      http2_protocol_options: {}
      load_assignment:
        cluster_name: routing_policy_svc
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: ${POLICY_SVC_HOST:-routing-policy}
                      port_value: ${POLICY_SVC_PORT_GRPC:-8081}
      # Если Policy Service за TLS — раскомментируйте:
      # transport_socket:
      #   name: envoy.transport_sockets.tls
      #   typed_config:
      #     "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
      #     sni: ${POLICY_SVC_SNI:-routing-policy}

    # === дефолтный plane (используется, если нет x-route-cluster) ===
    - name: xds_default
      type: STRICT_DNS
      connect_timeout: 1s
      http2_protocol_options: {}
      load_assignment:
        cluster_name: xds_default
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: ${PLANE_DEFAULT_HOST:-xds-a.internal}
                      port_value: ${PLANE_DEFAULT_PORT:-18000}
      # Upstream TLS к plane (если нужен):
      # transport_socket:
      #   name: envoy.transport_sockets.tls
      #   typed_config:
      #     "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
      #     sni: ${PLANE_DEFAULT_SNI:-xds-a.internal}
      health_checks:
        - timeout: 1s
          interval: 2s
          unhealthy_threshold: 2
          healthy_threshold: 2
          grpc_health_check: {}
      outlier_detection:
        consecutive_5xx: 2
        interval: 2s
        base_ejection_time: 10s

    # === дополнительные planes (пример: A/B/C). Можете завести сколько угодно. ===
    - name: xds_A
      type: STRICT_DNS
      connect_timeout: 1s
      http2_protocol_options: {}
      load_assignment:
        cluster_name: xds_A
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: ${PLANE_A_HOST:-xds-a.internal}
                      port_value: ${PLANE_A_PORT:-18000}
      health_checks:
        - timeout: 1s
          interval: 2s
          unhealthy_threshold: 2
          healthy_threshold: 2
          grpc_health_check: {}
      outlier_detection:
        consecutive_5xx: 2
        interval: 2s
        base_ejection_time: 10s

    - name: xds_B
      type: STRICT_DNS
      connect_timeout: 1s
      http2_protocol_options: {}
      load_assignment:
        cluster_name: xds_B
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: ${PLANE_B_HOST:-xds-b.internal}
                      port_value: ${PLANE_B_PORT:-18000}
      health_checks:
        - timeout: 1s
          interval: 2s
          unhealthy_threshold: 2
          healthy_threshold: 2
          grpc_health_check: {}
      outlier_detection:
        consecutive_5xx: 2
        interval: 2s
        base_ejection_time: 10s

    - name: xds_C
      type: STRICT_DNS
      connect_timeout: 1s
      http2_protocol_options: {}
      load_assignment:
        cluster_name: xds_C
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: ${PLANE_C_HOST:-xds-c.internal}
                      port_value: ${PLANE_C_PORT:-18000}
      health_checks:
        - timeout: 1s
          interval: 2s
          unhealthy_threshold: 2
          healthy_threshold: 2
          grpc_health_check: {}
      outlier_detection:
        consecutive_5xx: 2
        interval: 2s
        base_ejection_time: 10s

# Логи и административный интерфейс
admin:
  access_log_path: /dev/stdout
  address:
    socket_address:
      address: 0.0.0.0
      port_value: ${ENVOY_ADMIN_PORT:-9901}

# (опционально) Access Logs уровня HCM
# Можно добавить в HttpConnectionManager:
# access_log:
#   - name: envoy.access_loggers.file
#     typed_config:
#       "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
#       path: /dev/stdout
#       log_format:
#         text_format_source:
#           inline_string: "[%START_TIME%] %REQ(:AUTHORITY)% -> %RESP(x-route-cluster)% %RESPONSE_CODE%\\n"
```

### 18.3 cURL примеры

```bash
# Создать/обновить plane
curl -H "Authorization: Bearer $TOKEN" -X PUT \
-d '{"address":"xds-a.internal","port":18000,"enabled":true}' \
https://gateway-api.company/api/v1/planes/xds_A

# Переключить конкретного клиента на B
curl -H "Authorization: Bearer $TOKEN" -X PUT \
-d '{"target":"xds_B"}' \
https://gateway-api.company/api/v1/clients/node-123.xds.company

# Поставить default на C
curl -H "Authorization: Bearer $TOKEN" -X PUT \
-d '{"target":"xds_C"}' \
https://gateway-api.company/api/v1/defaults/route
```
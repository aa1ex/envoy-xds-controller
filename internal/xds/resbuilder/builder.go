package resbuilder

import (
	"encoding/json"
	"fmt"
	accesslogv3 "github.com/envoyproxy/go-control-plane/envoy/config/accesslog/v3"
	cluster "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	corev3 "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	listenerv3 "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	rbacv3 "github.com/envoyproxy/go-control-plane/envoy/config/rbac/v3"
	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	rbacFilter "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/http/rbac/v3"
	hcmv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	tlsv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/transport_sockets/tls/v3"
	"github.com/envoyproxy/go-control-plane/pkg/wellknown"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/helpers"
	"github.com/kaasops/envoy-xds-controller/internal/protoutil"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/wrapperspb"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"slices"
	"strings"
)

const (
	SecretRefType     = "secretRef"
	AutoDiscoveryType = "autoDiscoveryType"
)

type FilterChainsParams struct {
	UseRemoteAddress     bool
	RouteConfigName      string
	StatPrefix           string
	HTTPFilters          []*hcmv3.HttpFilter
	UpgradeConfigs       []*hcmv3.HttpConnectionManager_UpgradeConfig
	AccessLog            *accesslogv3.AccessLog
	Domains              []string
	DownstreamTLSContext *tlsv3.DownstreamTlsContext
	SecretNameToDomains  map[helpers.NamespacedName][]string
}

type Resources struct {
	Listener    *listenerv3.Listener
	RouteConfig *routev3.RouteConfiguration
	Clusters    []*cluster.Cluster
	Secrets     []*tlsv3.Secret
}

func BuildResources(vs *v1alpha1.VirtualService, store *store.Store) (*Resources, []helpers.NamespacedName, error) {
	var err error
	nn := helpers.NamespacedName{Namespace: vs.Namespace, Name: vs.Name}

	if vs.Spec.Template != nil {
		vst, ok := store.VirtualServiceTemplates[helpers.NamespacedName{Namespace: helpers.GetNamespace(vs.Spec.Template.Namespace, vs.Namespace), Name: vs.Spec.Template.Name}]
		if !ok {
			return nil, nil, fmt.Errorf("virtual service template %s/%s not found", helpers.GetNamespace(vs.Spec.Template.Namespace, vs.Namespace), vs.Spec.Template.Name)
		}
		vs = vs.DeepCopy()
		err = vs.FillFromTemplate(vst, vs.Spec.TemplateOptions...)
		if err != nil {
			return nil, nil, err
		}
	}

	// Route config ---

	virtualHost, err := buildVirtualHost(vs, store)
	if err != nil {
		return nil, nil, err
	}

	routeConfiguration := &routev3.RouteConfiguration{
		Name: vs.Name,
		VirtualHosts: []*routev3.VirtualHost{{
			Name:                nn.String(),
			Domains:             []string{"*"},
			Routes:              virtualHost.Routes,
			RequestHeadersToAdd: virtualHost.RequestHeadersToAdd,
		}},
	}
	if err = routeConfiguration.ValidateAll(); err != nil {
		return nil, nil, err
	}

	// Clusters ---

	clusters, err := buildClusters(vs, virtualHost, store)
	if err != nil {
		return nil, nil, err
	}

	// Listener ---

	httpFilters, err := buildHTTPFilters(vs, store)
	if err != nil {
		return nil, nil, err
	}

	filterChainParams := &FilterChainsParams{
		UseRemoteAddress: helpers.BoolFromPtr(vs.Spec.UseRemoteAddress),
		RouteConfigName:  nn.String(),
		StatPrefix:       strings.ReplaceAll(nn.String(), ".", "-"),
		HTTPFilters:      httpFilters,
	}

	filterChainParams.UpgradeConfigs, err = buildUpgradeConfigs(vs.Spec.UpgradeConfigs)
	if err != nil {
		return nil, nil, err
	}

	filterChainParams.AccessLog, err = buildAccessLogConfig(vs, nn.String(), store)
	if err != nil {
		return nil, nil, err
	}

	if vs.Spec.TlsConfig != nil {
		tlsType, err := getTLSType(vs.Spec.TlsConfig)
		if err != nil {
			return nil, nil, err
		}

		// { "secret_namespace/secret_name" : ["domain"] }

		switch tlsType {
		case SecretRefType:
			filterChainParams.SecretNameToDomains = getSecretNameToDomainsViaSecretRef(vs.Spec.TlsConfig.SecretRef, vs.Namespace, virtualHost.Domains)
		case AutoDiscoveryType:
			filterChainParams.SecretNameToDomains, err = getSecretNameToDomainsViaAutoDiscovery(virtualHost.Domains, store.DomainToSecretMap)
			if err != nil {
				return nil, nil, err
			}
		}
	}

	fcs, err := buildFilterChains(filterChainParams)
	if err != nil {
		return nil, nil, err
	}

	xdsListener, err := buildListener(vs, store)
	if err != nil {
		return nil, nil, err
	}
	xdsListener.FilterChains = fcs

	if err := xdsListener.ValidateAll(); err != nil {
		return nil, nil, err
	}

	// Secrets
	secrets, usedSecrets, err := buildSecrets(httpFilters, filterChainParams.SecretNameToDomains, store)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to build secrets: %w", err)
	}

	return &Resources{
		Listener:    xdsListener,
		RouteConfig: routeConfiguration,
		Clusters:    clusters,
		Secrets:     secrets,
	}, usedSecrets, nil
}

func buildListener(vs *v1alpha1.VirtualService, store *store.Store) (*listenerv3.Listener, error) {
	if vs.Spec.Listener == nil {
		return nil, fmt.Errorf("listener is empty")
	}
	listenerNs := helpers.GetNamespace(vs.Spec.Listener.Namespace, vs.Namespace)
	listener := store.Listeners[helpers.NamespacedName{Namespace: listenerNs, Name: vs.Spec.Listener.Name}]
	if listener == nil {
		return nil, fmt.Errorf("listener %s/%s not found", listenerNs, vs.Spec.Listener.Name)
	}
	xdsListener, err := listener.UnmarshalV3()
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal listener %s/%s: %w", listenerNs, vs.Spec.Listener.Name, err)
	}
	return xdsListener, nil
}

func buildVirtualHost(vs *v1alpha1.VirtualService, store *store.Store) (*routev3.VirtualHost, error) {
	if vs.Spec.VirtualHost == nil {
		return nil, fmt.Errorf("virtual host is empty")
	}

	virtualHost := &routev3.VirtualHost{}
	if err := protoutil.Unmarshaler.Unmarshal(vs.Spec.VirtualHost.Raw, virtualHost); err != nil {
		return nil, fmt.Errorf("failed to unmarshal virtual host: %w", err)
	}

	for _, routeRef := range vs.Spec.AdditionalRoutes {
		routeRefNs := helpers.GetNamespace(routeRef.Namespace, vs.Namespace)
		route := store.Routes[helpers.NamespacedName{Namespace: routeRefNs, Name: routeRef.Name}]
		if route == nil {
			return nil, fmt.Errorf("route %s/%s not found", routeRefNs, routeRef.Name)
		}
		for idx, rt := range route.Spec {
			var r routev3.Route
			if err := protoutil.Unmarshaler.Unmarshal(rt.Raw, &r); err != nil {
				return nil, fmt.Errorf("failed to unmarshal route %s/%s (%d): %w", routeRefNs, routeRef.Name, idx, err)
			}
			virtualHost.Routes = append(virtualHost.Routes, &r)
		}
	}

	if err := virtualHost.ValidateAll(); err != nil {
		return nil, fmt.Errorf("failed to validate virtual host: %w", err)
	}

	return virtualHost, nil
}

func buildHTTPFilters(vs *v1alpha1.VirtualService, store *store.Store) ([]*hcmv3.HttpFilter, error) {
	var httpFilters []*hcmv3.HttpFilter

	rbacF, err := buildRBACFilter(vs, store)
	if err != nil {
		return nil, err
	}
	if rbacF != nil {
		configType := &hcmv3.HttpFilter_TypedConfig{
			TypedConfig: &anypb.Any{},
		}
		if err := configType.TypedConfig.MarshalFrom(rbacF); err != nil {
			return nil, err
		}
		httpFilters = append(httpFilters, &hcmv3.HttpFilter{
			Name:       "exc.filters.http.rbac",
			ConfigType: configType,
		})
	}

	for _, httpFilter := range vs.Spec.HTTPFilters {
		hf := &hcmv3.HttpFilter{}
		if err := protoutil.Unmarshaler.Unmarshal(httpFilter.Raw, hf); err != nil {
			return nil, fmt.Errorf("failed to unmarshal http filter: %w", err)
		}
		if err := hf.ValidateAll(); err != nil {
			return nil, fmt.Errorf("failed to validate http filter: %w", err)
		}
		httpFilters = append(httpFilters, hf)
	}

	if len(vs.Spec.AdditionalHttpFilters) > 0 {
		for _, httpFilterRef := range vs.Spec.AdditionalHttpFilters {
			httpFilterRefNs := helpers.GetNamespace(httpFilterRef.Namespace, vs.Namespace)
			hf := store.HTTPFilters[helpers.NamespacedName{Namespace: httpFilterRefNs, Name: httpFilterRef.Name}]
			if hf == nil {
				return nil, fmt.Errorf("http filter %s/%s not found", httpFilterRefNs, httpFilterRef.Name)
			}
			for _, filter := range hf.Spec {
				xdsHttpFilter := &hcmv3.HttpFilter{}
				if err := protoutil.Unmarshaler.Unmarshal(filter.Raw, xdsHttpFilter); err != nil {
					return nil, err
				}
				if err := xdsHttpFilter.ValidateAll(); err != nil {
					return nil, err
				}
				httpFilters = append(httpFilters, xdsHttpFilter)
			}
		}
	}

	return httpFilters, nil
}

func buildClusters(vs *v1alpha1.VirtualService, virtualHost *routev3.VirtualHost, store *store.Store) ([]*cluster.Cluster, error) {
	var clusters []*cluster.Cluster

	for _, route := range virtualHost.Routes {
		jsonData, err := json.Marshal(route)
		if err != nil {
			return nil, err
		}

		var data any
		if err := json.Unmarshal(jsonData, &data); err != nil {
			return nil, err
		}

		clusterNames := findClusterNames(data, "Cluster")

		for _, clusterName := range clusterNames {
			clusterNS := vs.Namespace
			cl := store.Clusters[helpers.NamespacedName{Namespace: clusterNS, Name: clusterName}]
			if cl == nil {
				return nil, fmt.Errorf("cluster %s/%s not found", clusterNS, clusterName)
			}
			xdsCluster, err := cl.UnmarshalV3AndValidate()
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal cluster %s/%s: %w", clusterNS, clusterName, err)
			}
			clusters = append(clusters, xdsCluster)
		}
	}

	return clusters, nil
}

func buildRBACFilter(vs *v1alpha1.VirtualService, store *store.Store) (*rbacFilter.RBAC, error) {
	if vs.Spec.RBAC == nil {
		return nil, nil
	}

	if vs.Spec.RBAC.Action == "" {
		return nil, fmt.Errorf("rbac action is empty")
	}

	action, ok := rbacv3.RBAC_Action_value[vs.Spec.RBAC.Action]
	if !ok {
		return nil, fmt.Errorf("invalid rbac action %s", vs.Spec.RBAC.Action)
	}

	if len(vs.Spec.RBAC.Policies) == 0 && len(vs.Spec.RBAC.AdditionalPolicies) == 0 {
		return nil, fmt.Errorf("rbac policies is empty")
	}

	rules := &rbacv3.RBAC{Action: rbacv3.RBAC_Action(action), Policies: make(map[string]*rbacv3.Policy, len(vs.Spec.RBAC.Policies))}
	for policyName, rawPolicy := range vs.Spec.RBAC.Policies {
		policy := &rbacv3.Policy{}
		if err := protoutil.Unmarshaler.Unmarshal(rawPolicy.Raw, policy); err != nil {
			return nil, fmt.Errorf("failed to unmarshal rbac policy %s: %w", policyName, err)
		}
		if err := policy.ValidateAll(); err != nil {
			return nil, fmt.Errorf("failed to validate rbac policy %s: %w", policyName, err)
		}
		rules.Policies[policyName] = policy
	}

	for _, policyRef := range vs.Spec.RBAC.AdditionalPolicies {
		ns := helpers.GetNamespace(policyRef.Namespace, vs.Namespace)
		policy, ok := store.Policies[helpers.NamespacedName{Namespace: ns, Name: policyRef.Name}]
		if !ok {
			return nil, fmt.Errorf("rbac policy %s/%s not found", ns, policyRef.Name)
		}
		if _, ok := rules.Policies[policy.Name]; ok {
			return nil, fmt.Errorf("policy '%s' already exist in RBAC", policy.Name)
		}
		rbacPolicy := &rbacv3.Policy{}
		if err := protoutil.Unmarshaler.Unmarshal(policy.Spec.Raw, rbacPolicy); err != nil {
			return nil, fmt.Errorf("failed to unmarshal rbac policy %s/%s: %w", ns, policyRef.Name, err)
		}
		if err := rbacPolicy.ValidateAll(); err != nil {
			return nil, fmt.Errorf("failed to validate rbac policy %s/%s: %w", ns, policyRef.Name, err)
		}
		rules.Policies[policy.Name] = rbacPolicy
	}

	return &rbacFilter.RBAC{Rules: rules}, nil
}

func buildFilterChains(params *FilterChainsParams) ([]*listenerv3.FilterChain, error) {
	var filterChains []*listenerv3.FilterChain

	if len(params.SecretNameToDomains) > 0 {
		for secretName, domains := range params.SecretNameToDomains {
			params.Domains = domains
			params.DownstreamTLSContext = &tlsv3.DownstreamTlsContext{
				CommonTlsContext: &tlsv3.CommonTlsContext{
					TlsCertificateSdsSecretConfigs: []*tlsv3.SdsSecretConfig{{
						Name: secretName.String(),
						SdsConfig: &corev3.ConfigSource{
							ConfigSourceSpecifier: &corev3.ConfigSource_Ads{
								Ads: &corev3.AggregatedConfigSource{},
							},
							ResourceApiVersion: corev3.ApiVersion_V3,
						},
					}},
					AlpnProtocols: []string{"h2", "http/1.1"},
				},
			}
			fc, err := buildFilterChain(params)
			if err != nil {
				return nil, err
			}
			filterChains = append(filterChains, fc)
		}
		return filterChains, nil
	}

	fc, err := buildFilterChain(params)
	if err != nil {
		return nil, err
	}
	filterChains = append(filterChains, fc)
	return filterChains, nil
}

func buildFilterChain(params *FilterChainsParams) (*listenerv3.FilterChain, error) {
	httpConnectionManager := &hcmv3.HttpConnectionManager{
		CodecType:  hcmv3.HttpConnectionManager_AUTO,
		StatPrefix: params.StatPrefix,
		RouteSpecifier: &hcmv3.HttpConnectionManager_Rds{
			Rds: &hcmv3.Rds{
				ConfigSource: &corev3.ConfigSource{
					ResourceApiVersion:    corev3.ApiVersion_V3,
					ConfigSourceSpecifier: &corev3.ConfigSource_Ads{},
				},
				RouteConfigName: params.RouteConfigName,
			},
		},
		UseRemoteAddress: &wrapperspb.BoolValue{Value: params.UseRemoteAddress},
		UpgradeConfigs:   params.UpgradeConfigs,
		HttpFilters:      params.HTTPFilters,
	}
	if params.AccessLog != nil {
		httpConnectionManager.AccessLog = append(httpConnectionManager.AccessLog, params.AccessLog)
	}

	if err := httpConnectionManager.ValidateAll(); err != nil {
		return nil, err
	}

	pbst, err := anypb.New(httpConnectionManager)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal httpConnectionManager to anypb: %w", err)
	}

	fc := &listenerv3.FilterChain{}
	fc.Filters = []*listenerv3.Filter{{
		Name: wellknown.HTTPConnectionManager,
		ConfigType: &listenerv3.Filter_TypedConfig{
			TypedConfig: pbst,
		},
	}}
	if len(params.Domains) > 0 && !!slices.Contains(params.Domains, "*") {
		fc.FilterChainMatch = &listenerv3.FilterChainMatch{
			ServerNames: params.Domains,
		}
	}
	if params.DownstreamTLSContext != nil {
		scfg, err := anypb.New(params.DownstreamTLSContext)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal downstreamTlsContext to anypb, %w", err)
		}
		fc.TransportSocket = &corev3.TransportSocket{
			Name: "envoy.transport_sockets.tls",
			ConfigType: &corev3.TransportSocket_TypedConfig{
				TypedConfig: scfg,
			},
		}
	}

	if err := fc.ValidateAll(); err != nil {
		return nil, err
	}

	return fc, nil
}

func buildUpgradeConfigs(rawUpgradeConfigs []*runtime.RawExtension) ([]*hcmv3.HttpConnectionManager_UpgradeConfig, error) {
	var upgradeConfigs []*hcmv3.HttpConnectionManager_UpgradeConfig
	for _, upgradeConfig := range rawUpgradeConfigs {
		uc := &hcmv3.HttpConnectionManager_UpgradeConfig{}
		if err := protoutil.Unmarshaler.Unmarshal(upgradeConfig.Raw, uc); err != nil {
			return upgradeConfigs, err
		}
		if err := uc.ValidateAll(); err != nil {
			return upgradeConfigs, err
		}
		upgradeConfigs = append(upgradeConfigs, uc)
	}

	return upgradeConfigs, nil
}

func buildAccessLogConfig(vs *v1alpha1.VirtualService, resourceName string, store *store.Store) (*accesslogv3.AccessLog, error) {
	if vs.Spec.AccessLog == nil && vs.Spec.AccessLogConfig == nil {
		return nil, nil
	}
	if vs.Spec.AccessLog != nil && vs.Spec.AccessLogConfig != nil {
		return nil, fmt.Errorf("can't use accessLog and accessLogConfig at the same time")
	}
	if vs.Spec.AccessLog != nil {
		var accessLog accesslogv3.AccessLog
		if err := protoutil.Unmarshaler.Unmarshal(vs.Spec.AccessLog.Raw, &accessLog); err != nil {
			return nil, fmt.Errorf("failed to unmarshal accessLog: %w", err)
		}
		if err := accessLog.ValidateAll(); err != nil {
			return nil, err
		}
		return &accessLog, nil
	}

	accessLogNs := helpers.GetNamespace(vs.Spec.AccessLogConfig.Namespace, vs.Namespace)
	accessLogConfig, ok := store.AccessLogs[helpers.NamespacedName{Namespace: accessLogNs, Name: vs.Spec.AccessLogConfig.Name}]
	if !ok {
		return nil, fmt.Errorf("can't find accessLogConfig %s/%s", accessLogNs, vs.Spec.AccessLogConfig.Name)
	}

	accessLog, err := accessLogConfig.UnmarshalAndValidateV3(v1alpha1.WithAccessLogFileName(resourceName))
	if err != nil {
		return nil, err
	}

	return accessLog, nil
}

func getTLSType(vsTLSConfig *v1alpha1.TlsConfig) (string, error) {
	if vsTLSConfig.SecretRef != nil {
		if vsTLSConfig.AutoDiscovery != nil {
			return "", fmt.Errorf("can't use secretRef and autoDiscovery at the same time")
		}
		return SecretRefType, nil
	}
	if vsTLSConfig.AutoDiscovery != nil {
		return AutoDiscoveryType, nil
	}
	return "", fmt.Errorf("tls config is empty")
}

func getSecretNameToDomainsViaSecretRef(secretRef *v1alpha1.ResourceRef, vsNamespace string, domains []string) map[helpers.NamespacedName][]string {
	m := make(map[helpers.NamespacedName][]string)

	var secretNamespace string

	if secretRef.Namespace != nil {
		secretNamespace = *secretRef.Namespace
	} else {
		secretNamespace = vsNamespace
	}

	m[helpers.NamespacedName{Namespace: secretNamespace, Name: secretRef.Name}] = domains
	return m
}

func getSecretNameToDomainsViaAutoDiscovery(domains []string, domainToSecretMap map[string]v1.Secret) (map[helpers.NamespacedName][]string, error) {
	m := make(map[helpers.NamespacedName][]string)

	for _, domain := range domains {
		var secret v1.Secret
		secret, ok := domainToSecretMap[domain]
		if !ok {
			secret, ok = domainToSecretMap[getWildcardDomain(domain)]
			if !ok {
				return nil, fmt.Errorf("can't find secret for domain %s", domain)
			}
		}

		domainsFromMap, ok := m[helpers.NamespacedName{Namespace: secret.Namespace, Name: secret.Name}]
		if ok {
			m[helpers.NamespacedName{Namespace: secret.Namespace, Name: secret.Name}] = append(domainsFromMap, domain)
		} else {
			m[helpers.NamespacedName{Namespace: secret.Namespace, Name: secret.Name}] = []string{domain}
		}
	}

	return m, nil
}

func getWildcardDomain(domain string) string {
	parts := strings.Split(domain, ".")
	if len(parts) < 2 {
		return ""
	}
	parts[0] = "*"
	return strings.Join(parts, ".")
}

func findClusterNames(data interface{}, fieldName string) []string {
	var results []string

	switch value := data.(type) {
	case map[string]interface{}:
		for k, v := range value {
			if k == fieldName {
				results = append(results, fmt.Sprintf("%v", v))
			}
			results = append(results, findClusterNames(v, fieldName)...)
		}
	case []interface{}:
		for _, item := range value {
			results = append(results, findClusterNames(item, fieldName)...)
		}
	}

	return results
}

func buildSecrets(httpFilters []*hcmv3.HttpFilter, secretNameToDomains map[helpers.NamespacedName][]string, store *store.Store) ([]*tlsv3.Secret, []helpers.NamespacedName, error) {
	var secrets []*tlsv3.Secret
	var usedSecrets []helpers.NamespacedName // for validation

	getEnvoySecret := func(namespace, name string) ([]*tlsv3.Secret, error) {
		kubeSecret, ok := store.Secrets[helpers.NamespacedName{Namespace: namespace, Name: name}]
		if !ok {
			return nil, fmt.Errorf("can't find secret %s/%s", namespace, name)
		}
		usedSecrets = append(usedSecrets, helpers.NamespacedName{Namespace: namespace, Name: name})
		return makeEnvoySecretFromKubernetesSecret(kubeSecret)
	}

	// Get Secrets from certificatesWithDomains
	for secret, _ := range secretNameToDomains {
		v3Secret, err := getEnvoySecret(secret.Namespace, secret.Name)
		if err != nil {
			return nil, nil, fmt.Errorf("can't find envoy secret %s/%s", secret.Namespace, secret.Name)
		}
		secrets = append(secrets, v3Secret...)
	}

	for _, filter := range httpFilters {
		jsonData, err := json.MarshalIndent(filter, "", "  ")
		if err != nil {
			return nil, nil, err
		}

		var data interface{}
		if err := json.Unmarshal(jsonData, &data); err != nil {
			return nil, nil, err
		}

		fieldName := "sds_config"
		secretNames := findSDSNames(data, fieldName)

		for _, secretName := range secretNames {
			namespace, name, err := helpers.SplitNamespacedName(secretName)
			if err != nil {
				return nil, nil, fmt.Errorf("failed to split secret name: %v", err)
			}

			v3Secret, err := getEnvoySecret(namespace, name)
			if err != nil {
				return nil, nil, fmt.Errorf("failed to get envoy secret: %v", err)
			}

			secrets = append(secrets, v3Secret...)
		}
	}

	return secrets, usedSecrets, nil
}

func findSDSNames(data interface{}, fieldName string) []string {
	var results []string

	switch value := data.(type) {
	case map[string]interface{}:
		for k, v := range value {
			if k == fieldName {
				results = append(results, fmt.Sprintf("%v", value["name"]))
			}
			results = append(results, findSDSNames(v, fieldName)...)
		}
	case []interface{}:
		for _, item := range value {
			results = append(results, findSDSNames(item, fieldName)...)
		}
	}

	return results
}

func makeEnvoySecretFromKubernetesSecret(kubeSecret *v1.Secret) ([]*tlsv3.Secret, error) {
	switch kubeSecret.Type {
	case v1.SecretTypeTLS:
		return makeEnvoyTLSSecret(kubeSecret)
	case v1.SecretTypeOpaque:
		return makeEnvoyOpaqueSecret(kubeSecret)
	default:
		return nil, fmt.Errorf("unsupported secret type %s", kubeSecret.Type)
	}
}

func makeEnvoyTLSSecret(kubeSecret *v1.Secret) ([]*tlsv3.Secret, error) {
	secrets := make([]*tlsv3.Secret, 0)

	envoySecret := &tlsv3.Secret{
		Name: fmt.Sprintf("%s/%s", kubeSecret.Namespace, kubeSecret.Name),
		Type: &tlsv3.Secret_TlsCertificate{
			TlsCertificate: &tlsv3.TlsCertificate{
				CertificateChain: &corev3.DataSource{
					Specifier: &corev3.DataSource_InlineBytes{
						InlineBytes: kubeSecret.Data[v1.TLSCertKey],
					},
				},
				PrivateKey: &corev3.DataSource{
					Specifier: &corev3.DataSource_InlineBytes{
						InlineBytes: kubeSecret.Data[v1.TLSPrivateKeyKey],
					},
				},
			},
		},
	}
	if err := envoySecret.ValidateAll(); err != nil {
		return nil, fmt.Errorf("failed to validate tls secret: %w", err)
	}

	secrets = append(secrets, envoySecret)

	return secrets, nil
}

func makeEnvoyOpaqueSecret(kubeSecret *v1.Secret) ([]*tlsv3.Secret, error) {
	secrets := make([]*tlsv3.Secret, 0)

	for k, v := range kubeSecret.Data {
		envoySecret := &tlsv3.Secret{
			Name: fmt.Sprintf("%s/%s/%s", kubeSecret.Namespace, kubeSecret.Name, k),
			Type: &tlsv3.Secret_GenericSecret{
				GenericSecret: &tlsv3.GenericSecret{
					Secret: &corev3.DataSource{
						Specifier: &corev3.DataSource_InlineBytes{
							InlineBytes: v,
						},
					},
				},
			},
		}

		if err := envoySecret.ValidateAll(); err != nil {
			return nil, fmt.Errorf("cannot validate Envoy Secret: %w", err)
		}

		secrets = append(secrets, envoySecret)
	}

	return secrets, nil
}
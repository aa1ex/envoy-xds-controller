# API Reference

# Table of Contents


- Services
    - [AccessGroupStoreService](#access_groupv1accessgroupstoreservice)
  


- Messages
    - [AccessGroupListItem](#accessgrouplistitem)
    - [ListAccessGroupsRequest](#listaccessgroupsrequest)
    - [ListAccessGroupsResponse](#listaccessgroupsresponse)
  




- Services
    - [AccessLogConfigStoreService](#access_log_configv1accesslogconfigstoreservice)
  


- Messages
    - [AccessLogConfigListItem](#accesslogconfiglistitem)
    - [ListAccessLogConfigsRequest](#listaccesslogconfigsrequest)
    - [ListAccessLogConfigsResponse](#listaccesslogconfigsresponse)
  




- Services
    - [ClusterStoreService](#clusterv1clusterstoreservice)
  


- Messages
    - [ClusterListItem](#clusterlistitem)
    - [ListClustersRequest](#listclustersrequest)
    - [ListClustersResponse](#listclustersresponse)
  





- Messages
    - [ResourceRef](#resourceref)
  




- Services
    - [HTTPFilterStoreService](#http_filterv1httpfilterstoreservice)
  


- Messages
    - [HTTPFilterListItem](#httpfilterlistitem)
    - [ListHTTPFiltersRequest](#listhttpfiltersrequest)
    - [ListHTTPFiltersResponse](#listhttpfiltersresponse)
  




- Services
    - [ListenerStoreService](#listenerv1listenerstoreservice)
  


- Messages
    - [ListListenersRequest](#listlistenersrequest)
    - [ListListenersResponse](#listlistenersresponse)
    - [ListenerListItem](#listenerlistitem)
  


- Enums
    - [ListenerType](#listenertype)
  



- Services
    - [NodeStoreService](#nodev1nodestoreservice)
  


- Messages
    - [ListNodesRequest](#listnodesrequest)
    - [ListNodesResponse](#listnodesresponse)
    - [NodeListItem](#nodelistitem)
  




- Services
    - [PermissionsService](#permissionsv1permissionsservice)
  


- Messages
    - [ListPermissionsRequest](#listpermissionsrequest)
    - [ListPermissionsResponse](#listpermissionsresponse)
    - [PermissionsItem](#permissionsitem)
  




- Services
    - [PolicyStoreService](#policyv1policystoreservice)
  


- Messages
    - [ListPoliciesRequest](#listpoliciesrequest)
    - [ListPoliciesResponse](#listpoliciesresponse)
    - [PolicyListItem](#policylistitem)
  




- Services
    - [RouteStoreService](#routev1routestoreservice)
  


- Messages
    - [ListRoutesRequest](#listroutesrequest)
    - [ListRoutesResponse](#listroutesresponse)
    - [RouteListItem](#routelistitem)
  




- Services
    - [UtilsService](#utilv1utilsservice)
  


- Messages
    - [DomainVerificationResult](#domainverificationresult)
    - [VerifyDomainsRequest](#verifydomainsrequest)
    - [VerifyDomainsResponse](#verifydomainsresponse)
  




- Services
    - [VirtualServiceTemplateStoreService](#virtual_service_templatev1virtualservicetemplatestoreservice)
  


- Messages
    - [FillTemplateRequest](#filltemplaterequest)
    - [FillTemplateResponse](#filltemplateresponse)
    - [ListVirtualServiceTemplatesRequest](#listvirtualservicetemplatesrequest)
    - [ListVirtualServiceTemplatesResponse](#listvirtualservicetemplatesresponse)
    - [TemplateOption](#templateoption)
    - [VirtualServiceTemplateListItem](#virtualservicetemplatelistitem)
  


- Enums
    - [TemplateOptionModifier](#templateoptionmodifier)
  



- Services
    - [VirtualServiceStoreService](#virtual_servicev1virtualservicestoreservice)
  


- Messages
    - [CreateVirtualServiceRequest](#createvirtualservicerequest)
    - [CreateVirtualServiceResponse](#createvirtualserviceresponse)
    - [DeleteVirtualServiceRequest](#deletevirtualservicerequest)
    - [DeleteVirtualServiceResponse](#deletevirtualserviceresponse)
    - [GetVirtualServiceRequest](#getvirtualservicerequest)
    - [GetVirtualServiceResponse](#getvirtualserviceresponse)
    - [ListVirtualServicesRequest](#listvirtualservicesrequest)
    - [ListVirtualServicesResponse](#listvirtualservicesresponse)
    - [UpdateVirtualServiceRequest](#updatevirtualservicerequest)
    - [UpdateVirtualServiceResponse](#updatevirtualserviceresponse)
    - [VirtualHost](#virtualhost)
    - [VirtualServiceListItem](#virtualservicelistitem)
  



- [Scalar Value Types](#scalar-value-types)



# AccessGroupStoreService {#access_groupv1accessgroupstoreservice}
Service to manage access groups.

## ListAccessGroups

> **rpc** ListAccessGroups([ListAccessGroupsRequest](#listaccessgroupsrequest))
    [ListAccessGroupsResponse](#listaccessgroupsresponse)

Lists access groups.
 <!-- end methods -->
 <!-- end services -->

# Messages


## AccessGroupListItem {#accessgrouplistitem}
Represents an access group item.


| Field | Type | Description |
| ----- | ---- | ----------- |
| name | [ string](#string) | The name of the access group. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListAccessGroupsRequest {#listaccessgroupsrequest}
Request message for listing access groups.

 <!-- end HasFields -->


## ListAccessGroupsResponse {#listaccessgroupsresponse}
Response message containing a list of access groups.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated AccessGroupListItem](#accessgrouplistitem) | The list of access group items. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# AccessLogConfigStoreService {#access_log_configv1accesslogconfigstoreservice}
Service for storing and listing access log configurations.

## ListAccessLogConfigs

> **rpc** ListAccessLogConfigs([ListAccessLogConfigsRequest](#listaccesslogconfigsrequest))
    [ListAccessLogConfigsResponse](#listaccesslogconfigsresponse)

Lists all access log configurations based on the given request.
 <!-- end methods -->
 <!-- end services -->

# Messages


## AccessLogConfigListItem {#accesslogconfiglistitem}
Represents an access log configuration item.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The unique identifier of the access log configuration. |
| name | [ string](#string) | The name of the access log configuration. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListAccessLogConfigsRequest {#listaccesslogconfigsrequest}
Request message for listing access log configurations.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | The access group to filter the log configurations. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListAccessLogConfigsResponse {#listaccesslogconfigsresponse}
Response message containing a list of access log configuration items.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated AccessLogConfigListItem](#accesslogconfiglistitem) | The list of access log configuration items. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# ClusterStoreService {#clusterv1clusterstoreservice}
Service for managing clusters in the store.

## ListCluster

> **rpc** ListCluster([ListClustersRequest](#listclustersrequest))
    [ListClustersResponse](#listclustersresponse)

Lists all the clusters in the store.
 <!-- end methods -->
 <!-- end services -->

# Messages


## ClusterListItem {#clusterlistitem}
Represents a list item in the cluster.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The unique identifier of the cluster. |
| name | [ string](#string) | The name of the cluster. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListClustersRequest {#listclustersrequest}
Request message for listing clusters.

 <!-- end HasFields -->


## ListClustersResponse {#listclustersresponse}
Response message containing a list of clusters.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated ClusterListItem](#clusterlistitem) | The list of cluster items. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


 <!-- end services -->

# Messages


## ResourceRef {#resourceref}
ResourceRef represents a reference to a resource with a UID and name.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | UID is the unique identifier of the resource. |
| name | [ string](#string) | Name is the human-readable name of the resource. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# HTTPFilterStoreService {#http_filterv1httpfilterstoreservice}
Service to manage HTTP filters.

## ListHTTPFilters

> **rpc** ListHTTPFilters([ListHTTPFiltersRequest](#listhttpfiltersrequest))
    [ListHTTPFiltersResponse](#listhttpfiltersresponse)

Lists all HTTP filters for a given access group.
 <!-- end methods -->
 <!-- end services -->

# Messages


## HTTPFilterListItem {#httpfilterlistitem}
Represents an individual HTTP filter.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | Unique identifier of the HTTP filter. |
| name | [ string](#string) | Name of the HTTP filter. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListHTTPFiltersRequest {#listhttpfiltersrequest}
Request message for listing HTTP filters.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | Name of the access group to filter HTTP filters by. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListHTTPFiltersResponse {#listhttpfiltersresponse}
Response message containing a list of HTTP filters.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated HTTPFilterListItem](#httpfilterlistitem) | List of HTTP filter items. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# ListenerStoreService {#listenerv1listenerstoreservice}
Service for managing listeners.

## ListListeners

> **rpc** ListListeners([ListListenersRequest](#listlistenersrequest))
    [ListListenersResponse](#listlistenersresponse)

Retrieves a list of listeners based on the request.
 <!-- end methods -->
 <!-- end services -->

# Messages


## ListListenersRequest {#listlistenersrequest}
Request message to list listeners.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | The access group to filter the listeners. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListListenersResponse {#listlistenersresponse}
Response message containing a list of listeners.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated ListenerListItem](#listenerlistitem) | A list of listener items. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListenerListItem {#listenerlistitem}
Details of a listener.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | Unique identifier for the listener. |
| name | [ string](#string) | Display name of the listener. |
| type | [ ListenerType](#listenertype) | The type of listener. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums


## ListenerType {#listenertype}
Type of listener available.

| Name | Number | Description |
| ---- | ------ | ----------- |
| LISTENER_TYPE_UNSPECIFIED | 0 | Default value, unspecified listener type. |
| LISTENER_TYPE_HTTP | 1 | HTTP listener. |
| LISTENER_TYPE_HTTPS | 2 | HTTPS listener. |
| LISTENER_TYPE_TCP | 3 | TCP listener. |


 <!-- end Enums -->


# NodeStoreService {#nodev1nodestoreservice}
NodeStoreService provides operations for managing nodes.

## ListNodes

> **rpc** ListNodes([ListNodesRequest](#listnodesrequest))
    [ListNodesResponse](#listnodesresponse)

ListNodes retrieves a list of nodes belonging to the specified access group.
 <!-- end methods -->
 <!-- end services -->

# Messages


## ListNodesRequest {#listnodesrequest}
ListNodesRequest represents the request to list nodes.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | The access group to filter the nodes by. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListNodesResponse {#listnodesresponse}
ListNodesResponse represents the response containing the list of nodes.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated NodeListItem](#nodelistitem) | The list of nodes items. |
 <!-- end Fields -->
 <!-- end HasFields -->


## NodeListItem {#nodelistitem}
NodeListItem represents a node with its unique identifier.


| Field | Type | Description |
| ----- | ---- | ----------- |
| id | [ string](#string) | The unique identifier of the node. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# PermissionsService {#permissionsv1permissionsservice}


## ListPermissions

> **rpc** ListPermissions([ListPermissionsRequest](#listpermissionsrequest))
    [ListPermissionsResponse](#listpermissionsresponse)

Lists the permissions associated with a specific access group.
 <!-- end methods -->
 <!-- end services -->

# Messages


## ListPermissionsRequest {#listpermissionsrequest}
Request message for listing permissions.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | The access group for which permissions are being requested. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListPermissionsResponse {#listpermissionsresponse}
Response message containing a list of permission items.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated PermissionsItem](#permissionsitem) | The list of permission items. |
 <!-- end Fields -->
 <!-- end HasFields -->


## PermissionsItem {#permissionsitem}
Represents a permission item with an action and associated objects.


| Field | Type | Description |
| ----- | ---- | ----------- |
| action | [ string](#string) | The action of the permission. |
| objects | [repeated string](#string) | The objects associated with the permission. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# PolicyStoreService {#policyv1policystoreservice}
PolicyStoreService provides operations related to policy management.

## ListPolicies

> **rpc** ListPolicies([ListPoliciesRequest](#listpoliciesrequest))
    [ListPoliciesResponse](#listpoliciesresponse)

ListPolicies retrieves a list of policies.
 <!-- end methods -->
 <!-- end services -->

# Messages


## ListPoliciesRequest {#listpoliciesrequest}
ListPoliciesRequest is the request message for ListPolicies RPC.

 <!-- end HasFields -->


## ListPoliciesResponse {#listpoliciesresponse}
ListPoliciesResponse is the response message for ListPolicies RPC, containing a list of policy items.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated PolicyListItem](#policylistitem) | items is a list of PolicyListItem objects. |
 <!-- end Fields -->
 <!-- end HasFields -->


## PolicyListItem {#policylistitem}
PolicyListItem represents an individual policy item with a unique identifier and name.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | uid is the unique identifier for the policy. |
| name | [ string](#string) | name is the name of the policy. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# RouteStoreService {#routev1routestoreservice}
Service to manage routes.

## ListRoutes

> **rpc** ListRoutes([ListRoutesRequest](#listroutesrequest))
    [ListRoutesResponse](#listroutesresponse)

Lists all the routes for the specified access group.
 <!-- end methods -->
 <!-- end services -->

# Messages


## ListRoutesRequest {#listroutesrequest}
Request message for listing routes.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | Access group to filter the routes. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListRoutesResponse {#listroutesresponse}
Response message containing the list of routes.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated RouteListItem](#routelistitem) | List of route items. |
 <!-- end Fields -->
 <!-- end HasFields -->


## RouteListItem {#routelistitem}
Represents a route in the route list.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | Unique identifier for the route. |
| name | [ string](#string) | Name of the route. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# UtilsService {#utilv1utilsservice}


## VerifyDomains

> **rpc** VerifyDomains([VerifyDomainsRequest](#verifydomainsrequest))
    [VerifyDomainsResponse](#verifydomainsresponse)

Verifies the SSL certificates of the provided domains.
 <!-- end methods -->
 <!-- end services -->

# Messages


## DomainVerificationResult {#domainverificationresult}



| Field | Type | Description |
| ----- | ---- | ----------- |
| domain | [ string](#string) | The domain being verified. |
| valid_certificate | [ bool](#bool) | Indicates if the domain has a valid SSL certificate. |
| issuer | [ string](#string) | The issuer of the SSL certificate. |
| expires_at | [ google.protobuf.Timestamp](#googleprotobuftimestamp) | The expiration timestamp of the SSL certificate. |
| matched_by_wildcard | [ bool](#bool) | Indicates if the domain was matched using a wildcard certificate. |
| error | [ string](#string) | Any error messages related to the domain's verification. |
 <!-- end Fields -->
 <!-- end HasFields -->


## VerifyDomainsRequest {#verifydomainsrequest}



| Field | Type | Description |
| ----- | ---- | ----------- |
| domains | [repeated string](#string) | A list of domains to verify SSL certificates for. |
 <!-- end Fields -->
 <!-- end HasFields -->


## VerifyDomainsResponse {#verifydomainsresponse}



| Field | Type | Description |
| ----- | ---- | ----------- |
| results | [repeated DomainVerificationResult](#domainverificationresult) | A list of the results for each domain verification. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->


# VirtualServiceTemplateStoreService {#virtual_service_templatev1virtualservicetemplatestoreservice}
Service to manage virtual service templates.

## ListVirtualServiceTemplates

> **rpc** ListVirtualServiceTemplates([ListVirtualServiceTemplatesRequest](#listvirtualservicetemplatesrequest))
    [ListVirtualServiceTemplatesResponse](#listvirtualservicetemplatesresponse)

Lists all virtual service templates.
## FillTemplate

> **rpc** FillTemplate([FillTemplateRequest](#filltemplaterequest))
    [FillTemplateResponse](#filltemplateresponse)

Fills a template with specific configurations and returns the result.
 <!-- end methods -->
 <!-- end services -->

# Messages


## FillTemplateRequest {#filltemplaterequest}
Request message for filling a template with specific configurations.


| Field | Type | Description |
| ----- | ---- | ----------- |
| template_uid | [ string](#string) | Unique identifier of the template to fill. |
| listener_uid | [ string](#string) | Unique identifier of the listener to associate with the template. |
| virtual_host | [ bytes](#bytes) | Virtual host configuration in binary format. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) access_log_config.access_log_config_uid | [ string](#string) | Unique identifier of the access log configuration. |
| additional_http_filter_uids | [repeated string](#string) | Additional HTTP filter unique identifiers. |
| additional_route_uids | [repeated string](#string) | Additional route unique identifiers. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) _use_remote_address.use_remote_address | [optional bool](#bool) | Whether to use the remote address. |
| template_options | [repeated TemplateOption](#templateoption) | Options to modify the template. |
 <!-- end Fields -->
 <!-- end HasFields -->


## FillTemplateResponse {#filltemplateresponse}
Response message containing the filled template as a raw string.


| Field | Type | Description |
| ----- | ---- | ----------- |
| raw | [ string](#string) | The raw string representation of the filled template. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListVirtualServiceTemplatesRequest {#listvirtualservicetemplatesrequest}
Request message for listing all virtual service templates.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | The access group for filtering templates. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListVirtualServiceTemplatesResponse {#listvirtualservicetemplatesresponse}
Response message containing the list of virtual service templates.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated VirtualServiceTemplateListItem](#virtualservicetemplatelistitem) | The list of virtual service templates. |
 <!-- end Fields -->
 <!-- end HasFields -->


## TemplateOption {#templateoption}
Represents a single option to be applied to a template.


| Field | Type | Description |
| ----- | ---- | ----------- |
| field | [ string](#string) | The field name of the option. |
| modifier | [ TemplateOptionModifier](#templateoptionmodifier) | The modifier applied to the field. |
 <!-- end Fields -->
 <!-- end HasFields -->


## VirtualServiceTemplateListItem {#virtualservicetemplatelistitem}
Details of a virtual service template.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | Unique identifier of the template. |
| name | [ string](#string) | Name of the template. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums


## TemplateOptionModifier {#templateoptionmodifier}
Enum describing possible modifiers for template options.

| Name | Number | Description |
| ---- | ------ | ----------- |
| TEMPLATE_OPTION_MODIFIER_UNSPECIFIED | 0 | Unspecified modifier. |
| TEMPLATE_OPTION_MODIFIER_MERGE | 1 | Merge modifier for combining with existing options. |
| TEMPLATE_OPTION_MODIFIER_REPLACE | 2 | Replace modifier to overwrite existing options. |
| TEMPLATE_OPTION_MODIFIER_DELETE | 3 | Delete modifier to remove existing options. |


 <!-- end Enums -->


# VirtualServiceStoreService {#virtual_servicev1virtualservicestoreservice}
The VirtualServiceStoreService defines operations for managing virtual services.

## CreateVirtualService

> **rpc** CreateVirtualService([CreateVirtualServiceRequest](#createvirtualservicerequest))
    [CreateVirtualServiceResponse](#createvirtualserviceresponse)

CreateVirtualService creates a new virtual service.
## UpdateVirtualService

> **rpc** UpdateVirtualService([UpdateVirtualServiceRequest](#updatevirtualservicerequest))
    [UpdateVirtualServiceResponse](#updatevirtualserviceresponse)

UpdateVirtualService updates an existing virtual service.
## DeleteVirtualService

> **rpc** DeleteVirtualService([DeleteVirtualServiceRequest](#deletevirtualservicerequest))
    [DeleteVirtualServiceResponse](#deletevirtualserviceresponse)

DeleteVirtualService deletes a virtual service by its UID.
## GetVirtualService

> **rpc** GetVirtualService([GetVirtualServiceRequest](#getvirtualservicerequest))
    [GetVirtualServiceResponse](#getvirtualserviceresponse)

GetVirtualService retrieves a virtual service by its UID.
## ListVirtualServices

> **rpc** ListVirtualServices([ListVirtualServicesRequest](#listvirtualservicesrequest))
    [ListVirtualServicesResponse](#listvirtualservicesresponse)

ListVirtualServices retrieves a list of virtual services for the specified access group.
 <!-- end methods -->
 <!-- end services -->

# Messages


## CreateVirtualServiceRequest {#createvirtualservicerequest}
CreateVirtualServiceRequest is the request message for creating a virtual service.


| Field | Type | Description |
| ----- | ---- | ----------- |
| name | [ string](#string) | The name of the virtual service. |
| node_ids | [repeated string](#string) | The node IDs associated with the virtual service. |
| access_group | [ string](#string) | The access group of the virtual service. |
| template_uid | [ string](#string) | The UID of the template used by the virtual service. |
| listener_uid | [ string](#string) | The UID of the listener associated with the virtual service. |
| virtual_host | [ VirtualHost](#virtualhost) | The virtual host configuration for the virtual service. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) access_log_config.access_log_config_uid | [ string](#string) | The UID of the access log configuration. |
| additional_http_filter_uids | [repeated string](#string) | UIDs of additional HTTP filters appended to the virtual service. |
| additional_route_uids | [repeated string](#string) | UIDs of additional routes appended to the virtual service. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) _use_remote_address.use_remote_address | [optional bool](#bool) | Whether to use the remote address for the virtual service. |
| template_options | [repeated virtual_service_template.v1.TemplateOption](#virtual_service_templatev1templateoption) | Template options for the virtual service. |
 <!-- end Fields -->
 <!-- end HasFields -->


## CreateVirtualServiceResponse {#createvirtualserviceresponse}
CreateVirtualServiceResponse is the response message for creating a virtual service.

 <!-- end HasFields -->


## DeleteVirtualServiceRequest {#deletevirtualservicerequest}
DeleteVirtualServiceRequest is the request message for deleting a virtual service.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The UID of the virtual service to delete. |
 <!-- end Fields -->
 <!-- end HasFields -->


## DeleteVirtualServiceResponse {#deletevirtualserviceresponse}
DeleteVirtualServiceResponse is the response message for deleting a virtual service.

 <!-- end HasFields -->


## GetVirtualServiceRequest {#getvirtualservicerequest}
GetVirtualServiceRequest is the request message for retrieving a virtual service.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The UID of the virtual service to retrieve. |
 <!-- end Fields -->
 <!-- end HasFields -->


## GetVirtualServiceResponse {#getvirtualserviceresponse}
GetVirtualServiceResponse is the response message for retrieving a virtual service.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The UID of the virtual service. |
| name | [ string](#string) | The name of the virtual service. |
| node_ids | [repeated string](#string) | The node IDs associated with the virtual service. |
| access_group | [ string](#string) | The access group of the virtual service. |
| template | [ common.v1.ResourceRef](#commonv1resourceref) | A reference to the template used by the virtual service. |
| listener | [ common.v1.ResourceRef](#commonv1resourceref) | A reference to the listener associated with the virtual service. |
| virtual_host | [ VirtualHost](#virtualhost) | The virtual host configuration for the virtual service. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) access_log.access_log_config | [ common.v1.ResourceRef](#commonv1resourceref) | A reference to the access log configuration. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) access_log.access_log_config_raw | [ bytes](#bytes) | Raw configuration for access logs. |
| additional_http_filters | [repeated common.v1.ResourceRef](#commonv1resourceref) | Additional HTTP filters associated with the virtual service. |
| additional_routes | [repeated common.v1.ResourceRef](#commonv1resourceref) | Additional routes associated with the virtual service. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) _use_remote_address.use_remote_address | [optional bool](#bool) | Whether the virtual service uses the remote address. |
| template_options | [repeated virtual_service_template.v1.TemplateOption](#virtual_service_templatev1templateoption) | Template options for the virtual service. |
| is_editable | [ bool](#bool) | Indicates whether the virtual service is editable. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListVirtualServicesRequest {#listvirtualservicesrequest}
ListVirtualServicesRequest is the request message for listing virtual services.


| Field | Type | Description |
| ----- | ---- | ----------- |
| access_group | [ string](#string) | The access group for which to list virtual services. |
 <!-- end Fields -->
 <!-- end HasFields -->


## ListVirtualServicesResponse {#listvirtualservicesresponse}
ListVirtualServicesResponse is the response message for listing virtual services.


| Field | Type | Description |
| ----- | ---- | ----------- |
| items | [repeated VirtualServiceListItem](#virtualservicelistitem) | The list of virtual services. |
 <!-- end Fields -->
 <!-- end HasFields -->


## UpdateVirtualServiceRequest {#updatevirtualservicerequest}
UpdateVirtualServiceRequest is the request message for updating a virtual service.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The UID of the virtual service. |
| node_ids | [repeated string](#string) | The node IDs associated with the virtual service. |
| template_uid | [ string](#string) | The UID of the template used by the virtual service. |
| listener_uid | [ string](#string) | The UID of the listener associated with the virtual service. |
| virtual_host | [ VirtualHost](#virtualhost) | The virtual host configuration for the virtual service. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) access_log_config.access_log_config_uid | [ string](#string) | The UID of the access log configuration. |
| additional_http_filter_uids | [repeated string](#string) | UIDs of additional HTTP filters appended to the virtual service. |
| additional_route_uids | [repeated string](#string) | UIDs of additional routes appended to the virtual service. |
| [**oneof**](https://developers.google.com/protocol-buffers/docs/proto3#oneof) _use_remote_address.use_remote_address | [optional bool](#bool) | Whether to use the remote address for the virtual service. |
| template_options | [repeated virtual_service_template.v1.TemplateOption](#virtual_service_templatev1templateoption) | Template options for the virtual service. |
 <!-- end Fields -->
 <!-- end HasFields -->


## UpdateVirtualServiceResponse {#updatevirtualserviceresponse}
UpdateVirtualServiceResponse is the response message for updating a virtual service.

 <!-- end HasFields -->


## VirtualHost {#virtualhost}
VirtualHost represents a virtual host with a list of domain names.


| Field | Type | Description |
| ----- | ---- | ----------- |
| domains | [repeated string](#string) | The list of domain names associated with the virtual host. |
 <!-- end Fields -->
 <!-- end HasFields -->


## VirtualServiceListItem {#virtualservicelistitem}
VirtualServiceListItem represents a single virtual service in a list response.


| Field | Type | Description |
| ----- | ---- | ----------- |
| uid | [ string](#string) | The UID of the virtual service. |
| name | [ string](#string) | The name of the virtual service. |
| node_ids | [repeated string](#string) | The node IDs associated with the virtual service. |
| access_group | [ string](#string) | The access group of the virtual service. |
| template | [ common.v1.ResourceRef](#commonv1resourceref) | A reference to the template used by the virtual service. |
| is_editable | [ bool](#bool) | Indicates whether the virtual service is editable. |
 <!-- end Fields -->
 <!-- end HasFields -->
 <!-- end messages -->

# Enums
 <!-- end Enums -->
 <!-- end Files -->

# Scalar Value Types

| .proto Type | Notes | C++ Type | Java Type | Python Type |
| ----------- | ----- | -------- | --------- | ----------- |
| <div><h4 id="double" /></div><a name="double" /> double |  | double | double | float |
| <div><h4 id="float" /></div><a name="float" /> float |  | float | float | float |
| <div><h4 id="int32" /></div><a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int |
| <div><h4 id="int64" /></div><a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long |
| <div><h4 id="uint32" /></div><a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long |
| <div><h4 id="uint64" /></div><a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long |
| <div><h4 id="sint32" /></div><a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int |
| <div><h4 id="sint64" /></div><a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long |
| <div><h4 id="fixed32" /></div><a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int |
| <div><h4 id="fixed64" /></div><a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long |
| <div><h4 id="sfixed32" /></div><a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int |
| <div><h4 id="sfixed64" /></div><a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long |
| <div><h4 id="bool" /></div><a name="bool" /> bool |  | bool | boolean | boolean |
| <div><h4 id="string" /></div><a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode |
| <div><h4 id="bytes" /></div><a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str |

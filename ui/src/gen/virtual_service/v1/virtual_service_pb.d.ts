// @generated by protoc-gen-es v2.2.5 with parameter "target=dts"
// @generated from file virtual_service/v1/virtual_service.proto (package virtual_service.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";
import type { ResourceRef, ResourceRefs, UIDS, VirtualHost } from "../../common/v1/common_pb";
import type { TemplateOption } from "../../virtual_service_template/v1/virtual_service_template_pb";

/**
 * Describes the file virtual_service/v1/virtual_service.proto.
 */
export declare const file_virtual_service_v1_virtual_service: GenFile;

/**
 * @generated from message virtual_service.v1.Status
 */
export declare type Status = Message<"virtual_service.v1.Status"> & {
  /**
   * @generated from field: bool invalid = 1;
   */
  invalid: boolean;

  /**
   * @generated from field: string message = 2;
   */
  message: string;
};

/**
 * Describes the message virtual_service.v1.Status.
 * Use `create(StatusSchema)` to create a new message.
 */
export declare const StatusSchema: GenMessage<Status>;

/**
 * CreateVirtualServiceRequest is the request message for creating a virtual service.
 *
 * @generated from message virtual_service.v1.CreateVirtualServiceRequest
 */
export declare type CreateVirtualServiceRequest = Message<"virtual_service.v1.CreateVirtualServiceRequest"> & {
  /**
   * The name of the virtual service.
   *
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * The node IDs associated with the virtual service.
   *
   * @generated from field: repeated string node_ids = 2;
   */
  nodeIds: string[];

  /**
   * The access group of the virtual service.
   *
   * @generated from field: string access_group = 3;
   */
  accessGroup: string;

  /**
   * The UID of the template used by the virtual service.
   *
   * @generated from field: string template_uid = 4;
   */
  templateUid: string;

  /**
   * The UID of the listener associated with the virtual service.
   *
   * @generated from field: string listener_uid = 5;
   */
  listenerUid: string;

  /**
   * The virtual host configuration for the virtual service.
   *
   * @generated from field: common.v1.VirtualHost virtual_host = 6;
   */
  virtualHost?: VirtualHost;

  /**
   * The configuration for access logs.
   *
   * @generated from oneof virtual_service.v1.CreateVirtualServiceRequest.access_log_config
   */
  accessLogConfig: {
    /**
     * UIDs of the access log configurations.
     *
     * @generated from field: common.v1.UIDS access_log_config_uids = 7;
     */
    value: UIDS;
    case: "accessLogConfigUids";
  } | { case: undefined; value?: undefined };

  /**
   * UIDs of additional HTTP filters appended to the virtual service.
   *
   * @generated from field: repeated string additional_http_filter_uids = 8;
   */
  additionalHttpFilterUids: string[];

  /**
   * UIDs of additional routes appended to the virtual service.
   *
   * @generated from field: repeated string additional_route_uids = 9;
   */
  additionalRouteUids: string[];

  /**
   * Whether to use the remote address for the virtual service.
   *
   * @generated from field: optional bool use_remote_address = 10;
   */
  useRemoteAddress?: boolean;

  /**
   * Template options for the virtual service.
   *
   * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 11;
   */
  templateOptions: TemplateOption[];

  /**
   * Description is the human-readable description of the resource
   *
   * @generated from field: string description = 12;
   */
  description: string;
};

/**
 * Describes the message virtual_service.v1.CreateVirtualServiceRequest.
 * Use `create(CreateVirtualServiceRequestSchema)` to create a new message.
 */
export declare const CreateVirtualServiceRequestSchema: GenMessage<CreateVirtualServiceRequest>;

/**
 * CreateVirtualServiceResponse is the response message for creating a virtual service.
 *
 * @generated from message virtual_service.v1.CreateVirtualServiceResponse
 */
export declare type CreateVirtualServiceResponse = Message<"virtual_service.v1.CreateVirtualServiceResponse"> & {
};

/**
 * Describes the message virtual_service.v1.CreateVirtualServiceResponse.
 * Use `create(CreateVirtualServiceResponseSchema)` to create a new message.
 */
export declare const CreateVirtualServiceResponseSchema: GenMessage<CreateVirtualServiceResponse>;

/**
 * UpdateVirtualServiceRequest is the request message for updating a virtual service.
 *
 * @generated from message virtual_service.v1.UpdateVirtualServiceRequest
 */
export declare type UpdateVirtualServiceRequest = Message<"virtual_service.v1.UpdateVirtualServiceRequest"> & {
  /**
   * The UID of the virtual service.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * The node IDs associated with the virtual service.
   *
   * @generated from field: repeated string node_ids = 2;
   */
  nodeIds: string[];

  /**
   * The UID of the template used by the virtual service.
   *
   * @generated from field: string template_uid = 3;
   */
  templateUid: string;

  /**
   * The UID of the listener associated with the virtual service.
   *
   * @generated from field: string listener_uid = 4;
   */
  listenerUid: string;

  /**
   * The virtual host configuration for the virtual service.
   *
   * @generated from field: common.v1.VirtualHost virtual_host = 5;
   */
  virtualHost?: VirtualHost;

  /**
   * The configuration for access logs.
   *
   * @generated from oneof virtual_service.v1.UpdateVirtualServiceRequest.access_log_config
   */
  accessLogConfig: {
    /**
     * UIDs of the access log configurations.
     *
     * @generated from field: common.v1.UIDS access_log_config_uids = 6;
     */
    value: UIDS;
    case: "accessLogConfigUids";
  } | { case: undefined; value?: undefined };

  /**
   * UIDs of additional HTTP filters appended to the virtual service.
   *
   * @generated from field: repeated string additional_http_filter_uids = 7;
   */
  additionalHttpFilterUids: string[];

  /**
   * UIDs of additional routes appended to the virtual service.
   *
   * @generated from field: repeated string additional_route_uids = 8;
   */
  additionalRouteUids: string[];

  /**
   * Whether to use the remote address for the virtual service.
   *
   * @generated from field: optional bool use_remote_address = 9;
   */
  useRemoteAddress?: boolean;

  /**
   * Template options for the virtual service.
   *
   * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 10;
   */
  templateOptions: TemplateOption[];

  /**
   * Description is the human-readable description of the resource
   *
   * @generated from field: string description = 11;
   */
  description: string;
};

/**
 * Describes the message virtual_service.v1.UpdateVirtualServiceRequest.
 * Use `create(UpdateVirtualServiceRequestSchema)` to create a new message.
 */
export declare const UpdateVirtualServiceRequestSchema: GenMessage<UpdateVirtualServiceRequest>;

/**
 * UpdateVirtualServiceResponse is the response message for updating a virtual service.
 *
 * @generated from message virtual_service.v1.UpdateVirtualServiceResponse
 */
export declare type UpdateVirtualServiceResponse = Message<"virtual_service.v1.UpdateVirtualServiceResponse"> & {
};

/**
 * Describes the message virtual_service.v1.UpdateVirtualServiceResponse.
 * Use `create(UpdateVirtualServiceResponseSchema)` to create a new message.
 */
export declare const UpdateVirtualServiceResponseSchema: GenMessage<UpdateVirtualServiceResponse>;

/**
 * DeleteVirtualServiceRequest is the request message for deleting a virtual service.
 *
 * @generated from message virtual_service.v1.DeleteVirtualServiceRequest
 */
export declare type DeleteVirtualServiceRequest = Message<"virtual_service.v1.DeleteVirtualServiceRequest"> & {
  /**
   * The UID of the virtual service to delete.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;
};

/**
 * Describes the message virtual_service.v1.DeleteVirtualServiceRequest.
 * Use `create(DeleteVirtualServiceRequestSchema)` to create a new message.
 */
export declare const DeleteVirtualServiceRequestSchema: GenMessage<DeleteVirtualServiceRequest>;

/**
 * DeleteVirtualServiceResponse is the response message for deleting a virtual service.
 *
 * @generated from message virtual_service.v1.DeleteVirtualServiceResponse
 */
export declare type DeleteVirtualServiceResponse = Message<"virtual_service.v1.DeleteVirtualServiceResponse"> & {
};

/**
 * Describes the message virtual_service.v1.DeleteVirtualServiceResponse.
 * Use `create(DeleteVirtualServiceResponseSchema)` to create a new message.
 */
export declare const DeleteVirtualServiceResponseSchema: GenMessage<DeleteVirtualServiceResponse>;

/**
 * GetVirtualServiceRequest is the request message for retrieving a virtual service.
 *
 * @generated from message virtual_service.v1.GetVirtualServiceRequest
 */
export declare type GetVirtualServiceRequest = Message<"virtual_service.v1.GetVirtualServiceRequest"> & {
  /**
   * The UID of the virtual service to retrieve.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;
};

/**
 * Describes the message virtual_service.v1.GetVirtualServiceRequest.
 * Use `create(GetVirtualServiceRequestSchema)` to create a new message.
 */
export declare const GetVirtualServiceRequestSchema: GenMessage<GetVirtualServiceRequest>;

/**
 * GetVirtualServiceResponse is the response message for retrieving a virtual service.
 *
 * @generated from message virtual_service.v1.GetVirtualServiceResponse
 */
export declare type GetVirtualServiceResponse = Message<"virtual_service.v1.GetVirtualServiceResponse"> & {
  /**
   * The UID of the virtual service.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * The name of the virtual service.
   *
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * The node IDs associated with the virtual service.
   *
   * @generated from field: repeated string node_ids = 3;
   */
  nodeIds: string[];

  /**
   * The access group of the virtual service.
   *
   * @generated from field: string access_group = 4;
   */
  accessGroup: string;

  /**
   * A reference to the template used by the virtual service.
   *
   * @generated from field: common.v1.ResourceRef template = 5;
   */
  template?: ResourceRef;

  /**
   * A reference to the listener associated with the virtual service.
   *
   * @generated from field: common.v1.ResourceRef listener = 6;
   */
  listener?: ResourceRef;

  /**
   * The virtual host configuration for the virtual service.
   *
   * @generated from field: common.v1.VirtualHost virtual_host = 7;
   */
  virtualHost?: VirtualHost;

  /**
   * The configuration of access logs.
   *
   * @generated from oneof virtual_service.v1.GetVirtualServiceResponse.access_log
   */
  accessLog: {
    /**
     * A reference to the access log configurations.
     *
     * @generated from field: common.v1.ResourceRefs access_log_configs = 8;
     */
    value: ResourceRefs;
    case: "accessLogConfigs";
  } | {
    /**
     * Raw configuration for access logs.
     *
     * @generated from field: string access_log_config_raw = 9;
     */
    value: string;
    case: "accessLogConfigRaw";
  } | { case: undefined; value?: undefined };

  /**
   * Additional HTTP filters associated with the virtual service.
   *
   * @generated from field: repeated common.v1.ResourceRef additional_http_filters = 10;
   */
  additionalHttpFilters: ResourceRef[];

  /**
   * Additional routes associated with the virtual service.
   *
   * @generated from field: repeated common.v1.ResourceRef additional_routes = 11;
   */
  additionalRoutes: ResourceRef[];

  /**
   * Whether the virtual service uses the remote address.
   *
   * @generated from field: optional bool use_remote_address = 12;
   */
  useRemoteAddress?: boolean;

  /**
   * Template options for the virtual service.
   *
   * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 13;
   */
  templateOptions: TemplateOption[];

  /**
   * Indicates whether the virtual service is editable.
   *
   * @generated from field: bool is_editable = 14;
   */
  isEditable: boolean;

  /**
   * Description is the human-readable description of the resource
   *
   * @generated from field: string description = 15;
   */
  description: string;

  /**
   * The raw string representation of the resource
   *
   * @generated from field: string raw = 16;
   */
  raw: string;

  /**
   * Status
   *
   * @generated from field: virtual_service.v1.Status status = 17;
   */
  status?: Status;
};

/**
 * Describes the message virtual_service.v1.GetVirtualServiceResponse.
 * Use `create(GetVirtualServiceResponseSchema)` to create a new message.
 */
export declare const GetVirtualServiceResponseSchema: GenMessage<GetVirtualServiceResponse>;

/**
 * ListVirtualServicesRequest is the request message for listing virtual services.
 *
 * @generated from message virtual_service.v1.ListVirtualServicesRequest
 */
export declare type ListVirtualServicesRequest = Message<"virtual_service.v1.ListVirtualServicesRequest"> & {
  /**
   * The access group for which to list virtual services.
   *
   * @generated from field: string access_group = 1;
   */
  accessGroup: string;
};

/**
 * Describes the message virtual_service.v1.ListVirtualServicesRequest.
 * Use `create(ListVirtualServicesRequestSchema)` to create a new message.
 */
export declare const ListVirtualServicesRequestSchema: GenMessage<ListVirtualServicesRequest>;

/**
 * VirtualServiceListItem represents a single virtual service in a list response.
 *
 * @generated from message virtual_service.v1.VirtualServiceListItem
 */
export declare type VirtualServiceListItem = Message<"virtual_service.v1.VirtualServiceListItem"> & {
  /**
   * The UID of the virtual service.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * The name of the virtual service.
   *
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * The node IDs associated with the virtual service.
   *
   * @generated from field: repeated string node_ids = 3;
   */
  nodeIds: string[];

  /**
   * The access group of the virtual service.
   *
   * @generated from field: string access_group = 4;
   */
  accessGroup: string;

  /**
   * A reference to the template used by the virtual service.
   *
   * @generated from field: common.v1.ResourceRef template = 5;
   */
  template?: ResourceRef;

  /**
   * Indicates whether the virtual service is editable.
   *
   * @generated from field: bool is_editable = 6;
   */
  isEditable: boolean;

  /**
   * Description is the human-readable description of the resource
   *
   * @generated from field: string description = 7;
   */
  description: string;

  /**
   * Statusq
   *
   * @generated from field: virtual_service.v1.Status status = 8;
   */
  status?: Status;
};

/**
 * Describes the message virtual_service.v1.VirtualServiceListItem.
 * Use `create(VirtualServiceListItemSchema)` to create a new message.
 */
export declare const VirtualServiceListItemSchema: GenMessage<VirtualServiceListItem>;

/**
 * ListVirtualServicesResponse is the response message for listing virtual services.
 *
 * @generated from message virtual_service.v1.ListVirtualServicesResponse
 */
export declare type ListVirtualServicesResponse = Message<"virtual_service.v1.ListVirtualServicesResponse"> & {
  /**
   * The list of virtual services.
   *
   * @generated from field: repeated virtual_service.v1.VirtualServiceListItem items = 1;
   */
  items: VirtualServiceListItem[];
};

/**
 * Describes the message virtual_service.v1.ListVirtualServicesResponse.
 * Use `create(ListVirtualServicesResponseSchema)` to create a new message.
 */
export declare const ListVirtualServicesResponseSchema: GenMessage<ListVirtualServicesResponse>;

/**
 * The VirtualServiceStoreService defines operations for managing virtual services.
 *
 * @generated from service virtual_service.v1.VirtualServiceStoreService
 */
export declare const VirtualServiceStoreService: GenService<{
  /**
   * CreateVirtualService creates a new virtual service.
   *
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.CreateVirtualService
   */
  createVirtualService: {
    methodKind: "unary";
    input: typeof CreateVirtualServiceRequestSchema;
    output: typeof CreateVirtualServiceResponseSchema;
  },
  /**
   * UpdateVirtualService updates an existing virtual service.
   *
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.UpdateVirtualService
   */
  updateVirtualService: {
    methodKind: "unary";
    input: typeof UpdateVirtualServiceRequestSchema;
    output: typeof UpdateVirtualServiceResponseSchema;
  },
  /**
   * DeleteVirtualService deletes a virtual service by its UID.
   *
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.DeleteVirtualService
   */
  deleteVirtualService: {
    methodKind: "unary";
    input: typeof DeleteVirtualServiceRequestSchema;
    output: typeof DeleteVirtualServiceResponseSchema;
  },
  /**
   * GetVirtualService retrieves a virtual service by its UID.
   *
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.GetVirtualService
   */
  getVirtualService: {
    methodKind: "unary";
    input: typeof GetVirtualServiceRequestSchema;
    output: typeof GetVirtualServiceResponseSchema;
  },
  /**
   * ListVirtualServices retrieves a list of virtual services for the specified access group.
   *
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.ListVirtualServices
   */
  listVirtualServices: {
    methodKind: "unary";
    input: typeof ListVirtualServicesRequestSchema;
    output: typeof ListVirtualServicesResponseSchema;
  },
}>;


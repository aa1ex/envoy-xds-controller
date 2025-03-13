// @generated by protoc-gen-es v2.2.3 with parameter "target=dts"
// @generated from file virtual_service/v1/virtual_service.proto (package virtual_service.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";
import type { ResourceRef } from "../../common/v1/common_pb";

/**
 * Describes the file virtual_service/v1/virtual_service.proto.
 */
export declare const file_virtual_service_v1_virtual_service: GenFile;

/**
 * @generated from message virtual_service.v1.CreateVirtualServiceRequest
 */
export declare type CreateVirtualServiceRequest = Message<"virtual_service.v1.CreateVirtualServiceRequest"> & {
  /**
   * строка
   *
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * список чипов, данные вводим сами, из головы
   *
   * @generated from field: repeated string node_ids = 2;
   */
  nodeIds: string[];

  /**
   * строка. сточные прописные, цифры и спец символы, 80 символов
   *
   * @generated from field: string project_id = 3;
   */
  projectId: string;

  /**
   * выбор селектора из virtual_service_template.proto VirtualServiceTemplateStoreService
   *
   * @generated from field: string template_uid = 4;
   */
  templateUid: string;

  /**
   * выбор из колекции listeners proto/listener/v1/listener.proto
   *
   * @generated from field: string listener_uid = 5;
   */
  listenerUid: string;

  /**
   * textAria инпут на YAML или JSON, но при отправке в JSON(BASE64)
   *
   * @generated from field: bytes virtual_host = 6;
   */
  virtualHost: Uint8Array;

  /**
   * выбор из колекции access_log_config proto/access_log_config/v1/access_log_config.proto:7
   *
   * @generated from oneof virtual_service.v1.CreateVirtualServiceRequest.access_log_config
   */
  accessLogConfig: {
    /**
     * @generated from field: string access_log_config_uid = 7;
     */
    value: string;
    case: "accessLogConfigUid";
  } | { case: undefined; value?: undefined };

  /**
   * селектор из
   *
   * @generated from field: repeated string additional_http_filter_uids = 8;
   */
  additionalHttpFilterUids: string[];

  /**
   * @generated from field: repeated string additional_route_uids = 9;
   */
  additionalRouteUids: string[];

  /**
   * выбор из 3х значений ДА/НЕТ/NUll дефолт null
   *
   * @generated from field: optional bool use_remote_address = 10;
   */
  useRemoteAddress?: boolean;
};

/**
 * Describes the message virtual_service.v1.CreateVirtualServiceRequest.
 * Use `create(CreateVirtualServiceRequestSchema)` to create a new message.
 */
export declare const CreateVirtualServiceRequestSchema: GenMessage<CreateVirtualServiceRequest>;

/**
 * @generated from message virtual_service.v1.CreateVirtualServiceResponse
 */
export declare type CreateVirtualServiceResponse = Message<"virtual_service.v1.CreateVirtualServiceResponse"> & {
  /**
   * @generated from field: string uid = 1;
   */
  uid: string;
};

/**
 * Describes the message virtual_service.v1.CreateVirtualServiceResponse.
 * Use `create(CreateVirtualServiceResponseSchema)` to create a new message.
 */
export declare const CreateVirtualServiceResponseSchema: GenMessage<CreateVirtualServiceResponse>;

/**
 * @generated from message virtual_service.v1.UpdateVirtualServiceRequest
 */
export declare type UpdateVirtualServiceRequest = Message<"virtual_service.v1.UpdateVirtualServiceRequest"> & {
  /**
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * @generated from field: repeated string node_ids = 2;
   */
  nodeIds: string[];

  /**
   * @generated from field: string name = 3;
   */
  name: string;

  /**
   * @generated from field: string project_id = 4;
   */
  projectId: string;

  /**
   * @generated from field: string template_uid = 5;
   */
  templateUid: string;

  /**
   * @generated from field: string listener_uid = 6;
   */
  listenerUid: string;

  /**
   * @generated from field: bytes virtual_host = 7;
   */
  virtualHost: Uint8Array;

  /**
   * @generated from oneof virtual_service.v1.UpdateVirtualServiceRequest.access_log_config
   */
  accessLogConfig: {
    /**
     * @generated from field: string access_log_config_uid = 8;
     */
    value: string;
    case: "accessLogConfigUid";
  } | { case: undefined; value?: undefined };

  /**
   * @generated from field: repeated string additional_http_filter_uids = 9;
   */
  additionalHttpFilterUids: string[];

  /**
   * @generated from field: repeated string additional_route_uids = 10;
   */
  additionalRouteUids: string[];

  /**
   * @generated from field: optional bool use_remote_address = 11;
   */
  useRemoteAddress?: boolean;
};

/**
 * Describes the message virtual_service.v1.UpdateVirtualServiceRequest.
 * Use `create(UpdateVirtualServiceRequestSchema)` to create a new message.
 */
export declare const UpdateVirtualServiceRequestSchema: GenMessage<UpdateVirtualServiceRequest>;

/**
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
 * @generated from message virtual_service.v1.DeleteVirtualServiceRequest
 */
export declare type DeleteVirtualServiceRequest = Message<"virtual_service.v1.DeleteVirtualServiceRequest"> & {
  /**
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
 * @generated from message virtual_service.v1.GetVirtualServiceRequest
 */
export declare type GetVirtualServiceRequest = Message<"virtual_service.v1.GetVirtualServiceRequest"> & {
  /**
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
 * @generated from message virtual_service.v1.GetVirtualServiceResponse
 */
export declare type GetVirtualServiceResponse = Message<"virtual_service.v1.GetVirtualServiceResponse"> & {
  /**
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * @generated from field: repeated string node_ids = 3;
   */
  nodeIds: string[];

  /**
   * @generated from field: string project_id = 4;
   */
  projectId: string;

  /**
   * @generated from field: common.v1.ResourceRef template = 5;
   */
  template?: ResourceRef;

  /**
   * @generated from field: common.v1.ResourceRef listener = 6;
   */
  listener?: ResourceRef;

  /**
   * @generated from field: bytes virtual_host = 7;
   */
  virtualHost: Uint8Array;

  /**
   * @generated from oneof virtual_service.v1.GetVirtualServiceResponse.access_log
   */
  accessLog: {
    /**
     * @generated from field: common.v1.ResourceRef access_log_config = 8;
     */
    value: ResourceRef;
    case: "accessLogConfig";
  } | {
    /**
     * @generated from field: bytes access_log_config_raw = 9;
     */
    value: Uint8Array;
    case: "accessLogConfigRaw";
  } | { case: undefined; value?: undefined };

  /**
   * @generated from field: repeated common.v1.ResourceRef additional_http_filters = 10;
   */
  additionalHttpFilters: ResourceRef[];

  /**
   * @generated from field: repeated common.v1.ResourceRef additional_routes = 11;
   */
  additionalRoutes: ResourceRef[];

  /**
   * @generated from field: optional bool use_remote_address = 12;
   */
  useRemoteAddress?: boolean;
};

/**
 * Describes the message virtual_service.v1.GetVirtualServiceResponse.
 * Use `create(GetVirtualServiceResponseSchema)` to create a new message.
 */
export declare const GetVirtualServiceResponseSchema: GenMessage<GetVirtualServiceResponse>;

/**
 * @generated from message virtual_service.v1.ListVirtualServiceRequest
 */
export declare type ListVirtualServiceRequest = Message<"virtual_service.v1.ListVirtualServiceRequest"> & {
};

/**
 * Describes the message virtual_service.v1.ListVirtualServiceRequest.
 * Use `create(ListVirtualServiceRequestSchema)` to create a new message.
 */
export declare const ListVirtualServiceRequestSchema: GenMessage<ListVirtualServiceRequest>;

/**
 * @generated from message virtual_service.v1.VirtualServiceListItem
 */
export declare type VirtualServiceListItem = Message<"virtual_service.v1.VirtualServiceListItem"> & {
  /**
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * @generated from field: repeated string node_ids = 3;
   */
  nodeIds: string[];

  /**
   * @generated from field: string project_id = 4;
   */
  projectId: string;
};

/**
 * Describes the message virtual_service.v1.VirtualServiceListItem.
 * Use `create(VirtualServiceListItemSchema)` to create a new message.
 */
export declare const VirtualServiceListItemSchema: GenMessage<VirtualServiceListItem>;

/**
 * @generated from message virtual_service.v1.ListVirtualServiceResponse
 */
export declare type ListVirtualServiceResponse = Message<"virtual_service.v1.ListVirtualServiceResponse"> & {
  /**
   * @generated from field: repeated virtual_service.v1.VirtualServiceListItem items = 1;
   */
  items: VirtualServiceListItem[];
};

/**
 * Describes the message virtual_service.v1.ListVirtualServiceResponse.
 * Use `create(ListVirtualServiceResponseSchema)` to create a new message.
 */
export declare const ListVirtualServiceResponseSchema: GenMessage<ListVirtualServiceResponse>;

/**
 * @generated from service virtual_service.v1.VirtualServiceStoreService
 */
export declare const VirtualServiceStoreService: GenService<{
  /**
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.CreateVirtualService
   */
  createVirtualService: {
    methodKind: "unary";
    input: typeof CreateVirtualServiceRequestSchema;
    output: typeof CreateVirtualServiceResponseSchema;
  },
  /**
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.UpdateVirtualService
   */
  updateVirtualService: {
    methodKind: "unary";
    input: typeof UpdateVirtualServiceRequestSchema;
    output: typeof UpdateVirtualServiceResponseSchema;
  },
  /**
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.DeleteVirtualService
   */
  deleteVirtualService: {
    methodKind: "unary";
    input: typeof DeleteVirtualServiceRequestSchema;
    output: typeof DeleteVirtualServiceResponseSchema;
  },
  /**
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.GetVirtualService
   */
  getVirtualService: {
    methodKind: "unary";
    input: typeof GetVirtualServiceRequestSchema;
    output: typeof GetVirtualServiceResponseSchema;
  },
  /**
   * @generated from rpc virtual_service.v1.VirtualServiceStoreService.ListVirtualService
   */
  listVirtualService: {
    methodKind: "unary";
    input: typeof ListVirtualServiceRequestSchema;
    output: typeof ListVirtualServiceResponseSchema;
  },
}>;


// @generated by protoc-gen-es v2.2.5 with parameter "target=dts"
// @generated from file access_log_config/v1/access_log_config.proto (package access_log_config.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file access_log_config/v1/access_log_config.proto.
 */
export declare const file_access_log_config_v1_access_log_config: GenFile;

/**
 * @generated from message access_log_config.v1.AccessLogConfigListItem
 */
export declare type AccessLogConfigListItem = Message<"access_log_config.v1.AccessLogConfigListItem"> & {
  /**
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * @generated from field: string name = 2;
   */
  name: string;
};

/**
 * Describes the message access_log_config.v1.AccessLogConfigListItem.
 * Use `create(AccessLogConfigListItemSchema)` to create a new message.
 */
export declare const AccessLogConfigListItemSchema: GenMessage<AccessLogConfigListItem>;

/**
 * @generated from message access_log_config.v1.ListAccessLogConfigsRequest
 */
export declare type ListAccessLogConfigsRequest = Message<"access_log_config.v1.ListAccessLogConfigsRequest"> & {
};

/**
 * Describes the message access_log_config.v1.ListAccessLogConfigsRequest.
 * Use `create(ListAccessLogConfigsRequestSchema)` to create a new message.
 */
export declare const ListAccessLogConfigsRequestSchema: GenMessage<ListAccessLogConfigsRequest>;

/**
 * @generated from message access_log_config.v1.ListAccessLogConfigsResponse
 */
export declare type ListAccessLogConfigsResponse = Message<"access_log_config.v1.ListAccessLogConfigsResponse"> & {
  /**
   * @generated from field: repeated access_log_config.v1.AccessLogConfigListItem items = 1;
   */
  items: AccessLogConfigListItem[];
};

/**
 * Describes the message access_log_config.v1.ListAccessLogConfigsResponse.
 * Use `create(ListAccessLogConfigsResponseSchema)` to create a new message.
 */
export declare const ListAccessLogConfigsResponseSchema: GenMessage<ListAccessLogConfigsResponse>;

/**
 * @generated from service access_log_config.v1.AccessLogConfigStoreService
 */
export declare const AccessLogConfigStoreService: GenService<{
  /**
   * @generated from rpc access_log_config.v1.AccessLogConfigStoreService.ListAccessLogConfigs
   */
  listAccessLogConfigs: {
    methodKind: "unary";
    input: typeof ListAccessLogConfigsRequestSchema;
    output: typeof ListAccessLogConfigsResponseSchema;
  },
}>;


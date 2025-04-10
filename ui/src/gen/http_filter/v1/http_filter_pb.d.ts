// @generated by protoc-gen-es v2.2.5 with parameter "target=dts"
// @generated from file http_filter/v1/http_filter.proto (package http_filter.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file http_filter/v1/http_filter.proto.
 */
export declare const file_http_filter_v1_http_filter: GenFile;

/**
 * @generated from message http_filter.v1.HTTPFilterListItem
 */
export declare type HTTPFilterListItem = Message<"http_filter.v1.HTTPFilterListItem"> & {
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
 * Describes the message http_filter.v1.HTTPFilterListItem.
 * Use `create(HTTPFilterListItemSchema)` to create a new message.
 */
export declare const HTTPFilterListItemSchema: GenMessage<HTTPFilterListItem>;

/**
 * @generated from message http_filter.v1.ListHTTPFiltersRequest
 */
export declare type ListHTTPFiltersRequest = Message<"http_filter.v1.ListHTTPFiltersRequest"> & {
};

/**
 * Describes the message http_filter.v1.ListHTTPFiltersRequest.
 * Use `create(ListHTTPFiltersRequestSchema)` to create a new message.
 */
export declare const ListHTTPFiltersRequestSchema: GenMessage<ListHTTPFiltersRequest>;

/**
 * @generated from message http_filter.v1.ListHTTPFiltersResponse
 */
export declare type ListHTTPFiltersResponse = Message<"http_filter.v1.ListHTTPFiltersResponse"> & {
  /**
   * @generated from field: repeated http_filter.v1.HTTPFilterListItem items = 1;
   */
  items: HTTPFilterListItem[];
};

/**
 * Describes the message http_filter.v1.ListHTTPFiltersResponse.
 * Use `create(ListHTTPFiltersResponseSchema)` to create a new message.
 */
export declare const ListHTTPFiltersResponseSchema: GenMessage<ListHTTPFiltersResponse>;

/**
 * @generated from service http_filter.v1.HTTPFilterStoreService
 */
export declare const HTTPFilterStoreService: GenService<{
  /**
   * @generated from rpc http_filter.v1.HTTPFilterStoreService.ListHTTPFilter
   */
  listHTTPFilter: {
    methodKind: "unary";
    input: typeof ListHTTPFiltersRequestSchema;
    output: typeof ListHTTPFiltersResponseSchema;
  },
}>;


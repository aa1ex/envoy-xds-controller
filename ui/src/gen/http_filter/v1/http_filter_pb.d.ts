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
 * Represents an individual HTTP filter.
 *
 * @generated from message http_filter.v1.HTTPFilterListItem
 */
export declare type HTTPFilterListItem = Message<"http_filter.v1.HTTPFilterListItem"> & {
  /**
   * Unique identifier of the HTTP filter.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * Name of the HTTP filter.
   *
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * Description is the human-readable description of the resource
   *
   * @generated from field: string description = 3;
   */
  description: string;

  /**
   * The raw string representation of the resource
   *
   * @generated from field: string raw = 4;
   */
  raw: string;
};

/**
 * Describes the message http_filter.v1.HTTPFilterListItem.
 * Use `create(HTTPFilterListItemSchema)` to create a new message.
 */
export declare const HTTPFilterListItemSchema: GenMessage<HTTPFilterListItem>;

/**
 * Request message for listing HTTP filters.
 *
 * @generated from message http_filter.v1.ListHTTPFiltersRequest
 */
export declare type ListHTTPFiltersRequest = Message<"http_filter.v1.ListHTTPFiltersRequest"> & {
  /**
   * Name of the access group to filter HTTP filters by.
   *
   * @generated from field: string access_group = 1;
   */
  accessGroup: string;
};

/**
 * Describes the message http_filter.v1.ListHTTPFiltersRequest.
 * Use `create(ListHTTPFiltersRequestSchema)` to create a new message.
 */
export declare const ListHTTPFiltersRequestSchema: GenMessage<ListHTTPFiltersRequest>;

/**
 * Response message containing a list of HTTP filters.
 *
 * @generated from message http_filter.v1.ListHTTPFiltersResponse
 */
export declare type ListHTTPFiltersResponse = Message<"http_filter.v1.ListHTTPFiltersResponse"> & {
  /**
   * List of HTTP filter items.
   *
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
 * Service to manage HTTP filters.
 *
 * @generated from service http_filter.v1.HTTPFilterStoreService
 */
export declare const HTTPFilterStoreService: GenService<{
  /**
   * Lists all HTTP filters for a given access group.
   *
   * @generated from rpc http_filter.v1.HTTPFilterStoreService.ListHTTPFilters
   */
  listHTTPFilters: {
    methodKind: "unary";
    input: typeof ListHTTPFiltersRequestSchema;
    output: typeof ListHTTPFiltersResponseSchema;
  },
}>;


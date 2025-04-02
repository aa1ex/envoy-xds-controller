// @generated by protoc-gen-es v2.2.5 with parameter "target=ts"
// @generated from file http_filter/v1/http_filter.proto (package http_filter.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file http_filter/v1/http_filter.proto.
 */
export const file_http_filter_v1_http_filter: GenFile = /*@__PURE__*/
  fileDesc("CiBodHRwX2ZpbHRlci92MS9odHRwX2ZpbHRlci5wcm90bxIOaHR0cF9maWx0ZXIudjEiLwoSSFRUUEZpbHRlckxpc3RJdGVtEgsKA3VpZBgBIAEoCRIMCgRuYW1lGAIgASgJIhcKFUxpc3RIVFRQRmlsdGVyUmVxdWVzdCJLChZMaXN0SFRUUEZpbHRlclJlc3BvbnNlEjEKBWl0ZW1zGAEgAygLMiIuaHR0cF9maWx0ZXIudjEuSFRUUEZpbHRlckxpc3RJdGVtMnkKFkhUVFBGaWx0ZXJTdG9yZVNlcnZpY2USXwoOTGlzdEhUVFBGaWx0ZXISJS5odHRwX2ZpbHRlci52MS5MaXN0SFRUUEZpbHRlclJlcXVlc3QaJi5odHRwX2ZpbHRlci52MS5MaXN0SFRUUEZpbHRlclJlc3BvbnNlQs0BChJjb20uaHR0cF9maWx0ZXIudjFCD0h0dHBGaWx0ZXJQcm90b1ABWlFnaXRodWIuY29tL2thYXNvcHMvZW52b3kteGRzLWNvbnRyb2xsZXIvcGtnL2FwaS9ncnBjL2h0dHBfZmlsdGVyL3YxO2h0dHBfZmlsdGVydjGiAgNIWFiqAg1IdHRwRmlsdGVyLlYxygINSHR0cEZpbHRlclxWMeICGUh0dHBGaWx0ZXJcVjFcR1BCTWV0YWRhdGHqAg5IdHRwRmlsdGVyOjpWMWIGcHJvdG8z");

/**
 * @generated from message http_filter.v1.HTTPFilterListItem
 */
export type HTTPFilterListItem = Message<"http_filter.v1.HTTPFilterListItem"> & {
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
export const HTTPFilterListItemSchema: GenMessage<HTTPFilterListItem> = /*@__PURE__*/
  messageDesc(file_http_filter_v1_http_filter, 0);

/**
 * @generated from message http_filter.v1.ListHTTPFilterRequest
 */
export type ListHTTPFilterRequest = Message<"http_filter.v1.ListHTTPFilterRequest"> & {
};

/**
 * Describes the message http_filter.v1.ListHTTPFilterRequest.
 * Use `create(ListHTTPFilterRequestSchema)` to create a new message.
 */
export const ListHTTPFilterRequestSchema: GenMessage<ListHTTPFilterRequest> = /*@__PURE__*/
  messageDesc(file_http_filter_v1_http_filter, 1);

/**
 * @generated from message http_filter.v1.ListHTTPFilterResponse
 */
export type ListHTTPFilterResponse = Message<"http_filter.v1.ListHTTPFilterResponse"> & {
  /**
   * @generated from field: repeated http_filter.v1.HTTPFilterListItem items = 1;
   */
  items: HTTPFilterListItem[];
};

/**
 * Describes the message http_filter.v1.ListHTTPFilterResponse.
 * Use `create(ListHTTPFilterResponseSchema)` to create a new message.
 */
export const ListHTTPFilterResponseSchema: GenMessage<ListHTTPFilterResponse> = /*@__PURE__*/
  messageDesc(file_http_filter_v1_http_filter, 2);

/**
 * @generated from service http_filter.v1.HTTPFilterStoreService
 */
export const HTTPFilterStoreService: GenService<{
  /**
   * @generated from rpc http_filter.v1.HTTPFilterStoreService.ListHTTPFilter
   */
  listHTTPFilter: {
    methodKind: "unary";
    input: typeof ListHTTPFilterRequestSchema;
    output: typeof ListHTTPFilterResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_http_filter_v1_http_filter, 0);


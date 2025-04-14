// @generated by protoc-gen-es v2.2.5 with parameter "target=ts"
// @generated from file route/v1/route.proto (package route.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file route/v1/route.proto.
 */
export const file_route_v1_route: GenFile = /*@__PURE__*/
  fileDesc("ChRyb3V0ZS92MS9yb3V0ZS5wcm90bxIIcm91dGUudjEiKgoNUm91dGVMaXN0SXRlbRILCgN1aWQYASABKAkSDAoEbmFtZRgCIAEoCSIpChFMaXN0Um91dGVzUmVxdWVzdBIUCgxhY2Nlc3NfZ3JvdXAYASABKAkiPAoSTGlzdFJvdXRlc1Jlc3BvbnNlEiYKBWl0ZW1zGAEgAygLMhcucm91dGUudjEuUm91dGVMaXN0SXRlbTJcChFSb3V0ZVN0b3JlU2VydmljZRJHCgpMaXN0Um91dGVzEhsucm91dGUudjEuTGlzdFJvdXRlc1JlcXVlc3QaHC5yb3V0ZS52MS5MaXN0Um91dGVzUmVzcG9uc2VCogEKDGNvbS5yb3V0ZS52MUIKUm91dGVQcm90b1ABWkVnaXRodWIuY29tL2thYXNvcHMvZW52b3kteGRzLWNvbnRyb2xsZXIvcGtnL2FwaS9ncnBjL3JvdXRlL3YxO3JvdXRldjGiAgNSWFiqAghSb3V0ZS5WMcoCCFJvdXRlXFYx4gIUUm91dGVcVjFcR1BCTWV0YWRhdGHqAglSb3V0ZTo6VjFiBnByb3RvMw");

/**
 * @generated from message route.v1.RouteListItem
 */
export type RouteListItem = Message<"route.v1.RouteListItem"> & {
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
 * Describes the message route.v1.RouteListItem.
 * Use `create(RouteListItemSchema)` to create a new message.
 */
export const RouteListItemSchema: GenMessage<RouteListItem> = /*@__PURE__*/
  messageDesc(file_route_v1_route, 0);

/**
 * @generated from message route.v1.ListRoutesRequest
 */
export type ListRoutesRequest = Message<"route.v1.ListRoutesRequest"> & {
  /**
   * @generated from field: string access_group = 1;
   */
  accessGroup: string;
};

/**
 * Describes the message route.v1.ListRoutesRequest.
 * Use `create(ListRoutesRequestSchema)` to create a new message.
 */
export const ListRoutesRequestSchema: GenMessage<ListRoutesRequest> = /*@__PURE__*/
  messageDesc(file_route_v1_route, 1);

/**
 * @generated from message route.v1.ListRoutesResponse
 */
export type ListRoutesResponse = Message<"route.v1.ListRoutesResponse"> & {
  /**
   * @generated from field: repeated route.v1.RouteListItem items = 1;
   */
  items: RouteListItem[];
};

/**
 * Describes the message route.v1.ListRoutesResponse.
 * Use `create(ListRoutesResponseSchema)` to create a new message.
 */
export const ListRoutesResponseSchema: GenMessage<ListRoutesResponse> = /*@__PURE__*/
  messageDesc(file_route_v1_route, 2);

/**
 * @generated from service route.v1.RouteStoreService
 */
export const RouteStoreService: GenService<{
  /**
   * @generated from rpc route.v1.RouteStoreService.ListRoutes
   */
  listRoutes: {
    methodKind: "unary";
    input: typeof ListRoutesRequestSchema;
    output: typeof ListRoutesResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_route_v1_route, 0);


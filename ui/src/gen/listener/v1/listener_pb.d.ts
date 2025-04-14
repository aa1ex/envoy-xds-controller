// @generated by protoc-gen-es v2.2.5 with parameter "target=dts"
// @generated from file listener/v1/listener.proto (package listener.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file listener/v1/listener.proto.
 */
export declare const file_listener_v1_listener: GenFile;

/**
 * @generated from message listener.v1.ListenerListItem
 */
export declare type ListenerListItem = Message<"listener.v1.ListenerListItem"> & {
  /**
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * @generated from field: listener.v1.ListenerType type = 3;
   */
  type: ListenerType;
};

/**
 * Describes the message listener.v1.ListenerListItem.
 * Use `create(ListenerListItemSchema)` to create a new message.
 */
export declare const ListenerListItemSchema: GenMessage<ListenerListItem>;

/**
 * @generated from message listener.v1.ListListenersRequest
 */
export declare type ListListenersRequest = Message<"listener.v1.ListListenersRequest"> & {
  /**
   * @generated from field: string access_group = 1;
   */
  accessGroup: string;
};

/**
 * Describes the message listener.v1.ListListenersRequest.
 * Use `create(ListListenersRequestSchema)` to create a new message.
 */
export declare const ListListenersRequestSchema: GenMessage<ListListenersRequest>;

/**
 * @generated from message listener.v1.ListListenersResponse
 */
export declare type ListListenersResponse = Message<"listener.v1.ListListenersResponse"> & {
  /**
   * @generated from field: repeated listener.v1.ListenerListItem items = 1;
   */
  items: ListenerListItem[];
};

/**
 * Describes the message listener.v1.ListListenersResponse.
 * Use `create(ListListenersResponseSchema)` to create a new message.
 */
export declare const ListListenersResponseSchema: GenMessage<ListListenersResponse>;

/**
 * @generated from enum listener.v1.ListenerType
 */
export enum ListenerType {
  /**
   * @generated from enum value: LISTENER_TYPE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: LISTENER_TYPE_HTTP = 1;
   */
  HTTP = 1,

  /**
   * @generated from enum value: LISTENER_TYPE_HTTPS = 2;
   */
  HTTPS = 2,

  /**
   * @generated from enum value: LISTENER_TYPE_TCP = 3;
   */
  TCP = 3,
}

/**
 * Describes the enum listener.v1.ListenerType.
 */
export declare const ListenerTypeSchema: GenEnum<ListenerType>;

/**
 * @generated from service listener.v1.ListenerStoreService
 */
export declare const ListenerStoreService: GenService<{
  /**
   * @generated from rpc listener.v1.ListenerStoreService.ListListeners
   */
  listListeners: {
    methodKind: "unary";
    input: typeof ListListenersRequestSchema;
    output: typeof ListListenersResponseSchema;
  },
}>;


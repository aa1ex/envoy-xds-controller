// @generated by protoc-gen-es v2.2.5 with parameter "target=ts"
// @generated from file node/v1/node.proto (package node.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file node/v1/node.proto.
 */
export const file_node_v1_node: GenFile = /*@__PURE__*/
  fileDesc("ChJub2RlL3YxL25vZGUucHJvdG8SB25vZGUudjEiGgoMTm9kZUxpc3RJdGVtEgoKAmlkGAEgASgJIigKEExpc3ROb2Rlc1JlcXVlc3QSFAoMYWNjZXNzX2dyb3VwGAEgASgJIjkKEUxpc3ROb2Rlc1Jlc3BvbnNlEiQKBWl0ZW1zGAEgAygLMhUubm9kZS52MS5Ob2RlTGlzdEl0ZW0yVgoQTm9kZVN0b3JlU2VydmljZRJCCglMaXN0Tm9kZXMSGS5ub2RlLnYxLkxpc3ROb2Rlc1JlcXVlc3QaGi5ub2RlLnYxLkxpc3ROb2Rlc1Jlc3BvbnNlQpoBCgtjb20ubm9kZS52MUIJTm9kZVByb3RvUAFaQ2dpdGh1Yi5jb20va2Fhc29wcy9lbnZveS14ZHMtY29udHJvbGxlci9wa2cvYXBpL2dycGMvbm9kZS92MTtub2RldjGiAgNOWFiqAgdOb2RlLlYxygIHTm9kZVxWMeICE05vZGVcVjFcR1BCTWV0YWRhdGHqAghOb2RlOjpWMWIGcHJvdG8z");

/**
 * NodeListItem represents a node with its unique identifier.
 *
 * @generated from message node.v1.NodeListItem
 */
export type NodeListItem = Message<"node.v1.NodeListItem"> & {
  /**
   * The unique identifier of the node.
   *
   * @generated from field: string id = 1;
   */
  id: string;
};

/**
 * Describes the message node.v1.NodeListItem.
 * Use `create(NodeListItemSchema)` to create a new message.
 */
export const NodeListItemSchema: GenMessage<NodeListItem> = /*@__PURE__*/
  messageDesc(file_node_v1_node, 0);

/**
 * ListNodesRequest represents the request to list nodes.
 *
 * @generated from message node.v1.ListNodesRequest
 */
export type ListNodesRequest = Message<"node.v1.ListNodesRequest"> & {
  /**
   * The access group to filter the nodes by.
   *
   * @generated from field: string access_group = 1;
   */
  accessGroup: string;
};

/**
 * Describes the message node.v1.ListNodesRequest.
 * Use `create(ListNodesRequestSchema)` to create a new message.
 */
export const ListNodesRequestSchema: GenMessage<ListNodesRequest> = /*@__PURE__*/
  messageDesc(file_node_v1_node, 1);

/**
 * ListNodesResponse represents the response containing the list of nodes.
 *
 * @generated from message node.v1.ListNodesResponse
 */
export type ListNodesResponse = Message<"node.v1.ListNodesResponse"> & {
  /**
   * The list of nodes items.
   *
   * @generated from field: repeated node.v1.NodeListItem items = 1;
   */
  items: NodeListItem[];
};

/**
 * Describes the message node.v1.ListNodesResponse.
 * Use `create(ListNodesResponseSchema)` to create a new message.
 */
export const ListNodesResponseSchema: GenMessage<ListNodesResponse> = /*@__PURE__*/
  messageDesc(file_node_v1_node, 2);

/**
 * NodeStoreService provides operations for managing nodes.
 *
 * @generated from service node.v1.NodeStoreService
 */
export const NodeStoreService: GenService<{
  /**
   * ListNodes retrieves a list of nodes belonging to the specified access group.
   *
   * @generated from rpc node.v1.NodeStoreService.ListNodes
   */
  listNodes: {
    methodKind: "unary";
    input: typeof ListNodesRequestSchema;
    output: typeof ListNodesResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_node_v1_node, 0);


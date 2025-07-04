// @generated by protoc-gen-es v2.2.5 with parameter "target=dts"
// @generated from file common/v1/common.proto (package common.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file common/v1/common.proto.
 */
export declare const file_common_v1_common: GenFile;

/**
 * ResourceRef represents a reference to a resource with a UID and name.
 *
 * @generated from message common.v1.ResourceRef
 */
export declare type ResourceRef = Message<"common.v1.ResourceRef"> & {
  /**
   * UID is the unique identifier of the resource.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * Name is the human-readable name of the resource.
   *
   * @generated from field: string name = 2;
   */
  name: string;
};

/**
 * Describes the message common.v1.ResourceRef.
 * Use `create(ResourceRefSchema)` to create a new message.
 */
export declare const ResourceRefSchema: GenMessage<ResourceRef>;

/**
 * VirtualHost represents a virtual host with a list of domain names.
 *
 * @generated from message common.v1.VirtualHost
 */
export declare type VirtualHost = Message<"common.v1.VirtualHost"> & {
  /**
   * The list of domain names associated with the virtual host.
   *
   * @generated from field: repeated string domains = 1;
   */
  domains: string[];
};

/**
 * Describes the message common.v1.VirtualHost.
 * Use `create(VirtualHostSchema)` to create a new message.
 */
export declare const VirtualHostSchema: GenMessage<VirtualHost>;

/**
 * @generated from message common.v1.UIDS
 */
export declare type UIDS = Message<"common.v1.UIDS"> & {
  /**
   * @generated from field: repeated string uids = 1;
   */
  uids: string[];
};

/**
 * Describes the message common.v1.UIDS.
 * Use `create(UIDSSchema)` to create a new message.
 */
export declare const UIDSSchema: GenMessage<UIDS>;

/**
 * @generated from message common.v1.ResourceRefs
 */
export declare type ResourceRefs = Message<"common.v1.ResourceRefs"> & {
  /**
   * @generated from field: repeated common.v1.ResourceRef refs = 2;
   */
  refs: ResourceRef[];
};

/**
 * Describes the message common.v1.ResourceRefs.
 * Use `create(ResourceRefsSchema)` to create a new message.
 */
export declare const ResourceRefsSchema: GenMessage<ResourceRefs>;


// @generated by protoc-gen-es v2.2.5 with parameter "target=ts"
// @generated from file virtual_service_template/v1/virtual_service_template.proto (package virtual_service_template.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file virtual_service_template/v1/virtual_service_template.proto.
 */
export const file_virtual_service_template_v1_virtual_service_template: GenFile = /*@__PURE__*/
  fileDesc("Cjp2aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUvdjEvdmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlLnByb3RvEht2aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEiZgoOVGVtcGxhdGVPcHRpb24SDQoFZmllbGQYASABKAkSRQoIbW9kaWZpZXIYAiABKA4yMy52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuVGVtcGxhdGVPcHRpb25Nb2RpZmllciIkCiJMaXN0VmlydHVhbFNlcnZpY2VUZW1wbGF0ZXNSZXF1ZXN0IjsKHlZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVMaXN0SXRlbRILCgN1aWQYASABKAkSDAoEbmFtZRgCIAEoCSJxCiNMaXN0VmlydHVhbFNlcnZpY2VUZW1wbGF0ZXNSZXNwb25zZRJKCgVpdGVtcxgBIAMoCzI7LnZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZS52MS5WaXJ0dWFsU2VydmljZVRlbXBsYXRlTGlzdEl0ZW0i0AIKE0ZpbGxUZW1wbGF0ZVJlcXVlc3QSFAoMdGVtcGxhdGVfdWlkGAEgASgJEhQKDGxpc3RlbmVyX3VpZBgCIAEoCRIUCgx2aXJ0dWFsX2hvc3QYAyABKAwSHwoVYWNjZXNzX2xvZ19jb25maWdfdWlkGAQgASgJSAASIwobYWRkaXRpb25hbF9odHRwX2ZpbHRlcl91aWRzGAUgAygJEh0KFWFkZGl0aW9uYWxfcm91dGVfdWlkcxgGIAMoCRIfChJ1c2VfcmVtb3RlX2FkZHJlc3MYByABKAhIAYgBARJFChB0ZW1wbGF0ZV9vcHRpb25zGAggAygLMisudmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlLnYxLlRlbXBsYXRlT3B0aW9uQhMKEWFjY2Vzc19sb2dfY29uZmlnQhUKE191c2VfcmVtb3RlX2FkZHJlc3MiIwoURmlsbFRlbXBsYXRlUmVzcG9uc2USCwoDcmF3GAEgASgJKrEBChZUZW1wbGF0ZU9wdGlvbk1vZGlmaWVyEigKJFRFTVBMQVRFX09QVElPTl9NT0RJRklFUl9VTlNQRUNJRklFRBAAEiIKHlRFTVBMQVRFX09QVElPTl9NT0RJRklFUl9NRVJHRRABEiQKIFRFTVBMQVRFX09QVElPTl9NT0RJRklFUl9SRVBMQUNFEAISIwofVEVNUExBVEVfT1BUSU9OX01PRElGSUVSX0RFTEVURRADMrwCCiJWaXJ0dWFsU2VydmljZVRlbXBsYXRlU3RvcmVTZXJ2aWNlEqABChtMaXN0VmlydHVhbFNlcnZpY2VUZW1wbGF0ZXMSPy52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuTGlzdFZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVzUmVxdWVzdBpALnZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZS52MS5MaXN0VmlydHVhbFNlcnZpY2VUZW1wbGF0ZXNSZXNwb25zZRJzCgxGaWxsVGVtcGxhdGUSMC52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuRmlsbFRlbXBsYXRlUmVxdWVzdBoxLnZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZS52MS5GaWxsVGVtcGxhdGVSZXNwb25zZUKwAgofY29tLnZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZS52MUIbVmlydHVhbFNlcnZpY2VUZW1wbGF0ZVByb3RvUAFaa2dpdGh1Yi5jb20va2Fhc29wcy9lbnZveS14ZHMtY29udHJvbGxlci9wa2cvYXBpL2dycGMvdmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlL3YxO3ZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZXYxogIDVlhYqgIZVmlydHVhbFNlcnZpY2VUZW1wbGF0ZS5WMcoCGVZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVcVjHiAiVWaXJ0dWFsU2VydmljZVRlbXBsYXRlXFYxXEdQQk1ldGFkYXRh6gIaVmlydHVhbFNlcnZpY2VUZW1wbGF0ZTo6VjFiBnByb3RvMw");

/**
 * @generated from message virtual_service_template.v1.TemplateOption
 */
export type TemplateOption = Message<"virtual_service_template.v1.TemplateOption"> & {
  /**
   * @generated from field: string field = 1;
   */
  field: string;

  /**
   * @generated from field: virtual_service_template.v1.TemplateOptionModifier modifier = 2;
   */
  modifier: TemplateOptionModifier;
};

/**
 * Describes the message virtual_service_template.v1.TemplateOption.
 * Use `create(TemplateOptionSchema)` to create a new message.
 */
export const TemplateOptionSchema: GenMessage<TemplateOption> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 0);

/**
 * @generated from message virtual_service_template.v1.ListVirtualServiceTemplatesRequest
 */
export type ListVirtualServiceTemplatesRequest = Message<"virtual_service_template.v1.ListVirtualServiceTemplatesRequest"> & {
};

/**
 * Describes the message virtual_service_template.v1.ListVirtualServiceTemplatesRequest.
 * Use `create(ListVirtualServiceTemplatesRequestSchema)` to create a new message.
 */
export const ListVirtualServiceTemplatesRequestSchema: GenMessage<ListVirtualServiceTemplatesRequest> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 1);

/**
 * @generated from message virtual_service_template.v1.VirtualServiceTemplateListItem
 */
export type VirtualServiceTemplateListItem = Message<"virtual_service_template.v1.VirtualServiceTemplateListItem"> & {
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
 * Describes the message virtual_service_template.v1.VirtualServiceTemplateListItem.
 * Use `create(VirtualServiceTemplateListItemSchema)` to create a new message.
 */
export const VirtualServiceTemplateListItemSchema: GenMessage<VirtualServiceTemplateListItem> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 2);

/**
 * @generated from message virtual_service_template.v1.ListVirtualServiceTemplatesResponse
 */
export type ListVirtualServiceTemplatesResponse = Message<"virtual_service_template.v1.ListVirtualServiceTemplatesResponse"> & {
  /**
   * @generated from field: repeated virtual_service_template.v1.VirtualServiceTemplateListItem items = 1;
   */
  items: VirtualServiceTemplateListItem[];
};

/**
 * Describes the message virtual_service_template.v1.ListVirtualServiceTemplatesResponse.
 * Use `create(ListVirtualServiceTemplatesResponseSchema)` to create a new message.
 */
export const ListVirtualServiceTemplatesResponseSchema: GenMessage<ListVirtualServiceTemplatesResponse> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 3);

/**
 * @generated from message virtual_service_template.v1.FillTemplateRequest
 */
export type FillTemplateRequest = Message<"virtual_service_template.v1.FillTemplateRequest"> & {
  /**
   * @generated from field: string template_uid = 1;
   */
  templateUid: string;

  /**
   * @generated from field: string listener_uid = 2;
   */
  listenerUid: string;

  /**
   * @generated from field: bytes virtual_host = 3;
   */
  virtualHost: Uint8Array;

  /**
   * @generated from oneof virtual_service_template.v1.FillTemplateRequest.access_log_config
   */
  accessLogConfig: {
    /**
     * @generated from field: string access_log_config_uid = 4;
     */
    value: string;
    case: "accessLogConfigUid";
  } | { case: undefined; value?: undefined };

  /**
   * @generated from field: repeated string additional_http_filter_uids = 5;
   */
  additionalHttpFilterUids: string[];

  /**
   * @generated from field: repeated string additional_route_uids = 6;
   */
  additionalRouteUids: string[];

  /**
   * @generated from field: optional bool use_remote_address = 7;
   */
  useRemoteAddress?: boolean;

  /**
   * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 8;
   */
  templateOptions: TemplateOption[];
};

/**
 * Describes the message virtual_service_template.v1.FillTemplateRequest.
 * Use `create(FillTemplateRequestSchema)` to create a new message.
 */
export const FillTemplateRequestSchema: GenMessage<FillTemplateRequest> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 4);

/**
 * @generated from message virtual_service_template.v1.FillTemplateResponse
 */
export type FillTemplateResponse = Message<"virtual_service_template.v1.FillTemplateResponse"> & {
  /**
   * @generated from field: string raw = 1;
   */
  raw: string;
};

/**
 * Describes the message virtual_service_template.v1.FillTemplateResponse.
 * Use `create(FillTemplateResponseSchema)` to create a new message.
 */
export const FillTemplateResponseSchema: GenMessage<FillTemplateResponse> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 5);

/**
 * @generated from enum virtual_service_template.v1.TemplateOptionModifier
 */
export enum TemplateOptionModifier {
  /**
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_MERGE = 1;
   */
  MERGE = 1,

  /**
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_REPLACE = 2;
   */
  REPLACE = 2,

  /**
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_DELETE = 3;
   */
  DELETE = 3,
}

/**
 * Describes the enum virtual_service_template.v1.TemplateOptionModifier.
 */
export const TemplateOptionModifierSchema: GenEnum<TemplateOptionModifier> = /*@__PURE__*/
  enumDesc(file_virtual_service_template_v1_virtual_service_template, 0);

/**
 * @generated from service virtual_service_template.v1.VirtualServiceTemplateStoreService
 */
export const VirtualServiceTemplateStoreService: GenService<{
  /**
   * @generated from rpc virtual_service_template.v1.VirtualServiceTemplateStoreService.ListVirtualServiceTemplates
   */
  listVirtualServiceTemplates: {
    methodKind: "unary";
    input: typeof ListVirtualServiceTemplatesRequestSchema;
    output: typeof ListVirtualServiceTemplatesResponseSchema;
  },
  /**
   * @generated from rpc virtual_service_template.v1.VirtualServiceTemplateStoreService.FillTemplate
   */
  fillTemplate: {
    methodKind: "unary";
    input: typeof FillTemplateRequestSchema;
    output: typeof FillTemplateResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_virtual_service_template_v1_virtual_service_template, 0);


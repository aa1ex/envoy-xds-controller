// @generated by protoc-gen-es v2.2.5 with parameter "target=ts"
// @generated from file virtual_service_template/v1/virtual_service_template.proto (package virtual_service_template.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { UIDS, VirtualHost } from "../../common/v1/common_pb";
import { file_common_v1_common } from "../../common/v1/common_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file virtual_service_template/v1/virtual_service_template.proto.
 */
export const file_virtual_service_template_v1_virtual_service_template: GenFile = /*@__PURE__*/
  fileDesc("Cjp2aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUvdjEvdmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlLnByb3RvEht2aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEiZgoOVGVtcGxhdGVPcHRpb24SDQoFZmllbGQYASABKAkSRQoIbW9kaWZpZXIYAiABKA4yMy52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuVGVtcGxhdGVPcHRpb25Nb2RpZmllciI6CiJMaXN0VmlydHVhbFNlcnZpY2VUZW1wbGF0ZXNSZXF1ZXN0EhQKDGFjY2Vzc19ncm91cBgBIAEoCSJdCh5WaXJ0dWFsU2VydmljZVRlbXBsYXRlTGlzdEl0ZW0SCwoDdWlkGAEgASgJEgwKBG5hbWUYAiABKAkSEwoLZGVzY3JpcHRpb24YAyABKAkSCwoDcmF3GAUgASgJInEKI0xpc3RWaXJ0dWFsU2VydmljZVRlbXBsYXRlc1Jlc3BvbnNlEkoKBWl0ZW1zGAEgAygLMjsudmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlLnYxLlZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVMaXN0SXRlbSK4AwoTRmlsbFRlbXBsYXRlUmVxdWVzdBIUCgx0ZW1wbGF0ZV91aWQYASABKAkSFAoMbGlzdGVuZXJfdWlkGAIgASgJEiwKDHZpcnR1YWxfaG9zdBgDIAEoCzIWLmNvbW1vbi52MS5WaXJ0dWFsSG9zdBIxChZhY2Nlc3NfbG9nX2NvbmZpZ191aWRzGAQgASgLMg8uY29tbW9uLnYxLlVJRFNIABIjChthZGRpdGlvbmFsX2h0dHBfZmlsdGVyX3VpZHMYBSADKAkSHQoVYWRkaXRpb25hbF9yb3V0ZV91aWRzGAYgAygJEh8KEnVzZV9yZW1vdGVfYWRkcmVzcxgHIAEoCEgBiAEBEkUKEHRlbXBsYXRlX29wdGlvbnMYCCADKAsyKy52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuVGVtcGxhdGVPcHRpb24SDAoEbmFtZRgJIAEoCRITCgtkZXNjcmlwdGlvbhgKIAEoCRIZChFleHBhbmRfcmVmZXJlbmNlcxgLIAEoCEITChFhY2Nlc3NfbG9nX2NvbmZpZ0IVChNfdXNlX3JlbW90ZV9hZGRyZXNzIiMKFEZpbGxUZW1wbGF0ZVJlc3BvbnNlEgsKA3JhdxgBIAEoCSqxAQoWVGVtcGxhdGVPcHRpb25Nb2RpZmllchIoCiRURU1QTEFURV9PUFRJT05fTU9ESUZJRVJfVU5TUEVDSUZJRUQQABIiCh5URU1QTEFURV9PUFRJT05fTU9ESUZJRVJfTUVSR0UQARIkCiBURU1QTEFURV9PUFRJT05fTU9ESUZJRVJfUkVQTEFDRRACEiMKH1RFTVBMQVRFX09QVElPTl9NT0RJRklFUl9ERUxFVEUQAzK8AgoiVmlydHVhbFNlcnZpY2VUZW1wbGF0ZVN0b3JlU2VydmljZRKgAQobTGlzdFZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVzEj8udmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlLnYxLkxpc3RWaXJ0dWFsU2VydmljZVRlbXBsYXRlc1JlcXVlc3QaQC52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuTGlzdFZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVzUmVzcG9uc2UScwoMRmlsbFRlbXBsYXRlEjAudmlydHVhbF9zZXJ2aWNlX3RlbXBsYXRlLnYxLkZpbGxUZW1wbGF0ZVJlcXVlc3QaMS52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuRmlsbFRlbXBsYXRlUmVzcG9uc2VCsAIKH2NvbS52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjFCG1ZpcnR1YWxTZXJ2aWNlVGVtcGxhdGVQcm90b1ABWmtnaXRodWIuY29tL2thYXNvcHMvZW52b3kteGRzLWNvbnRyb2xsZXIvcGtnL2FwaS9ncnBjL3ZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZS92MTt2aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGV2MaICA1ZYWKoCGVZpcnR1YWxTZXJ2aWNlVGVtcGxhdGUuVjHKAhlWaXJ0dWFsU2VydmljZVRlbXBsYXRlXFYx4gIlVmlydHVhbFNlcnZpY2VUZW1wbGF0ZVxWMVxHUEJNZXRhZGF0YeoCGlZpcnR1YWxTZXJ2aWNlVGVtcGxhdGU6OlYxYgZwcm90bzM", [file_common_v1_common]);

/**
 * Represents a single option to be applied to a template.
 *
 * @generated from message virtual_service_template.v1.TemplateOption
 */
export type TemplateOption = Message<"virtual_service_template.v1.TemplateOption"> & {
  /**
   * The field name of the option.
   *
   * @generated from field: string field = 1;
   */
  field: string;

  /**
   * The modifier applied to the field.
   *
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
 * Request message for listing all virtual service templates.
 *
 * @generated from message virtual_service_template.v1.ListVirtualServiceTemplatesRequest
 */
export type ListVirtualServiceTemplatesRequest = Message<"virtual_service_template.v1.ListVirtualServiceTemplatesRequest"> & {
  /**
   * The access group for filtering templates.
   *
   * @generated from field: string access_group = 1;
   */
  accessGroup: string;
};

/**
 * Describes the message virtual_service_template.v1.ListVirtualServiceTemplatesRequest.
 * Use `create(ListVirtualServiceTemplatesRequestSchema)` to create a new message.
 */
export const ListVirtualServiceTemplatesRequestSchema: GenMessage<ListVirtualServiceTemplatesRequest> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 1);

/**
 * Details of a virtual service template.
 *
 * @generated from message virtual_service_template.v1.VirtualServiceTemplateListItem
 */
export type VirtualServiceTemplateListItem = Message<"virtual_service_template.v1.VirtualServiceTemplateListItem"> & {
  /**
   * Unique identifier of the template.
   *
   * @generated from field: string uid = 1;
   */
  uid: string;

  /**
   * Name of the template.
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
   * @generated from field: string raw = 5;
   */
  raw: string;
};

/**
 * Describes the message virtual_service_template.v1.VirtualServiceTemplateListItem.
 * Use `create(VirtualServiceTemplateListItemSchema)` to create a new message.
 */
export const VirtualServiceTemplateListItemSchema: GenMessage<VirtualServiceTemplateListItem> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 2);

/**
 * Response message containing the list of virtual service templates.
 *
 * @generated from message virtual_service_template.v1.ListVirtualServiceTemplatesResponse
 */
export type ListVirtualServiceTemplatesResponse = Message<"virtual_service_template.v1.ListVirtualServiceTemplatesResponse"> & {
  /**
   * The list of virtual service templates.
   *
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
 * Request message for filling a template with specific configurations.
 *
 * @generated from message virtual_service_template.v1.FillTemplateRequest
 */
export type FillTemplateRequest = Message<"virtual_service_template.v1.FillTemplateRequest"> & {
  /**
   * Unique identifier of the template to fill.
   *
   * @generated from field: string template_uid = 1;
   */
  templateUid: string;

  /**
   * Unique identifier of the listener to associate with the template.
   *
   * @generated from field: string listener_uid = 2;
   */
  listenerUid: string;

  /**
   * The virtual host configuration for the virtual service.
   *
   * @generated from field: common.v1.VirtualHost virtual_host = 3;
   */
  virtualHost?: VirtualHost;

  /**
   * Access log configuration.
   *
   * @generated from oneof virtual_service_template.v1.FillTemplateRequest.access_log_config
   */
  accessLogConfig: {
    /**
     * UIDs of the access log configurations.
     *
     * @generated from field: common.v1.UIDS access_log_config_uids = 4;
     */
    value: UIDS;
    case: "accessLogConfigUids";
  } | { case: undefined; value?: undefined };

  /**
   * Additional HTTP filter unique identifiers.
   *
   * @generated from field: repeated string additional_http_filter_uids = 5;
   */
  additionalHttpFilterUids: string[];

  /**
   * Additional route unique identifiers.
   *
   * @generated from field: repeated string additional_route_uids = 6;
   */
  additionalRouteUids: string[];

  /**
   * Whether to use the remote address.
   *
   * @generated from field: optional bool use_remote_address = 7;
   */
  useRemoteAddress?: boolean;

  /**
   * Options to modify the template.
   *
   * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 8;
   */
  templateOptions: TemplateOption[];

  /**
   * Virtual service name
   *
   * @generated from field: string name = 9;
   */
  name: string;

  /**
   * Description is the human-readable description of the resource
   *
   * @generated from field: string description = 10;
   */
  description: string;

  /**
   * Expand references determines whether to replace reference links
   * with their full expanded content in the returned structure.
   *
   * @generated from field: bool expand_references = 11;
   */
  expandReferences: boolean;
};

/**
 * Describes the message virtual_service_template.v1.FillTemplateRequest.
 * Use `create(FillTemplateRequestSchema)` to create a new message.
 */
export const FillTemplateRequestSchema: GenMessage<FillTemplateRequest> = /*@__PURE__*/
  messageDesc(file_virtual_service_template_v1_virtual_service_template, 4);

/**
 * Response message containing the filled template as a raw string.
 *
 * @generated from message virtual_service_template.v1.FillTemplateResponse
 */
export type FillTemplateResponse = Message<"virtual_service_template.v1.FillTemplateResponse"> & {
  /**
   * The raw string representation of the filled template.
   *
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
 * Enum describing possible modifiers for template options.
 *
 * @generated from enum virtual_service_template.v1.TemplateOptionModifier
 */
export enum TemplateOptionModifier {
  /**
   * Unspecified modifier.
   *
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * Merge modifier for combining with existing options.
   *
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_MERGE = 1;
   */
  MERGE = 1,

  /**
   * Replace modifier to overwrite existing options.
   *
   * @generated from enum value: TEMPLATE_OPTION_MODIFIER_REPLACE = 2;
   */
  REPLACE = 2,

  /**
   * Delete modifier to remove existing options.
   *
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
 * Service to manage virtual service templates.
 *
 * @generated from service virtual_service_template.v1.VirtualServiceTemplateStoreService
 */
export const VirtualServiceTemplateStoreService: GenService<{
  /**
   * Lists all virtual service templates.
   *
   * @generated from rpc virtual_service_template.v1.VirtualServiceTemplateStoreService.ListVirtualServiceTemplates
   */
  listVirtualServiceTemplates: {
    methodKind: "unary";
    input: typeof ListVirtualServiceTemplatesRequestSchema;
    output: typeof ListVirtualServiceTemplatesResponseSchema;
  },
  /**
   * Fills a template with specific configurations and returns the result.
   *
   * @generated from rpc virtual_service_template.v1.VirtualServiceTemplateStoreService.FillTemplate
   */
  fillTemplate: {
    methodKind: "unary";
    input: typeof FillTemplateRequestSchema;
    output: typeof FillTemplateResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_virtual_service_template_v1_virtual_service_template, 0);


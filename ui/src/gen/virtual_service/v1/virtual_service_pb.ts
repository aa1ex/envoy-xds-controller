// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file virtual_service/v1/virtual_service.proto (package virtual_service.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from '@bufbuild/protobuf/codegenv1'
import { fileDesc, messageDesc, serviceDesc } from '@bufbuild/protobuf/codegenv1'
import type { ResourceRef } from '../../common/v1/common_pb'
import { file_common_v1_common } from '../../common/v1/common_pb'
import type { TemplateOption } from '../../virtual_service_template/v1/virtual_service_template_pb'
import { file_virtual_service_template_v1_virtual_service_template } from '../../virtual_service_template/v1/virtual_service_template_pb'
import type { Message } from '@bufbuild/protobuf'

/**
 * Describes the file virtual_service/v1/virtual_service.proto.
 */
export const file_virtual_service_v1_virtual_service: GenFile =
	/*@__PURE__*/
	fileDesc(
		'Cih2aXJ0dWFsX3NlcnZpY2UvdjEvdmlydHVhbF9zZXJ2aWNlLnByb3RvEhJ2aXJ0dWFsX3NlcnZpY2UudjEijgMKG0NyZWF0ZVZpcnR1YWxTZXJ2aWNlUmVxdWVzdBIMCgRuYW1lGAEgASgJEhAKCG5vZGVfaWRzGAIgAygJEhQKDGFjY2Vzc19ncm91cBgDIAEoCRIUCgx0ZW1wbGF0ZV91aWQYBCABKAkSFAoMbGlzdGVuZXJfdWlkGAUgASgJEhQKDHZpcnR1YWxfaG9zdBgGIAEoDBIfChVhY2Nlc3NfbG9nX2NvbmZpZ191aWQYByABKAlIABIjChthZGRpdGlvbmFsX2h0dHBfZmlsdGVyX3VpZHMYCCADKAkSHQoVYWRkaXRpb25hbF9yb3V0ZV91aWRzGAkgAygJEh8KEnVzZV9yZW1vdGVfYWRkcmVzcxgKIAEoCEgBiAEBEkUKEHRlbXBsYXRlX29wdGlvbnMYCyADKAsyKy52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuVGVtcGxhdGVPcHRpb25CEwoRYWNjZXNzX2xvZ19jb25maWdCFQoTX3VzZV9yZW1vdGVfYWRkcmVzcyIeChxDcmVhdGVWaXJ0dWFsU2VydmljZVJlc3BvbnNlIpsDChtVcGRhdGVWaXJ0dWFsU2VydmljZVJlcXVlc3QSCwoDdWlkGAEgASgJEhAKCG5vZGVfaWRzGAIgAygJEgwKBG5hbWUYAyABKAkSFAoMYWNjZXNzX2dyb3VwGAQgASgJEhQKDHRlbXBsYXRlX3VpZBgFIAEoCRIUCgxsaXN0ZW5lcl91aWQYBiABKAkSFAoMdmlydHVhbF9ob3N0GAcgASgMEh8KFWFjY2Vzc19sb2dfY29uZmlnX3VpZBgIIAEoCUgAEiMKG2FkZGl0aW9uYWxfaHR0cF9maWx0ZXJfdWlkcxgJIAMoCRIdChVhZGRpdGlvbmFsX3JvdXRlX3VpZHMYCiADKAkSHwoSdXNlX3JlbW90ZV9hZGRyZXNzGAsgASgISAGIAQESRQoQdGVtcGxhdGVfb3B0aW9ucxgMIAMoCzIrLnZpcnR1YWxfc2VydmljZV90ZW1wbGF0ZS52MS5UZW1wbGF0ZU9wdGlvbkITChFhY2Nlc3NfbG9nX2NvbmZpZ0IVChNfdXNlX3JlbW90ZV9hZGRyZXNzIh4KHFVwZGF0ZVZpcnR1YWxTZXJ2aWNlUmVzcG9uc2UiKgobRGVsZXRlVmlydHVhbFNlcnZpY2VSZXF1ZXN0EgsKA3VpZBgBIAEoCSIeChxEZWxldGVWaXJ0dWFsU2VydmljZVJlc3BvbnNlIicKGEdldFZpcnR1YWxTZXJ2aWNlUmVxdWVzdBILCgN1aWQYASABKAkilwQKGUdldFZpcnR1YWxTZXJ2aWNlUmVzcG9uc2USCwoDdWlkGAEgASgJEgwKBG5hbWUYAiABKAkSEAoIbm9kZV9pZHMYAyADKAkSFAoMYWNjZXNzX2dyb3VwGAQgASgJEigKCHRlbXBsYXRlGAUgASgLMhYuY29tbW9uLnYxLlJlc291cmNlUmVmEigKCGxpc3RlbmVyGAYgASgLMhYuY29tbW9uLnYxLlJlc291cmNlUmVmEhQKDHZpcnR1YWxfaG9zdBgHIAEoDBIzChFhY2Nlc3NfbG9nX2NvbmZpZxgIIAEoCzIWLmNvbW1vbi52MS5SZXNvdXJjZVJlZkgAEh8KFWFjY2Vzc19sb2dfY29uZmlnX3JhdxgJIAEoDEgAEjcKF2FkZGl0aW9uYWxfaHR0cF9maWx0ZXJzGAogAygLMhYuY29tbW9uLnYxLlJlc291cmNlUmVmEjEKEWFkZGl0aW9uYWxfcm91dGVzGAsgAygLMhYuY29tbW9uLnYxLlJlc291cmNlUmVmEh8KEnVzZV9yZW1vdGVfYWRkcmVzcxgMIAEoCEgBiAEBEkUKEHRlbXBsYXRlX29wdGlvbnMYDSADKAsyKy52aXJ0dWFsX3NlcnZpY2VfdGVtcGxhdGUudjEuVGVtcGxhdGVPcHRpb25CDAoKYWNjZXNzX2xvZ0IVChNfdXNlX3JlbW90ZV9hZGRyZXNzIhsKGUxpc3RWaXJ0dWFsU2VydmljZVJlcXVlc3QihQEKFlZpcnR1YWxTZXJ2aWNlTGlzdEl0ZW0SCwoDdWlkGAEgASgJEgwKBG5hbWUYAiABKAkSEAoIbm9kZV9pZHMYAyADKAkSFAoMYWNjZXNzX2dyb3VwGAQgASgJEigKCHRlbXBsYXRlGAUgASgLMhYuY29tbW9uLnYxLlJlc291cmNlUmVmIlcKGkxpc3RWaXJ0dWFsU2VydmljZVJlc3BvbnNlEjkKBWl0ZW1zGAEgAygLMioudmlydHVhbF9zZXJ2aWNlLnYxLlZpcnR1YWxTZXJ2aWNlTGlzdEl0ZW0y9AQKGlZpcnR1YWxTZXJ2aWNlU3RvcmVTZXJ2aWNlEnkKFENyZWF0ZVZpcnR1YWxTZXJ2aWNlEi8udmlydHVhbF9zZXJ2aWNlLnYxLkNyZWF0ZVZpcnR1YWxTZXJ2aWNlUmVxdWVzdBowLnZpcnR1YWxfc2VydmljZS52MS5DcmVhdGVWaXJ0dWFsU2VydmljZVJlc3BvbnNlEnkKFFVwZGF0ZVZpcnR1YWxTZXJ2aWNlEi8udmlydHVhbF9zZXJ2aWNlLnYxLlVwZGF0ZVZpcnR1YWxTZXJ2aWNlUmVxdWVzdBowLnZpcnR1YWxfc2VydmljZS52MS5VcGRhdGVWaXJ0dWFsU2VydmljZVJlc3BvbnNlEnkKFERlbGV0ZVZpcnR1YWxTZXJ2aWNlEi8udmlydHVhbF9zZXJ2aWNlLnYxLkRlbGV0ZVZpcnR1YWxTZXJ2aWNlUmVxdWVzdBowLnZpcnR1YWxfc2VydmljZS52MS5EZWxldGVWaXJ0dWFsU2VydmljZVJlc3BvbnNlEnAKEUdldFZpcnR1YWxTZXJ2aWNlEiwudmlydHVhbF9zZXJ2aWNlLnYxLkdldFZpcnR1YWxTZXJ2aWNlUmVxdWVzdBotLnZpcnR1YWxfc2VydmljZS52MS5HZXRWaXJ0dWFsU2VydmljZVJlc3BvbnNlEnMKEkxpc3RWaXJ0dWFsU2VydmljZRItLnZpcnR1YWxfc2VydmljZS52MS5MaXN0VmlydHVhbFNlcnZpY2VSZXF1ZXN0Gi4udmlydHVhbF9zZXJ2aWNlLnYxLkxpc3RWaXJ0dWFsU2VydmljZVJlc3BvbnNlQu0BChZjb20udmlydHVhbF9zZXJ2aWNlLnYxQhNWaXJ0dWFsU2VydmljZVByb3RvUAFaWWdpdGh1Yi5jb20va2Fhc29wcy9lbnZveS14ZHMtY29udHJvbGxlci9wa2cvYXBpL2dycGMvdmlydHVhbF9zZXJ2aWNlL3YxO3ZpcnR1YWxfc2VydmljZXYxogIDVlhYqgIRVmlydHVhbFNlcnZpY2UuVjHKAhFWaXJ0dWFsU2VydmljZVxWMeICHVZpcnR1YWxTZXJ2aWNlXFYxXEdQQk1ldGFkYXRh6gISVmlydHVhbFNlcnZpY2U6OlYxYgZwcm90bzM',
		[file_common_v1_common, file_virtual_service_template_v1_virtual_service_template]
	)

/**
 * @generated from message virtual_service.v1.CreateVirtualServiceRequest
 */
export type CreateVirtualServiceRequest = Message<'virtual_service.v1.CreateVirtualServiceRequest'> & {
	/**
	 * строка
	 *
	 * @generated from field: string name = 1;
	 */
	name: string

	/**
	 * список чипов, данные вводим сами, из головы
	 *
	 * @generated from field: repeated string node_ids = 2;
	 */
	nodeIds: string[]

	/**
	 * строка. сточные прописные, цифры и спец символы, 80 символов
	 *
	 * @generated from field: string access_group = 3;
	 */
	accessGroup: string

	/**
	 * выбор селектора из virtual_service_template.proto VirtualServiceTemplateStoreService
	 *
	 * @generated from field: string template_uid = 4;
	 */
	templateUid: string

	/**
	 * выбор из колекции listeners proto/listener/v1/listener.proto
	 *
	 * @generated from field: string listener_uid = 5;
	 */
	listenerUid: string

	/**
	 * textAria инпут на YAML или JSON, но при отправке в JSON(BASE64)
	 *
	 * @generated from field: bytes virtual_host = 6;
	 */
	virtualHost: Uint8Array

	/**
	 * выбор из колекции access_log_config proto/access_log_config/v1/access_log_config.proto:7
	 *
	 * @generated from oneof virtual_service.v1.CreateVirtualServiceRequest.access_log_config
	 */
	accessLogConfig:
		| {
				/**
				 * select
				 *
				 * @generated from field: string access_log_config_uid = 7;
				 */
				value: string
				case: 'accessLogConfigUid'
		  }
		| { case: undefined; value?: undefined }

	/**
	 * селектор множества фильтров порядок важен, сначала добавляем из списка, а после двигаем
	 *
	 * @generated from field: repeated string additional_http_filter_uids = 8;
	 */
	additionalHttpFilterUids: string[]

	/**
	 * примерно так же как и http filter
	 *
	 * @generated from field: repeated string additional_route_uids = 9;
	 */
	additionalRouteUids: string[]

	/**
	 * выбор из 3х значений ДА/НЕТ/NUll дефолт null
	 *
	 * @generated from field: optional bool use_remote_address = 10;
	 */
	useRemoteAddress?: boolean

	/**
	 * набор опций пе
	 *
	 * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 11;
	 */
	templateOptions: TemplateOption[]
}

/**
 * Describes the message virtual_service.v1.CreateVirtualServiceRequest.
 * Use `create(CreateVirtualServiceRequestSchema)` to create a new message.
 */
export const CreateVirtualServiceRequestSchema: GenMessage<CreateVirtualServiceRequest> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 0)

/**
 * @generated from message virtual_service.v1.CreateVirtualServiceResponse
 */
export type CreateVirtualServiceResponse = Message<'virtual_service.v1.CreateVirtualServiceResponse'> & {}

/**
 * Describes the message virtual_service.v1.CreateVirtualServiceResponse.
 * Use `create(CreateVirtualServiceResponseSchema)` to create a new message.
 */
export const CreateVirtualServiceResponseSchema: GenMessage<CreateVirtualServiceResponse> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 1)

/**
 * @generated from message virtual_service.v1.UpdateVirtualServiceRequest
 */
export type UpdateVirtualServiceRequest = Message<'virtual_service.v1.UpdateVirtualServiceRequest'> & {
	/**
	 * @generated from field: string uid = 1;
	 */
	uid: string

	/**
	 * @generated from field: repeated string node_ids = 2;
	 */
	nodeIds: string[]

	/**
	 * @generated from field: string name = 3;
	 */
	// name: string;

	/**
	 * @generated from field: string access_group = 4;
	 */
	accessGroup: string

	/**
	 * @generated from field: string template_uid = 5;
	 */
	templateUid: string

	/**
	 * @generated from field: string listener_uid = 6;
	 */
	listenerUid: string

	/**
	 * @generated from field: bytes virtual_host = 7;
	 */
	virtualHost: Uint8Array

	/**
	 * @generated from oneof virtual_service.v1.UpdateVirtualServiceRequest.access_log_config
	 */
	accessLogConfig:
		| {
				/**
				 * @generated from field: string access_log_config_uid = 8;
				 */
				value: string
				case: 'accessLogConfigUid'
		  }
		| { case: undefined; value?: undefined }

	/**
	 * @generated from field: repeated string additional_http_filter_uids = 9;
	 */
	additionalHttpFilterUids: string[]

	/**
	 * @generated from field: repeated string additional_route_uids = 10;
	 */
	additionalRouteUids: string[]

	/**
	 * @generated from field: optional bool use_remote_address = 11;
	 */
	useRemoteAddress?: boolean

	/**
	 * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 12;
	 */
	templateOptions: TemplateOption[]
}

/**
 * Describes the message virtual_service.v1.UpdateVirtualServiceRequest.
 * Use `create(UpdateVirtualServiceRequestSchema)` to create a new message.
 */
export const UpdateVirtualServiceRequestSchema: GenMessage<UpdateVirtualServiceRequest> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 2)

/**
 * @generated from message virtual_service.v1.UpdateVirtualServiceResponse
 */
export type UpdateVirtualServiceResponse = Message<'virtual_service.v1.UpdateVirtualServiceResponse'> & {}

/**
 * Describes the message virtual_service.v1.UpdateVirtualServiceResponse.
 * Use `create(UpdateVirtualServiceResponseSchema)` to create a new message.
 */
export const UpdateVirtualServiceResponseSchema: GenMessage<UpdateVirtualServiceResponse> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 3)

/**
 * @generated from message virtual_service.v1.DeleteVirtualServiceRequest
 */
export type DeleteVirtualServiceRequest = Message<'virtual_service.v1.DeleteVirtualServiceRequest'> & {
	/**
	 * @generated from field: string uid = 1;
	 */
	uid: string
}

/**
 * Describes the message virtual_service.v1.DeleteVirtualServiceRequest.
 * Use `create(DeleteVirtualServiceRequestSchema)` to create a new message.
 */
export const DeleteVirtualServiceRequestSchema: GenMessage<DeleteVirtualServiceRequest> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 4)

/**
 * @generated from message virtual_service.v1.DeleteVirtualServiceResponse
 */
export type DeleteVirtualServiceResponse = Message<'virtual_service.v1.DeleteVirtualServiceResponse'> & {}

/**
 * Describes the message virtual_service.v1.DeleteVirtualServiceResponse.
 * Use `create(DeleteVirtualServiceResponseSchema)` to create a new message.
 */
export const DeleteVirtualServiceResponseSchema: GenMessage<DeleteVirtualServiceResponse> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 5)

/**
 * @generated from message virtual_service.v1.GetVirtualServiceRequest
 */
export type GetVirtualServiceRequest = Message<'virtual_service.v1.GetVirtualServiceRequest'> & {
	/**
	 * @generated from field: string uid = 1;
	 */
	uid: string
}

/**
 * Describes the message virtual_service.v1.GetVirtualServiceRequest.
 * Use `create(GetVirtualServiceRequestSchema)` to create a new message.
 */
export const GetVirtualServiceRequestSchema: GenMessage<GetVirtualServiceRequest> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 6)

/**
 * @generated from message virtual_service.v1.GetVirtualServiceResponse
 */
export type GetVirtualServiceResponse = Message<'virtual_service.v1.GetVirtualServiceResponse'> & {
	/**
	 * @generated from field: string uid = 1;
	 */
	uid: string

	/**
	 * @generated from field: string name = 2;
	 */
	name: string

	/**
	 * @generated from field: repeated string node_ids = 3;
	 */
	nodeIds: string[]

	/**
	 * @generated from field: string access_group = 4;
	 */
	accessGroup: string

	/**
	 * @generated from field: common.v1.ResourceRef template = 5;
	 */
	template?: ResourceRef

	/**
	 * @generated from field: common.v1.ResourceRef listener = 6;
	 */
	listener?: ResourceRef

	/**
	 * @generated from field: bytes virtual_host = 7;
	 */
	virtualHost: Uint8Array

	/**
	 * @generated from oneof virtual_service.v1.GetVirtualServiceResponse.access_log
	 */
	accessLog:
		| {
				/**
				 * @generated from field: common.v1.ResourceRef access_log_config = 8;
				 */
				value: ResourceRef
				case: 'accessLogConfig'
		  }
		| {
				/**
				 * @generated from field: bytes access_log_config_raw = 9;
				 */
				value: Uint8Array
				case: 'accessLogConfigRaw'
		  }
		| { case: undefined; value?: undefined }

	/**
	 * @generated from field: repeated common.v1.ResourceRef additional_http_filters = 10;
	 */
	additionalHttpFilters: ResourceRef[]

	/**
	 * @generated from field: repeated common.v1.ResourceRef additional_routes = 11;
	 */
	additionalRoutes: ResourceRef[]

	/**
	 * @generated from field: optional bool use_remote_address = 12;
	 */
	useRemoteAddress?: boolean

	/**
	 * @generated from field: repeated virtual_service_template.v1.TemplateOption template_options = 13;
	 */
	templateOptions: TemplateOption[]
}

/**
 * Describes the message virtual_service.v1.GetVirtualServiceResponse.
 * Use `create(GetVirtualServiceResponseSchema)` to create a new message.
 */
export const GetVirtualServiceResponseSchema: GenMessage<GetVirtualServiceResponse> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 7)

/**
 * @generated from message virtual_service.v1.ListVirtualServiceRequest
 */
export type ListVirtualServiceRequest = Message<'virtual_service.v1.ListVirtualServiceRequest'> & {}

/**
 * Describes the message virtual_service.v1.ListVirtualServiceRequest.
 * Use `create(ListVirtualServiceRequestSchema)` to create a new message.
 */
export const ListVirtualServiceRequestSchema: GenMessage<ListVirtualServiceRequest> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 8)

/**
 * @generated from message virtual_service.v1.VirtualServiceListItem
 */
export type VirtualServiceListItem = Message<'virtual_service.v1.VirtualServiceListItem'> & {
	/**
	 * @generated from field: string uid = 1;
	 */
	uid: string

	/**
	 * @generated from field: string name = 2;
	 */
	name: string

	/**
	 * @generated from field: repeated string node_ids = 3;
	 */
	nodeIds: string[]

	/**
	 * @generated from field: string access_group = 4;
	 */
	accessGroup: string

	/**
	 * @generated from field: common.v1.ResourceRef template = 5;
	 */
	template?: ResourceRef
}

/**
 * Describes the message virtual_service.v1.VirtualServiceListItem.
 * Use `create(VirtualServiceListItemSchema)` to create a new message.
 */
export const VirtualServiceListItemSchema: GenMessage<VirtualServiceListItem> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 9)

/**
 * @generated from message virtual_service.v1.ListVirtualServiceResponse
 */
export type ListVirtualServiceResponse = Message<'virtual_service.v1.ListVirtualServiceResponse'> & {
	/**
	 * @generated from field: repeated virtual_service.v1.VirtualServiceListItem items = 1;
	 */
	items: VirtualServiceListItem[]
}

/**
 * Describes the message virtual_service.v1.ListVirtualServiceResponse.
 * Use `create(ListVirtualServiceResponseSchema)` to create a new message.
 */
export const ListVirtualServiceResponseSchema: GenMessage<ListVirtualServiceResponse> =
	/*@__PURE__*/
	messageDesc(file_virtual_service_v1_virtual_service, 10)

/**
 * @generated from service virtual_service.v1.VirtualServiceStoreService
 */
export const VirtualServiceStoreService: GenService<{
	/**
	 * @generated from rpc virtual_service.v1.VirtualServiceStoreService.CreateVirtualService
	 */
	createVirtualService: {
		methodKind: 'unary'
		input: typeof CreateVirtualServiceRequestSchema
		output: typeof CreateVirtualServiceResponseSchema
	}
	/**
	 * @generated from rpc virtual_service.v1.VirtualServiceStoreService.UpdateVirtualService
	 */
	updateVirtualService: {
		methodKind: 'unary'
		input: typeof UpdateVirtualServiceRequestSchema
		output: typeof UpdateVirtualServiceResponseSchema
	}
	/**
	 * @generated from rpc virtual_service.v1.VirtualServiceStoreService.DeleteVirtualService
	 */
	deleteVirtualService: {
		methodKind: 'unary'
		input: typeof DeleteVirtualServiceRequestSchema
		output: typeof DeleteVirtualServiceResponseSchema
	}
	/**
	 * @generated from rpc virtual_service.v1.VirtualServiceStoreService.GetVirtualService
	 */
	getVirtualService: {
		methodKind: 'unary'
		input: typeof GetVirtualServiceRequestSchema
		output: typeof GetVirtualServiceResponseSchema
	}
	/**
	 * @generated from rpc virtual_service.v1.VirtualServiceStoreService.ListVirtualService
	 */
	listVirtualService: {
		methodKind: 'unary'
		input: typeof ListVirtualServiceRequestSchema
		output: typeof ListVirtualServiceResponseSchema
	}
}> = /*@__PURE__*/ serviceDesc(file_virtual_service_v1_virtual_service, 0)

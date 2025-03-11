// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.5
// 	protoc        (unknown)
// source: access_log_config/v1/access_log_config.proto

package access_log_configv1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
	unsafe "unsafe"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type AccessLogConfigListItem struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Uid           string                 `protobuf:"bytes,1,opt,name=uid,proto3" json:"uid,omitempty"`
	Name          string                 `protobuf:"bytes,2,opt,name=name,proto3" json:"name,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *AccessLogConfigListItem) Reset() {
	*x = AccessLogConfigListItem{}
	mi := &file_access_log_config_v1_access_log_config_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *AccessLogConfigListItem) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*AccessLogConfigListItem) ProtoMessage() {}

func (x *AccessLogConfigListItem) ProtoReflect() protoreflect.Message {
	mi := &file_access_log_config_v1_access_log_config_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use AccessLogConfigListItem.ProtoReflect.Descriptor instead.
func (*AccessLogConfigListItem) Descriptor() ([]byte, []int) {
	return file_access_log_config_v1_access_log_config_proto_rawDescGZIP(), []int{0}
}

func (x *AccessLogConfigListItem) GetUid() string {
	if x != nil {
		return x.Uid
	}
	return ""
}

func (x *AccessLogConfigListItem) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

type ListAccessLogConfigRequest struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ListAccessLogConfigRequest) Reset() {
	*x = ListAccessLogConfigRequest{}
	mi := &file_access_log_config_v1_access_log_config_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ListAccessLogConfigRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListAccessLogConfigRequest) ProtoMessage() {}

func (x *ListAccessLogConfigRequest) ProtoReflect() protoreflect.Message {
	mi := &file_access_log_config_v1_access_log_config_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListAccessLogConfigRequest.ProtoReflect.Descriptor instead.
func (*ListAccessLogConfigRequest) Descriptor() ([]byte, []int) {
	return file_access_log_config_v1_access_log_config_proto_rawDescGZIP(), []int{1}
}

type ListAccessLogConfigResponse struct {
	state         protoimpl.MessageState     `protogen:"open.v1"`
	Items         []*AccessLogConfigListItem `protobuf:"bytes,1,rep,name=items,proto3" json:"items,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ListAccessLogConfigResponse) Reset() {
	*x = ListAccessLogConfigResponse{}
	mi := &file_access_log_config_v1_access_log_config_proto_msgTypes[2]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ListAccessLogConfigResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListAccessLogConfigResponse) ProtoMessage() {}

func (x *ListAccessLogConfigResponse) ProtoReflect() protoreflect.Message {
	mi := &file_access_log_config_v1_access_log_config_proto_msgTypes[2]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListAccessLogConfigResponse.ProtoReflect.Descriptor instead.
func (*ListAccessLogConfigResponse) Descriptor() ([]byte, []int) {
	return file_access_log_config_v1_access_log_config_proto_rawDescGZIP(), []int{2}
}

func (x *ListAccessLogConfigResponse) GetItems() []*AccessLogConfigListItem {
	if x != nil {
		return x.Items
	}
	return nil
}

var File_access_log_config_v1_access_log_config_proto protoreflect.FileDescriptor

var file_access_log_config_v1_access_log_config_proto_rawDesc = string([]byte{
	0x0a, 0x2c, 0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63, 0x6f, 0x6e,
	0x66, 0x69, 0x67, 0x2f, 0x76, 0x31, 0x2f, 0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f,
	0x67, 0x5f, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x14,
	0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63, 0x6f, 0x6e, 0x66, 0x69,
	0x67, 0x2e, 0x76, 0x31, 0x22, 0x3f, 0x0a, 0x17, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x4c, 0x6f,
	0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x4c, 0x69, 0x73, 0x74, 0x49, 0x74, 0x65, 0x6d, 0x12,
	0x10, 0x0a, 0x03, 0x75, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x75, 0x69,
	0x64, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x04, 0x6e, 0x61, 0x6d, 0x65, 0x22, 0x1c, 0x0a, 0x1a, 0x4c, 0x69, 0x73, 0x74, 0x41, 0x63, 0x63,
	0x65, 0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x22, 0x62, 0x0a, 0x1b, 0x4c, 0x69, 0x73, 0x74, 0x41, 0x63, 0x63, 0x65, 0x73,
	0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e,
	0x73, 0x65, 0x12, 0x43, 0x0a, 0x05, 0x69, 0x74, 0x65, 0x6d, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28,
	0x0b, 0x32, 0x2d, 0x2e, 0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63,
	0x6f, 0x6e, 0x66, 0x69, 0x67, 0x2e, 0x76, 0x31, 0x2e, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x4c,
	0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x4c, 0x69, 0x73, 0x74, 0x49, 0x74, 0x65, 0x6d,
	0x52, 0x05, 0x69, 0x74, 0x65, 0x6d, 0x73, 0x32, 0x99, 0x01, 0x0a, 0x1b, 0x41, 0x63, 0x63, 0x65,
	0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x53, 0x74, 0x6f, 0x72, 0x65,
	0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x7a, 0x0a, 0x13, 0x4c, 0x69, 0x73, 0x74, 0x41,
	0x63, 0x63, 0x65, 0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x12, 0x30,
	0x2e, 0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63, 0x6f, 0x6e, 0x66,
	0x69, 0x67, 0x2e, 0x76, 0x31, 0x2e, 0x4c, 0x69, 0x73, 0x74, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73,
	0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x31, 0x2e, 0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63, 0x6f,
	0x6e, 0x66, 0x69, 0x67, 0x2e, 0x76, 0x31, 0x2e, 0x4c, 0x69, 0x73, 0x74, 0x41, 0x63, 0x63, 0x65,
	0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x42, 0xf8, 0x01, 0x0a, 0x18, 0x63, 0x6f, 0x6d, 0x2e, 0x61, 0x63, 0x63, 0x65,
	0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x2e, 0x76, 0x31,
	0x42, 0x14, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69,
	0x67, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x50, 0x01, 0x5a, 0x5d, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62,
	0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x6b, 0x61, 0x61, 0x73, 0x6f, 0x70, 0x73, 0x2f, 0x65, 0x6e, 0x76,
	0x6f, 0x79, 0x2d, 0x78, 0x64, 0x73, 0x2d, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x6f, 0x6c, 0x6c, 0x65,
	0x72, 0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x67, 0x72, 0x70, 0x63, 0x2f, 0x61,
	0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x67,
	0x2f, 0x76, 0x31, 0x3b, 0x61, 0x63, 0x63, 0x65, 0x73, 0x73, 0x5f, 0x6c, 0x6f, 0x67, 0x5f, 0x63,
	0x6f, 0x6e, 0x66, 0x69, 0x67, 0x76, 0x31, 0xa2, 0x02, 0x03, 0x41, 0x58, 0x58, 0xaa, 0x02, 0x12,
	0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x2e,
	0x56, 0x31, 0xca, 0x02, 0x12, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f,
	0x6e, 0x66, 0x69, 0x67, 0x5c, 0x56, 0x31, 0xe2, 0x02, 0x1e, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73,
	0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x5c, 0x56, 0x31, 0x5c, 0x47, 0x50, 0x42,
	0x4d, 0x65, 0x74, 0x61, 0x64, 0x61, 0x74, 0x61, 0xea, 0x02, 0x13, 0x41, 0x63, 0x63, 0x65, 0x73,
	0x73, 0x4c, 0x6f, 0x67, 0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x3a, 0x3a, 0x56, 0x31, 0x62, 0x06,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
})

var (
	file_access_log_config_v1_access_log_config_proto_rawDescOnce sync.Once
	file_access_log_config_v1_access_log_config_proto_rawDescData []byte
)

func file_access_log_config_v1_access_log_config_proto_rawDescGZIP() []byte {
	file_access_log_config_v1_access_log_config_proto_rawDescOnce.Do(func() {
		file_access_log_config_v1_access_log_config_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_access_log_config_v1_access_log_config_proto_rawDesc), len(file_access_log_config_v1_access_log_config_proto_rawDesc)))
	})
	return file_access_log_config_v1_access_log_config_proto_rawDescData
}

var file_access_log_config_v1_access_log_config_proto_msgTypes = make([]protoimpl.MessageInfo, 3)
var file_access_log_config_v1_access_log_config_proto_goTypes = []any{
	(*AccessLogConfigListItem)(nil),     // 0: access_log_config.v1.AccessLogConfigListItem
	(*ListAccessLogConfigRequest)(nil),  // 1: access_log_config.v1.ListAccessLogConfigRequest
	(*ListAccessLogConfigResponse)(nil), // 2: access_log_config.v1.ListAccessLogConfigResponse
}
var file_access_log_config_v1_access_log_config_proto_depIdxs = []int32{
	0, // 0: access_log_config.v1.ListAccessLogConfigResponse.items:type_name -> access_log_config.v1.AccessLogConfigListItem
	1, // 1: access_log_config.v1.AccessLogConfigStoreService.ListAccessLogConfig:input_type -> access_log_config.v1.ListAccessLogConfigRequest
	2, // 2: access_log_config.v1.AccessLogConfigStoreService.ListAccessLogConfig:output_type -> access_log_config.v1.ListAccessLogConfigResponse
	2, // [2:3] is the sub-list for method output_type
	1, // [1:2] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_access_log_config_v1_access_log_config_proto_init() }
func file_access_log_config_v1_access_log_config_proto_init() {
	if File_access_log_config_v1_access_log_config_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_access_log_config_v1_access_log_config_proto_rawDesc), len(file_access_log_config_v1_access_log_config_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   3,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_access_log_config_v1_access_log_config_proto_goTypes,
		DependencyIndexes: file_access_log_config_v1_access_log_config_proto_depIdxs,
		MessageInfos:      file_access_log_config_v1_access_log_config_proto_msgTypes,
	}.Build()
	File_access_log_config_v1_access_log_config_proto = out.File
	file_access_log_config_v1_access_log_config_proto_goTypes = nil
	file_access_log_config_v1_access_log_config_proto_depIdxs = nil
}

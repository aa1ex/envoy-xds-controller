// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: virtual_service/v1/virtual_service.proto

package virtual_servicev1connect

import (
	connect "connectrpc.com/connect"
	context "context"
	errors "errors"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1"
	http "net/http"
	strings "strings"
)

// This is a compile-time assertion to ensure that this generated file and the connect package are
// compatible. If you get a compiler error that this constant is not defined, this code was
// generated with a version of connect newer than the one compiled into your binary. You can fix the
// problem by either regenerating this code with an older version of connect or updating the connect
// version compiled into your binary.
const _ = connect.IsAtLeastVersion1_13_0

const (
	// VirtualServiceStoreServiceName is the fully-qualified name of the VirtualServiceStoreService
	// service.
	VirtualServiceStoreServiceName = "virtual_service.v1.VirtualServiceStoreService"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// VirtualServiceStoreServiceCreateVirtualServiceProcedure is the fully-qualified name of the
	// VirtualServiceStoreService's CreateVirtualService RPC.
	VirtualServiceStoreServiceCreateVirtualServiceProcedure = "/virtual_service.v1.VirtualServiceStoreService/CreateVirtualService"
	// VirtualServiceStoreServiceUpdateVirtualServiceProcedure is the fully-qualified name of the
	// VirtualServiceStoreService's UpdateVirtualService RPC.
	VirtualServiceStoreServiceUpdateVirtualServiceProcedure = "/virtual_service.v1.VirtualServiceStoreService/UpdateVirtualService"
	// VirtualServiceStoreServiceDeleteVirtualServiceProcedure is the fully-qualified name of the
	// VirtualServiceStoreService's DeleteVirtualService RPC.
	VirtualServiceStoreServiceDeleteVirtualServiceProcedure = "/virtual_service.v1.VirtualServiceStoreService/DeleteVirtualService"
	// VirtualServiceStoreServiceGetVirtualServiceProcedure is the fully-qualified name of the
	// VirtualServiceStoreService's GetVirtualService RPC.
	VirtualServiceStoreServiceGetVirtualServiceProcedure = "/virtual_service.v1.VirtualServiceStoreService/GetVirtualService"
	// VirtualServiceStoreServiceListVirtualServicesProcedure is the fully-qualified name of the
	// VirtualServiceStoreService's ListVirtualServices RPC.
	VirtualServiceStoreServiceListVirtualServicesProcedure = "/virtual_service.v1.VirtualServiceStoreService/ListVirtualServices"
)

// VirtualServiceStoreServiceClient is a client for the
// virtual_service.v1.VirtualServiceStoreService service.
type VirtualServiceStoreServiceClient interface {
	// CreateVirtualService creates a new virtual service.
	CreateVirtualService(context.Context, *connect.Request[v1.CreateVirtualServiceRequest]) (*connect.Response[v1.CreateVirtualServiceResponse], error)
	// UpdateVirtualService updates an existing virtual service.
	UpdateVirtualService(context.Context, *connect.Request[v1.UpdateVirtualServiceRequest]) (*connect.Response[v1.UpdateVirtualServiceResponse], error)
	// DeleteVirtualService deletes a virtual service by its UID.
	DeleteVirtualService(context.Context, *connect.Request[v1.DeleteVirtualServiceRequest]) (*connect.Response[v1.DeleteVirtualServiceResponse], error)
	// GetVirtualService retrieves a virtual service by its UID.
	GetVirtualService(context.Context, *connect.Request[v1.GetVirtualServiceRequest]) (*connect.Response[v1.GetVirtualServiceResponse], error)
	// ListVirtualServices retrieves a list of virtual services for the specified access group.
	ListVirtualServices(context.Context, *connect.Request[v1.ListVirtualServicesRequest]) (*connect.Response[v1.ListVirtualServicesResponse], error)
}

// NewVirtualServiceStoreServiceClient constructs a client for the
// virtual_service.v1.VirtualServiceStoreService service. By default, it uses the Connect protocol
// with the binary Protobuf Codec, asks for gzipped responses, and sends uncompressed requests. To
// use the gRPC or gRPC-Web protocols, supply the connect.WithGRPC() or connect.WithGRPCWeb()
// options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewVirtualServiceStoreServiceClient(httpClient connect.HTTPClient, baseURL string, opts ...connect.ClientOption) VirtualServiceStoreServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	virtualServiceStoreServiceMethods := v1.File_virtual_service_v1_virtual_service_proto.Services().ByName("VirtualServiceStoreService").Methods()
	return &virtualServiceStoreServiceClient{
		createVirtualService: connect.NewClient[v1.CreateVirtualServiceRequest, v1.CreateVirtualServiceResponse](
			httpClient,
			baseURL+VirtualServiceStoreServiceCreateVirtualServiceProcedure,
			connect.WithSchema(virtualServiceStoreServiceMethods.ByName("CreateVirtualService")),
			connect.WithClientOptions(opts...),
		),
		updateVirtualService: connect.NewClient[v1.UpdateVirtualServiceRequest, v1.UpdateVirtualServiceResponse](
			httpClient,
			baseURL+VirtualServiceStoreServiceUpdateVirtualServiceProcedure,
			connect.WithSchema(virtualServiceStoreServiceMethods.ByName("UpdateVirtualService")),
			connect.WithClientOptions(opts...),
		),
		deleteVirtualService: connect.NewClient[v1.DeleteVirtualServiceRequest, v1.DeleteVirtualServiceResponse](
			httpClient,
			baseURL+VirtualServiceStoreServiceDeleteVirtualServiceProcedure,
			connect.WithSchema(virtualServiceStoreServiceMethods.ByName("DeleteVirtualService")),
			connect.WithClientOptions(opts...),
		),
		getVirtualService: connect.NewClient[v1.GetVirtualServiceRequest, v1.GetVirtualServiceResponse](
			httpClient,
			baseURL+VirtualServiceStoreServiceGetVirtualServiceProcedure,
			connect.WithSchema(virtualServiceStoreServiceMethods.ByName("GetVirtualService")),
			connect.WithClientOptions(opts...),
		),
		listVirtualServices: connect.NewClient[v1.ListVirtualServicesRequest, v1.ListVirtualServicesResponse](
			httpClient,
			baseURL+VirtualServiceStoreServiceListVirtualServicesProcedure,
			connect.WithSchema(virtualServiceStoreServiceMethods.ByName("ListVirtualServices")),
			connect.WithClientOptions(opts...),
		),
	}
}

// virtualServiceStoreServiceClient implements VirtualServiceStoreServiceClient.
type virtualServiceStoreServiceClient struct {
	createVirtualService *connect.Client[v1.CreateVirtualServiceRequest, v1.CreateVirtualServiceResponse]
	updateVirtualService *connect.Client[v1.UpdateVirtualServiceRequest, v1.UpdateVirtualServiceResponse]
	deleteVirtualService *connect.Client[v1.DeleteVirtualServiceRequest, v1.DeleteVirtualServiceResponse]
	getVirtualService    *connect.Client[v1.GetVirtualServiceRequest, v1.GetVirtualServiceResponse]
	listVirtualServices  *connect.Client[v1.ListVirtualServicesRequest, v1.ListVirtualServicesResponse]
}

// CreateVirtualService calls virtual_service.v1.VirtualServiceStoreService.CreateVirtualService.
func (c *virtualServiceStoreServiceClient) CreateVirtualService(ctx context.Context, req *connect.Request[v1.CreateVirtualServiceRequest]) (*connect.Response[v1.CreateVirtualServiceResponse], error) {
	return c.createVirtualService.CallUnary(ctx, req)
}

// UpdateVirtualService calls virtual_service.v1.VirtualServiceStoreService.UpdateVirtualService.
func (c *virtualServiceStoreServiceClient) UpdateVirtualService(ctx context.Context, req *connect.Request[v1.UpdateVirtualServiceRequest]) (*connect.Response[v1.UpdateVirtualServiceResponse], error) {
	return c.updateVirtualService.CallUnary(ctx, req)
}

// DeleteVirtualService calls virtual_service.v1.VirtualServiceStoreService.DeleteVirtualService.
func (c *virtualServiceStoreServiceClient) DeleteVirtualService(ctx context.Context, req *connect.Request[v1.DeleteVirtualServiceRequest]) (*connect.Response[v1.DeleteVirtualServiceResponse], error) {
	return c.deleteVirtualService.CallUnary(ctx, req)
}

// GetVirtualService calls virtual_service.v1.VirtualServiceStoreService.GetVirtualService.
func (c *virtualServiceStoreServiceClient) GetVirtualService(ctx context.Context, req *connect.Request[v1.GetVirtualServiceRequest]) (*connect.Response[v1.GetVirtualServiceResponse], error) {
	return c.getVirtualService.CallUnary(ctx, req)
}

// ListVirtualServices calls virtual_service.v1.VirtualServiceStoreService.ListVirtualServices.
func (c *virtualServiceStoreServiceClient) ListVirtualServices(ctx context.Context, req *connect.Request[v1.ListVirtualServicesRequest]) (*connect.Response[v1.ListVirtualServicesResponse], error) {
	return c.listVirtualServices.CallUnary(ctx, req)
}

// VirtualServiceStoreServiceHandler is an implementation of the
// virtual_service.v1.VirtualServiceStoreService service.
type VirtualServiceStoreServiceHandler interface {
	// CreateVirtualService creates a new virtual service.
	CreateVirtualService(context.Context, *connect.Request[v1.CreateVirtualServiceRequest]) (*connect.Response[v1.CreateVirtualServiceResponse], error)
	// UpdateVirtualService updates an existing virtual service.
	UpdateVirtualService(context.Context, *connect.Request[v1.UpdateVirtualServiceRequest]) (*connect.Response[v1.UpdateVirtualServiceResponse], error)
	// DeleteVirtualService deletes a virtual service by its UID.
	DeleteVirtualService(context.Context, *connect.Request[v1.DeleteVirtualServiceRequest]) (*connect.Response[v1.DeleteVirtualServiceResponse], error)
	// GetVirtualService retrieves a virtual service by its UID.
	GetVirtualService(context.Context, *connect.Request[v1.GetVirtualServiceRequest]) (*connect.Response[v1.GetVirtualServiceResponse], error)
	// ListVirtualServices retrieves a list of virtual services for the specified access group.
	ListVirtualServices(context.Context, *connect.Request[v1.ListVirtualServicesRequest]) (*connect.Response[v1.ListVirtualServicesResponse], error)
}

// NewVirtualServiceStoreServiceHandler builds an HTTP handler from the service implementation. It
// returns the path on which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewVirtualServiceStoreServiceHandler(svc VirtualServiceStoreServiceHandler, opts ...connect.HandlerOption) (string, http.Handler) {
	virtualServiceStoreServiceMethods := v1.File_virtual_service_v1_virtual_service_proto.Services().ByName("VirtualServiceStoreService").Methods()
	virtualServiceStoreServiceCreateVirtualServiceHandler := connect.NewUnaryHandler(
		VirtualServiceStoreServiceCreateVirtualServiceProcedure,
		svc.CreateVirtualService,
		connect.WithSchema(virtualServiceStoreServiceMethods.ByName("CreateVirtualService")),
		connect.WithHandlerOptions(opts...),
	)
	virtualServiceStoreServiceUpdateVirtualServiceHandler := connect.NewUnaryHandler(
		VirtualServiceStoreServiceUpdateVirtualServiceProcedure,
		svc.UpdateVirtualService,
		connect.WithSchema(virtualServiceStoreServiceMethods.ByName("UpdateVirtualService")),
		connect.WithHandlerOptions(opts...),
	)
	virtualServiceStoreServiceDeleteVirtualServiceHandler := connect.NewUnaryHandler(
		VirtualServiceStoreServiceDeleteVirtualServiceProcedure,
		svc.DeleteVirtualService,
		connect.WithSchema(virtualServiceStoreServiceMethods.ByName("DeleteVirtualService")),
		connect.WithHandlerOptions(opts...),
	)
	virtualServiceStoreServiceGetVirtualServiceHandler := connect.NewUnaryHandler(
		VirtualServiceStoreServiceGetVirtualServiceProcedure,
		svc.GetVirtualService,
		connect.WithSchema(virtualServiceStoreServiceMethods.ByName("GetVirtualService")),
		connect.WithHandlerOptions(opts...),
	)
	virtualServiceStoreServiceListVirtualServicesHandler := connect.NewUnaryHandler(
		VirtualServiceStoreServiceListVirtualServicesProcedure,
		svc.ListVirtualServices,
		connect.WithSchema(virtualServiceStoreServiceMethods.ByName("ListVirtualServices")),
		connect.WithHandlerOptions(opts...),
	)
	return "/virtual_service.v1.VirtualServiceStoreService/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case VirtualServiceStoreServiceCreateVirtualServiceProcedure:
			virtualServiceStoreServiceCreateVirtualServiceHandler.ServeHTTP(w, r)
		case VirtualServiceStoreServiceUpdateVirtualServiceProcedure:
			virtualServiceStoreServiceUpdateVirtualServiceHandler.ServeHTTP(w, r)
		case VirtualServiceStoreServiceDeleteVirtualServiceProcedure:
			virtualServiceStoreServiceDeleteVirtualServiceHandler.ServeHTTP(w, r)
		case VirtualServiceStoreServiceGetVirtualServiceProcedure:
			virtualServiceStoreServiceGetVirtualServiceHandler.ServeHTTP(w, r)
		case VirtualServiceStoreServiceListVirtualServicesProcedure:
			virtualServiceStoreServiceListVirtualServicesHandler.ServeHTTP(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}

// UnimplementedVirtualServiceStoreServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedVirtualServiceStoreServiceHandler struct{}

func (UnimplementedVirtualServiceStoreServiceHandler) CreateVirtualService(context.Context, *connect.Request[v1.CreateVirtualServiceRequest]) (*connect.Response[v1.CreateVirtualServiceResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("virtual_service.v1.VirtualServiceStoreService.CreateVirtualService is not implemented"))
}

func (UnimplementedVirtualServiceStoreServiceHandler) UpdateVirtualService(context.Context, *connect.Request[v1.UpdateVirtualServiceRequest]) (*connect.Response[v1.UpdateVirtualServiceResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("virtual_service.v1.VirtualServiceStoreService.UpdateVirtualService is not implemented"))
}

func (UnimplementedVirtualServiceStoreServiceHandler) DeleteVirtualService(context.Context, *connect.Request[v1.DeleteVirtualServiceRequest]) (*connect.Response[v1.DeleteVirtualServiceResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("virtual_service.v1.VirtualServiceStoreService.DeleteVirtualService is not implemented"))
}

func (UnimplementedVirtualServiceStoreServiceHandler) GetVirtualService(context.Context, *connect.Request[v1.GetVirtualServiceRequest]) (*connect.Response[v1.GetVirtualServiceResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("virtual_service.v1.VirtualServiceStoreService.GetVirtualService is not implemented"))
}

func (UnimplementedVirtualServiceStoreServiceHandler) ListVirtualServices(context.Context, *connect.Request[v1.ListVirtualServicesRequest]) (*connect.Response[v1.ListVirtualServicesResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("virtual_service.v1.VirtualServiceStoreService.ListVirtualServices is not implemented"))
}

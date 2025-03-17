// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: policy/v1/policy.proto

package policyv1connect

import (
	connect "connectrpc.com/connect"
	context "context"
	errors "errors"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/policy/v1"
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
	// PolicyStoreServiceName is the fully-qualified name of the PolicyStoreService service.
	PolicyStoreServiceName = "policy.v1.PolicyStoreService"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// PolicyStoreServiceListPolicyProcedure is the fully-qualified name of the PolicyStoreService's
	// ListPolicy RPC.
	PolicyStoreServiceListPolicyProcedure = "/policy.v1.PolicyStoreService/ListPolicy"
)

// PolicyStoreServiceClient is a client for the policy.v1.PolicyStoreService service.
type PolicyStoreServiceClient interface {
	ListPolicy(context.Context, *connect.Request[v1.ListPolicyRequest]) (*connect.Response[v1.ListPolicyResponse], error)
}

// NewPolicyStoreServiceClient constructs a client for the policy.v1.PolicyStoreService service. By
// default, it uses the Connect protocol with the binary Protobuf Codec, asks for gzipped responses,
// and sends uncompressed requests. To use the gRPC or gRPC-Web protocols, supply the
// connect.WithGRPC() or connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewPolicyStoreServiceClient(httpClient connect.HTTPClient, baseURL string, opts ...connect.ClientOption) PolicyStoreServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	policyStoreServiceMethods := v1.File_policy_v1_policy_proto.Services().ByName("PolicyStoreService").Methods()
	return &policyStoreServiceClient{
		listPolicy: connect.NewClient[v1.ListPolicyRequest, v1.ListPolicyResponse](
			httpClient,
			baseURL+PolicyStoreServiceListPolicyProcedure,
			connect.WithSchema(policyStoreServiceMethods.ByName("ListPolicy")),
			connect.WithClientOptions(opts...),
		),
	}
}

// policyStoreServiceClient implements PolicyStoreServiceClient.
type policyStoreServiceClient struct {
	listPolicy *connect.Client[v1.ListPolicyRequest, v1.ListPolicyResponse]
}

// ListPolicy calls policy.v1.PolicyStoreService.ListPolicy.
func (c *policyStoreServiceClient) ListPolicy(ctx context.Context, req *connect.Request[v1.ListPolicyRequest]) (*connect.Response[v1.ListPolicyResponse], error) {
	return c.listPolicy.CallUnary(ctx, req)
}

// PolicyStoreServiceHandler is an implementation of the policy.v1.PolicyStoreService service.
type PolicyStoreServiceHandler interface {
	ListPolicy(context.Context, *connect.Request[v1.ListPolicyRequest]) (*connect.Response[v1.ListPolicyResponse], error)
}

// NewPolicyStoreServiceHandler builds an HTTP handler from the service implementation. It returns
// the path on which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewPolicyStoreServiceHandler(svc PolicyStoreServiceHandler, opts ...connect.HandlerOption) (string, http.Handler) {
	policyStoreServiceMethods := v1.File_policy_v1_policy_proto.Services().ByName("PolicyStoreService").Methods()
	policyStoreServiceListPolicyHandler := connect.NewUnaryHandler(
		PolicyStoreServiceListPolicyProcedure,
		svc.ListPolicy,
		connect.WithSchema(policyStoreServiceMethods.ByName("ListPolicy")),
		connect.WithHandlerOptions(opts...),
	)
	return "/policy.v1.PolicyStoreService/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case PolicyStoreServiceListPolicyProcedure:
			policyStoreServiceListPolicyHandler.ServeHTTP(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}

// UnimplementedPolicyStoreServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedPolicyStoreServiceHandler struct{}

func (UnimplementedPolicyStoreServiceHandler) ListPolicy(context.Context, *connect.Request[v1.ListPolicyRequest]) (*connect.Response[v1.ListPolicyResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("policy.v1.PolicyStoreService.ListPolicy is not implemented"))
}

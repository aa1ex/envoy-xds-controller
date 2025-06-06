// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: cluster/v1/cluster.proto

package clusterv1connect

import (
	connect "connectrpc.com/connect"
	context "context"
	errors "errors"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/cluster/v1"
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
	// ClusterStoreServiceName is the fully-qualified name of the ClusterStoreService service.
	ClusterStoreServiceName = "cluster.v1.ClusterStoreService"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// ClusterStoreServiceListClusterProcedure is the fully-qualified name of the ClusterStoreService's
	// ListCluster RPC.
	ClusterStoreServiceListClusterProcedure = "/cluster.v1.ClusterStoreService/ListCluster"
)

// ClusterStoreServiceClient is a client for the cluster.v1.ClusterStoreService service.
type ClusterStoreServiceClient interface {
	// Lists all the clusters in the store.
	ListCluster(context.Context, *connect.Request[v1.ListClustersRequest]) (*connect.Response[v1.ListClustersResponse], error)
}

// NewClusterStoreServiceClient constructs a client for the cluster.v1.ClusterStoreService service.
// By default, it uses the Connect protocol with the binary Protobuf Codec, asks for gzipped
// responses, and sends uncompressed requests. To use the gRPC or gRPC-Web protocols, supply the
// connect.WithGRPC() or connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewClusterStoreServiceClient(httpClient connect.HTTPClient, baseURL string, opts ...connect.ClientOption) ClusterStoreServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	clusterStoreServiceMethods := v1.File_cluster_v1_cluster_proto.Services().ByName("ClusterStoreService").Methods()
	return &clusterStoreServiceClient{
		listCluster: connect.NewClient[v1.ListClustersRequest, v1.ListClustersResponse](
			httpClient,
			baseURL+ClusterStoreServiceListClusterProcedure,
			connect.WithSchema(clusterStoreServiceMethods.ByName("ListCluster")),
			connect.WithClientOptions(opts...),
		),
	}
}

// clusterStoreServiceClient implements ClusterStoreServiceClient.
type clusterStoreServiceClient struct {
	listCluster *connect.Client[v1.ListClustersRequest, v1.ListClustersResponse]
}

// ListCluster calls cluster.v1.ClusterStoreService.ListCluster.
func (c *clusterStoreServiceClient) ListCluster(ctx context.Context, req *connect.Request[v1.ListClustersRequest]) (*connect.Response[v1.ListClustersResponse], error) {
	return c.listCluster.CallUnary(ctx, req)
}

// ClusterStoreServiceHandler is an implementation of the cluster.v1.ClusterStoreService service.
type ClusterStoreServiceHandler interface {
	// Lists all the clusters in the store.
	ListCluster(context.Context, *connect.Request[v1.ListClustersRequest]) (*connect.Response[v1.ListClustersResponse], error)
}

// NewClusterStoreServiceHandler builds an HTTP handler from the service implementation. It returns
// the path on which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewClusterStoreServiceHandler(svc ClusterStoreServiceHandler, opts ...connect.HandlerOption) (string, http.Handler) {
	clusterStoreServiceMethods := v1.File_cluster_v1_cluster_proto.Services().ByName("ClusterStoreService").Methods()
	clusterStoreServiceListClusterHandler := connect.NewUnaryHandler(
		ClusterStoreServiceListClusterProcedure,
		svc.ListCluster,
		connect.WithSchema(clusterStoreServiceMethods.ByName("ListCluster")),
		connect.WithHandlerOptions(opts...),
	)
	return "/cluster.v1.ClusterStoreService/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case ClusterStoreServiceListClusterProcedure:
			clusterStoreServiceListClusterHandler.ServeHTTP(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}

// UnimplementedClusterStoreServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedClusterStoreServiceHandler struct{}

func (UnimplementedClusterStoreServiceHandler) ListCluster(context.Context, *connect.Request[v1.ListClustersRequest]) (*connect.Response[v1.ListClustersResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("cluster.v1.ClusterStoreService.ListCluster is not implemented"))
}

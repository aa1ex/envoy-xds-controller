package extproc

import (
	"io"
	"log"
	"strings"

	corev3 "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	extprocv3 "github.com/envoyproxy/go-control-plane/envoy/service/ext_proc/v3"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/resolver"
)

type Server struct {
	extprocv3.UnimplementedExternalProcessorServer
	Resolver *resolver.Resolver
}

func NewServer(r *resolver.Resolver) *Server { return &Server{Resolver: r} }

func (s *Server) Process(stream extprocv3.ExternalProcessor_ProcessServer) error {
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		switch r := req.Request.(type) {
		case *extprocv3.ProcessingRequest_RequestHeaders:
			clientKey := extractAuthority(r.RequestHeaders)
			res, err := s.Resolver.Resolve(stream.Context(), clientKey)
			if err != nil {
				log.Printf("resolve error: %v", err)
				// fail-open: send empty response (no mutation)
				if err := stream.Send(&extprocv3.ProcessingResponse{}); err != nil {
					return err
				}
				continue
			}
			if res.Cluster == "" {
				// no decision -> default route in Envoy
				if err := stream.Send(&extprocv3.ProcessingResponse{}); err != nil {
					return err
				}
				continue
			}
			resp := &extprocv3.ProcessingResponse{
				Response: &extprocv3.ProcessingResponse_RequestHeaders{
					RequestHeaders: &extprocv3.HeadersResponse{
						Response: &extprocv3.CommonResponse{
							HeaderMutation: &extprocv3.HeaderMutation{
								SetHeaders: []*corev3.HeaderValueOption{{
									Header: &corev3.HeaderValue{Key: "x-route-cluster", Value: res.Cluster},
								}},
							},
						},
					},
				},
			}
			if err := stream.Send(resp); err != nil {
				return err
			}
		default:
			// ignore other events for MVP
			if err := stream.Send(&extprocv3.ProcessingResponse{}); err != nil {
				return err
			}
		}
	}
}

func extractAuthority(hdrs *extprocv3.HttpHeaders) string {
	if hdrs == nil || hdrs.Headers == nil {
		return ""
	}
	for _, hv := range hdrs.Headers.Headers {
		k := strings.ToLower(hv.GetKey())
		if k == ":authority" || k == "host" {
			val := hv.GetValue()
			if val != "" {
				return val
			}
			return string(hv.GetRawValue())
		}
	}
	return ""
}

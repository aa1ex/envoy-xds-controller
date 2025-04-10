package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/node/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/node/v1/nodev1connect"
)

type NodeStore struct {
	nodeIDs []string
	nodev1connect.NodeStoreServiceHandler
}

func NewNodeStore(nodeIDs []string) *NodeStore {
	return &NodeStore{nodeIDs: nodeIDs}
}

func (s *NodeStore) ListNode(ctx context.Context, _ *connect.Request[v1.ListNodeRequest]) (*connect.Response[v1.ListNodeResponse], error) {
	list := make([]*v1.NodeListItem, 0, len(s.nodeIDs))
	authorizer := getAuthorizerFromContext(ctx)

	for _, v := range s.nodeIDs {
		item := &v1.NodeListItem{
			Id: v,
		}
		isAllowed, err := authorizer.Authorize(domainGeneral, item.Id)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			continue
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListNodeResponse{Items: list}), nil
}

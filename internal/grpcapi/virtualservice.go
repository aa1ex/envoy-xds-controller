package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"fmt"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	"github.com/kaasops/envoy-xds-controller/internal/xds/resbuilder"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1/virtual_servicev1connect"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VirtualServiceStore struct {
	store  *store.Store
	client client.Client
	virtual_servicev1connect.UnimplementedVirtualServiceStoreServiceHandler
}

func NewVirtualServiceStore(s *store.Store, c client.Client) *VirtualServiceStore {
	return &VirtualServiceStore{
		store:  s,
		client: c,
	}
}

func (s *VirtualServiceStore) ListVirtualService(_ context.Context, _ *connect.Request[v1.ListVirtualServiceRequest]) (*connect.Response[v1.ListVirtualServiceResponse], error) {
	m := s.store.MapVirtualServices()
	list := make([]*v1.VirtualServiceListItem, 0, len(m))
	for _, v := range m {
		vs := &v1.VirtualServiceListItem{
			Uid:       string(v.UID),
			Name:      v.Name,
			NodeIds:   v.GetNodeIDs(),
			ProjectId: "", // TODO:
		}
		list = append(list, vs)
	}
	return connect.NewResponse(&v1.ListVirtualServiceResponse{Items: list}), nil
}

func (s *VirtualServiceStore) CreateVirtualService(ctx context.Context, req *connect.Request[v1.CreateVirtualServiceRequest]) (*connect.Response[v1.CreateVirtualServiceResponse], error) {
	if len(req.Msg.NodeIds) == 0 {
		return nil, fmt.Errorf("nodeIDs is required")
	}

	vs := &v1alpha1.VirtualService{}
	vs.Name = req.Msg.Name
	vs.Labels = make(map[string]string)
	vs.Annotations = make(map[string]string)
	vs.SetNodeIDs(req.Msg.NodeIds)
	vs.Namespace = "default" // TODO: hardcode

	if req.Msg.ProjectId != "" {
		vs.SetProjectID(req.Msg.ProjectId)
	}

	if req.Msg.TemplateUid != "" {
		vst := s.store.GetVirtualServiceTemplateByUID(req.Msg.TemplateUid)
		if vst == nil {
			return nil, fmt.Errorf("template uid '%s' not found", req.Msg.TemplateUid)
		}
		vs.Spec.Template = &v1alpha1.ResourceRef{
			Name:      vst.Name,
			Namespace: &vst.Namespace,
		}
	}

	if req.Msg.ListenerUid != "" {
		listener := s.store.GetListenerByUID(req.Msg.ListenerUid)
		if listener == nil {
			return nil, fmt.Errorf("listener uid '%s' not found", req.Msg.ListenerUid)
		}
		vs.Spec.Listener = &v1alpha1.ResourceRef{
			Name:      listener.Name,
			Namespace: &listener.Namespace,
		}
	}

	if len(req.Msg.VirtualHost) > 0 {
		var tmp runtime.RawExtension
		if err := tmp.UnmarshalJSON(req.Msg.VirtualHost); err != nil {
			return nil, fmt.Errorf("unmarshal virtual host failed: %v", err)
		}
		vs.Spec.VirtualHost = &tmp
	}

	if req.Msg.AccessLogConfig != nil {
		if alcUID := req.Msg.GetAccessLogConfigUid(); alcUID != "" {
			alc := s.store.GetAccessLogByUID(alcUID)
			if alc == nil {
				return nil, fmt.Errorf("access log config uid '%s' not found", alcUID)
			}
			vs.Spec.AccessLogConfig = &v1alpha1.ResourceRef{
				Name:      alc.Name,
				Namespace: &alc.Namespace,
			}
		}
	}

	if len(req.Msg.AdditionalRouteUids) > 0 {
		for _, uid := range req.Msg.AdditionalRouteUids {
			route := s.store.GetRouteByUID(uid)
			if route == nil {
				return nil, fmt.Errorf("route uid '%s' not found", uid)
			}
			vs.Spec.AdditionalRoutes = append(vs.Spec.AdditionalRoutes, &v1alpha1.ResourceRef{
				Name:      route.Name,
				Namespace: &route.Namespace,
			})
		}
	}

	if len(req.Msg.AdditionalHttpFilterUids) > 0 {
		for _, uid := range req.Msg.AdditionalHttpFilterUids {
			filter := s.store.GetHTTPFilterByUID(uid)
			if filter == nil {
				return nil, fmt.Errorf("http filter uid '%s' not found", uid)
			}
			vs.Spec.AdditionalHttpFilters = append(vs.Spec.AdditionalHttpFilters, &v1alpha1.ResourceRef{
				Name:      filter.Name,
				Namespace: &filter.Namespace,
			})
		}
	}

	if req.Msg.UseRemoteAddress != nil {
		vs.Spec.UseRemoteAddress = req.Msg.UseRemoteAddress
	}

	tmpStore := store.New()
	if err := tmpStore.Fill(ctx, s.client); err != nil {
		return nil, err
	}
	if _, _, err := resbuilder.BuildResources(vs, tmpStore); err != nil {
		return nil, err
	}

	if err := s.client.Create(ctx, vs); err != nil {
		return nil, err
	}

	return connect.NewResponse(&v1.CreateVirtualServiceResponse{}), nil
}

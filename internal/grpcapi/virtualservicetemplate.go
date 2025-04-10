package grpcapi

import (
	"connectrpc.com/authn"
	"connectrpc.com/connect"
	"context"
	"encoding/json"
	"fmt"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1/virtual_service_templatev1connect"
	"k8s.io/apimachinery/pkg/runtime"
)

type VirtualServiceTemplateStore struct {
	store *store.Store
	virtual_service_templatev1connect.UnimplementedVirtualServiceTemplateStoreServiceHandler
}

func NewVirtualServiceTemplateStore(s *store.Store) *VirtualServiceTemplateStore {
	return &VirtualServiceTemplateStore{
		store: s,
	}
}

func (s *VirtualServiceTemplateStore) ListVirtualServiceTemplates(ctx context.Context, _ *connect.Request[v1.ListVirtualServiceTemplatesRequest]) (*connect.Response[v1.ListVirtualServiceTemplatesResponse], error) {
	m := s.store.MapVirtualServiceTemplates()
	list := make([]*v1.VirtualServiceTemplateListItem, 0, len(m))
	authorizer := getAuthorizerFromContext(ctx)
	for _, v := range m {
		item := &v1.VirtualServiceTemplateListItem{
			Uid:  string(v.UID),
			Name: v.Name,
		}
		isAllowed, err := authorizer.Authorize(domainGeneral, item.Name)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			continue
		}
		list = append(list, item)
	}
	return connect.NewResponse(&v1.ListVirtualServiceTemplatesResponse{Items: list}), nil
}

func (s *VirtualServiceTemplateStore) FillTemplate(ctx context.Context, req *connect.Request[v1.FillTemplateRequest]) (*connect.Response[v1.FillTemplateResponse], error) {
	authorizer := getAuthorizerFromContext(ctx)
	isAllowed, err := authorizer.Authorize(domainGeneral, "*")
	if err != nil {
		return nil, err
	}
	if !isAllowed {
		return nil, authn.Errorf("forbidden")
	}

	if req.Msg.TemplateUid == "" {
		return nil, fmt.Errorf("template uid is required")
	}
	template := s.store.GetVirtualServiceTemplateByUID(req.Msg.TemplateUid)
	if template == nil {
		return nil, fmt.Errorf("template not found")
	}
	vs := &v1alpha1.VirtualService{}
	vs.Spec.Template = &v1alpha1.ResourceRef{
		Name:      template.Name,
		Namespace: &template.Namespace,
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

	if err := vs.FillFromTemplate(template); err != nil {
		return nil, err
	}

	data, err := json.MarshalIndent(vs.Spec, "", "\t")
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(&v1.FillTemplateResponse{Raw: string(data)}), nil
}

package grpcapi

import (
	"connectrpc.com/connect"
	"context"
	"fmt"
	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/helpers"
	"github.com/kaasops/envoy-xds-controller/internal/protoutil"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	"github.com/kaasops/envoy-xds-controller/internal/xds/resbuilder"
	commonv1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/common/v1"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1/virtual_servicev1connect"
	virtual_service_templatev1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VirtualServiceStore struct {
	store    *store.Store
	client   client.Client
	targetNs string
	virtual_servicev1connect.UnimplementedVirtualServiceStoreServiceHandler
}

func NewVirtualServiceStore(s *store.Store, c client.Client, targetNs string) *VirtualServiceStore {
	return &VirtualServiceStore{
		store:    s,
		client:   c,
		targetNs: targetNs,
	}
}

func (s *VirtualServiceStore) ListVirtualService(ctx context.Context, r *connect.Request[v1.ListVirtualServiceRequest]) (*connect.Response[v1.ListVirtualServiceResponse], error) {
	m := s.store.MapVirtualServices()
	list := make([]*v1.VirtualServiceListItem, 0, len(m))

	authorizer := getAuthorizerFromContext(ctx)

	for _, v := range m {
		isAllowed, err := authorizer.Authorize(v.GetAccessGroup(), v.Name)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			continue
		}

		if r.Msg.AccessGroup != "" && r.Msg.AccessGroup != v.GetAccessGroup() {
			continue
		}
		vs := &v1.VirtualServiceListItem{
			Uid:         string(v.UID),
			Name:        v.Name,
			NodeIds:     v.GetNodeIDs(),
			AccessGroup: v.GetAccessGroup(),
		}
		if v.Spec.Template != nil {
			template := s.store.GetVirtualServiceTemplate(helpers.NamespacedName{Namespace: v.Namespace, Name: v.Spec.Template.Name})
			vs.Template = &commonv1.ResourceRef{
				Uid:       string(template.UID),
				Name:      template.Name,
				Namespace: template.Namespace,
			}
		}
		vs.IsEditable = v.IsEditable()
		list = append(list, vs)
	}
	return connect.NewResponse(&v1.ListVirtualServiceResponse{Items: list}), nil
}

func (s *VirtualServiceStore) CreateVirtualService(ctx context.Context, req *connect.Request[v1.CreateVirtualServiceRequest]) (*connect.Response[v1.CreateVirtualServiceResponse], error) {
	if len(req.Msg.NodeIds) == 0 {
		return nil, fmt.Errorf("nodeIDs is required")
	}

	if req.Msg.AccessGroup == "" {
		return nil, fmt.Errorf("access group is required")
	}

	authorizer := getAuthorizerFromContext(ctx)
	isAllowed, err := authorizer.Authorize(req.Msg.AccessGroup, req.Msg.Name)
	if err != nil {
		return nil, err
	}
	if !isAllowed {
		return nil, fmt.Errorf("access group '%s' is not allowed to create virtual service '%s'", req.Msg.AccessGroup, req.Msg.Name)
	}

	vs := &v1alpha1.VirtualService{}
	vs.Name = req.Msg.Name
	vs.Labels = make(map[string]string)
	vs.SetEditable(true)
	vs.SetNodeIDs(req.Msg.NodeIds)
	vs.Namespace = s.targetNs
	vs.SetAccessGroup(req.Msg.AccessGroup)

	if req.Msg.TemplateUid != "" {
		vst := s.store.GetVirtualServiceTemplateByUID(req.Msg.TemplateUid)
		if vst == nil {
			return nil, fmt.Errorf("template uid '%s' not found", req.Msg.TemplateUid)
		}
		isAllowed, err = authorizer.AuthorizeCommonObjectWithAction(vst.Name, ActionListVirtualServiceTemplate)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			return nil, fmt.Errorf("template uid '%s' not found", req.Msg.TemplateUid)
		}
		vs.Spec.Template = &v1alpha1.ResourceRef{
			Name:      vst.Name,
			Namespace: &vst.Namespace,
		}
		if len(req.Msg.TemplateOptions) > 0 {
			tOpts := make([]v1alpha1.TemplateOpts, 0, len(req.Msg.TemplateOptions))
			for _, opt := range req.Msg.TemplateOptions {
				tOpts = append(tOpts, v1alpha1.TemplateOpts{
					Field:    opt.Field,
					Modifier: parseTemplateOptionModifier(opt.Modifier),
				})
			}
			vs.Spec.TemplateOptions = tOpts
		}
	}

	if req.Msg.ListenerUid != "" {
		listener := s.store.GetListenerByUID(req.Msg.ListenerUid)
		if listener == nil {
			return nil, fmt.Errorf("listener uid '%s' not found", req.Msg.ListenerUid)
		}
		isAllowed, err = authorizer.AuthorizeCommonObjectWithAction(listener.Name, ActionListListeners)
		if err != nil {
			return nil, err
		}
		if !isAllowed {
			return nil, fmt.Errorf("listener uid '%s' not found", req.Msg.ListenerUid)
		}
		vs.Spec.Listener = &v1alpha1.ResourceRef{
			Name:      listener.Name,
			Namespace: &listener.Namespace,
		}
	}

	if req.Msg.VirtualHost != nil {
		virtualHost := &routev3.VirtualHost{}
		virtualHost.Name = vs.Name + "-virtual-host"
		virtualHost.Domains = req.Msg.VirtualHost.Domains
		vhData, err := protoutil.Marshaler.Marshal(virtualHost)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal virtual host: %w", err)
		}
		vs.Spec.VirtualHost = &runtime.RawExtension{Raw: vhData}
	}

	if req.Msg.AccessLogConfig != nil {
		if alcUID := req.Msg.GetAccessLogConfigUid(); alcUID != "" {
			alc := s.store.GetAccessLogByUID(alcUID)
			if alc == nil {
				return nil, fmt.Errorf("access log config uid '%s' not found", alcUID)
			}
			isAllowed, err = authorizer.AuthorizeCommonObjectWithAction(alc.Name, ActionListAccessLogConfig)
			if err != nil {
				return nil, err
			}
			if !isAllowed {
				return nil, fmt.Errorf("access log uid '%s' not found", req.Msg.ListenerUid)
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
			isAllowed, err = authorizer.AuthorizeCommonObjectWithAction(route.Name, ActionListRoutes)
			if err != nil {
				return nil, err
			}
			if !isAllowed {
				return nil, fmt.Errorf("route uid '%s' not found", req.Msg.ListenerUid)
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
			isAllowed, err = authorizer.AuthorizeCommonObjectWithAction(filter.Name, ActionListListeners)
			if err != nil {
				return nil, err
			}
			if !isAllowed {
				return nil, fmt.Errorf("http filter uid '%s' not found", req.Msg.ListenerUid)
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

func (s *VirtualServiceStore) UpdateVirtualService(ctx context.Context, req *connect.Request[v1.UpdateVirtualServiceRequest]) (*connect.Response[v1.UpdateVirtualServiceResponse], error) {
	if req.Msg.Uid == "" {
		return nil, fmt.Errorf("uid is required")
	}
	vs := s.store.GetVirtualServiceByUID(req.Msg.Uid)
	if vs == nil {
		return nil, fmt.Errorf("virtual service uid '%s' not found", req.Msg.Uid)
	}
	if !vs.IsEditable() {
		return nil, fmt.Errorf("virtual service uid '%s' is not editable", req.Msg.Uid)
	}

	vs.SetEditable(true)
	vs.SetNodeIDs(req.Msg.NodeIds)
	vs.Namespace = s.targetNs

	if req.Msg.TemplateUid != "" {
		vst := s.store.GetVirtualServiceTemplateByUID(req.Msg.TemplateUid)
		if vst == nil {
			return nil, fmt.Errorf("template uid '%s' not found", req.Msg.TemplateUid)
		}
		vs.Spec.Template = &v1alpha1.ResourceRef{
			Name:      vst.Name,
			Namespace: &vst.Namespace,
		}
		if len(req.Msg.TemplateOptions) > 0 {
			tOpts := make([]v1alpha1.TemplateOpts, 0, len(req.Msg.TemplateOptions))
			for _, opt := range req.Msg.TemplateOptions {
				tOpts = append(tOpts, v1alpha1.TemplateOpts{
					Field:    opt.Field,
					Modifier: parseTemplateOptionModifier(opt.Modifier),
				})
			}
			vs.Spec.TemplateOptions = tOpts
		} else {
			vs.Spec.TemplateOptions = nil
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

	if req.Msg.VirtualHost != nil {
		virtualHost := &routev3.VirtualHost{}
		virtualHost.Name = vs.Name + "-virtual-host"
		virtualHost.Domains = req.Msg.VirtualHost.Domains
		vhData, err := protoutil.Marshaler.Marshal(virtualHost)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal virtual host: %w", err)
		}
		vs.Spec.VirtualHost = &runtime.RawExtension{Raw: vhData}
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
		vs.Spec.AdditionalRoutes = vs.Spec.AdditionalRoutes[:0]
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
	} else {
		vs.Spec.AdditionalRoutes = nil
	}

	if len(req.Msg.AdditionalHttpFilterUids) > 0 {
		vs.Spec.AdditionalHttpFilters = vs.Spec.AdditionalHttpFilters[:0]
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
	} else {
		vs.Spec.AdditionalHttpFilters = nil
	}

	if req.Msg.UseRemoteAddress != nil {
		vs.Spec.UseRemoteAddress = req.Msg.UseRemoteAddress
	}

	if _, _, err := resbuilder.BuildResources(vs, s.store); err != nil {
		return nil, err
	}

	if err := s.client.Update(ctx, vs); err != nil {
		return nil, err
	}
	return connect.NewResponse(&v1.UpdateVirtualServiceResponse{}), nil
}

func (s *VirtualServiceStore) DeleteVirtualService(ctx context.Context, req *connect.Request[v1.DeleteVirtualServiceRequest]) (*connect.Response[v1.DeleteVirtualServiceResponse], error) {
	if req.Msg.Uid == "" {
		return nil, fmt.Errorf("uid is required")
	}
	vs := s.store.GetVirtualServiceByUID(req.Msg.Uid)
	if vs == nil {
		return nil, fmt.Errorf("virtual service uid '%s' not found", req.Msg.Uid)
	}
	if !vs.IsEditable() {
		return nil, fmt.Errorf("virtual service uid '%s' is not editable", req.Msg.Uid)
	}
	if err := s.client.Delete(ctx, vs); err != nil {
		return nil, err
	}
	return connect.NewResponse(&v1.DeleteVirtualServiceResponse{}), nil
}

func (s *VirtualServiceStore) GetVirtualService(ctx context.Context, req *connect.Request[v1.GetVirtualServiceRequest]) (*connect.Response[v1.GetVirtualServiceResponse], error) {
	if req.Msg.Uid == "" {
		return nil, fmt.Errorf("uid is required")
	}
	vs := s.store.GetVirtualServiceByUID(req.Msg.Uid)
	if vs == nil {
		return nil, fmt.Errorf("virtual service uid '%s' not found", req.Msg.Uid)
	}
	resp := &v1.GetVirtualServiceResponse{
		Uid:         string(vs.UID),
		Name:        vs.Name,
		NodeIds:     vs.GetNodeIDs(),
		AccessGroup: vs.GetAccessGroup(),
		IsEditable:  vs.IsEditable(),
	}
	if vs.Spec.Template != nil {
		template := s.store.GetVirtualServiceTemplate(helpers.NamespacedName{Namespace: vs.Namespace, Name: vs.Spec.Template.Name})
		resp.Template = &commonv1.ResourceRef{
			Uid:       string(template.UID),
			Name:      template.Name,
			Namespace: template.Namespace,
		}
		if len(vs.Spec.TemplateOptions) > 0 {
			resp.TemplateOptions = make([]*virtual_service_templatev1.TemplateOption, 0, len(vs.Spec.TemplateOptions))
			for _, opt := range vs.Spec.TemplateOptions {
				resp.TemplateOptions = append(resp.TemplateOptions, &virtual_service_templatev1.TemplateOption{
					Field:    opt.Field,
					Modifier: parseModifierToTemplateOption(opt.Modifier),
				})
			}
		}
	}
	if vs.Spec.Listener != nil {
		listener := s.store.GetListener(helpers.NamespacedName{Namespace: vs.Namespace, Name: vs.Spec.Listener.Name})
		resp.Listener = &commonv1.ResourceRef{
			Uid:       string(listener.UID),
			Name:      listener.Name,
			Namespace: listener.Namespace,
		}
	}
	if vs.Spec.VirtualHost != nil {
		virtualHost := &routev3.VirtualHost{}
		err := protoutil.Unmarshaler.Unmarshal(vs.Spec.VirtualHost.Raw, virtualHost)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal virtual host: %w", err)
		}
		resp.VirtualHost = &v1.VirtualHost{Domains: virtualHost.Domains}
	}
	if vs.Spec.AccessLogConfig != nil {
		alc := s.store.GetAccessLog(helpers.NamespacedName{Namespace: vs.Namespace, Name: vs.Spec.AccessLogConfig.Name})
		resp.AccessLog = &v1.GetVirtualServiceResponse_AccessLogConfig{AccessLogConfig: &commonv1.ResourceRef{
			Uid:       string(alc.UID),
			Name:      alc.Name,
			Namespace: alc.Namespace,
		}}
	}
	if vs.Spec.AdditionalRoutes != nil {
		resp.AdditionalRoutes = make([]*commonv1.ResourceRef, 0, len(vs.Spec.AdditionalRoutes))
		for _, route := range vs.Spec.AdditionalRoutes {
			r := s.store.GetRoute(helpers.NamespacedName{Namespace: vs.Namespace, Name: route.Name})
			resp.AdditionalRoutes = append(resp.AdditionalRoutes, &commonv1.ResourceRef{
				Uid:       string(r.UID),
				Name:      r.Name,
				Namespace: r.Namespace,
			})
		}
	}
	if vs.Spec.AdditionalHttpFilters != nil {
		resp.AdditionalHttpFilters = make([]*commonv1.ResourceRef, 0, len(vs.Spec.AdditionalHttpFilters))
		for _, filter := range vs.Spec.AdditionalHttpFilters {
			f := s.store.GetHTTPFilter(helpers.NamespacedName{Namespace: vs.Namespace, Name: filter.Name})
			resp.AdditionalHttpFilters = append(resp.AdditionalHttpFilters, &commonv1.ResourceRef{
				Uid:       string(f.UID),
				Name:      f.Name,
				Namespace: f.Namespace,
			})
		}
	}
	if vs.Spec.UseRemoteAddress != nil {
		resp.UseRemoteAddress = vs.Spec.UseRemoteAddress
	}
	return connect.NewResponse(resp), nil
}

func parseTemplateOptionModifier(modifier virtual_service_templatev1.TemplateOptionModifier) v1alpha1.Modifier {
	switch modifier {
	case virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_MERGE:
		return v1alpha1.ModifierMerge
	case virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_REPLACE:
		return v1alpha1.ModifierReplace
	case virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_DELETE:
		return v1alpha1.ModifierDelete
	}
	return ""
}

func parseModifierToTemplateOption(modifier v1alpha1.Modifier) virtual_service_templatev1.TemplateOptionModifier {
	switch modifier {
	case v1alpha1.ModifierMerge:
		return virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_MERGE
	case v1alpha1.ModifierReplace:
		return virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_REPLACE
	case v1alpha1.ModifierDelete:
		return virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_DELETE
	}
	return virtual_service_templatev1.TemplateOptionModifier_TEMPLATE_OPTION_MODIFIER_UNSPECIFIED
}

package virtualservice

import (
	"connectrpc.com/connect"
	"context"
	"fmt"
	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/grpcapi"
	"github.com/kaasops/envoy-xds-controller/internal/protoutil"
	"github.com/kaasops/envoy-xds-controller/internal/xds/resbuilder"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

func (s *VirtualServiceStore) UpdateVirtualService(ctx context.Context, req *connect.Request[v1.UpdateVirtualServiceRequest]) (*connect.Response[v1.UpdateVirtualServiceResponse], error) {
	if err := s.validateUpdateVirtualServiceRequest(ctx, req); err != nil {
		return nil, err
	}
	vs := s.store.GetVirtualServiceByUID(req.Msg.Uid)
	if vs == nil {
		return nil, fmt.Errorf("virtual service uid '%s' not found", req.Msg.Uid)
	}
	if !vs.IsEditable() {
		return nil, fmt.Errorf("virtual service uid '%s' is not editable", req.Msg.Uid)
	}

	authorizer := grpcapi.GetAuthorizerFromContext(ctx)

	vs.SetEditable(true)
	vs.SetNodeIDs(req.Msg.NodeIds)
	vs.Namespace = s.targetNs

	if req.Msg.TemplateUid != "" {
		vst := s.store.GetVirtualServiceTemplateByUID(req.Msg.TemplateUid)
		if vst == nil {
			return nil, fmt.Errorf("template uid '%s' not found", req.Msg.TemplateUid)
		}
		isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(vs.GetAccessGroup(), vst.Name, grpcapi.ActionListVirtualServiceTemplates)
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
		} else {
			vs.Spec.TemplateOptions = nil
		}
	}

	if req.Msg.ListenerUid != "" {
		listener := s.store.GetListenerByUID(req.Msg.ListenerUid)
		if listener == nil {
			return nil, fmt.Errorf("listener uid '%s' not found", req.Msg.ListenerUid)
		}
		isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(vs.GetAccessGroup(), listener.Name, grpcapi.ActionListListeners)
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
			isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(vs.GetAccessGroup(), alc.Name, grpcapi.ActionListAccessLogConfigs)
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
		vs.Spec.AdditionalRoutes = vs.Spec.AdditionalRoutes[:0]
		for _, uid := range req.Msg.AdditionalRouteUids {
			route := s.store.GetRouteByUID(uid)
			if route == nil {
				return nil, fmt.Errorf("route uid '%s' not found", uid)
			}
			isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(vs.GetAccessGroup(), route.Name, grpcapi.ActionListRoutes)
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
			isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(vs.GetAccessGroup(), filter.Name, grpcapi.ActionListHTTPFilters)
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

func (s *VirtualServiceStore) validateUpdateVirtualServiceRequest(ctx context.Context, req *connect.Request[v1.UpdateVirtualServiceRequest]) error {
	if req == nil || req.Msg == nil {
		return fmt.Errorf("request or message cannot be nil")
	}
	if req.Msg.Uid == "" {
		return fmt.Errorf("uid is required")
	}
	return nil
}

package virtualservice

import (
	"context"
	"fmt"

	virtual_service_templatev1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1"

	"connectrpc.com/connect"
	routev3 "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/grpcapi"
	"github.com/kaasops/envoy-xds-controller/internal/protoutil"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	"github.com/kaasops/envoy-xds-controller/internal/xds/resbuilder"
	v1 "github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

func (s *VirtualServiceStore) CreateVirtualService(
	ctx context.Context,
	req *connect.Request[v1.CreateVirtualServiceRequest],
) (*connect.Response[v1.CreateVirtualServiceResponse], error) {
	if err := s.validateCreateVirtualServiceRequest(req); err != nil {
		return nil, err
	}

	authorizer := grpcapi.GetAuthorizerFromContext(ctx)
	isAllowed, err := s.authorizeAccessGroup(authorizer, req.Msg.AccessGroup, req.Msg.Name)
	if err != nil {
		return nil, err
	}
	if !isAllowed {
		return nil, fmt.Errorf("access group '%s' is not allowed to create virtual service '%s'", req.Msg.AccessGroup, req.Msg.Name)
	}

	accessGroup := req.Msg.AccessGroup

	vs := s.initializeVirtualService(req)
	if err := s.processTemplate(
		ctx,
		accessGroup,
		req.Msg.TemplateUid,
		req.Msg.TemplateOptions,
		vs,
		authorizer,
	); err != nil {
		return nil, err
	}
	if err := s.processListener(ctx, accessGroup, req.Msg.ListenerUid, vs, authorizer); err != nil {
		return nil, err
	}
	if err := s.processVirtualHost(req.Msg.VirtualHost, vs); err != nil {
		return nil, err
	}
	if err := s.processAccessLogConfig(ctx, accessGroup, req.Msg.GetAccessLogConfigUid(), vs, authorizer); err != nil {
		return nil, err
	}
	if err := s.processAdditionalRoutes(ctx, accessGroup, req.Msg.AdditionalRouteUids, vs, authorizer); err != nil {
		return nil, err
	}
	if err := s.processAdditionalHTTPFilters(ctx, accessGroup, req.Msg.AdditionalHttpFilterUids, vs, authorizer); err != nil {
		return nil, err
	}

	vs.Spec.UseRemoteAddress = req.Msg.UseRemoteAddress

	if err := s.buildAndCreateVirtualService(ctx, vs); err != nil {
		return nil, err
	}

	return connect.NewResponse(&v1.CreateVirtualServiceResponse{}), nil
}

func (s *VirtualServiceStore) authorizeAccessGroup(
	authorizer grpcapi.IAuthorizer,
	accessGroup, serviceName string,
) (bool, error) {
	return authorizer.Authorize(accessGroup, serviceName)
}

func (s *VirtualServiceStore) initializeVirtualService(req *connect.Request[v1.CreateVirtualServiceRequest]) *v1alpha1.VirtualService {
	vs := &v1alpha1.VirtualService{}
	vs.Name = req.Msg.AccessGroup + "-" + req.Msg.Name
	vs.SetEditable(true)
	vs.SetLabelName(req.Msg.Name)
	vs.SetNamespace(req.Msg.Name)
	vs.SetAccessGroup(req.Msg.AccessGroup)
	vs.SetNodeIDs(req.Msg.NodeIds)
	vs.Namespace = s.targetNs
	return vs
}
func (s *VirtualServiceStore) processTemplate(
	_ context.Context,
	accessGroup string,
	templateUID string,
	templateOpts []*virtual_service_templatev1.TemplateOption,
	vs *v1alpha1.VirtualService,
	authorizer grpcapi.IAuthorizer,
) error {
	vst := s.store.GetVirtualServiceTemplateByUID(templateUID)
	if vst == nil {
		return fmt.Errorf("template uid '%s' not found", templateUID)
	}

	isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(accessGroup, vst.Name, grpcapi.ActionListVirtualServiceTemplates)
	if err != nil {
		return err
	}
	if !isAllowed {
		return fmt.Errorf("template uid '%s' not allowed", templateUID)
	}

	vs.Spec.Template = &v1alpha1.ResourceRef{
		Name:      vst.Name,
		Namespace: &vst.Namespace,
	}

	if len(templateOpts) > 0 {
		tOpts := make([]v1alpha1.TemplateOpts, 0, len(templateOpts))
		for _, opt := range templateOpts {
			tOpts = append(tOpts, v1alpha1.TemplateOpts{
				Field:    opt.Field,
				Modifier: parseTemplateOptionModifier(opt.Modifier),
			})
		}
		vs.Spec.TemplateOptions = tOpts
	}
	return nil
}
func (s *VirtualServiceStore) processListener(
	_ context.Context,
	accessGroup string,
	listenerUID string,
	vs *v1alpha1.VirtualService,
	authorizer grpcapi.IAuthorizer,
) error {
	if listenerUID == "" {
		return nil
	}

	listener := s.store.GetListenerByUID(listenerUID)
	if listener == nil {
		return fmt.Errorf("listener uid '%s' not found", listenerUID)
	}

	isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(accessGroup, listener.Name, grpcapi.ActionListListeners)
	if err != nil {
		return err
	}
	if !isAllowed {
		return fmt.Errorf("listener '%s' not allowed", listenerUID)
	}

	vs.Spec.Listener = &v1alpha1.ResourceRef{
		Name:      listener.Name,
		Namespace: &listener.Namespace,
	}
	return nil
}

func (s *VirtualServiceStore) processVirtualHost(
	vh *v1.VirtualHost,
	vs *v1alpha1.VirtualService,
) error {
	if vh == nil {
		return nil
	}

	virtualHost := &routev3.VirtualHost{
		Name:    vs.Name + "-virtual-host",
		Domains: vh.Domains,
	}

	vhData, err := protoutil.Marshaler.Marshal(virtualHost)
	if err != nil {
		return fmt.Errorf("failed to marshal virtual host: %w", err)
	}

	vs.Spec.VirtualHost = &runtime.RawExtension{Raw: vhData}
	return nil
}

func (s *VirtualServiceStore) processAccessLogConfig(
	_ context.Context,
	accessGroup string,
	alcUID string,
	vs *v1alpha1.VirtualService,
	authorizer grpcapi.IAuthorizer,
) error {
	if alcUID == "" {
		return nil
	}

	alc := s.store.GetAccessLogByUID(alcUID)
	if alc == nil {
		return fmt.Errorf("access log config uid '%s' not found", alcUID)
	}

	isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(accessGroup, alc.Name, grpcapi.ActionListAccessLogConfigs)
	if err != nil {
		return err
	}
	if !isAllowed {
		return fmt.Errorf("access log config '%s' not allowed", alcUID)
	}

	vs.Spec.AccessLogConfig = &v1alpha1.ResourceRef{
		Name:      alc.Name,
		Namespace: &alc.Namespace,
	}
	return nil
}

func (s *VirtualServiceStore) processAdditionalRoutes(
	_ context.Context,
	accessGroup string,
	additionalRouteUIDs []string,
	vs *v1alpha1.VirtualService,
	authorizer grpcapi.IAuthorizer,
) error {
	for _, uid := range additionalRouteUIDs {
		route := s.store.GetRouteByUID(uid)
		if route == nil {
			return fmt.Errorf("route uid '%s' not found", uid)
		}

		isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(accessGroup, route.Name, grpcapi.ActionListRoutes)
		if err != nil {
			return err
		}
		if !isAllowed {
			return fmt.Errorf("route '%s' not allowed", uid)
		}

		vs.Spec.AdditionalRoutes = append(vs.Spec.AdditionalRoutes, &v1alpha1.ResourceRef{
			Name:      route.Name,
			Namespace: &route.Namespace,
		})
	}
	return nil
}

func (s *VirtualServiceStore) buildAndCreateVirtualService(
	ctx context.Context,
	vs *v1alpha1.VirtualService,
) error {
	tmpStore := store.New()
	if err := tmpStore.Fill(ctx, s.client); err != nil {
		return err
	}

	if _, _, err := resbuilder.BuildResources(vs, tmpStore); err != nil {
		return err
	}

	return s.client.Create(ctx, vs)
}

func (s *VirtualServiceStore) processAdditionalHTTPFilters(
	_ context.Context,
	accessGroup string,
	additionalHttpFilterUIDs []string,
	vs *v1alpha1.VirtualService,
	authorizer grpcapi.IAuthorizer,
) error {
	for _, uid := range additionalHttpFilterUIDs {
		filter := s.store.GetHTTPFilterByUID(uid)
		if filter == nil {
			return fmt.Errorf("http filter uid '%s' not found", uid)
		}

		isAllowed, err := authorizer.AuthorizeCommonObjectWithAction(accessGroup, filter.Name, grpcapi.ActionListHTTPFilters)
		if err != nil {
			return err
		}

		if !isAllowed {
			return fmt.Errorf("http filter '%s' is not allowed", uid)
		}

		vs.Spec.AdditionalHttpFilters = append(vs.Spec.AdditionalHttpFilters, &v1alpha1.ResourceRef{
			Name:      filter.Name,
			Namespace: &filter.Namespace,
		})
	}
	return nil
}

func (s *VirtualServiceStore) validateCreateVirtualServiceRequest(req *connect.Request[v1.CreateVirtualServiceRequest]) error {
	if req == nil || req.Msg == nil {
		return fmt.Errorf("request or message cannot be nil")
	}
	if len(req.Msg.NodeIds) == 0 {
		return fmt.Errorf("nodeIDs is required")
	}
	if req.Msg.AccessGroup == "" {
		return fmt.Errorf("access group is required")
	}
	if req.Msg.AccessGroup == grpcapi.DomainGeneral {
		return fmt.Errorf("forbidden to create virtual service in group '-'")
	}
	if req.Msg.TemplateUid == "" {
		return fmt.Errorf("template uid is required")
	}
	return nil
}

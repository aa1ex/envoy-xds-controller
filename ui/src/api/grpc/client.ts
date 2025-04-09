import { createConnectTransport } from '@connectrpc/connect-web'
import { env } from '../../env.ts'
import { createClient, Interceptor } from '@connectrpc/connect'
import { VirtualServiceStoreService } from '../../gen/virtual_service/v1/virtual_service_pb'
import { VirtualServiceTemplateStoreService } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { ListenerStoreService } from '../../gen/listener/v1/listener_pb.ts'
import { AccessLogConfigStoreService } from '../../gen/access_log_config/v1/access_log_config_pb.ts'
import { HTTPFilterStoreService } from '../../gen/http_filter/v1/http_filter_pb.ts'
import { RouteStoreService } from '../../gen/route/v1/route_pb.ts'
import { AccessGroupStoreService } from '../../gen/access_group/v1/access_group_pb.ts'
import { NodeStoreService } from '../../gen/node/v1/node_pb.ts'

const authInterceptor: Interceptor = next => async req => {
	const sessionData = sessionStorage.getItem(`oidc.user:${env.VITE_OIDC_AUTHORITY}:envoy-xds-controller`)
	let accessToken

	if (sessionData) {
		try {
			const parsed = JSON.parse(sessionData)
			accessToken = parsed.access_token
		} catch (e) {
			console.error('Failed to parse token:', e)
		}
	}

	if (accessToken) {
		req.header.set('Authorization', `Bearer ${accessToken}`)
	}

	return next(req)
}

export const transport = createConnectTransport({
	baseUrl: env.VITE_GRPC_API_URL || '/grpc-api',
	interceptors: [authInterceptor]
})

export const virtualServiceClient = createClient(VirtualServiceStoreService, transport)

export const templateServiceClient = createClient(VirtualServiceTemplateStoreService, transport)

export const listenerServiceClient = createClient(ListenerStoreService, transport)

export const accessLogServiceClient = createClient(AccessLogConfigStoreService, transport)

export const httpFilterServiceClient = createClient(HTTPFilterStoreService, transport)

export const routeServiceClient = createClient(RouteStoreService, transport)

export const accessGroupsServiceClient = createClient(AccessGroupStoreService, transport)

export const nodeServiceClient = createClient(NodeStoreService, transport)

import { createConnectTransport } from '@connectrpc/connect-web'
import { env } from '../../env.ts'
import { createClient } from '@connectrpc/connect'
import { VirtualServiceStoreService } from '../../gen/virtual_service/v1/virtual_service_pb'
import { VirtualServiceTemplateStoreService } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { ListenerStoreService } from '../../gen/listener/v1/listener_pb.ts'
import { AccessLogConfigStoreService } from '../../gen/access_log_config/v1/access_log_config_pb.ts'

export const transport = createConnectTransport({
	baseUrl: env.VITE_GRPC_API_URL || '/grpc-api'
})

export const virtualServiceClient = createClient(VirtualServiceStoreService, transport)

export const templateServiceClient = createClient(VirtualServiceTemplateStoreService, transport)

export const listenerServiceClient = createClient(ListenerStoreService, transport)

export const accessLogServiceClient = createClient(AccessLogConfigStoreService, transport)

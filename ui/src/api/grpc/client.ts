import { createConnectTransport } from '@connectrpc/connect-web'
import { env } from '../../env.ts'
import { createClient } from '@connectrpc/connect'
import { VirtualServiceStoreService } from '../../gen/virtual_service/v1/virtual_service_pb'

export const transport = createConnectTransport({
	baseUrl: env.VITE_GRPC_API_URL || '/grpc-api'
})

export const virtualServiceClient = createClient(VirtualServiceStoreService, transport)

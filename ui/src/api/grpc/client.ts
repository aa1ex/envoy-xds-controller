import { createClient } from '@connectrpc/connect'
import { createConnectTransport } from '@connectrpc/connect-web'

import { VirtualServiceStoreService } from '../../gen/virtual_service/v1/virtual_service_pb.ts'
import { env } from '../../env.ts'

export const transport = createConnectTransport({
	baseUrl: env.VITE_GRPC_API_URL || '/grpc-api'
})

const virtualServiceClient = createClient(VirtualServiceStoreService, transport)

export default {
	virtualServiceClient
}

import { useQuery } from '@connectrpc/connect-query'
import { listVirtualService } from '../../gen/virtual_service/v1/virtual_service-VirtualServiceStoreService_connectquery.ts'

function KuberPage() {
	const { data } = useQuery(listVirtualService, {})
	console.log(data)

	return <div>KuberPage</div>
}

export default KuberPage

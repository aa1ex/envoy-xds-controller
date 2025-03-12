import client from '../../api/grpc/client'

function KuberPage() {
	;(async function () {
      const list = await client.virtualServiceClient.listVirtualService({})
      console.log(list)
    })()
	return <div>KuberPage</div>
}

export default KuberPage
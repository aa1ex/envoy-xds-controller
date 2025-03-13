// import { useQuery } from '@connectrpc/connect-query'
import { useQuery } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'

// export const useGetVirtualServices = () => {
// 	return useQuery(listVirtualService, {})
// }

export const useGetVirtualServices = () => {
	return useQuery({
		queryKey: ['virtualServices'],
		queryFn: () => virtualServiceClient.listVirtualService({})
	})
}

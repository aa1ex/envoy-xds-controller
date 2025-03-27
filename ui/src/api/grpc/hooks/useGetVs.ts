// import { useQuery } from '@connectrpc/connect-query'
import { useQuery } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'

// export const useGetVs = () => {
// 	return useQuery(listVirtualService, {})
// }

export const useGetVs = () => {
	return useQuery({
		queryKey: ['virtualServices'],
		queryFn: () => virtualServiceClient.listVirtualService({})
	})
}

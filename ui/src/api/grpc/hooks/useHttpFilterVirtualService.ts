import { useQuery } from '@tanstack/react-query'
import { httpFilterServiceClient } from '../client.ts'

export const useHttpFilterVirtualService = () => {
	return useQuery({
		queryKey: ['httpFilterVirtualService'],
		queryFn: () => httpFilterServiceClient.listHTTPFilter({})
	})
}

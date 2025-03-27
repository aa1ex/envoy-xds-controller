import { useQuery } from '@tanstack/react-query'
import { httpFilterServiceClient } from '../client.ts'

export const useHttpFilterVs = () => {
	return useQuery({
		queryKey: ['httpFilterVs'],
		queryFn: () => httpFilterServiceClient.listHTTPFilter({})
	})
}

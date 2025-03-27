import { useQuery } from '@tanstack/react-query'
import { routeServiceClient } from '../client.ts'

export const useRouteVs = () => {
	return useQuery({
		queryKey: ['routeVs'],
		queryFn: () => routeServiceClient.listRoute({})
	})
}

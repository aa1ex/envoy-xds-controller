import { useQuery } from '@tanstack/react-query'
import { routeServiceClient } from '../client.ts'

export const useRouteVirtualService = () => {
	return useQuery({
		queryKey: ['routeVirtualService'],
		queryFn: () => routeServiceClient.listRoute({})
	})
}

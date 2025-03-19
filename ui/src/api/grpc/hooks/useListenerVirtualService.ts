import { useQuery } from '@tanstack/react-query'
import { listenerServiceClient } from '../client.ts'

export const useListenerVirtualService = () => {
	return useQuery({
		queryKey: ['listenerVirtualService'],
		queryFn: () => listenerServiceClient.listListener({})
	})
}

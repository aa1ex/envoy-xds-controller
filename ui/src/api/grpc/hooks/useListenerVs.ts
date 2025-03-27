import { useQuery } from '@tanstack/react-query'
import { listenerServiceClient } from '../client.ts'

export const useListenerVs = () => {
	return useQuery({
		queryKey: ['listenerVs'],
		queryFn: () => listenerServiceClient.listListener({})
	})
}

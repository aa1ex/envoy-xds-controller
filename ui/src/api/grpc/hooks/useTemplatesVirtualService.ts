import { useQuery } from '@tanstack/react-query'
import { templateServiceClient } from '../client.ts'

export const useTemplatesVirtualService = () => {
	return useQuery({
		queryKey: ['templatesVirtualService'],
		queryFn: () => templateServiceClient.listVirtualServiceTemplate({})
	})
}

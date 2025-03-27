import { useQuery } from '@tanstack/react-query'
import { templateServiceClient } from '../client.ts'

export const useTemplatesVs = () => {
	return useQuery({
		queryKey: ['templatesVs'],
		queryFn: () => templateServiceClient.listVirtualServiceTemplate({})
	})
}

import { useMutation } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'

export const useCreateVirtualService = () => {
	const createVirtualServiceMutation = useMutation({
		mutationKey: ['createVirtualService'],
		mutationFn: (virtualServiceCreateData: any) =>
			virtualServiceClient.createVirtualService(virtualServiceCreateData)
	})

	return {
		createVirtualService: createVirtualServiceMutation.mutateAsync
	}
}

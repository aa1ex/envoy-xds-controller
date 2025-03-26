import { useMutation } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'
import { CreateVirtualServiceRequest } from '../../../gen/virtual_service/v1/virtual_service_pb.ts'

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

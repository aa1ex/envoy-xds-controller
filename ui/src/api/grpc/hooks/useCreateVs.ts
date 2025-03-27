import { useMutation } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'
import { CreateVirtualServiceRequest } from '../../../gen/virtual_service/v1/virtual_service_pb.ts'

export const useCreateVs = () => {
	const createVirtualServiceMutation = useMutation({
		mutationKey: ['createVs'],
		mutationFn: (virtualServiceCreateData: CreateVirtualServiceRequest) =>
			virtualServiceClient.createVirtualService(virtualServiceCreateData)
	})

	return {
		createVirtualService: createVirtualServiceMutation.mutateAsync
	}
}

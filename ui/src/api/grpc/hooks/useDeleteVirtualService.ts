import { useMutation } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'

export const useDeleteVirtualService = () => {
	const deleteVirtualServiceMutation = useMutation({
		mutationKey: ['deleteVirtualService'],
		mutationFn: (uid: string) => virtualServiceClient.deleteVirtualService({ uid })
	})

	return {
		deleteVirtualService: deleteVirtualServiceMutation.mutateAsync
	}
}

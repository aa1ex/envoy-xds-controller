import { useMutation } from '@tanstack/react-query'
import { virtualServiceClient } from '../client.ts'

export const useDeleteVs = () => {
	const deleteVirtualServiceMutation = useMutation({
		mutationKey: ['deleteVs'],
		mutationFn: (uid: string) => virtualServiceClient.deleteVirtualService({ uid })
	})

	return {
		deleteVirtualService: deleteVirtualServiceMutation.mutateAsync
	}
}

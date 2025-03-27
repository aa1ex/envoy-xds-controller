import { useQuery } from '@tanstack/react-query'
import { accessGroupsClient } from '../client.ts'

export const useAccessGroupsVs = () => {
	return useQuery({
		queryKey: ['accessGroupsVs'],
		queryFn: () => accessGroupsClient.listAccessGroup({})
	})
}

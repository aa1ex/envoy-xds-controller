import { useQuery } from '@tanstack/react-query'
import { accessLogServiceClient } from '../client.ts'

export const useAccessLogsVirtualService = () => {
	return useQuery({
		queryKey: ['accessLogsVirtualService'],
		queryFn: () => accessLogServiceClient.listAccessLogConfig({})
	})
}

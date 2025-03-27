import { useQuery } from '@tanstack/react-query'
import { accessLogServiceClient } from '../client.ts'

export const useAccessLogsVs = () => {
	return useQuery({
		queryKey: ['accessLogsVs'],
		queryFn: () => accessLogServiceClient.listAccessLogConfig({})
	})
}

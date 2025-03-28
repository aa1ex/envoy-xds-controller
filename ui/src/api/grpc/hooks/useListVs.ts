import { useMutation, useQuery } from '@tanstack/react-query'
import {
	accessGroupsClient,
	accessLogServiceClient,
	httpFilterServiceClient,
	listenerServiceClient,
	routeServiceClient,
	templateServiceClient,
	virtualServiceClient
} from '../client.ts'
import { CreateVirtualServiceRequest } from '../../../gen/virtual_service/v1/virtual_service_pb.ts'

export const useListVs = () => {
	return useQuery({
		queryKey: ['listVs'],
		queryFn: () => virtualServiceClient.listVirtualService({})
	})
}

export const useGetVs = (uid: string) => {
	return useQuery({
		queryKey: ['getVs', uid],
		queryFn: () => virtualServiceClient.getVirtualService({ uid })
	})
}

export const useAccessGroupsVs = () => {
	return useQuery({
		queryKey: ['accessGroupsVs'],
		queryFn: () => accessGroupsClient.listAccessGroup({})
	})
}

export const useAccessLogsVs = () => {
	return useQuery({
		queryKey: ['accessLogsVs'],
		queryFn: () => accessLogServiceClient.listAccessLogConfig({})
	})
}

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

export const useDeleteVs = () => {
	const deleteVirtualServiceMutation = useMutation({
		mutationKey: ['deleteVs'],
		mutationFn: (uid: string) => virtualServiceClient.deleteVirtualService({ uid })
	})

	return {
		deleteVirtualService: deleteVirtualServiceMutation.mutateAsync
	}
}

export const useHttpFilterVs = () => {
	return useQuery({
		queryKey: ['httpFilterVs'],
		queryFn: () => httpFilterServiceClient.listHTTPFilter({})
	})
}

export const useListenerVs = () => {
	return useQuery({
		queryKey: ['listenerVs'],
		queryFn: () => listenerServiceClient.listListener({})
	})
}

export const useRouteVs = () => {
	return useQuery({
		queryKey: ['routeVs'],
		queryFn: () => routeServiceClient.listRoute({})
	})
}

export const useTemplatesVs = () => {
	return useQuery({
		queryKey: ['templatesVs'],
		queryFn: () => templateServiceClient.listVirtualServiceTemplate({})
	})
}

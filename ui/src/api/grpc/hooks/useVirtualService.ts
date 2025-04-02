import { useMutation, useQuery } from '@tanstack/react-query'
import {
	accessGroupsServiceClient,
	accessLogServiceClient,
	httpFilterServiceClient,
	listenerServiceClient,
	nodeServiceClient,
	routeServiceClient,
	templateServiceClient,
	virtualServiceClient
} from '../client.ts'
import {
	CreateVirtualServiceRequest,
	UpdateVirtualServiceRequest
} from '../../../gen/virtual_service/v1/virtual_service_pb.ts'

export const useListVs = (flag: boolean) => {
	return useQuery({
		queryKey: ['listVs'],
		queryFn: () => virtualServiceClient.listVirtualService({}),
		enabled: flag
	})
}

export const useGetVs = (uid: string) => {
	return useQuery({
		queryKey: ['getVs', uid],
		queryFn: () => virtualServiceClient.getVirtualService({ uid }),
		gcTime: 0
	})
}

export const useCreateVs = () => {
	const createVirtualServiceMutation = useMutation({
		mutationKey: ['createVs'],
		mutationFn: (vsCreateData: CreateVirtualServiceRequest) =>
			virtualServiceClient.createVirtualService(vsCreateData)
	})

	return {
		createVirtualService: createVirtualServiceMutation.mutateAsync,
		errorCreateVs: createVirtualServiceMutation.error,
		isFetchingCreateVs: createVirtualServiceMutation.isPending
	}
}

export const useUpdateVs = () => {
	const updateVsMutations = useMutation({
		mutationKey: ['update'],
		mutationFn: (vsUpdateData: UpdateVirtualServiceRequest) =>
			virtualServiceClient.updateVirtualService(vsUpdateData)
	})

	return {
		updateVS: updateVsMutations.mutateAsync,
		errorUpdateVs: updateVsMutations.error,
		isFetchingUpdateVs: updateVsMutations.isPending
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

export const useAccessGroupsVs = () => {
	return useQuery({
		queryKey: ['accessGroupsVs'],
		queryFn: () => accessGroupsServiceClient.listAccessGroup({})
	})
}

export const useAccessLogsVs = () => {
	return useQuery({
		queryKey: ['accessLogsVs'],
		queryFn: () => accessLogServiceClient.listAccessLogConfig({})
	})
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

export const useNodeListVs = () => {
	return useQuery({
		queryKey: ['nodeListVs'],
		queryFn: () => nodeServiceClient.listNode({})
	})
}

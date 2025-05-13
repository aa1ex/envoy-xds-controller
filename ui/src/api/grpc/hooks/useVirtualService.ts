import { useMutation, useQuery } from '@tanstack/react-query'
import {
	accessGroupsServiceClient,
	accessLogServiceClient,
	httpFilterServiceClient,
	listenerServiceClient,
	nodeServiceClient,
	routeServiceClient,
	templateServiceClient,
	utilServiceClient,
	virtualServiceClient
} from '../client.ts'
import {
	CreateVirtualServiceRequest,
	UpdateVirtualServiceRequest
} from '../../../gen/virtual_service/v1/virtual_service_pb.ts'

const metadata = {
	headers: undefined
}

export const useListVs = (flag: boolean, accessGroup?: string) => {
	const safeAccessGroup = accessGroup ?? ''

	return useQuery({
		queryKey: ['listVs', safeAccessGroup],
		queryFn: () =>
			virtualServiceClient.listVirtualServices(
				{
					accessGroup: safeAccessGroup
				}
				// metadata
			),
		enabled: flag
	})
}

export const useGetVs = (uid: string) => {
	return useQuery({
		queryKey: ['getVs', uid],
		queryFn: () => virtualServiceClient.getVirtualService({ uid }, metadata),
		gcTime: 0
	})
}

export const useCreateVs = () => {
	const createVirtualServiceMutation = useMutation({
		mutationKey: ['createVs'],
		mutationFn: (vsCreateData: CreateVirtualServiceRequest) =>
			virtualServiceClient.createVirtualService(vsCreateData, metadata)
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
			virtualServiceClient.updateVirtualService(vsUpdateData, metadata)
	})

	return {
		updateVS: updateVsMutations.mutateAsync,
		successUpdateVs: updateVsMutations.isSuccess,
		errorUpdateVs: updateVsMutations.error,
		isFetchingUpdateVs: updateVsMutations.isPending,
		resetQueryUpdateVs: updateVsMutations.reset
	}
}

export const useDeleteVs = () => {
	const deleteVirtualServiceMutation = useMutation({
		mutationKey: ['deleteVs'],
		mutationFn: (uid: string) => virtualServiceClient.deleteVirtualService({ uid }, metadata)
	})

	return {
		deleteVirtualService: deleteVirtualServiceMutation.mutateAsync
	}
}

export const useAccessGroupsVs = () => {
	return useQuery({
		queryKey: ['accessGroupsVs'],
		queryFn: () =>
			accessGroupsServiceClient.listAccessGroups(
				{}
				// metadata
			)
	})
}

export const useAccessLogsVs = (accessGroup?: string) => {
	return useQuery({
		queryKey: ['accessLogsVs'],
		queryFn: () => accessLogServiceClient.listAccessLogConfigs({ accessGroup: accessGroup || '' }, metadata)
	})
}

export const useHttpFilterVs = (accessGroup?: string) => {
	return useQuery({
		queryKey: ['httpFilterVs'],
		queryFn: () => httpFilterServiceClient.listHTTPFilters({ accessGroup: accessGroup || '' }, metadata)
	})
}

export const useListenerVs = (accessGroup?: string) => {
	return useQuery({
		queryKey: ['listenerVs'],
		queryFn: () => listenerServiceClient.listListeners({ accessGroup: accessGroup || '' }, metadata)
	})
}

export const useRouteVs = (accessGroup?: string) => {
	return useQuery({
		queryKey: ['routeVs'],
		queryFn: () => routeServiceClient.listRoutes({ accessGroup: accessGroup || '' }, metadata)
	})
}

export const useTemplatesVs = (accessGroup?: string) => {
	return useQuery({
		queryKey: ['templatesVs'],
		queryFn: () => templateServiceClient.listVirtualServiceTemplates({ accessGroup: accessGroup || '' }, metadata)
	})
}

export const useNodeListVs = (accessGroup?: string) => {
	return useQuery({
		queryKey: ['nodeListVs'],
		queryFn: () => nodeServiceClient.listNodes({ accessGroup: accessGroup || '' }, metadata)
	})
}

export const useVerifyDomains = (domains: string[]) => {
	return useQuery({
		queryKey: ['verifyDomains', domains],
		queryFn: () => utilServiceClient.verifyDomains({ domains: domains }),
		select: data => data,
		enabled: !!domains
	})
}

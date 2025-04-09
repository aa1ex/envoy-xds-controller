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

const metadata = {
	headers: undefined
}

export function setAuthToken(token: string | undefined) {
	if (!token) {
		return
	}
	const headers = new Headers()
	headers.set('Authorization', 'Bearer ' + token)
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	metadata.headers = headers
}

export const useListVs = (flag: boolean, accessGroup?: string) => {
	const safeAccessGroup = accessGroup ?? ''

	return useQuery({
		queryKey: ['listVs', safeAccessGroup],
		queryFn: () =>
			virtualServiceClient.listVirtualService(
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
			accessGroupsServiceClient.listAccessGroup(
				{}
				// metadata
			)
	})
}

export const useAccessLogsVs = () => {
	return useQuery({
		queryKey: ['accessLogsVs'],
		queryFn: () => accessLogServiceClient.listAccessLogConfig({}, metadata)
	})
}

export const useHttpFilterVs = () => {
	return useQuery({
		queryKey: ['httpFilterVs'],
		queryFn: () => httpFilterServiceClient.listHTTPFilter({}, metadata)
	})
}

export const useListenerVs = () => {
	return useQuery({
		queryKey: ['listenerVs'],
		queryFn: () => listenerServiceClient.listListener({}, metadata)
	})
}

export const useRouteVs = () => {
	return useQuery({
		queryKey: ['routeVs'],
		queryFn: () => routeServiceClient.listRoute({}, metadata)
	})
}

export const useTemplatesVs = () => {
	return useQuery({
		queryKey: ['templatesVs'],
		queryFn: () => templateServiceClient.listVirtualServiceTemplate({}, metadata)
	})
}

export const useNodeListVs = () => {
	return useQuery({
		queryKey: ['nodeListVs'],
		queryFn: () => nodeServiceClient.listNode({}, metadata)
	})
}

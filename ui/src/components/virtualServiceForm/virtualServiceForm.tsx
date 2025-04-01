import React, { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import { TextFieldFormVs } from '../textFieldFormVs/textFieldFormVs.tsx'
import { MultiChipFormVS } from '../multiChipFormVS/multiChipFormVS.tsx'
import { SelectFormVs } from '../selectFormVs/selectFormVs.tsx'
import { RemoteAddrFormVs } from '../remoteAddrFormVS/remoteAddrFormVS.tsx'
import { TemplateOptionsFormVs } from '../templateOptionsFormVs/templateOptionsFormVs.tsx'
import {
	CreateVirtualServiceRequest,
	UpdateVirtualServiceRequest
} from '../../gen/virtual_service/v1/virtual_service_pb'
import { ResourceRef } from '../../gen/common/v1/common_pb.ts'

import {
	useAccessGroupsVs,
	useAccessLogsVs,
	useCreateVs,
	useHttpFilterVs,
	useListenerVs,
	useListVs,
	useRouteVs,
	useTemplatesVs,
	useUpdateVs
} from '../../api/grpc/hooks/useVirtualService.ts'
import { DNdSelectFormVs } from '../dNdSelectFormVs/dNdSelectFormVs.tsx'
import { useNavigate } from 'react-router-dom'
import { IVirtualServiceForm, IVirtualServiceFormProps } from './types.ts'

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = ({ virtualServiceInfo, isEdit }) => {
	const navigate = useNavigate()
	const { data: templates, isFetching: isFetchingTemplates, isError: isErrorTemplates } = useTemplatesVs()
	const { data: listeners, isFetching: isFetchingListeners, isError: isErrorListeners } = useListenerVs()
	const { data: accessLogs, isFetching: isFetchingAccessLogs, isError: isErrorAccessLogs } = useAccessLogsVs()
	const { data: httpFilters, isFetching: isFetchingHttpFilters, isError: isErrorHttpFilters } = useHttpFilterVs()
	const { data: accessGroups, isFetching: isFetchingAccessGroups, isError: isErrorAccessGroups } = useAccessGroupsVs()
	const { data: routes, isFetching: isFetchingRoutes, isError: isErrorRoutes } = useRouteVs()
	const { refetch } = useListVs(false)
	const { createVirtualService, isFetchingCreateVs } = useCreateVs()
	const { updateVS, isFetchingUpdateVs } = useUpdateVs()

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		control,
		setError,
		clearErrors,
		watch,
		getValues,
		reset
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			nodeIds: [],
			vhDomains: [],
			additionalHttpFilterUids: [],
			additionalRouteUids: [],
			useRemoteAddress: undefined,
			templateOptions: [{ field: '', modifier: 0 }]
		}
	})

	useEffect(() => {
		if (isEdit && virtualServiceInfo) {
			const vhDomains =
				virtualServiceInfo?.virtualHost && virtualServiceInfo.virtualHost.length > 0
					? JSON.parse(new TextDecoder().decode(virtualServiceInfo.virtualHost)).domains
					: []

			reset({
				name: virtualServiceInfo.name,
				nodeIds: virtualServiceInfo.nodeIds || [],
				accessGroup: virtualServiceInfo.accessGroup,
				templateUid: virtualServiceInfo.template?.uid,
				listenerUid: virtualServiceInfo.listener?.uid,
				accessLogConfigUid: (virtualServiceInfo.accessLog?.value as ResourceRef)?.uid || '',
				useRemoteAddress: virtualServiceInfo.useRemoteAddress,
				templateOptions: virtualServiceInfo.templateOptions,
				vhDomains,
				additionalHttpFilterUids: virtualServiceInfo.additionalHttpFilters?.map(filter => filter.uid) || [],
				additionalRouteUids: virtualServiceInfo.additionalRoutes?.map(router => router.uid) || []
			})
		}
	}, [isEdit, virtualServiceInfo, reset])

	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		const formValues = {
			domains: data.vhDomains
		}
		const jsonString = JSON.stringify(formValues)
		const virtualHostUint8Array = new TextEncoder().encode(jsonString)

		const { vhDomains, ...result } = data

		const baseVSData = {
			...result,
			virtualHost: virtualHostUint8Array,
			templateOptions: result.templateOptions?.some(option => option.field !== '' || option.modifier !== 0)
				? result.templateOptions.map(option => ({
						...option,
						$typeName: 'virtual_service_template.v1.TemplateOption' as const
					}))
				: [],
			accessLogConfig: result.accessLogConfigUid
				? { case: 'accessLogConfigUid' as const, value: result.accessLogConfigUid }
				: { case: undefined }
		}

		if (!isEdit) {
			const createVSData: CreateVirtualServiceRequest = {
				...baseVSData,
				$typeName: 'virtual_service.v1.CreateVirtualServiceRequest' as const
			}

			console.log('data for create', createVSData)
			await createVirtualService(createVSData)
		}
		if (isEdit && virtualServiceInfo) {
			const { name, ...baseVSDataWithoutName } = baseVSData

			const updateVSData: UpdateVirtualServiceRequest = {
				...baseVSDataWithoutName,
				uid: virtualServiceInfo?.uid,
				$typeName: 'virtual_service.v1.UpdateVirtualServiceRequest' as const
			}

			console.log('data for Update', updateVSData)
			await updateVS(updateVSData)
		}
		navigate('/virtualServices')
		await refetch()
	}

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
				<Box
					display='flex'
					flexDirection='column'
					justifyContent='space-between'
					height='100%'
					gap={2}
					overflow='auto'
				>
					<Grid container spacing={3} sx={{ overflow: 'auto', p: 1 }}>
						<Grid size={{ xs: 4 }} display='flex' flexDirection='column' gap={2}>
							<TextFieldFormVs register={register} nameField='name' errors={errors} isDisabled={isEdit} />
							<MultiChipFormVS
								nameFields={'nodeIds'}
								errors={errors}
								setValue={setValue}
								control={control}
								clearErrors={clearErrors}
								setError={setError}
							/>
							<SelectFormVs
								nameField={'accessGroup'}
								data={accessGroups}
								control={control}
								errors={errors}
								isFetching={isFetchingAccessGroups}
								isErrorFetch={isErrorAccessGroups}
							/>
							<SelectFormVs
								nameField={'templateUid'}
								data={templates}
								control={control}
								errors={errors}
								isFetching={isFetchingTemplates}
								isErrorFetch={isErrorTemplates}
							/>
							<SelectFormVs
								nameField={'listenerUid'}
								data={listeners}
								control={control}
								errors={errors}
								isFetching={isFetchingListeners}
								isErrorFetch={isErrorListeners}
							/>
							<MultiChipFormVS
								nameFields={'vhDomains'}
								errors={errors}
								setValue={setValue}
								control={control}
								clearErrors={clearErrors}
								setError={setError}
							/>
							<SelectFormVs
								nameField={'accessLogConfigUid'}
								data={accessLogs}
								control={control}
								errors={errors}
								isErrorFetch={isErrorAccessLogs}
								isFetching={isFetchingAccessLogs}
							/>
							<DNdSelectFormVs
								nameField={'additionalHttpFilterUids'}
								data={httpFilters}
								control={control}
								setValue={setValue}
								watch={watch}
								errors={errors}
								isErrorFetch={isErrorHttpFilters}
								isFetching={isFetchingHttpFilters}
							/>
						</Grid>
						<Divider orientation='vertical' flexItem />

						<Grid size={{ xs: 4 }} display='flex' flexDirection='column' gap={2}>
							<DNdSelectFormVs
								nameField={'additionalRouteUids'}
								data={routes}
								control={control}
								setValue={setValue}
								watch={watch}
								errors={errors}
								isErrorFetch={isErrorRoutes}
								isFetching={isFetchingRoutes}
							/>
							<RemoteAddrFormVs
								nameField={'useRemoteAddress'}
								control={control}
								errors={errors}
								setError={setError}
								clearErrors={clearErrors}
								setValue={setValue}
							/>
							<TemplateOptionsFormVs
								register={register}
								control={control}
								errors={errors}
								getValues={getValues}
								clearErrors={clearErrors}
							/>
						</Grid>
						<Divider orientation='vertical' flexItem />
						<Grid size={{ xs: 4 }}>
							fragment for code
							{/*<TextFieldFormVs register={register} nameField='some' errors={errors} />*/}
						</Grid>
					</Grid>
					<Box display='flex' alignItems='center' justifyContent='center'>
						<Button variant='contained' type='submit' loading={isFetchingCreateVs || isFetchingUpdateVs}>
							{isEdit ? 'Update Virtual Service' : 'Create Virtual Service'}
						</Button>
					</Box>
				</Box>
			</form>
		</>
	)
}

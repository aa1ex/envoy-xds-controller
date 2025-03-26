import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Box, Button, Divider } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { TextFieldFormVs } from '../textFieldFormVs/textFieldFormVs.tsx'
import { useTemplatesVirtualService } from '../../api/grpc/hooks/useTemplatesVirtualService.ts'
import { useListenerVirtualService } from '../../api/grpc/hooks/useListenerVirtualService.ts'
import { VirtualHostVs } from '../virtualHostVS/virtualHostVS.tsx'
import { AutocompleteChipVs } from '../autocompleteChipVs/autocompleteChipVs.tsx'
import { useAccessLogsVirtualService } from '../../api/grpc/hooks/useAccessLogsVirtualService.ts'
import { SelectFormVs } from '../selectFormVs/selectFormVs.tsx'
import { useHttpFilterVirtualService } from '../../api/grpc/hooks/useHttpFilterVirtualService.ts'
import { useRouteVirtualService } from '../../api/grpc/hooks/useRouteVirtualService.ts'
import { DNdSelectFormVs } from '../dNdSelectFormVs/dNdSelectFormVs.tsx'
import { RemoteAddrFormVs } from '../remoteAddrFormVS/remoteAddrFormVS.tsx'
import { TemplateOptionsFormVs } from '../templateOptionsFormVs/templateOptionsFormVs.tsx'
import { useCreateVirtualService } from '../../api/grpc/hooks/useCreateVirtualService.ts'

interface IVirtualServiceFormProps {
	title?: string
}

export interface ITemplateOption {
	field: string
	modifier: number
}

export interface IVirtualServiceForm {
	name: string
	nodeIds: string[]
	projectId: string
	templateUid: string
	listenerUid: string
	vhDomains: string[]
	accessLogConfigUid: string
	additionalHttpFilterUids: string[]
	additionalRouteUids: string[]
	useRemoteAddress: boolean | null
	templateOptions: ITemplateOption[]
}

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = () => {
	const { data: templates, isFetching: isFetchingTemplates, isError: isErrorTemplates } = useTemplatesVirtualService()
	const { data: listeners, isFetching: isFetchingListeners, isError: isErrorListeners } = useListenerVirtualService()
	const {
		data: accessLogs,
		isFetching: isFetchingAccessLogs,
		isError: isErrorAccessLogs
	} = useAccessLogsVirtualService()
	const {
		data: httpFilters,
		isFetching: isFetchingHttpFilters,
		isError: isErrorHttpFilters
	} = useHttpFilterVirtualService()
	const { data: routes, isFetching: isFetchingRoutes, isError: isErrorRoutes } = useRouteVirtualService()
	const { createVirtualService } = useCreateVirtualService()

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		control,
		setError,
		clearErrors,
		watch,
		getValues
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			nodeIds: [],
			projectId: '',
			vhDomains: [],
			additionalHttpFilterUids: [],
			additionalRouteUids: [],
			useRemoteAddress: null,
			accessLogConfigUid: '',
			templateOptions: [{ field: '', modifier: 0 }]
		}
	})

	//TODO поменять IVirtualServiceForm на CreateVirtualServiceRequest
	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		console.log('Form Data:', data)

		const formValues = {
			domains: data.vhDomains
		}
		const jsonString = JSON.stringify(formValues)
		const virtualHostUint8Array = new TextEncoder().encode(jsonString)

		const { vhDomains, ...result } = data

		const createVSData = {
			...result,
			virtualHost: virtualHostUint8Array,
			templateOptions: result.templateOptions[0].field ? result.templateOptions : []
		}

		console.log('data for create', createVSData)
		await createVirtualService(createVSData)
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
					<Grid container spacing={3} overflow='auto' padding={1}>
						<Grid xs display='flex' flexDirection='column' gap={2}>
							<TextFieldFormVs register={register} nameField='name' errors={errors} />
							<AutocompleteChipVs
								nameField={'nodeIds'}
								control={control}
								setValue={setValue}
								errors={errors}
								setError={setError}
								clearErrors={clearErrors}
							/>
							<TextFieldFormVs register={register} nameField='projectId' errors={errors} />
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
							<VirtualHostVs
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
								isError={isErrorHttpFilters}
								isFetching={isFetchingHttpFilters}
							/>
						</Grid>
						<Divider orientation='vertical' flexItem />

						<Grid xs display='flex' flexDirection='column' gap={2}>
							<DNdSelectFormVs
								nameField={'additionalRouteUids'}
								data={routes}
								control={control}
								setValue={setValue}
								watch={watch}
								errors={errors}
								isError={isErrorRoutes}
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
						<Grid xs>
							fragmenf for code
							{/*<TextFieldFormVs register={register} nameField='some' errors={errors} />*/}
						</Grid>
					</Grid>
					<Box display='flex' alignItems='center' justifyContent='center'>
						<Button variant='contained' type='submit'>
							Submit
						</Button>
					</Box>
				</Box>
			</form>
		</>
	)
}

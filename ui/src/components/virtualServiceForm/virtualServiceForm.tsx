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
import { TemplateOptionModifier } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { TemplateOptionsFormVs } from '../templateOptionsFormVs/templateOptionsFormVs.tsx'

interface IVirtualServiceFormProps {
	title?: string
}

export interface ITemplateOption {
	field: string
	modifier: string
}

export interface IVirtualServiceForm {
	name: string
	node_ids: string[]
	project_id: string
	template_uid: string
	listener_uid: string
	vh_name: string
	vh_domains: string[]
	access_log_config: string
	additional_http_filter_uids: string[]
	additional_route_uids: string[]
	use_remote_address: boolean | null
	template_options: ITemplateOption[]
}

const mockData = {
	items: [
		{
			uid: '91344217',
			name: 'http-filter'
		},
		{
			uid: '91344218',
			name: 'http-filter1'
		},
		{
			uid: '91344219',
			name: 'http-filter2'
		},
		{
			uid: '91344210',
			name: 'http-filter3'
		}
	]
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

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		control,
		setError,
		clearErrors,
		watch
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			node_ids: [],
			project_id: '',
			vh_name: '',
			vh_domains: [],
			additional_http_filter_uids: [],
			additional_route_uids: [],
			use_remote_address: null,
			template_options: [{ field: '', modifier: '' }]
		}
	})

	//TODO поменять IVirtualServiceForm на CreateVirtualServiceRequest
	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		console.log('Form Data:', data)

		const formValues = {
			name: data.vh_name,
			domains: data.vh_domains
		}
		const jsonString = JSON.stringify(formValues)
		const virtual_hostBase64 = btoa(jsonString)

		console.log('Base64 String:', '\n', virtual_hostBase64)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
			<Box
				display='flex'
				flexDirection='column'
				justifyContent='space-between'
				height='100%'
				gap={2}
				overflow='auto'
			>
				<Grid container spacing={3}>
					<Grid xs display='flex' flexDirection='column' gap={2}>
						<TextFieldFormVs register={register} nameField='name' errors={errors} />
						<AutocompleteChipVs
							nameField={'node_ids'}
							control={control}
							setValue={setValue}
							errors={errors}
							setError={setError}
							clearErrors={clearErrors}
						/>
						<TextFieldFormVs register={register} nameField='project_id' errors={errors} />
						<SelectFormVs
							nameField={'template_uid'}
							data={templates}
							control={control}
							errors={errors}
							isFetching={isFetchingTemplates}
							isErrorFetch={isErrorTemplates}
						/>
						<SelectFormVs
							nameField={'listener_uid'}
							data={listeners}
							control={control}
							errors={errors}
							isFetching={isFetchingListeners}
							isErrorFetch={isErrorListeners}
						/>
						<VirtualHostVs
							nameFields={['vh_name', 'vh_domains']}
							register={register}
							errors={errors}
							setValue={setValue}
							control={control}
							clearErrors={clearErrors}
							setError={setError}
						/>
						<SelectFormVs
							nameField={'access_log_config'}
							data={accessLogs}
							control={control}
							errors={errors}
							isErrorFetch={isErrorAccessLogs}
							isFetching={isFetchingAccessLogs}
						/>
						<DNdSelectFormVs
							nameField={'additional_http_filter_uids'}
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
							nameField={'additional_route_uids'}
							data={mockData}
							control={control}
							setValue={setValue}
							watch={watch}
							errors={errors}
							isError={isErrorRoutes}
							isFetching={isFetchingRoutes}
						/>
						<RemoteAddrFormVs
							nameField={'use_remote_address'}
							control={control}
							errors={errors}
							setError={setError}
							clearErrors={clearErrors}
							setValue={setValue}
						/>
						<TemplateOptionsFormVs register={register} control={control} errors={errors} />
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
	)
}

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

interface IVirtualServiceFormProps {
	title?: string
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
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		control,
		setError,
		clearErrors
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			node_ids: [],
			project_id: '',
			vh_name: '',
			vh_domains: [],
			access_log_config: ''
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
			<Box display='flex' flexDirection='column' justifyContent='space-between' height='100%' gap={2}>
				<Grid container spacing={3}>
					<Grid xs display='flex' flexDirection='column' gap={2}>
						<TextFieldFormVs register={register} fieldName='name' errors={errors} />
						<AutocompleteChipVs
							nameField={'node_ids'}
							control={control}
							setValue={setValue}
							errors={errors}
							setError={setError}
							clearErrors={clearErrors}
						/>
						<TextFieldFormVs register={register} fieldName='project_id' errors={errors} />
						<SelectFormVs
							fieldName={'template_uid'}
							data={templates}
							control={control}
							errors={errors}
							isFetching={isFetchingTemplates}
							isErrorFetch={isErrorTemplates}
						/>
						<SelectFormVs
							fieldName={'listener_uid'}
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
							fieldName={'access_log_config'}
							data={accessLogs}
							control={control}
							errors={errors}
							isErrorFetch={isErrorAccessLogs}
							isFetching={isFetchingAccessLogs}
						/>
					</Grid>
					<Divider orientation='vertical' flexItem />

					<Grid xs>
						next fragment
						{/*<TextFieldFormVs register={register} nameField='node' errors={errors} />*/}
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

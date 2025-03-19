import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Box, Button, Divider, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { TextFieldFormVs } from '../textFieldFormVs/textFieldFormVs.tsx'
import { InputWithChips } from '../inputWithChips/inputWithChips.tsx'
import { useTemplatesVirtualService } from '../../api/grpc/hooks/useTemplatesVirtualService.ts'
import SelectTemplateVs from '../selectTemplateVs/selectTemplateVs.tsx'

interface IVirtualServiceFormProps {
	title?: string
}

export interface IVirtualServiceForm {
	name: string
	node_ids: string[]
	project_id: string
	template_uid: string
}

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = () => {
	const { data: templatesVs, isFetching, isError } = useTemplatesVirtualService()

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		control,
		setError,
		clearErrors
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			node_ids: [],
			project_id: ''
		}
	})

	//TODO поменять IVirtualServiceForm на CreateVirtualServiceRequest
	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		console.log(data)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
			<Box display='flex' flexDirection='column' justifyContent='space-between' height='100%' gap={2}>
				<Grid container spacing={3}>
					<Grid xs display='flex' flexDirection='column' gap={2}>
						<TextFieldFormVs register={register} nameField='name' errors={errors} />
						<InputWithChips
							setValue={setValue}
							watch={watch}
							control={control}
							errors={errors}
							clearErrors={clearErrors}
							setError={setError}
						/>
						<TextFieldFormVs register={register} nameField='project_id' errors={errors} />
						<SelectTemplateVs
							control={control}
							templatesVs={templatesVs}
							errors={errors}
							isFetching={isFetching}
							isErrorFetch={isError}
						/>
						<TextField fullWidth />
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

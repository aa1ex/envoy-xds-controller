import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Box, Button, Divider } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { TextFieldFormVs } from '../textFieldFormVs/textFieldFormVs.tsx'
import { InputWithChips } from '../inputWithChips/inputWithChips.tsx'

interface IVirtualServiceFormProps {
	title?: string
}

export interface IVirtualServiceForm {
	name: string
	node_ids: string[]
}

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = () => {
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
			node_ids: []
		}
	})

	//TODO поменять IVirtualServiceForm на CreateVirtualServiceRequest
	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		console.log(data)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
			<Box display='flex' flexDirection='column' justifyContent='space-between' height='100%' gap={2}>
				<Grid container spacing={2}>
					<Grid xs spacing={1}>
						<TextFieldFormVs register={register} nameField='name' errors={errors} />
						<InputWithChips
							setValue={setValue}
							watch={watch}
							control={control}
							errors={errors}
							clearErrors={clearErrors}
							setError={setError}
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

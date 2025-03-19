import React from 'react'
import { Box, Typography } from '@mui/material'
import {
	Control,
	FieldErrors,
	UseFormClearErrors,
	UseFormRegister,
	UseFormSetError,
	UseFormSetValue,
	UseFormWatch
} from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TextFieldFormVs } from '../textFieldFormVs/textFieldFormVs.tsx'
import { InputWithChips } from '../inputWithChips/inputWithChips.tsx'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'vh_name' | 'vh_domains'>

interface IVirtualHostVsProps {
	nameFields: nameFieldKeys[]
	register: UseFormRegister<IVirtualServiceForm>
	watch: UseFormWatch<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
}

export const VirtualHostVs: React.FC<IVirtualHostVsProps> = ({
	nameFields,
	register,
	errors,
	setError,
	clearErrors,
	control,
	setValue,
	watch
}) => {
	const [vh_name, vh_domains] = nameFields
	return (
		<Box
			sx={{
				width: '100%',
				border: '1px solid gray',
				borderRadius: 1,
				p: 2,
				pt: 0.5,
				display: 'flex',
				flexDirection: 'column',
				gap: 2
			}}
		>
			<Typography fontSize={15} color='gray'>
				Configure the virtual host
			</Typography>
			<TextFieldFormVs register={register} nameField={vh_name} errors={errors} />
			<InputWithChips
				nameField={vh_domains}
				setValue={setValue}
				watch={watch}
				control={control}
				errors={errors}
				clearErrors={clearErrors}
				setError={setError}
			/>
		</Box>
	)
}

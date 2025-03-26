import React from 'react'
import { Box, Typography } from '@mui/material'
import { Control, FieldErrors, UseFormClearErrors, UseFormSetError, UseFormSetValue } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { AutocompleteChipVs } from '../autocompleteChipVs/autocompleteChipVs.tsx'

interface IVirtualHostVsProps {
	nameFields: 'vhDomains'
	setValue: UseFormSetValue<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
}

export const VirtualHostVs: React.FC<IVirtualHostVsProps> = ({
	nameFields,
	errors,
	setError,
	clearErrors,
	control,
	setValue
}) => {
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
			<Typography fontSize={15} color='gray' mt={1}>
				Configure the virtual host
			</Typography>
			<AutocompleteChipVs
				nameField={nameFields}
				control={control}
				setValue={setValue}
				errors={errors}
				setError={setError}
				clearErrors={clearErrors}
				variant={'standard'}
			/>
		</Box>
	)
}

import React from 'react'
import { Control, Controller, FieldErrors, UseFormClearErrors, UseFormSetError, UseFormSetValue } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'

interface IRemoteAddrFormVsProps {
	nameField: Extract<keyof IVirtualServiceForm, 'use_remote_address'>
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
}

export const RemoteAddrFormVs: React.FC<IRemoteAddrFormVsProps> = ({ nameField, control, errors }) => {
	return (
		<Box
			display='flex'
			justifyContent='center'
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
				Use Remote Address
			</Typography>
			<Controller
				name={nameField}
				control={control}
				render={({ field }) => (
					<FormControl error={!!errors[nameField]} sx={{ alignItems: 'center' }}>
						<RadioGroup
							value={field.value ?? ''}
							onChange={e => {
								const value =
									e.target.value === 'true' ? true : e.target.value === 'false' ? false : null
								field.onChange(value)
							}}
						>
							<Box display='flex' justifyContent='center' alignItems='center'>
								<FormControlLabel value='true' control={<Radio />} label='True' />
								<FormControlLabel value='false' control={<Radio />} label='False' />
								<FormControlLabel value='' control={<Radio />} label='Default (Null)' />
							</Box>
						</RadioGroup>
					</FormControl>
				)}
			/>
		</Box>
	)
}

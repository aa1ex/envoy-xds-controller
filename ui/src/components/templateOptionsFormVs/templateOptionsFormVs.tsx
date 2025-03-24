import React from 'react'
import { Control, Controller, FieldErrors, useFieldArray, UseFormRegister } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TemplateOptionModifier } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { Box, Button, FormControl, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface ITemplateOptionsFormVsProps {
	register: UseFormRegister<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
}

export const TemplateOptionsFormVs: React.FC<ITemplateOptionsFormVsProps> = ({ register, control, errors }) => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'template_options'
	})

	const enumOptionsModifier = Object.entries(TemplateOptionModifier)
		.filter(([_, value]) => typeof value === 'number')
		.map(([key]) => ({
			label: `TEMPLATE_OPTION_MODIFIER_${key.toUpperCase()}`,
			value: `TEMPLATE_OPTION_MODIFIER_${key.toUpperCase()}`
		}))

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
				Template Modifier
			</Typography>

			<Box display='flex' flexDirection='column' gap={2}>
				{fields.map((field, index) => (
					<Box key={field.id} display='flex' gap={2}>
						<TextField
							{...register(`template_options.${index}.field`)}
							fullWidth
							placeholder='Enter path'
							error={!!errors.template_options?.[index]?.field}
							label={errors.template_options?.[index]?.field?.message || 'Enter path'}
						/>
						<Controller
							name={`template_options.${index}.modifier` as const}
							control={control}
							render={({ field }) => (
								<FormControl fullWidth error={!!errors.template_options?.[index]?.modifier}>
									<Select {...field}>
										{enumOptionsModifier.map(option => (
											<MenuItem key={option.value} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}
						/>
						<IconButton size='large' onClick={() => remove(index)} color='error'>
							<DeleteIcon />
						</IconButton>
					</Box>
				))}
			</Box>
			<Button onClick={() => append({ field: '', modifier: '' })} variant='contained'>
				Add Template Modifier
			</Button>
		</Box>
	)
}

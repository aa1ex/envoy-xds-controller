import React, { useEffect } from 'react'
import { Control, Controller, FieldErrors, UseFormSetValue, useWatch } from 'react-hook-form'
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { IVirtualServiceForm } from '../virtualServiceForm'
import { useTemplatesVs } from '../../api/grpc/hooks/useVirtualService.ts'
import { useVirtualServiceFormMeta } from '../../utils/hooks'

interface IExtraFieldsTabVsProps {
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
}

export const ExtraFieldsTabVs: React.FC<IExtraFieldsTabVsProps> = ({ control, errors, setValue }) => {
	const { groupId } = useVirtualServiceFormMeta()
	const { data: templatesData } = useTemplatesVs(groupId)

	// Watch the selected template UID to get its extra fields
	const selectedTemplateUid = useWatch({ control, name: 'templateUid' })

	// Find the selected template
	const selectedTemplate = templatesData?.items?.find(template => template.uid === selectedTemplateUid)

	// Get the extra fields from the selected template
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const extraFields = selectedTemplate?.extraFields || []

	// Initialize extraFields in form data when template changes
	useEffect(() => {
		if (extraFields.length > 0) {
			const initialExtraFields: Record<string, string> = {}

			// Set default values for extra fields
			extraFields.forEach(field => {
				if (field.default) {
					initialExtraFields[field.name] = field.default
				}
			})

			setValue('extraFields', initialExtraFields)
		}
	}, [selectedTemplateUid, extraFields, setValue])

	if (!selectedTemplate || extraFields.length === 0) {
		return (
			<Box p={2}>
				<Typography variant='body1'>No extra fields are defined for this template.</Typography>
			</Box>
		)
	}

	return (
		<Box p={2} display='flex' flexDirection='column' gap={2}>
			<Typography variant='h6' gutterBottom>
				Extra Fields
			</Typography>

			{extraFields.map(field => (
				<Controller
					key={field.name}
					name={`extraFields.${field.name}`}
					control={control}
					defaultValue={field.default || ''}
					rules={{
						required: field.required ? `${field.name} is required` : false
					}}
					render={({ field: formField }) => {
						// For enum type fields, render a select
						if (field.type === 'enum' && field.enum && field.enum.length > 0) {
							return (
								<FormControl fullWidth error={!!errors.extraFields?.[field.name]}>
									<InputLabel>{field.name}</InputLabel>
									<Select
										label={field.name}
										value={formField.value || ''}
										onChange={formField.onChange}
									>
										{field.enum.map(option => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
									</Select>
									{field.description && (
										<FormHelperText>
											{errors.extraFields?.[field.name]?.message || field.description}
										</FormHelperText>
									)}
								</FormControl>
							)
						}

						// For other types, render a text field
						return (
							<TextField
								fullWidth
								label={field.name}
								value={formField.value || ''}
								onChange={formField.onChange}
								error={!!errors.extraFields?.[field.name]}
								helperText={errors.extraFields?.[field.name]?.message || field.description}
								required={field.required}
							/>
						)
					}}
				/>
			))}
		</Box>
	)
}

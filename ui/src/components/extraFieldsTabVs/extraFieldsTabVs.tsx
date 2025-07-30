import React, { useEffect } from 'react'
import { Control, Controller, FieldErrors, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form'
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { IVirtualServiceForm } from '../virtualServiceForm'
import { useTemplatesVs } from '../../api/grpc/hooks/useVirtualService.ts'
import { useVirtualServiceFormMeta } from '../../utils/hooks'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'

interface IExtraFieldsTabVsProps {
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	isEditable?: boolean
}

export const ExtraFieldsTabVs: React.FC<IExtraFieldsTabVsProps> = ({ control, errors, setValue, isEditable = true }) => {
	const { groupId } = useVirtualServiceFormMeta()
	const { data: templatesData } = useTemplatesVs(groupId)
	const viewMode = useViewModeStore(state => state.viewMode)

	// Watch the selected template UID to get its extra fields
	const selectedTemplateUid = useWatch({ control, name: 'templateUid' })
	
	// Watch the current extraFields to preserve them
	const currentExtraFields = useWatch({ control, name: 'extraFields' }) || {}

	// Find the selected template
	const selectedTemplate = templatesData?.items?.find(template => template.uid === selectedTemplateUid)

	// Get the extra fields from the selected template
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const extraFields = selectedTemplate?.extraFields || []

	// Initialize extraFields in form data when template changes
	useEffect(() => {
		if (extraFields.length > 0) {
			const initialExtraFields: Record<string, string> = {}
			const currentValues = currentExtraFields || {}

			// Set default values for extra fields
			extraFields.forEach(field => {
				if (field.default) {
					// Only set default if the field doesn't already have a value
					if (!currentValues[field.name]) {
						initialExtraFields[field.name] = field.default
					}
				}
			})

			// Merge with existing values to preserve them
			if (Object.keys(initialExtraFields).length > 0) {
				setValue('extraFields', { ...currentValues, ...initialExtraFields })
			}
		}
	}, [selectedTemplateUid, extraFields, setValue])

	// Always register required fields even if they're not displayed
	// This ensures validation works for fields that are not visible
	const registerHiddenFields = () => {
		// Map over extraFields to create an array of Controller components for required fields
		return extraFields
			.filter(field => field.required)
			.map(field => (
				<Controller
					key={field.name}
					name={`extraFields.${field.name}`}
					control={control}
					defaultValue={field.default || ''}
					rules={{
						required: `${field.name} is required`
					}}
					render={() => null} // Hidden field, no UI
				/>
			));
	};

	if (!selectedTemplate || extraFields.length === 0) {
		return (
			<Box p={2}>
				<Typography variant='body1'>No extra fields are defined for this template.</Typography>
				{/* Register hidden fields for validation */}
				{registerHiddenFields()}
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
								<FormControl fullWidth error={!!errors.extraFields?.[field.name]} required={field.required}>
									<InputLabel error={!!errors.extraFields?.[field.name]}>{field.name}</InputLabel>
									<Select
										label={field.name}
										value={formField.value || ''}
										onChange={formField.onChange}
										disabled={!isEditable || viewMode === 'read'}
										error={!!errors.extraFields?.[field.name]}
									>
										{field.enum.map(option => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
									</Select>
									<FormHelperText error={!!errors.extraFields?.[field.name]}>
										{errors.extraFields?.[field.name]?.message || field.description || ' '}
									</FormHelperText>
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
								helperText={errors.extraFields?.[field.name]?.message || field.description || ' '}
								required={field.required}
								disabled={!isEditable || viewMode === 'read'}
							/>
						)
					}}
				/>
			))}
		</Box>
	)
}

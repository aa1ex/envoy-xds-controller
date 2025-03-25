import React from 'react'
import {
	Control,
	Controller,
	FieldErrors,
	useFieldArray,
	UseFormClearErrors,
	UseFormGetValues,
	UseFormRegister
} from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TemplateOptionModifier } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import {
	Box,
	Button,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

interface ITemplateOptionsFormVsProps {
	register: UseFormRegister<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	getValues: UseFormGetValues<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
}

export const TemplateOptionsFormVs: React.FC<ITemplateOptionsFormVsProps> = ({
	register,
	control,
	errors,
	getValues,
	clearErrors
}) => {
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

	const validateTemplateOption = (fieldName: 'field' | 'modifier', index: number, value: string) => {
		const fieldValue = getValues(`template_options.${index}.field`)
		const modifierValue = getValues(`template_options.${index}.modifier`)

		const templateOption = {
			field: fieldName === 'field' ? value : fieldValue,
			modifier: fieldName === 'modifier' ? value : modifierValue
		}

		const result = validationRulesVsForm.template_options([templateOption])

		if (fieldName === 'field' && modifierValue && result === true) {
			clearErrors(`template_options.${index}.modifier`)
		}

		if (fieldName === 'modifier' && fieldValue && result === true) {
			clearErrors(`template_options.${index}.field`)
		}

		return result
	}

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
							{...register(`template_options.${index}.field`, {
								validate: value => validateTemplateOption('field', index, value)
							})}
							key={field.id}
							fullWidth
							placeholder='Enter path'
							error={!!errors.template_options?.[index]?.field}
							label={errors.template_options?.[index]?.field?.message || 'Path'}
						/>
						<Controller
							name={`template_options.${index}.modifier` as const}
							control={control}
							rules={{
								validate: value => validateTemplateOption('modifier', index, value)
							}}
							render={({ field }) => (
								<FormControl fullWidth error={!!errors.template_options?.[index]?.modifier}>
									<InputLabel>
										{errors.template_options?.[index]?.modifier?.message || 'Select Modification'}
									</InputLabel>
									<Select
										{...field}
										label={errors.template_options?.[index]?.modifier?.message || 'Modifications'}
									>
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

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
import { TemplateOptionModifier } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import { styleBox, styleTooltip } from './style.ts'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'

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
		name: 'templateOptions'
	})

	const enumOptionsModifier = Object.entries(TemplateOptionModifier)
		.filter(([_, value]) => typeof value === 'number')
		.map(([key, value]) => ({
			label: `TEMPLATE_OPTION_MODIFIER_${key.toUpperCase()}`,
			value: value
		}))

	const validateTemplateOption = (fieldName: 'field' | 'modifier', index: number, value: string | number) => {
		const fieldValue = getValues(`templateOptions.${index}.field`)
		const modifierValue = getValues(`templateOptions.${index}.modifier`)

		const templateOption = {
			field: fieldName === 'field' ? String(value) : String(fieldValue), // Приводим к строке
			modifier: fieldName === 'modifier' ? Number(value) : Number(modifierValue) // Приводим к числу
		}

		const result = validationRulesVsForm.templateOptions([templateOption])

		if (fieldName === 'field' && modifierValue && result === true) {
			clearErrors(`templateOptions.${index}.modifier`)
		}

		if (fieldName === 'modifier' && fieldValue && result === true) {
			clearErrors(`templateOptions.${index}.field`)
		}

		return result
	}

	return (
		<Box sx={{ ...styleBox }}>
			<Tooltip
				title='Specify the property and select the modification parameter.'
				placement='bottom-start'
				enterDelay={500}
				slotProps={{ ...styleTooltip }}
			>
				<Typography fontSize={15} color='gray' mt={1}>
					Template Modifier
				</Typography>
			</Tooltip>

			<Box display='flex' flexDirection='column' gap={2}>
				{fields.map((field, index) => (
					<Box key={field.id} display='flex' gap={2}>
						<TextField
							{...register(`templateOptions.${index}.field`, {
								validate: value => validateTemplateOption('field', index, value)
							})}
							key={field.id}
							fullWidth
							error={!!errors.templateOptions?.[index]?.field}
							label='Path'
							helperText={errors.templateOptions?.[index]?.field?.message}
						/>
						<Controller
							name={`templateOptions.${index}.modifier` as const}
							control={control}
							rules={{
								validate: value => validateTemplateOption('modifier', index, value)
							}}
							render={({ field }) => (
								<FormControl fullWidth error={!!errors.templateOptions?.[index]?.modifier}>
									<InputLabel>Modification</InputLabel>
									<Select
										{...field}
										value={field.value === 0 ? '' : field.value}
										error={!!errors.templateOptions?.[index]?.modifier}
										fullWidth
										label='Modification'
									>
										{enumOptionsModifier
											.filter(option => option.value !== 0)
											.map(option => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
									</Select>
									<FormHelperText>
										{errors.templateOptions?.[index]?.modifier?.message}
									</FormHelperText>
								</FormControl>
							)}
						/>
						<IconButton size='large' onClick={() => remove(index)} color='error'>
							<DeleteIcon />
						</IconButton>
					</Box>
				))}
			</Box>
			<Button onClick={() => append({ field: '', modifier: 0 })} variant='contained'>
				Add Template Modifier
			</Button>
		</Box>
	)
}

import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TextField } from '@mui/material'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

interface ITextFieldFormVsProps {
	fieldName: keyof IVirtualServiceForm
	register: UseFormRegister<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	variant?: 'standard' | 'outlined'
}

export const TextFieldFormVs: React.FC<ITextFieldFormVsProps> = ({ register, fieldName, errors, variant }) => {
	const validate = validationRulesVsForm[fieldName]
	const fieldTitles: Record<string, string> = {
		name: 'Name Vs',
		project_id: 'Project Id',
		vh_name: 'Virtual Host Name'
	}

	const titleMessage = fieldTitles[fieldName] || fieldName

	return (
		<TextField
			{...register(fieldName, {
				required: `The ${titleMessage} field is required`,
				validate: validate
			})}
			fullWidth
			placeholder={`Enter ${titleMessage}`}
			error={!!errors[fieldName]}
			label={errors[fieldName]?.message ?? ` ${titleMessage}`}
			variant={variant}
		/>
	)
}

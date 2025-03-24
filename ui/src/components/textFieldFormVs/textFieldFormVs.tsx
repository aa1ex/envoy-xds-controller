import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TextField } from '@mui/material'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'name' | 'project_id' | 'vh_name'>

interface ITextFieldFormVsProps {
	nameField: nameFieldKeys
	register: UseFormRegister<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	variant?: 'standard' | 'outlined'
}

export const TextFieldFormVs: React.FC<ITextFieldFormVsProps> = ({ register, nameField, errors, variant }) => {
	const validate = validationRulesVsForm[nameField]
	const fieldTitles: Record<string, string> = {
		name: 'Name Vs',
		project_id: 'Project Id',
		vh_name: 'Virtual Host Name'
	}

	const titleMessage = fieldTitles[nameField] || nameField

	return (
		<TextField
			{...register(nameField, {
				required: `The ${titleMessage} field is required`,
				validate: validate
			})}
			fullWidth
			placeholder={`Enter ${titleMessage}`}
			error={!!errors[nameField]}
			label={errors[nameField]?.message ?? ` ${titleMessage}`}
			variant={variant}
		/>
	)
}

import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TextField } from '@mui/material'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

interface ITextFieldFormVsProps {
	nameField: keyof IVirtualServiceForm
	register: UseFormRegister<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
}

export const TextFieldFormVs: React.FC<ITextFieldFormVsProps> = ({ register, nameField, errors }) => {
	const validate = validationRulesVsForm[nameField]

	return (
		<TextField
			{...register(nameField, {
				required: `The ${nameField} field is required`,
				validate: validate
			})}
			fullWidth
			size='small'
			placeholder={`Enter ${nameField}`}
			error={!!errors[nameField]}
			label={errors[nameField]?.message ?? `Enter ${nameField}`}
		/>
	)
}

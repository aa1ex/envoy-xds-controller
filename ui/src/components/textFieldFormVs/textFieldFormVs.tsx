import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { TextField, Tooltip } from '@mui/material'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'name' | 'projectId'>

interface ITextFieldFormVsProps {
	nameField: nameFieldKeys
	register: UseFormRegister<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	variant?: 'standard' | 'outlined'
}

export const TextFieldFormVs: React.FC<ITextFieldFormVsProps> = ({ register, nameField, errors, variant }) => {
	const titleMessage = nameField === 'name' ? 'Name' : 'Project Id'

	return (
		<Tooltip title={`Enter ${titleMessage}`} placement='bottom-start' arrow>
			<TextField
				{...register(nameField, {
					required: `The ${titleMessage} field is required`,
					validate: validationRulesVsForm[nameField]
				})}
				fullWidth
				error={!!errors[nameField]}
				label={titleMessage}
				helperText={errors[nameField]?.message}
				variant={variant}
			/>
		</Tooltip>
	)
}

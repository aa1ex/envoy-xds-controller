import React from 'react'
import { Control, Controller, FieldErrors, UseFormClearErrors, UseFormSetError, UseFormSetValue } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import { Autocomplete, TextField } from '@mui/material'
import Chip from '@mui/material/Chip'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'nodeIds' | 'vh_domains'>

interface IAutocompleteChipVsProps {
	nameField: nameFieldKeys
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
	variant?: 'standard' | 'outlined'
}

export const AutocompleteChipVs: React.FC<IAutocompleteChipVsProps> = ({
	nameField,
	control,
	setValue,
	errors,
	setError,
	clearErrors,
	variant
}) => {
	const titleMessage = nameField === 'nodeIds' ? 'NodeID' : 'Domains Virtual Host'

	return (
		<Controller
			name={nameField}
			control={control}
			rules={{
				validate: validationRulesVsForm[nameField]
			}}
			render={({ field }) => (
				<Autocomplete
					multiple
					freeSolo
					options={[]}
					value={field.value}
					onChange={(_, newValue) => {
						const errorMessage = validationRulesVsForm[nameField](newValue)
						if (errorMessage !== true) {
							setError(nameField, { type: 'manual', message: errorMessage })
							return
						}

						clearErrors(nameField)
						setValue(nameField, newValue)
					}}
					renderTags={(value: readonly string[], getTagProps) =>
						value.map((option: string, index: number) => {
							const { key, ...tagProps } = getTagProps({ index })
							return <Chip variant='outlined' label={option} key={key} {...tagProps} />
						})
					}
					renderInput={params => (
						<TextField
							{...params}
							label={errors[nameField]?.message ?? `Enter the ${titleMessage} name and press enter`}
							placeholder={`To add a ${titleMessage}, enter the ${titleMessage} name and press enter`}
							error={!!errors[nameField]}
							variant={variant}
						/>
					)}
				/>
			)}
		/>
	)
}

import React from 'react'
import { Control, Controller, FieldErrors, UseFormClearErrors, UseFormSetError, UseFormSetValue } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import { Autocomplete, TextField, Tooltip } from '@mui/material'
import Chip from '@mui/material/Chip'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'nodeIds' | 'vhDomains'>

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
	const titleMessage = nameField === 'nodeIds' ? 'NodeIDs' : 'Domains'

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

						if (!newValue.length || errorMessage === true) {
							clearErrors(nameField)
							field.onChange(newValue)
							setValue(nameField, newValue)
						} else {
							setError(nameField, { type: 'manual', message: errorMessage as string })
						}
					}}
					renderTags={(value: readonly string[], getTagProps) =>
						value.map((option: string, index: number) => {
							const { key, ...tagProps } = getTagProps({ index })
							return <Chip variant='outlined' label={option} key={key} {...tagProps} />
						})
					}
					renderInput={params => (
						<Tooltip
							title={`Enter ${titleMessage.slice(0, -1)}. Press Enter to add it to the list.`}
							placement='bottom-start'
							arrow
							enterDelay={800}
							disableInteractive
						>
							<TextField
								{...params}
								error={!!errors[nameField]}
								helperText={errors[nameField]?.message}
								label={titleMessage}
								variant={variant}
							/>
						</Tooltip>
					)}
				/>
			)}
		/>
	)
}

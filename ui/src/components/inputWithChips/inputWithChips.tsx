import React, { useState } from 'react'
import {
	Control,
	Controller,
	FieldErrors,
	UseFormClearErrors,
	UseFormSetError,
	UseFormSetValue,
	UseFormWatch
} from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { Box, TextField } from '@mui/material'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

interface IInputWithChipsProps {
	watch: UseFormWatch<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
}

export const InputWithChips: React.FC<IInputWithChipsProps> = ({
	watch,
	setValue,
	control,
	errors,
	setError,
	clearErrors
}) => {
	const [inputValue, setInputValue] = useState('')
	const nodeIds = watch('node_ids')

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault()

			const trimmedValue = inputValue.trim()
			if (!trimmedValue) return

			const cleanedValue = trimmedValue.replace(/,$/, '')
			const currentTags = watch('node_ids') || []

			if (!/^[a-zA-Z0-9_-]+$/.test(cleanedValue)) {
				setError('node_ids', {
					type: 'manual',
					message: 'Node IDs must contain only letters, numbers, hyphens, and underscores'
				})
				return
			}

			if (!currentTags.includes(cleanedValue)) {
				const updatedTags = [...currentTags, cleanedValue]
				setValue('node_ids', updatedTags, { shouldValidate: true })
				clearErrors('node_ids')
			}

			setInputValue('')
		}
	}

	const handleDeleteChip = (chipToDelete: string) => {
		const updatedTags = nodeIds.filter(nodeId => nodeId !== chipToDelete)
		setValue('node_ids', updatedTags)
	}

	return (
		<Box display='flex' flexDirection='column'>
			<Stack direction='row' spacing={1} flexWrap='wrap' mb={nodeIds.length > 0 ? 1.3 : 0}>
				{nodeIds.map((nodeId, index) => (
					<Chip key={index} label={nodeId} onDelete={() => handleDeleteChip(nodeId)} />
				))}
			</Stack>

			<Controller
				name='node_ids'
				control={control}
				rules={{
					validate: validationRulesVsForm.node_ids
				}}
				render={() => (
					<TextField
						value={inputValue}
						onChange={handleInputChange}
						onKeyUp={handleKeyUp}
						onKeyDown={event => {
							if (event.key === 'Enter') event.preventDefault() // Блокируем отправку формы
						}}
						fullWidth
						size='small'
						placeholder='Add tags. Press Enter or comma to add tags'
						error={!!errors.node_ids}
						label={errors.node_ids?.message ?? 'Enter Node IDs (press Enter or use commas to separate)'}
					/>
				)}
			/>
		</Box>
	)
}

import React from 'react'
import { Control, Controller, useFieldArray, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import { TemplateOptionModifier } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import Box from '@mui/material/Box'
import { templateOptionsBox } from './style.ts'
import { TooltipTemplateOptions } from './tooltipTemplateOptions.tsx'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

interface ITemplateOptionsFormVsRoProps {
	register: UseFormRegister<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	setValue?: UseFormSetValue<IVirtualServiceForm>
}

export const TemplateOptionsFormVsRo: React.FC<ITemplateOptionsFormVsRoProps> = ({ register, control }) => {
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

	const { fields, remove } = useFieldArray({ control, name: 'templateOptions' })

	const enumOptionsModifier = Object.entries(TemplateOptionModifier)
		.filter(([_, value]) => typeof value === 'number')
		.map(([key, value]) => ({
			label: key.toUpperCase(),
			value: value
		}))

	return (
		<Box className='templateOptionsBox' sx={{ ...templateOptionsBox }}>
			<TooltipTemplateOptions />

			<Box display='flex' flexDirection='column' gap={2}>
				{fields.map((field, index) => (
					<Box key={field.id} display='flex' gap={2}>
						<TextField
							{...register(`templateOptions.${index}.field`)}
							key={field.id}
							fullWidth
							disabled={readMode}
							label='Path'
							slotProps={{
								input: {
									readOnly: true
								}
							}}
						/>
						<Controller
							name={`templateOptions.${index}.modifier` as const}
							control={control}
							render={({ field }) => (
								<FormControl fullWidth>
									<InputLabel>Modifier</InputLabel>
									<Select
										{...field}
										value={field.value === 0 ? '' : field.value}
										fullWidth
										disabled={readMode}
										label='Modifier'
										readOnly
										sx={{
											'& .MuiSelect-select': {
												cursor: 'default'
											}
										}}
									>
										{enumOptionsModifier
											.filter(option => option.value !== 0)
											.map(option => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
									</Select>
								</FormControl>
							)}
						/>
						<IconButton size='large' onClick={() => remove(index)} color='error' disabled={true}>
							<DeleteIcon color={readMode ? 'disabled' : 'primary'} />
						</IconButton>
					</Box>
				))}
			</Box>
		</Box>
	)
}

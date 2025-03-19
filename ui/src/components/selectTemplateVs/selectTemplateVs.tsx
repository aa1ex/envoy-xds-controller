import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { ListVirtualServiceTemplateResponse } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'

interface ISelectTemplateVsProps {
	control: Control<IVirtualServiceForm, any>
	templatesVs: ListVirtualServiceTemplateResponse | undefined
	errors: FieldErrors<IVirtualServiceForm>
	isFetching: boolean
	isErrorFetch: boolean
}

const SelectTemplateVs: React.FC<ISelectTemplateVsProps> = ({
	control,
	errors,
	templatesVs,
	isFetching,
	isErrorFetch
}) => {
	return (
		<Controller
			name='template_uid'
			control={control}
			rules={{
				validate: validationRulesVsForm.template_uid
			}}
			render={({ field }) => (
				<FormControl fullWidth error={!!errors.template_uid || isErrorFetch} size='small'>
					<InputLabel>
						{errors.template_uid?.message ??
							(isErrorFetch ? 'Error loading TemplateVs data' : 'Select template VS')}
					</InputLabel>
					<Select
						fullWidth
						error={!!errors.template_uid || isErrorFetch}
						label={
							errors.template_uid?.message ??
							(isErrorFetch ? 'Error loading TemplateVs data' : 'Select template VS')
						}
						value={field.value || ''}
						onChange={e => field.onChange(e.target.value)}
						IconComponent={
							isFetching ? () => <CircularProgress size={20} sx={{ marginRight: 2 }} /> : undefined
						}
						sx={{ '& .MuiSelect-icon': { width: '24px', height: '24px' } }}
					>
						{isErrorFetch && (
							<MenuItem disabled>
								<span style={{ color: 'error' }}>Error loading TemplateVs data</span>
							</MenuItem>
						)}

						{templatesVs?.items?.map(template => (
							<MenuItem key={template.uid} value={template.uid}>
								{template.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}
		/>
	)
}

export default SelectTemplateVs

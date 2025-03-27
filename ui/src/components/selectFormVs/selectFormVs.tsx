import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import {
	ListVirtualServiceTemplateResponse,
	VirtualServiceTemplateListItem
} from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { ListenerListItem, ListListenerResponse } from '../../gen/listener/v1/listener_pb.ts'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import {
	AccessLogConfigListItem,
	ListAccessLogConfigResponse
} from '../../gen/access_log_config/v1/access_log_config_pb.ts'
import { AccessGroupListItem, ListAccessGroupResponse } from '../../gen/access_group/v1/access_group_pb'

type nameFieldKeys = Extract<
	keyof IVirtualServiceForm,
	'templateUid' | 'listenerUid' | 'accessLogConfigUid' | 'accessGroup'
>

type Item = ListenerListItem | VirtualServiceTemplateListItem | AccessLogConfigListItem | AccessGroupListItem

interface ISelectFormVsProps {
	nameField: nameFieldKeys
	control: Control<IVirtualServiceForm, any>
	data:
		| ListListenerResponse
		| ListVirtualServiceTemplateResponse
		| ListAccessLogConfigResponse
		| ListAccessGroupResponse
		| undefined
	errors: FieldErrors<IVirtualServiceForm>
	isFetching: boolean
	isErrorFetch: boolean
}

export const SelectFormVs: React.FC<ISelectFormVsProps> = ({
	nameField,
	data,
	control,
	errors,
	isErrorFetch,
	isFetching
}) => {
	const fieldTitles: Record<string, string> = {
		templateUid: 'Template',
		listenerUid: 'Listeners',
		accessLogConfigUid: 'AccessLogConfig',
		accessGroup: 'AccessGroup'
	}

	const titleMessage = fieldTitles[nameField] || nameField

	const renderMenuItem = (item: Item) => {
		const key = 'uid' in item ? item.uid : item.name
		const value = 'uid' in item ? item.uid : item.name

		return (
			<MenuItem key={key} value={value}>
				{item.name}
			</MenuItem>
		)
	}

	return (
		<Controller
			name={nameField}
			control={control}
			rules={{
				validate: validationRulesVsForm[nameField]
			}}
			render={({ field }) => (
				<FormControl fullWidth error={!!errors[nameField] || isErrorFetch}>
					<InputLabel>
						{errors[nameField]?.message ??
							(isErrorFetch ? `Error loading ${titleMessage} data` : `Select ${titleMessage}`)}
					</InputLabel>
					<Select
						fullWidth
						error={!!errors[nameField] || isErrorFetch}
						label={
							errors[nameField]?.message ??
							(isErrorFetch ? `Error loading ${titleMessage} data` : `Select ${titleMessage}`)
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
								<span style={{ color: 'error' }}>{`Error loading ${titleMessage} data`}</span>
							</MenuItem>
						)}

						{data?.items?.map(item => renderMenuItem(item))}
					</Select>
				</FormControl>
			)}
		/>
	)
}

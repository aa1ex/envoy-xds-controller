import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import {
	ListVirtualServiceTemplatesResponse,
	VirtualServiceTemplateListItem
} from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { ListenerListItem, ListListenersResponse } from '../../gen/listener/v1/listener_pb.ts'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import CircularProgress from '@mui/material/CircularProgress'
import {
	AccessLogConfigListItem,
	ListAccessLogConfigsResponse
} from '../../gen/access_log_config/v1/access_log_config_pb.ts'
import { AccessGroupListItem, ListAccessGroupsResponse } from '../../gen/access_group/v1/access_group_pb'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'

type nameFieldKeys = Extract<
	keyof IVirtualServiceForm,
	'templateUid' | 'listenerUid' | 'accessLogConfigUid' | 'accessGroup'
>

type Item = ListenerListItem | VirtualServiceTemplateListItem | AccessLogConfigListItem | AccessGroupListItem

interface ISelectFormVsProps {
	nameField: nameFieldKeys
	control: Control<IVirtualServiceForm, any>
	data:
		| ListListenersResponse
		| ListVirtualServiceTemplatesResponse
		| ListAccessLogConfigsResponse
		| ListAccessGroupsResponse
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
		accessGroup: 'AccessGroup',
		templateUid: 'Template',
		listenerUid: 'Listeners',
		accessLogConfigUid: 'AccessLogConfig'
	}

	const titleMessage = fieldTitles[nameField] || nameField
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

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
					<InputLabel>{titleMessage}</InputLabel>
					<Select
						fullWidth
						disabled={readMode}
						error={!!errors[nameField] || isErrorFetch}
						label={titleMessage}
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
					<FormHelperText>
						{errors[nameField]?.message || (isErrorFetch && `Error loading ${titleMessage} data`)}
					</FormHelperText>
				</FormControl>
			)}
		/>
	)
}

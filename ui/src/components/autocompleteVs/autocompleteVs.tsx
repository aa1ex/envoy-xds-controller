import React from 'react'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { ListenerListItem, ListListenersResponse } from '../../gen/listener/v1/listener_pb.ts'
import {
	ListVirtualServiceTemplatesResponse,
	VirtualServiceTemplateListItem
} from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import {
	AccessLogConfigListItem,
	ListAccessLogConfigsResponse
} from '../../gen/access_log_config/v1/access_log_config_pb.ts'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import Autocomplete from '@mui/material/Autocomplete'
import { AutocompleteRenderInputParams, TextField } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'templateUid' | 'listenerUid' | 'accessLogConfigUid'>

type Item = ListenerListItem | VirtualServiceTemplateListItem | AccessLogConfigListItem

interface IAutocompleteVsProps {
	nameField: nameFieldKeys
	control: Control<IVirtualServiceForm>
	data: ListListenersResponse | ListVirtualServiceTemplatesResponse | ListAccessLogConfigsResponse | undefined
	errors: FieldErrors<IVirtualServiceForm>
	isFetching: boolean
	isErrorFetch: boolean
}

const fieldTitles: Record<string, string> = {
	templateUid: 'Template',
	listenerUid: 'Listeners',
	accessLogConfigUid: 'AccessLogConfig'
}

export const AutocompleteVs: React.FC<IAutocompleteVsProps> = ({
	nameField,
	data,
	control,
	errors,
	isErrorFetch,
	isFetching
}) => {
	const titleMessage = fieldTitles[nameField] || nameField
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

	const renderOptions = (
		props: React.HTMLAttributes<HTMLLIElement> & {
			key: any
		},
		option: Item
	) => {
		const { key, ...optionProps } = props

		return (
			<Box
				component='li'
				key={option.uid}
				{...optionProps}
				sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
			>
				<Box sx={{ width: '45%' }}>
					<Typography>{option.name}</Typography>
				</Box>
				<Box sx={{ width: '65%' }}>
					<Typography variant='body2' sx={{ wordWrap: 'break-word' }} color='text.disabled'>
						{option.description}
					</Typography>
				</Box>
			</Box>
		)
	}

	const renderInput = (params: AutocompleteRenderInputParams, selectedItem: any) => {
		return (
			<TextField
				{...params}
				label={fieldTitles[nameField]}
				error={!!errors[nameField] || isErrorFetch}
				helperText={errors[nameField]?.message || (isErrorFetch ? `Error loading ${titleMessage} data` : '')}
				onKeyDown={e => {
					const container = document.querySelector(`.autocomplete-${nameField}`)
					const autocompletePopup = document.querySelector('.MuiAutocomplete-popper')
					const isAutocompleteOpen = container && autocompletePopup && autocompletePopup.clientHeight > 0

					if (e.key === 'Enter' && isAutocompleteOpen) {
						e.preventDefault()
					}
				}}
				slotProps={{
					input: {
						...params.InputProps,
						endAdornment: (
							<>
								<Typography variant='body2' sx={{ wordWrap: 'break-word' }} color='textDisabled'>
									{selectedItem?.description || ''}
								</Typography>
								{isFetching ? <CircularProgress color='inherit' size={20} /> : null}
								{params.InputProps.endAdornment}
							</>
						)
					}
				}}
			/>
		)
	}

	return (
		<Controller
			name={nameField}
			control={control}
			rules={{ validate: validationRulesVsForm[nameField] }}
			render={({ field }) => {
				const filteredItems = (data?.items || []).filter(item => {
					if (nameField === 'listenerUid') return item.$typeName === 'listener.v1.ListenerListItem'
					if (nameField === 'templateUid')
						return item.$typeName === 'virtual_service_template.v1.VirtualServiceTemplateListItem'
					if (nameField === 'accessLogConfigUid')
						return item.$typeName === 'access_log_config.v1.AccessLogConfigListItem'
					return false
				})

				const selectedItem = filteredItems.find(item => item.uid === field.value) || null

				return (
					<Autocomplete
						className={`autocomplete-${nameField}`}
						disabled={readMode}
						loading={isFetching}
						options={filteredItems}
						value={selectedItem}
						getOptionLabel={option => option.name}
						isOptionEqualToValue={(option, value) => option.uid === value.uid}
						onChange={(_, newValue) => field.onChange(newValue ? newValue.uid : '')}
						renderOption={(props, option) => renderOptions(props, option)}
						renderInput={params => renderInput(params, selectedItem)}
					/>
				)
			}}
		/>
	)
}

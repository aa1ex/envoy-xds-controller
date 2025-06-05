import React, { useEffect, useState } from 'react'
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
import Typography from '@mui/material/Typography'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import Autocomplete from '@mui/material/Autocomplete'
import { AutocompleteRenderInputParams, ClickAwayListener, Popper, TextField } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'templateUid' | 'listenerUid' | 'accessLogConfigUid'>

export type Item = ListenerListItem | VirtualServiceTemplateListItem | AccessLogConfigListItem

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

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const [popoverOption, setPopoverOption] = useState<Item | null>(null)
	const isPopoverOpen = !!(popoverOption && anchorEl && document.body.contains(anchorEl))

	const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>, option: Item) => {
		event.stopPropagation()
		setAnchorEl(event.currentTarget)
		setPopoverOption(option)
	}

	const handleClosePopover = () => {
		setAnchorEl(null)
		setPopoverOption(null)
	}

	useEffect(() => {
		if (anchorEl && !document.body.contains(anchorEl)) {
			handleClosePopover()
		}
	}, [anchorEl])

	// В renderOptions заменяем рендер встроенного бокса на Popper
	const renderOptions = (props: React.HTMLAttributes<HTMLLIElement> & { key: any }, option: Item) => {
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
				<IconButton onClick={e => handleOpenPopover(e, option)}>
					<VisibilityOutlinedIcon />
				</IconButton>
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
		<>
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
						<>
							<Autocomplete
								className={`autocomplete-${nameField}`}
								disabled={readMode}
								loading={isFetching}
								options={filteredItems}
								value={selectedItem}
								getOptionLabel={option => option.name}
								isOptionEqualToValue={(option, value) => option.uid === value.uid}
								onChange={(_, newValue) => field.onChange(newValue ? newValue.uid : '')}
								renderInput={params => renderInput(params, selectedItem)}
								renderOption={(props, option) => renderOptions(props, option)}
							/>
							{isPopoverOpen && anchorEl && (
								<ClickAwayListener onClickAway={handleClosePopover}>
									<Popper
										open={Boolean(anchorEl && popoverOption)}
										anchorEl={anchorEl}
										placement='right'
										disablePortal={false}
										style={{ zIndex: 1300 }}
										onClick={e => e.stopPropagation()}
									>
										{popoverOption && (
											<Box
												sx={{
													bgcolor: 'background.paper',
													boxShadow: 3,
													borderRadius: 1,
													p: 1,
													minWidth: 200,
													userSelect: 'text'
												}}
											>
												<Typography variant='subtitle2'>Код элемента:</Typography>
												<Typography variant='body2'>{popoverOption.description}</Typography>
												<Box
													component='button'
													onClick={handleClosePopover}
													sx={{
														mt: 1,
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														color: '#1976d2',
														':hover': { textDecoration: 'underline' }
													}}
												>
													Закрыть
												</Box>
											</Box>
										)}
									</Popper>
								</ClickAwayListener>
							)}
						</>
					)
				}}
			/>
		</>
	)
}

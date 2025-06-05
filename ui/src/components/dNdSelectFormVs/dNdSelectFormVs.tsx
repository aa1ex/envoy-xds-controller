import React from 'react'
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form'
import { HTTPFilterListItem, ListHTTPFiltersResponse } from '../../gen/http_filter/v1/http_filter_pb.ts'
import { ListRoutesResponse, RouteListItem } from '../../gen/route/v1/route_pb.ts'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import CircularProgress from '@mui/material/CircularProgress'
import { dNdBox } from './style.ts'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import { ToolTipVs } from '../toolTipVs/toolTipVs.tsx'
import { AutocompleteRenderInputParams } from '@mui/material'
import { DNdElementsBox } from '../dNdElementsBox/dNdElementsBox.tsx'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import IconButton from '@mui/material/IconButton'

export type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'additionalHttpFilterUids' | 'additionalRouteUids'>

interface IdNdSelectFormVsProps {
	nameField: nameFieldKeys
	data: ListHTTPFiltersResponse | ListRoutesResponse | undefined
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	isErrorFetch: boolean
	isFetching: boolean
}

export const DNdSelectFormVs: React.FC<IdNdSelectFormVsProps> = ({
	nameField,
	data,
	control,
	setValue,
	errors,
	isFetching,
	isErrorFetch
}) => {
	const titleMessage = nameField === 'additionalHttpFilterUids' ? 'HTTP filter' : 'Route'
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

	const renderOptions = (
		props: React.HTMLAttributes<HTMLLIElement> & {
			key: any
		},
		option: HTTPFilterListItem | RouteListItem
	) => {
		const { key, ...optionProps } = props

		return (
			<Box
				key={option.uid}
				component='li'
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
				<IconButton
					aria-label='watchCode'
					onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
						event.stopPropagation()
					}}
				>
					<VisibilityOutlinedIcon />
				</IconButton>
			</Box>
		)
	}

	const renderInput = (params: AutocompleteRenderInputParams) => (
		<TextField
			{...params}
			variant='standard'
			error={!!errors[nameField] || isErrorFetch}
			helperText={errors[nameField]?.message || (isErrorFetch && `Error loading ${titleMessage} data`)}
			onKeyDown={e => {
				const container = document.querySelector(`.dndAutoComplete-${nameField}`)
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
							{isFetching ? <CircularProgress color='inherit' size={20} /> : null}
							{params.InputProps.endAdornment}
						</>
					)
				}
			}}
		/>
	)

	return (
		<Box sx={{ ...dNdBox }}>
			<ToolTipVs titleMessage={titleMessage} delay={500} isDnD={true} />
			<Controller
				name={nameField}
				control={control}
				rules={{
					validate: validationRulesVsForm[nameField]
				}}
				render={({ field }) => (
					<Autocomplete
						className={`dndAutoComplete-${nameField}`}
						multiple
						disabled={readMode}
						loading={isFetching}
						options={data?.items || []}
						getOptionLabel={option => option.name}
						renderOption={(props, option) => renderOptions(props, option)}
						value={(data?.items || []).filter(item => field.value.includes(item.uid))}
						onChange={(_, newValue) => field.onChange(newValue.map(item => item.uid))}
						renderInput={params => renderInput(params)}
					/>
				)}
			/>
			<DNdElementsBox
				titleMessage={titleMessage}
				nameField={nameField}
				control={control}
				data={data}
				setValue={setValue}
			/>
		</Box>
	)
}

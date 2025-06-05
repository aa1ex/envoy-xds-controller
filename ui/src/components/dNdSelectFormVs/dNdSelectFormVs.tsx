import React from 'react'
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { HTTPFilterListItem, ListHTTPFiltersResponse } from '../../gen/http_filter/v1/http_filter_pb.ts'
import { ListRoutesResponse, RouteListItem } from '../../gen/route/v1/route_pb.ts'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import CircularProgress from '@mui/material/CircularProgress'
import { SortableItemDnd } from '../sortableItemDnd/sortableItemDnd.tsx'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { dNdBox, styleTooltip } from './style.ts'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import { ToolTipVs } from '../toolTipVs/toolTipVs.tsx'
import { AutocompleteRenderInputParams } from '@mui/material'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'additionalHttpFilterUids' | 'additionalRouteUids'>

interface IdNdSelectFormVsProps {
	nameField: nameFieldKeys
	data: ListHTTPFiltersResponse | ListRoutesResponse | undefined
	watch: UseFormWatch<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	isErrorFetch: boolean
	isFetching: boolean
}

export const DNdSelectFormVs: React.FC<IdNdSelectFormVsProps> = ({
	nameField,
	data,
	watch,
	control,
	setValue,
	errors,
	isFetching,
	isErrorFetch
}) => {
	const titleMessage = nameField === 'additionalHttpFilterUids' ? 'HTTP filter' : 'Route'
	const selectedUids = watch(nameField)
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

	const onDragEnd = (e: DragEndEvent) => {
		const { active, over } = e
		if (!over || active.id === over.id) return

		const oldIndex = selectedUids.indexOf(active.id.toString())
		const newIndex = selectedUids.indexOf(over.id.toString())

		setValue(nameField, arrayMove(selectedUids, oldIndex, newIndex))
	}

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
			<DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
				<SortableContext items={selectedUids} strategy={verticalListSortingStrategy}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<Tooltip
							title={`Arrange the ${titleMessage} from top to bottom..`}
							placement='bottom-start'
							enterDelay={500}
							slotProps={{ ...styleTooltip }}
						>
							<ArrowDownwardIcon sx={{ fontSize: 19, color: 'gray' }} />
						</Tooltip>
						<List sx={{ padding: 1, borderRadius: '4px', width: '100%' }}>
							{selectedUids.map(uid => {
								const item = (data?.items || []).find(el => el.uid === uid)
								return item ? (
									<SortableItemDnd
										key={uid}
										uid={uid}
										name={item.name}
										description={item.description}
									/>
								) : null
							})}
						</List>
					</Box>
				</SortableContext>
			</DndContext>
		</Box>
	)
}

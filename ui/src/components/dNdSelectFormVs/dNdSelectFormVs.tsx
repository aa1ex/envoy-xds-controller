import React from 'react'
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ListHTTPFilterResponse } from '../../gen/http_filter/v1/http_filter_pb.ts'
import { ListRouteResponse } from '../../gen/route/v1/route_pb.ts'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import Chip from '@mui/material/Chip'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import CircularProgress from '@mui/material/CircularProgress'
import { SortableItemDnd } from '../sortableItemDnd/sortableItemDnd.tsx'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { styleBox, styleTooltip } from './style.ts'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'additionalHttpFilterUids' | 'additionalRouteUids'>

interface mockData {
	items: {
		uid: string
		name: string
	}[]
}

interface IdNdSelectFormVsProps {
	nameField: nameFieldKeys
	data: ListHTTPFilterResponse | ListRouteResponse | mockData | undefined
	watch: UseFormWatch<IVirtualServiceForm>
	control: Control<IVirtualServiceForm, any>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	isErrorFetch: boolean
	isFetching: boolean
	isDisabledEdit: boolean
}

export const DNdSelectFormVs: React.FC<IdNdSelectFormVsProps> = ({
	nameField,
	data,
	watch,
	control,
	setValue,
	errors,
	isFetching,
	isErrorFetch,
	isDisabledEdit
}) => {
	const titleMessage = nameField === 'additionalHttpFilterUids' ? 'HTTP filter' : 'Route'
	const selectedUids = watch(nameField)

	const onDragEnd = (e: DragEndEvent) => {
		const { active, over } = e
		if (!over || active.id === over.id) return

		const oldIndex = selectedUids.indexOf(active.id.toString())
		const newIndex = selectedUids.indexOf(over.id.toString())

		setValue(nameField, arrayMove(selectedUids, oldIndex, newIndex))
	}
	return (
		<Box sx={{ ...styleBox }}>
			<Typography fontSize={15} color='gray' mt={1} display='flex' alignItems='center' gap={0.5}>
				Configure {titleMessage}
				<Tooltip
					title={`Select ${titleMessage}s and arrange them in the desired order.`}
					placement='bottom-start'
					enterDelay={500}
					slotProps={{ ...styleTooltip }}
				>
					<InfoOutlinedIcon fontSize='inherit' sx={{ cursor: 'pointer', fontSize: '14px' }} />
				</Tooltip>
			</Typography>
			<Controller
				name={nameField}
				control={control}
				rules={{
					validate: validationRulesVsForm[nameField]
				}}
				render={({ field }) => (
					<Autocomplete
						multiple
						options={data?.items || []}
						getOptionLabel={option => option.name}
						value={(data?.items || []).filter(item => field.value.includes(item.uid))}
						onChange={(_, newValue) => field.onChange(newValue.map(item => item.uid))}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => {
								const tagProps = getTagProps({ index })
								return <Chip {...tagProps} label={option.name} />
							})
						}
						loading={isFetching}
						disabled={!isDisabledEdit}
						renderInput={params => (
							<TextField
								{...params}
								// label={titleMessage}
								error={!!errors[nameField] || isErrorFetch}
								variant='standard'
								helperText={
									errors[nameField]?.message || (isErrorFetch && `Error loading ${titleMessage} data`)
								}
								slotProps={{
									input: {
										...params.InputProps,
										endAdornment: (
											<>
												{isFetching ? <CircularProgress color='inherit' size={20} /> : null}
												{params.InputProps?.endAdornment}
											</>
										)
									}
								}}
							/>
						)}
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
								return item ? <SortableItemDnd key={uid} uid={uid} name={item.name} /> : null
							})}
						</List>
					</Box>
				</SortableContext>
			</DndContext>
		</Box>
	)
}

import React from 'react'
import { IVirtualServiceForm } from '../virtualServiceForm/virtualServiceForm.tsx'
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ListHTTPFilterResponse } from '../../gen/http_filter/v1/http_filter_pb.ts'
import { ListRouteResponse } from '../../gen/route/v1/route_pb.ts'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { Autocomplete, Box, List, ListItem, TextField, Typography } from '@mui/material'
import { CSS } from '@dnd-kit/utilities'
import Chip from '@mui/material/Chip'
import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import { useColors } from '../../utils/hooks/useColors.ts'

type nameFieldKeys = Extract<keyof IVirtualServiceForm, 'additional_http_filter_uids' | 'additional_route_uids'>

interface mockData {
	items: {
		uid: string
		name: string
	}[]
}

interface IdNdSelectFormVsProps {
	nameField: nameFieldKeys
	data: ListHTTPFilterResponse | ListRouteResponse | mockData
	watch: UseFormWatch<IVirtualServiceForm>
	control: Control<IVirtualServiceForm, any>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
}

const SortableItem = ({ uid, name }: { uid: string; name: string }) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: uid })
	const { colors } = useColors()

	return (
		<ListItem
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			sx={{
				padding: '8px',
				marginBottom: '4px',
				backgroundColor: colors.primary[200],
				borderRadius: '4px',
				cursor: 'grab',
				transform: CSS.Transform.toString(transform),
				transition
			}}
		>
			{name} {/* Отображаем имя, но передаём uid */}
		</ListItem>
	)
}

export const DNdSelectFormVs: React.FC<IdNdSelectFormVsProps> = ({
	nameField,
	data,
	watch,
	control,
	setValue,
	errors
}) => {
	const titleMessage = nameField === 'additional_http_filter_uids' ? 'HTTP filters' : 'Routes'
	const selectedUids = watch(nameField)

	const onDragEnd = (e: DragEndEvent) => {
		const { active, over } = e
		if (!over || active.id === over.id) return

		const oldIndex = selectedUids.indexOf(active.id.toString())
		const newIndex = selectedUids.indexOf(over.id.toString())

		setValue(nameField, arrayMove(selectedUids, oldIndex, newIndex))
	}
	return (
		<Box
			sx={{
				width: '100%',
				border: '1px solid gray',
				borderRadius: 1,
				p: 2,
				pt: 0.5,
				display: 'flex',
				flexDirection: 'column',
				gap: 2
			}}
		>
			<Typography fontSize={15} color='gray' mt={1}>
				Configure filters
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
						options={data.items}
						getOptionLabel={option => option.name}
						value={data.items.filter(item => field.value.includes(item.uid))}
						onChange={(_, newValue) => field.onChange(newValue.map(item => item.uid))}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => {
								const tagProps = getTagProps({ index })
								return <Chip {...tagProps} label={option.name} />
							})
						}
						renderInput={params => (
							<TextField
								{...params}
								label={
									errors[nameField]?.message ??
									`Select the required ${titleMessage} and then install them in the required order.`
								}
								placeholder={`Select the required ${titleMessage} and then install them in the required order.`}
								error={!!errors[nameField]}
								variant='standard'
							/>
						)}
					/>
				)}
			/>

			<DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
				<SortableContext items={selectedUids} strategy={verticalListSortingStrategy}>
					<List sx={{ padding: 1, borderRadius: '4px' }}>
						{selectedUids.map(uid => {
							const item = data.items.find(el => el.uid === uid)
							return item ? <SortableItem key={uid} uid={uid} name={item.name} /> : null
						})}
					</List>
				</SortableContext>
			</DndContext>
		</Box>
	)
}

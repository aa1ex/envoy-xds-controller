import React, { useEffect, useRef, useState } from 'react'
import { useListVs } from '../../api/grpc/hooks/useVirtualService.ts'
import { MaterialReactTable, MRT_VisibilityState } from 'material-react-table'
import { useConfigTable } from './configVirtualServicesTable.tsx'
import DialogDeleteVS from '../dialogDeleteVs/dialogDeleteVs.tsx'

interface VirtualServicesTable {
	groupId: string
}

const VirtualServicesTable: React.FC<VirtualServicesTable> = ({ groupId }) => {
	const { data: virtualServices, isError, isFetching, refetch } = useListVs(true, groupId)

	const isFirstRender = useRef(true)

	const [openDialog, setOpenDialog] = useState(false)
	const [nameForDialog, setNameForDialog] = useState('')
	const [selectedUid, setSelectedUid] = useState('')
	const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})

	const { table } = useConfigTable({
		groupId,
		virtualServices,
		refetch,
		isError,
		isFetching,
		setOpenDialog,
		setNameForDialog,
		setSelectedUid
	})

	//Загрузка состояния таблицы
	useEffect(() => {
		const columnVisibility = localStorage.getItem('columnVisibility_VS')

		if (columnVisibility) {
			setColumnVisibility(JSON.parse(columnVisibility))
		}

		isFirstRender.current = false
	}, [])

	//Сохранение видимости столбцов
	useEffect(() => {
		if (!isFirstRender.current) return
		localStorage.setItem('columnVisibility_VS', JSON.stringify(columnVisibility))
	}, [columnVisibility])

	return (
		<>
			<MaterialReactTable table={table} />
			<DialogDeleteVS
				openDialog={openDialog}
				serviceName={nameForDialog}
				setOpenDialog={setOpenDialog}
				refetchServices={refetch}
				selectedUid={selectedUid}
				setSelectedUid={setSelectedUid}
			/>
		</>
	)
}

export default VirtualServicesTable

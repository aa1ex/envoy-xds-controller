import React, { useEffect, useRef, useState } from 'react'
import { useGetVirtualServices } from '../../api/grpc/hooks/useGetVirtualServices.ts'
import { MaterialReactTable, MRT_VisibilityState } from 'material-react-table'
import { useConfigTable } from './configVirtualServicesTable.tsx'
import DialogDeleteVS from '../dialogDeleteVs/dialogDeleteVs.tsx'

const VirtualServicesTable: React.FC = () => {
	const { data: virtualServices, isError, isFetching, refetch } = useGetVirtualServices()

	const [openDialog, setOpenDialog] = useState(false)
	const [nameForDialog, setNameForDialog] = useState('')
	const isFirstRender = useRef(true)
	const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})
	const { table } = useConfigTable({ virtualServices, refetch, isError, isFetching, setOpenDialog, setNameForDialog })

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
			/>
		</>
	)
}

export default VirtualServicesTable

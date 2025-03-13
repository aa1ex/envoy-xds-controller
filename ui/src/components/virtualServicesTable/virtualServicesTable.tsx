import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGetVirtualServices } from '../../api/grpc/hooks/useGetVirtualServices.ts'
import { MaterialReactTable, MRT_ColumnDef, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { VirtualServiceListItem } from '../../gen/virtual_service/v1/virtual_service_pb.ts'

const VirtualServicesTable: React.FC = () => {
	const { data: virtualServices, isError, isFetching } = useGetVirtualServices()

	const isFirstRender = useRef(true)
	const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({})

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

	const columns = useMemo<MRT_ColumnDef<VirtualServiceListItem>[]>(
		() => [
			{
				//TODO их может быт несколько
				accessorKey: 'nodeIds',
				header: 'Node IDs'
			},
			{
				accessorKey: 'name',
				header: 'Name'
			},
			{
				accessorKey: 'projectId',
				header: 'Project ID'
			},
			{
				accessorKey: 'uid',
				header: 'UID'
			}
		],
		[]
	)

	const savedColumnOrder = JSON.parse(localStorage.getItem('columnOrder') || 'null') || [
		'mrt-row-select',
		...columns.map(column => column.accessorKey)
	]
	const [columnOrder, setColumnOrder] = useState(savedColumnOrder)

	useEffect(() => {
		localStorage.setItem('columnOrder', JSON.stringify(columnOrder))
	}, [columnOrder])

	const table = useMaterialReactTable({
		columns,
		data: virtualServices?.items || [],

		enableRowActions: true,

		enableColumnResizing: true,
		enableColumnOrdering: true,

		enableStickyHeader: true,
		enableStickyFooter: true,
		enableFullScreenToggle: false,
		enableDensityToggle: false,

		state: {
			showGlobalFilter: true,
			isLoading: isFetching,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			showSkeletons: isFetching
		},

		enableGlobalFilterModes: true,
		globalFilterModeOptions: ['fuzzy', 'startsWith'],

		onColumnOrderChange: setColumnOrder,

		muiTableContainerProps: {
			sx: { overflow: 'auto', height: 'calc(100% - 120px)', minHeight: 'calc(80% - 120px)' }
		},
		muiTablePaperProps: {
			sx: { overflow: 'auto', height: '100%' }
		},
		muiTopToolbarProps: {
			sx: {
				'button[aria-label="Show/Hide search"]': {
					display: 'none'
				}
			}
		}
	})

	return <MaterialReactTable table={table} />
}

export default VirtualServicesTable

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGetVirtualServices } from '../../api/grpc/hooks/useGetVirtualServices.ts'
import { MaterialReactTable, MRT_ColumnDef, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { VirtualServiceListItem } from '../../gen/virtual_service/v1/virtual_service_pb.ts'
import { NodeIdsChip } from '../nodeIdsChip/nodeIdsChip.tsx'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

const VirtualServicesTable: React.FC = () => {
	const { data: virtualServices, isError, isFetching, refetch } = useGetVirtualServices()

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
				header: 'Node IDs',
				minSize: 250,
				size: 300,
				Cell: ({ renderedCellValue }) =>
					Array.isArray(renderedCellValue) && <NodeIdsChip nodeIsData={renderedCellValue} />
			},
			{
				accessorKey: 'name',
				header: 'Name',
				minSize: 200
			},
			{
				accessorKey: 'projectId',
				header: 'Project ID',
				minSize: 200
			},
			{
				accessorKey: 'uid',
				header: 'UID',
				minSize: 350
			}
		],
		[]
	)

	const table = useMaterialReactTable({
		columns,
		data: virtualServices?.items || [],

		enableRowActions: true,
		enableSorting: false,

		enableColumnResizing: true,

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

		globalFilterFn: 'myCustomFilterFn',

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
		},

		renderTopToolbarCustomActions: () => (
			<Box display='flex' gap={1} alignItems='center'>
				<Tooltip arrow title='Презапросить данные'>
					<IconButton onClick={() => refetch()}>
						<RefreshIcon />
					</IconButton>
				</Tooltip>

				<Button
					color='primary'
					onClick={() => alert('TODO Добавить новый VirtualService')}
					variant='contained'
					disabled={isFetching}
					size='small'
					sx={{ fontSize: 15, height: 36 }}
				>
					Добавить новый VirtualService
				</Button>
			</Box>
		)
	})

	return <MaterialReactTable table={table} />
}

export default VirtualServicesTable

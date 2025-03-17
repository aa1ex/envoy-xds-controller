import React, { useCallback, useMemo } from 'react'
import { MRT_ColumnDef, MRT_Row, useMaterialReactTable } from 'material-react-table'
import { VirtualServiceListItem } from '../../gen/virtual_service/v1/virtual_service_pb.ts'
import { NodeIdsChip } from '../nodeIdsChip/nodeIdsChip.tsx'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { ListVirtualServiceResponse } from '../../gen/virtual_service/v1/virtual_service_pb'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { Delete, Edit } from '@mui/icons-material'

interface IConfigVirtualServicesTable {
	virtualServices: ListVirtualServiceResponse | undefined
	refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<ListVirtualServiceResponse, Error>>
	isError: boolean
	isFetching: boolean
	setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
	setNameForDialog: React.Dispatch<React.SetStateAction<string>>
}

export const useConfigTable = ({
	virtualServices,
	refetch,
	isFetching,
	isError,
	setOpenDialog,
	setNameForDialog
}: IConfigVirtualServicesTable) => {
	const handleDeleteVS = useCallback(
		(row: MRT_Row<VirtualServiceListItem>) => {
			setNameForDialog(row.getValue('name'))
			setOpenDialog(true)
		},
		[setNameForDialog, setOpenDialog]
	)

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
		displayColumnDefOptions: {
			'mrt-row-actions': {
				size: 100
				// grow: false
			}
		},

		renderRowActions: ({ row }) => (
			<Box display='flex' gap={1}>
				<Tooltip placement='top-end' title='Edit Virtual Service'>
					<IconButton onClick={() => console.log(row)}>
						<Edit />
					</IconButton>
				</Tooltip>

				<Tooltip placement='top-end' title='Remove Virtual Service'>
					<IconButton onClick={() => handleDeleteVS(row)}>
						<Delete color='error' />
					</IconButton>
				</Tooltip>
			</Box>
		),

		renderTopToolbarCustomActions: () => (
			<Box display='flex' gap={1} alignItems='center'>
				<Tooltip arrow title='Re-request data'>
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
					Add VirtualService
				</Button>
			</Box>
		)
	})

	return { columns, table }
}

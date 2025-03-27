import React from 'react'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import Dialog from '@mui/material/Dialog'
import { Button, DialogActions, DialogTitle } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import { ListVirtualServiceResponse } from '../../gen/virtual_service/v1/virtual_service_pb.ts'
import { useDeleteVs } from '../../api/grpc/hooks/useDeleteVs.ts'

interface IDialogDeleteVSProps {
	serviceName: string
	openDialog: boolean
	setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
	refetchServices: (
		options?: RefetchOptions | undefined
	) => Promise<QueryObserverResult<ListVirtualServiceResponse, Error>>
	selectedUid: string
	setSelectedUid: React.Dispatch<React.SetStateAction<string>>
}

const DialogDeleteVS: React.FC<IDialogDeleteVSProps> = ({
	serviceName,
	openDialog,
	setOpenDialog,
	refetchServices,
	selectedUid,
	setSelectedUid
}) => {
	//TODO тут хук удаления
	const { deleteVirtualService } = useDeleteVs()

	const handleConfirmDelete = async () => {
		if (!selectedUid.trim()) return

		await deleteVirtualService(selectedUid)
		setOpenDialog(false)
		await refetchServices()
		setSelectedUid('')
	}

	const handleCloseDialog = () => {
		setOpenDialog(false)
		setSelectedUid('')
	}

	return (
		<>
			<Dialog open={openDialog} onClose={handleCloseDialog}>
				<DialogTitle>Remove Virtual Service</DialogTitle>
				<DialogContent>Are you sure you want to delete this VS: {serviceName.toUpperCase()}?</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog} color='primary'>
						Cancel
					</Button>
					<Button onClick={handleConfirmDelete} color='error' autoFocus>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default DialogDeleteVS

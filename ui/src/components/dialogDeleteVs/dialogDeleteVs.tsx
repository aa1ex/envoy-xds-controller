import React from 'react'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import Dialog from '@mui/material/Dialog'
import { Button, DialogActions, DialogTitle } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import { ListVirtualServiceResponse } from '../../gen/virtual_service/v1/virtual_service_pb.ts'

interface IDialogDeleteVSProps {
	serviceName: string
	openDialog: boolean
	setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
	refetchServices: (
		options?: RefetchOptions | undefined
	) => Promise<QueryObserverResult<ListVirtualServiceResponse, Error>>
}

const DialogDeleteVS: React.FC<IDialogDeleteVSProps> = ({
	serviceName,
	openDialog,
	setOpenDialog,
	refetchServices
}) => {
	//TODO тут хук удаления

	const handleConfirmDelete = async () => {
		setOpenDialog(false)
		alert('Заглушка после удаления данные таблицы перезапросятся')
		await refetchServices()
	}

	const handleCloseDialog = () => {
		setOpenDialog(false)
	}

	return (
		<>
			<Dialog open={openDialog} onClose={handleCloseDialog}>
				<DialogTitle>Remove Virtual Service</DialogTitle>
				<DialogContent>Are you sure you want to delete this VS: {serviceName}?</DialogContent>
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

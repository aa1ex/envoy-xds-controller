import { Alert, Snackbar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { FieldErrors } from 'react-hook-form'

interface IErrorSnackBarVsProps {
	errors: FieldErrors<any>
	errorUpdateVs: Error | null
	errorCreateVs: Error | null
	isSubmitted: boolean
}

export const ErrorSnackBarVs: React.FC<IErrorSnackBarVsProps> = ({
	errors,
	errorUpdateVs,
	errorCreateVs,
	isSubmitted
}) => {
	const [open, setOpen] = useState(false)
	const [message, setMessage] = useState('')
	const [severity, setSeverity] = useState<'error' | 'warning'>('warning')
	const [autoHideDuration, setAutoHideDuration] = useState<number | null>(3000)

	useEffect(() => {
		if (isSubmitted) {
			if (Object.keys(errors).length > 0) {
				const errorMessages = Object.values(errors)
					.map((error: any) => error.message)
					.join('\n')

				setMessage(errorMessages)
				setSeverity('warning')
				setAutoHideDuration(3000)
				setOpen(true)
			} else if (errorUpdateVs || errorCreateVs) {
				setMessage(errorUpdateVs?.message || errorCreateVs?.message || 'An error occurred')
				setSeverity('error')
				setAutoHideDuration(null)
				setOpen(true)
			}
		}
	}, [errors, errorUpdateVs, errorCreateVs, isSubmitted])

	const handleClose = () => setOpen(false)

	return (
		<Snackbar
			open={open}
			autoHideDuration={autoHideDuration}
			onClose={handleClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
		>
			<Alert onClose={handleClose} severity={severity} variant='filled' sx={{ width: '50%' }}>
				{message}
			</Alert>
		</Snackbar>
	)
}

import React from 'react'
import { Box, Popover, Typography } from '@mui/material'
import { Item } from '../autocompleteVs/autocompleteVs.tsx'

interface PopoverForOptionProps {
	anchorEl: HTMLElement | null
	option: Item | null
	onClose: () => void
}

export const PopoverForOption: React.FC<PopoverForOptionProps> = ({ anchorEl, option, onClose }) => {
	const open = Boolean(anchorEl)

	return (
		<Popover
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'left'
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'left'
			}}
		>
			<Box p={2}>
				<Typography variant='subtitle2'>Код элемента:</Typography>
				<Typography variant='body2'>{option?.description}</Typography>
			</Box>
		</Popover>
	)
}

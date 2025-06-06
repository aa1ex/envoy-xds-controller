import React from 'react'
import { ItemVs } from './autocompleteVs.tsx'
import { ClickAwayListener, Popper } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ItemDnd } from '../dNdSelectFormVs/dNdSelectFormVs.tsx'

interface IPopoverOptionProps {
	anchorEl: HTMLElement | null
	option: ItemVs | ItemDnd | null
	onClose: () => void
}

export const PopoverOption: React.FC<IPopoverOptionProps> = ({ anchorEl, option, onClose }) => {
	const isOpen = option && anchorEl && document.body.contains(anchorEl)

	if (!isOpen || !anchorEl) return null

	return (
		<ClickAwayListener onClickAway={onClose}>
			<Popper
				open={Boolean(anchorEl && option)}
				anchorEl={anchorEl}
				placement='right'
				disablePortal={false}
				style={{ zIndex: 1300 }}
				onClick={e => e.stopPropagation()}
			>
				{option && (
					<Box
						sx={{
							bgcolor: 'background.paper',
							boxShadow: 3,
							borderRadius: 1,
							p: 1,
							minWidth: 200,
							userSelect: 'text'
						}}
					>
						<Typography variant='subtitle2'>Код элемента:</Typography>
						<Typography variant='body2'>{option.description}</Typography>
						<Box
							component='button'
							onClick={onClose}
							sx={{
								mt: 1,
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								color: '#1976d2',
								':hover': { textDecoration: 'underline' }
							}}
						>
							Закрыть
						</Box>
					</Box>
				)}
			</Popper>
		</ClickAwayListener>
	)
}

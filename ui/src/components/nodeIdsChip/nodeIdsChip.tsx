import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import React, { useState } from 'react'
import { Box, IconButton, Menu, MenuItem } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface INodeIdsChipProps {
	nodeIsData: string[]
}

export const NodeIdsChip: React.FC<INodeIdsChipProps> = ({ nodeIsData }) => {
	const MAX_VISIBLE = 2
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)

	const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 1,
				overflow: 'hidden'
			}}
		>
			<Stack direction='row' spacing={1} sx={{ flexGrow: 1, overflow: 'hidden' }}>
				{nodeIsData.slice(0, MAX_VISIBLE).map((item, index) => (
					<Chip key={index} label={item} />
				))}
			</Stack>

			{nodeIsData.length > MAX_VISIBLE && (
				<>
					<IconButton size='small' onClick={handleOpen}>
						<ExpandMoreIcon />
					</IconButton>
					<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
						{nodeIsData.slice(MAX_VISIBLE).map((item, index) => (
							<MenuItem key={index} onClick={handleClose}>
								<Chip key={index} label={item} />
							</MenuItem>
						))}
					</Menu>
				</>
			)}
		</Box>
	)
}

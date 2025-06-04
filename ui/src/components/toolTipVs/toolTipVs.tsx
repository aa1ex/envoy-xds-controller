import React from 'react'
import Tooltip from '@mui/material/Tooltip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Typography from '@mui/material/Typography'
import { toolTipVs, toolTipVsTypography } from './style.ts'

interface IToolTipVsProps {
	titleMessage: string
}

export const ToolTipVs: React.FC<IToolTipVsProps> = ({ titleMessage }) => {
	return (
		<Typography className='toolTipVs' sx={{ ...toolTipVsTypography }}>
			{titleMessage}
			<Tooltip
				title={`Select ${titleMessage.slice(0, -1)}.`}
				placement='bottom-start'
				enterDelay={800}
				disableInteractive
				slotProps={{ ...toolTipVs }}
			>
				<InfoOutlinedIcon fontSize='inherit' sx={{ cursor: 'pointer', fontSize: '14px' }} />
			</Tooltip>
		</Typography>
	)
}

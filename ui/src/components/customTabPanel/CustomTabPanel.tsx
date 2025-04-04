import Box from '@mui/material/Box'
import React from 'react'

interface ICustomTabPanelProps {
	children?: React.ReactNode
	index: number
	value: number
	variant?: string
}

function CustomTabPanel(props: ICustomTabPanelProps) {
	const { children, value, index, variant = 'simple', ...other } = props

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`${variant}-tabpanel-${index}`}
			aria-labelledby={`${variant}-tab-${index}`}
			style={{ width: '100%' }}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 1 }} height='100%'>
					<Box
						className='Costyl style Pane'
						sx={{
							...(variant === 'vertical' && {
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								pl: 1,
								height: '100%'
							})
						}}
					>
						{children}
					</Box>
				</Box>
			)}
		</div>
	)
}

export default CustomTabPanel

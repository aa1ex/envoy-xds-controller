import React, { useState } from 'react'
import {
	Control,
	Controller,
	FieldErrors,
	UseFormClearErrors,
	UseFormSetError,
	UseFormSetValue,
	UseFormWatch
} from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { styleBox, styleTooltip } from '../multiChipFormVS/style.ts'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'

import { validationRulesVsForm } from '../../utils/helpers/validationRulesVsForm.ts'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import DeleteIcon from '@mui/icons-material/Delete'

interface IVirtualHostDomainsProps {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
	watch: UseFormWatch<IVirtualServiceForm>
}

export const VirtualHostDomains: React.FC<IVirtualHostDomainsProps> = ({
	control,
	errors,
	setError,
	clearErrors,
	setValue,
	watch
}) => {
	const [newDomain, setNewDomain] = useState('')

	const addDomain = () => {
		const errorMessage = validationRulesVsForm.virtualHostDomains([newDomain])

		if (errorMessage === true) {
			const currentDomains = watch('virtualHostDomains')
			setValue('virtualHostDomains', [...currentDomains, newDomain])
			setNewDomain('')
			clearErrors('virtualHostDomains')
		} else {
			setError('virtualHostDomains', { type: 'manual', message: errorMessage })
			setNewDomain('')
		}
	}

	const removeDomain = (index: number) => {
		const domains = watch('virtualHostDomains')
		domains.splice(index, 1)
		setValue('virtualHostDomains', [...domains])
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addDomain()
		}
	}

	return (
		<Box sx={{ ...styleBox }}>
			<Typography fontSize={15} color='gray' mt={1} display='flex' alignItems='center' gap={0.5}>
				Configure the Domains
				<Tooltip
					title={`Enter Domain. Press Enter to add it to the list.`}
					placement='bottom-start'
					enterDelay={800}
					disableInteractive
					slotProps={{ ...styleTooltip }}
				>
					<InfoOutlinedIcon fontSize='inherit' sx={{ cursor: 'pointer', fontSize: '14px' }} />
				</Tooltip>
			</Typography>

			<Box display='flex' width='100%' alignItems='center'>
				<Controller
					name='virtualHostDomains'
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							value={newDomain}
							onChange={e => setNewDomain(e.target.value)}
							variant='standard'
							onKeyDown={handleKeyPress}
							style={{ flex: 1 }}
							error={!!errors.virtualHostDomains}
							helperText={errors.virtualHostDomains?.message}
						/>
					)}
				/>
				<Button
					variant='contained'
					onClick={addDomain}
					style={{ flexShrink: 0, marginLeft: '10px', marginRight: '10px' }}
				>
					Add Domain
				</Button>
				<Button variant='outlined' style={{ flexShrink: 0 }}>
					Another Button
				</Button>
			</Box>

			<Box mt={1}>
				{watch('virtualHostDomains').map((domain, index) => (
					<Card key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
						<CardContent
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								width: '100%',
								alignItems: 'center',
								height: '100%',
								padding: '8px'
							}}
						>
							<Typography>{domain}</Typography>
							<IconButton onClick={() => removeDomain(index)} color='secondary'>
								<DeleteIcon />
							</IconButton>
						</CardContent>
					</Card>
				))}
			</Box>
		</Box>
	)
}

export default VirtualHostDomains

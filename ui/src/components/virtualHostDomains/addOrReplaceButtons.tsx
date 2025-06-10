import React from 'react'
import Button from '@mui/material/Button'
import { ButtonGroup, Tooltip } from '@mui/material'
import { Control, UseFormSetValue, useWatch } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { useVHDomainsTemplateOptions } from '../../utils/hooks/useVHDomainsTemplateOptions.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'

interface IAddOrReplaceButtonsProps {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
}

export const AddOrReplaceButtons: React.FC<IAddOrReplaceButtonsProps> = ({ control, setValue }) => {
	const readMode = useViewModeStore(state => state.viewMode) === 'read'
	const templateUid = useWatch({ control, name: 'templateUid' })
	const isReplaceMode = useWatch({ control, name: 'virtualHostDomainsMode' })

	useVHDomainsTemplateOptions({ control, setValue })

	if (readMode || !templateUid) return null

	return (
		<ButtonGroup variant='contained' size='small' sx={{ height: '1.5rem' }}>
			<Tooltip title='Mode when the entered domains will be ADDED to the existing ones'>
				<Button
					onClick={() => setValue('virtualHostDomainsMode', false)}
					color={!isReplaceMode ? 'primary' : 'inherit'}
				>
					Add
				</Button>
			</Tooltip>
			<Tooltip title='A mode where the entered domains will be REPLACED by the existing ones'>
				<Button
					onClick={() => setValue('virtualHostDomainsMode', true)}
					color={isReplaceMode ? 'primary' : 'inherit'}
				>
					Rep
				</Button>
			</Tooltip>
		</ButtonGroup>
	)
}

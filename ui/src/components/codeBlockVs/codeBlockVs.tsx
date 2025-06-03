import React, { memo } from 'react'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import { CodeEditorVs } from '../codeEditorVs/codeEditorVs.tsx'
import Box from '@mui/material/Box'
import { codeBlockVs } from './style.ts'
import { Control, useWatch } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'

interface ICodeBlockVsProps {
	rawDataTemplate: string | undefined
	rawDataPreview: string | undefined
	isLoadingFillTemplate: boolean
	control: Control<IVirtualServiceForm>
	isCreateMode: boolean
}

export const CodeBlockVs: React.FC<ICodeBlockVsProps> = memo(
	({ rawDataTemplate, rawDataPreview, isLoadingFillTemplate, isCreateMode, control }) => {
		const templateUid = useWatch({ control, name: 'templateUid' })

		const renderContent = () => {
			if (isCreateMode && !templateUid) {
				return (
					<Typography align='center' variant='h3'>
						For a preview, select a template
					</Typography>
				)
			}
			if (isLoadingFillTemplate) {
				return <CircularProgress size={100} />
			}

			if (rawDataTemplate) {
				return (
					<Fade in timeout={300}>
						<div style={{ width: '100%', height: '100%' }}>
							<CodeEditorVs raw={rawDataTemplate} />
						</div>
					</Fade>
				)
			}
			if (!isCreateMode && !templateUid && rawDataPreview) {
				return (
					<div style={{ width: '100%', height: '100%' }}>
						<CodeEditorVs raw={rawDataPreview} />
					</div>
				)
			}
		}

		return (
			<Box className='codeBlockVs' sx={{ ...codeBlockVs }}>
				{renderContent()}
			</Box>
		)
	}
)

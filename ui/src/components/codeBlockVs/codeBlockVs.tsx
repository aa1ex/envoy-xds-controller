import React from 'react'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import { CodeEditorVs } from '../codeEditorVs/codeEditorVs.tsx'
import Box from '@mui/material/Box'
import { codeBlockVs } from './style.ts'
import { FillTemplateResponse } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'
import { UseFormWatch } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'

interface ICodeBlockVsProps {
	rawData: FillTemplateResponse | undefined
	isLoadingFillTemplate: boolean
	watch: UseFormWatch<IVirtualServiceForm>
	isCreateMode: boolean
}

export const CodeBlockVs: React.FC<ICodeBlockVsProps> = ({ rawData, isLoadingFillTemplate, watch, isCreateMode }) => {
	console.log(isCreateMode)
	return (
		<Box className='codeBlockVs' sx={{ ...codeBlockVs }}>
			{!watch('templateUid') ? (
				<Typography align='center' variant='h3'>
					For a preview, select a template
				</Typography>
			) : isLoadingFillTemplate ? (
				<CircularProgress />
			) : rawData ? (
				<Fade in timeout={300}>
					<div style={{ width: '100%', height: '100%' }}>
						<CodeEditorVs raw={rawData} />
					</div>
				</Fade>
			) : (
				<Typography align='center' variant='h4' color='warning'>
					Some template options are incomplete. Please finish configuring them to preview
				</Typography>
			)}
		</Box>
	)
}

import VirtualServicesTable from '../../components/virtualServicesTable/virtualServicesTable.tsx'
import { Box } from '@mui/material'
import { styleBox, styleRootBoxVirtualService } from './style.ts'
import { useColors } from '../../utils/hooks/useColors.ts'

function VirtualServices() {
	const { colors } = useColors()

	return (
		<Box
			className='RootBoxVirtualServices'
			component='section'
			sx={{ ...styleRootBoxVirtualService, backgroundColor: colors.primary[800] }}
		>
			<Box sx={{ ...styleBox }}>
				<VirtualServicesTable />
			</Box>
		</Box>
	)
}

export default VirtualServices

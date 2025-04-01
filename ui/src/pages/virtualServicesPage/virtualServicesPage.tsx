import VirtualServicesTable from '../../components/virtualServicesTable/virtualServicesTable.tsx'
import Box from '@mui/material/Box'
import { styleBox, styleRootBoxVirtualService } from './style.ts'
import { useColors } from '../../utils/hooks/useColors.ts'

function VirtualServicesPage() {
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

export default VirtualServicesPage

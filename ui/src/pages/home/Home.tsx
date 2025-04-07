import Box from '@mui/material/Box'
import { useNodeIDs } from '../../api/hooks/useNodeIDsApi'
import AccessOrNodeCard from '../../components/accessOrNodeCard/accessOrNodeCard.tsx'
import Spinner from '../../components/spinner/Spinner'
import { useColors } from '../../utils/hooks/useColors'
import { styleRootBox, styleWrapperCards } from './style'

const Home = () => {
	const { colors } = useColors()

	const { data: nodes, isFetching } = useNodeIDs()

	const renderCards = nodes?.map(node => <AccessOrNodeCard entity={node} key={node} />)

	return (
		<Box component='section' sx={{ ...styleRootBox, backgroundColor: colors.primary[800] }}>
			{!isFetching ? <Box sx={{ ...styleWrapperCards }}>{renderCards}</Box> : <Spinner />}
		</Box>
	)
}
export default Home

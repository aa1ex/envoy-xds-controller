import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface INodeCard {
	node: string
}

function NodeCard({ node }: INodeCard) {
	const navigate = useNavigate()

	const openNodeZoneInfo = useCallback(
		(nodeID: string) => {
			navigate(`${nodeID}`)
		},
		[navigate]
	)

	return (
		<Card key={node}>
			<CardActionArea onClick={() => openNodeZoneInfo(node)} sx={{ height: '100%' }}>
				<CardContent>
					<Typography gutterBottom variant='h5' component='div' margin={0}>
						{node}
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}

export default NodeCard

import EnvoyIcon from '../iconsSvg/envoyIcon/EnvoyIcon'
import { VirtualServicesIcon } from '../iconsSvg/virtualServicesIcon/virtualServicesIcon.tsx'

const navMenuItems = [
	{
		id: 1,
		name: 'Envoy Configs',
		icon: <EnvoyIcon />,
		path: '/nodeIDs'
	},
	{
		id: 2,
		name: 'VirtualServices',
		icon: <VirtualServicesIcon />,
		path: '/virtualServices'
	}
]

export default navMenuItems

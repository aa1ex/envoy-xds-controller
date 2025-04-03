export function a11yProps(index: number, variant: string = 'simple') {
	return {
		id: `${variant}-tab-${index}`,
		'aria-controls': `${variant}-tabpanel-${index}`
	}
}

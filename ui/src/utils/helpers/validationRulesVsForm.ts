import { IVirtualServiceForm } from '../../components/virtualServiceForm/virtualServiceForm.tsx'

export const validationRulesVsForm: Record<keyof IVirtualServiceForm, (value: string | string[]) => string | true> = {
	name: value => {
		if (typeof value !== 'string') return 'Invalid value'
		if (value.length < 3) return 'Name must be at least 3 characters long'
		if (value.length > 50) return 'Name must be at most 50 characters long'
		if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Name must contain only letters, numbers, hyphens, and underscores'
		return true
	},
	node_ids: value => {
		if (!Array.isArray(value) || value.length === 0) return 'The NodeIds field is required, enter at least one node'
		const invalidNodeIds = value.filter(tag => !/^[a-zA-Z0-9_-]+$/.test(tag))
		if (invalidNodeIds.length > 0) return 'NodeIds must contain only letters, numbers, hyphens, and underscores'
		return true
	}
}

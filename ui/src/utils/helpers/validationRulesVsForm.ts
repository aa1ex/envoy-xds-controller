import { ITemplateOption, IVirtualServiceForm } from '../../components/virtualServiceForm/types.ts'

export const validationRulesVsForm: Record<
	keyof IVirtualServiceForm,
	(value: string | string[] | boolean | null | ITemplateOption[]) => string | true
> = {
	name: value => {
		if (typeof value !== 'string') return 'Invalid value'
		if (value.length < 3) return 'Name must be at least 3 characters long'
		if (value.length > 50) return 'Name must be at most 50 characters long'
		if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Name must contain only letters, numbers, hyphens, and underscores'
		return true
	},
	nodeIds: value => {
		if (!Array.isArray(value)) return 'Invalid value for NodeIds, expected an array'
		if (value.length === 0) return 'The NodeIds field is required, enter at least one node'
		for (const nodeId of value) {
			if (typeof nodeId !== 'string') return 'Each nodeId must be a string'
			if (!/^[a-zA-Z0-9_-]+$/.test(nodeId))
				return 'NodeIds must contain only letters, numbers, hyphens, and underscores'
		}
		return true
	},
	accessGroup: value => {
		if (typeof value !== 'string') return 'The Access Group field is required'
		return true
	},
	templateUid: value => {
		if (typeof value !== 'string') return 'The Template field is required'
		return true
	},
	listenerUid: value => {
		if (typeof value !== 'string') return 'The Listener field is required'
		return true
	},
	vhDomains: value => {
		if (!Array.isArray(value)) return 'Invalid value for Domains Virtual Host, expected an array'
		if (value.length === 0) return 'The Domains Virtual Host field is required, enter at least one node'
		for (const virtualHost of value) {
			if (typeof virtualHost !== 'string') return 'Each Domains Virtual Host must be a string'
			if (!/^[a-zA-Z0-9_.-]+$/.test(virtualHost)) {
				return 'Domains Virtual Host must contain only letters, numbers, hyphens, and underscores'
			}
		}
		return true
	},
	accessLogConfigUid: value => {
		if (typeof value !== 'string') return 'The AccessLogConfig field is required'
		return true
	},
	additionalHttpFilterUids: value => {
		if (!Array.isArray(value)) return 'HTTPS_filters must be an array'
		return true
	},
	additionalRouteUids: value => {
		if (!Array.isArray(value)) return 'Routes must be an array'
		return true
	},
	useRemoteAddress: value => {
		if (value !== null && typeof value !== 'boolean') {
			return 'Use Remote Address must be a boolean or null'
		}
		return true
	},
	templateOptions: value => {
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				const option = value[i]

				if (typeof option !== 'object' || !option) {
					return 'Invalid option structure'
				}

				if (option.field && !/^[a-zA-Z0-9_./-]+$/.test(option.field)) {
					return 'Path must only contain letters, numbers, hyphens, underscores, slashes, and dots.'
				}

				// if (option.modifier && typeof option.modifier !== 'number') {
				// 	return 'Modifier must be a number.'
				// }

				if (option.field && option.modifier === 0) {
					return 'You specified the path but did not select the modification.'
				}
				if (option.modifier && !option.field) {
					return 'You have selected a modification but have not specified the path.'
				}
			}
		} else {
			return 'Template options must be an array'
		}

		return true
	}
}

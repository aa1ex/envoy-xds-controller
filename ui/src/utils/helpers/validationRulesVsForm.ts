import { ITemplateOption, IVirtualServiceForm } from '../../components/virtualServiceForm/virtualServiceForm.tsx'

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
	node_ids: value => {
		if (!Array.isArray(value)) return 'Invalid value for NodeIds, expected an array'
		if (value.length === 0) return 'The NodeIds field is required, enter at least one node'
		for (const nodeId of value) {
			if (typeof nodeId !== 'string') return 'Each nodeId must be a string'
			if (!/^[a-zA-Z0-9_-]+$/.test(nodeId))
				return 'NodeIds must contain only letters, numbers, hyphens, and underscores'
		}
		return true
	},
	project_id: value => {
		if (typeof value !== 'string') return 'Invalid value'
		if (value.length > 80) return 'Project ID must be at most 80 characters long'
		if (!/^[a-zA-Z0-9_-]+$/.test(value))
			return 'Project ID must contain only letters, numbers, hyphens, and underscores'
		return true
	},
	template_uid: value => {
		if (typeof value !== 'string') return 'The TemplateVS field is required'
		return true
	},
	listener_uid: value => {
		if (typeof value !== 'string') return 'The ListenerVS field is required'
		return true
	},
	vh_name: value => {
		if (typeof value !== 'string') return 'Invalid value'
		if (value.length < 3) return 'Name Virtual Host must be at least 3 characters long'
		if (value.length > 50) return 'Name Virtual Host must be at most 50 characters long'
		if (!/^[a-zA-Z0-9_-]+$/.test(value))
			return 'Name Virtual Host must contain only letters, numbers, hyphens, and underscores'
		return true
	},
	vh_domains: value => {
		if (!Array.isArray(value)) return 'Invalid value for Domains Virtual Host, expected an array'
		if (value.length === 0) return 'The Domains Virtual Host field is required, enter at least one node'
		for (const virtualHost of value) {
			if (typeof virtualHost !== 'string') return 'Each Domains Virtual Host must be a string'
			if (!/^[a-zA-Z0-9_-]+$/.test(virtualHost)) {
				return 'Domains Virtual Host must contain only letters, numbers, hyphens, and underscores'
			}
		}
		return true
	},
	access_log_config: value => {
		if (typeof value !== 'string') return 'The AccessLogConfig field is required'
		return true
	},
	additional_http_filter_uids: value => {
		if (!Array.isArray(value) || value.length === 0) return 'The HTTPS_filters field is required'
		return true
	},
	additional_route_uids: value => {
		if (!Array.isArray(value) || value.length === 0) return 'The Routes field is required'
		return true
	},
	use_remote_address: value => {
		if (value !== null && typeof value !== 'boolean') {
			return 'Use Remote Address must be a boolean or null'
		}
		return true
	},
	template_options: value => {
		// Проверка, что value - это массив ITemplateOption
		console.log(value)
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				const option = value[i]

				// Убедимся, что option - это объект типа ITemplateOption, а не строка
				if (typeof option !== 'string') {
					// Проверка, если modifier есть, но нет field
					if (option.modifier && !option.field) {
						return 'Please specify field when modifier is selected'
					}

					// Проверка, если field есть, но нет modifier
					if (option.field && !option.modifier) {
						return 'Please select a modifier when field is specified'
					}
				}
			}
		}

		return true
	}
}

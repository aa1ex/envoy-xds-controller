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
		for (const nodeId of value) {
			if (!/^[a-zA-Z0-9_-]+$/.test(nodeId)) {
				return 'NodeIds must contain only letters, numbers, hyphens, and underscores'
			}
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
		if (!Array.isArray(value) || value.length === 0)
			return 'The Domains Virtual Host field is required, enter at least one node'
		for (const nodeId of value) {
			if (!/^[a-zA-Z0-9_-]+$/.test(nodeId)) {
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
		if (typeof value !== 'string') return 'The Routes field is required'
		return true
	}
}

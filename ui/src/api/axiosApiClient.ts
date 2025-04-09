import axios from 'axios'
import { env } from '../env.ts'

const axiosClient = axios.create({
	baseURL: env.VITE_ROOT_API_URL || '/api/v1',
	headers: { 'Content-Type': 'application/json' }
})

// export function setAccessToken(token: string | undefined) {
// 	axiosClient.interceptors.request.use(
// 		config => {
// 			config.headers['Authorization'] = `Bearer ${token}`
// 			return config
// 		},
// 		error => {
// 			return Promise.reject(error)
// 		}
// 	)
// }
//
// export const setToken = (token: string | undefined) => {
// 	if (token) sessionStorage.setItem('token', token)
// }

axiosClient.interceptors.request.use(config => {
	const sessionData = sessionStorage.getItem(`oidc.user:${env.VITE_OIDC_AUTHORITY}:envoy-xds-controller`)
	let accessToken
	if (sessionData) {
		try {
			const parsed = JSON.parse(sessionData)
			accessToken = parsed.access_token
		} catch (e) {
			console.error('Failed to parse token:', e)
		}
	}
	if (config?.headers && accessToken) config.headers.Authorization = `Bearer ${accessToken}`

	return config
})

export default axiosClient

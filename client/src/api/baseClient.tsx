import axios from 'axios'

export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const tokenStorage = {
	getAccessToken(): string | null {
		return localStorage.getItem(ACCESS_TOKEN_KEY)
	},

	getRefreshToken(): string | null {
		return localStorage.getItem(REFRESH_TOKEN_KEY)
	},

	setTokens(accessToken: string, refreshToken: string): void {
		localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
		localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
	},

	clearTokens(): void {
		localStorage.removeItem(ACCESS_TOKEN_KEY)
		localStorage.removeItem(REFRESH_TOKEN_KEY)
	},
}

export const baseClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
})

export { API_BASE_URL }

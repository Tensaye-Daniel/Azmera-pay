import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '../store/auth'

export const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined
    const { refreshToken, setSession, logout } = useAuthStore.getState()

    const isAuthRequest = original?.url?.includes('/auth/')
    const isUnauthorized = error.response?.status === 401

    if (
      isUnauthorized &&
      original &&
      !original._retry &&
      !isAuthRequest &&
      refreshToken
    ) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/v1/auth/token/refresh', {
          refresh: refreshToken,
        })
        setSession(data.access, refreshToken)
        const headers = AxiosHeaders.from(original.headers)
        headers.set('Authorization', `Bearer ${data.access}`)
        original.headers = headers
        return client(original)
      } catch {
        logout()
      }
    }
    return Promise.reject(error)
  },
)
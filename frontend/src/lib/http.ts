import axios from 'axios'

export const STORAGE_KEYS = {
  token: 'computer-store-token',
  user: 'computer-store-user',
} as const

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default http

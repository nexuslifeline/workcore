import axios from 'axios'
import { toast } from 'sonner'
import { getApiErrorMessage, getHttpErrorFallback } from '@/lib/api-error-message'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens and organization ID
api.interceptors.request.use(
  (config) => {
    // Add active organization ID from localStorage (set by organization store)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('active-organization-id')
        if (stored) {
          // Zustand persist stores data as JSON with {state: {...}, version: 0}
          const parsed = JSON.parse(stored)
          const activeOrgId = parsed?.state?.activeOrganizationId || parsed?.activeOrganizationId || parsed
          if (activeOrgId && typeof activeOrgId === 'string') {
            config.headers['X-Organization-Id'] = activeOrgId
          }
        }
      } catch (_error) {
        // If parsing fails, try to use the raw value (fallback for non-JSON storage)
        const activeOrgId = localStorage.getItem('active-organization-id')
        if (activeOrgId && activeOrgId.length === 36) {
          // UUID format check (basic validation)
          config.headers['X-Organization-Id'] = activeOrgId
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.skipErrorToast) {
      return Promise.reject(error)
    }
    const status = error.response?.status as number | undefined
    if (status && status >= 400) {
      toast.error(getApiErrorMessage(error.response?.data, getHttpErrorFallback(status)))
    } else if (!error.response && error.code !== 'ERR_CANCELED') {
      toast.error('Unable to connect. Check your network and try again.')
    }
    return Promise.reject(error)
  }
)









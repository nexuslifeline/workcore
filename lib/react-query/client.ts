import { QueryCache, QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { handleServerError } from '../handle-server-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount >= 0 && process.env.NODE_ENV === 'development')
          return false
        if (failureCount > 3 && process.env.NODE_ENV === 'production')
          return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          const redirect = window.location.href
          window.location.href = `/sign-in?redirect=${encodeURIComponent(redirect)}`
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          if (process.env.NODE_ENV === 'production') {
            window.location.href = '/500'
          }
        }
        if (error.response?.status === 403) {
          // Handle forbidden
        }
      }
    },
  }),
})









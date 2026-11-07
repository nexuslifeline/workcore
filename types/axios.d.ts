import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** When true, the api interceptor does not toast — caller owns the error toast. */
    skipErrorToast?: boolean
  }
}

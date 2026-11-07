type ApiErrorBody = {
  error?: unknown
  message?: unknown
}

/**
 * App JSON errors use `{ error: string }` (`errorResponse` / `badRequestResponse`).
 * `message` is a fallback for other shapes.
 */
function humanizeApiError(message: string): string {
  const normalized = message.trim()
  if (normalized.toLowerCase() === 'unauthorized') return 'Please sign in again.'
  if (normalized.toLowerCase() === 'forbidden') return 'You do not have permission to do that.'
  return normalized
}

export function getApiErrorMessage(data: unknown, fallback = 'Request failed'): string {
  if (!data || typeof data !== 'object') return fallback
  const body = data as ApiErrorBody
  if (typeof body.error === 'string' && body.error.trim() !== '') {
    return humanizeApiError(body.error)
  }
  if (typeof body.message === 'string' && body.message.trim() !== '') {
    return humanizeApiError(body.message)
  }
  return fallback
}

/** Status-only copy when the API body has no `error` / `message`. */
export function getHttpErrorFallback(status: number): string {
  if (status === 401) return 'Please sign in again.'
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 404) return 'The requested item was not found.'
  if (status === 409) return 'This change conflicts with existing data.'
  if (status === 429) return 'Too many requests. Please try again shortly.'
  if (status === 400 || status === 422) return 'Please check your input and try again.'
  if (status >= 500) return 'Something went wrong. Please try again.'
  return 'Request failed'
}

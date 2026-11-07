import { NextResponse } from 'next/server'
import { isOptionalNonNegativeNumber } from '@/lib/shared/validation/optional-non-negative-number'

// Re-export NextResponse for convenience
export { NextResponse }

/**
 * Return unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Return no-permission response (403)
 */
export function noPermissionResponse() {
  return NextResponse.json({ error: 'You don\'t have permission to perform this action.' }, { status: 403 })
}

/**
 * Return error response with status code
 */
export function errorResponse(
  message: string,
  status: number = 500,
  error?: unknown
) {
  if (error) {
    // eslint-disable-next-line no-console
    console.error(message, error)
  }
  return NextResponse.json({ error: message }, { status })
}

/**
 * Return not found response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

/**
 * Return bad request response
 */
export function badRequestResponse(message: string, errors?: unknown) {
  return NextResponse.json({ error: message, errors }, { status: 400 })
}

/**
 * If `value` is present, returns a 400 response when it fails {@link isOptionalNonNegativeNumber}.
 * Use for optional numeric body fields (prices, quantities, etc.).
 */
export function nonNegativeFieldError(
  label: string,
  value: unknown
): NextResponse | null {
  // Treat "absent" values as valid for optional fields
  if (value === undefined || value === null) return null
  if (typeof value === 'string' && value.trim() === '') return null

  // Provide a clearer error for invalid numbers vs negatives
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.trim())
        : Number(value)

  if (Number.isNaN(n)) {
    return badRequestResponse(`${label} must be a valid number`)
  }
  if (n < 0) {
    return badRequestResponse(`${label} cannot be negative`)
  }

  // Fallback: if helper adds more rules later
  if (!isOptionalNonNegativeNumber(value)) {
    return badRequestResponse(`${label} must be zero or greater`)
  }
  return null
}

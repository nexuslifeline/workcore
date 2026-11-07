import { z } from 'zod'

/**
 * True when the value is treated as absent, or parses to a number ≥ 0.
 * - `undefined` / `null`: absent
 * - string: whitespace-only counts as absent; otherwise `Number(trimmed)` must be ≥ 0
 * - number: must be ≥ 0 (and not NaN)
 */
export function isOptionalNonNegativeNumber(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') {
    const t = value.trim()
    if (t === '') return true
    const n = Number(t)
    return !Number.isNaN(n) && n >= 0
  }
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value >= 0
  }
  const n = Number(value)
  return !Number.isNaN(n) && n >= 0
}

/** Zod string field: empty / whitespace-only OK; otherwise same rules as {@link isOptionalNonNegativeNumber}. */
export function zOptionalNonNegativeNumberString(message: string) {
  return z.string().refine((val) => isOptionalNonNegativeNumber(val), message)
}

/** Zod string field: trimmed value must be non-empty, then same numeric rules as {@link isOptionalNonNegativeNumber}. */
export function zRequiredNonNegativeNumberString(
  requiredMessage: string,
  invalidMessage: string
) {
  return z
    .string()
    .refine((val) => val.trim().length > 0, requiredMessage)
    .refine((val) => isOptionalNonNegativeNumber(val), invalidMessage)
}

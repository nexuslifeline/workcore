import { getCurrencyByCode } from '@/lib/constants/currencies'
import { stripGrouping } from '@/lib/utils/numeric-string'

export type CurrencyMode = 'symbol' | 'code'

/**
 * Format a raw amount as currency with thousands separators and 2 decimals.
 *
 * - `amount`: number or numeric string (commas allowed)
 * - `code`: currency code (e.g. "PHP", "USD"), defaults to "PHP" when omitted
 * - `opts`: options `{ mode?: 'symbol' | 'code' }`
 *
 * Mode behavior:
 * - `'symbol'` (default): use the currency symbol when known, otherwise fall back to `"CODE 1,234.56"`
 * - `'code'`: always use `"CODE 1,234.56"`
 */
export function toCurrency(
  amount: number | string,
  code: string = 'PHP',
  opts: { mode?: CurrencyMode } = {}
): string {
  const numeric =
    typeof amount === 'number' ? amount : Number(stripGrouping(String(amount)))

  if (Number.isNaN(numeric)) {
    return ''
  }

  const mode = opts.mode ?? 'symbol'
  const currency = getCurrencyByCode(code)
  const base = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  if (mode === 'code' || !currency) {
    return `${code} ${base}`
  }

  return `${currency.symbol || code} ${base}`
}

/**
 * Wrap an already formatted currency string in parentheses when it represents a negative.
 * Strips the minus used by `toLocaleString` (ASCII or Unicode) so the result is `(CODE 1,234.56)` not `(CODE -1,234.56)`.
 */
export const toParens = (value: string): string => {
  const normalized = value.replace(/\u2212/g, '-') // Unicode minus → hyphen
  if (!normalized.includes('-')) {
    return value
  }
  // "PHP -1,234.56" / "₱ -1,234.56" — minus immediately before the amount
  let positive = normalized.replace(/\s*-\s*(?=[\d.])/, ' ')
  // Rare: leading "-PHP 1,234.56" after a bad double-negative concat
  positive = positive.replace(/^-\s*/, '').trim()
  return `(${positive})`
}

/**
 * Format a raw numeric amount as currency (symbol or code) and apply parentheses for negatives.
 *
 * - `amount`: number or numeric string (commas allowed)
 * - `code`: currency code (e.g. "PHP", "USD")
 * - `opts.mode`: passed through to `toCurrency` (defaults to `'symbol'`)
 */
export function toParensCurrency(
  amount: number | string,
  code: string,
  opts: { mode?: CurrencyMode } = {}
): string {
  const numeric =
    typeof amount === 'number' ? amount : Number(stripGrouping(String(amount)))

  if (Number.isNaN(numeric)) {
    return ''
  }

  if (numeric < 0) {
    // `toCurrency` already embeds "-" in the numeric part; do not prefix another "-" or `toParens` leaves a stray minus.
    return `(${toCurrency(Math.abs(numeric), code, opts)})`
  }

  return toCurrency(numeric, code, opts)
}

/**
 * Same as {@link toParensCurrency} but returns an empty string when `amount` is exactly `0`
 * (e.g. trial balance cells where zero is shown as blank).
 */
export function toParensCurrencyOrEmpty(
  amount: number,
  code: string,
  opts: { mode?: CurrencyMode } = {}
): string {
  if (amount === 0) return ''
  return toParensCurrency(amount, code, opts)
}

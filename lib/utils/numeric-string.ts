/**
 * Strip thousands-style grouping from a numeric-like string (ASCII commas today).
 * Does not trim or validate; callers can chain `.trim()` / `Number(...)` as needed.
 * Add more replacements here if you support other grouping characters.
 */
export function stripGrouping(value: string | null | undefined): string {
  if (value == null || value === '') return ''
  return String(value).replace(/,/g, '')
}

/**
 * Normalizes a numeric string for inputs: strips grouping, trims trailing fractional zeros
 * (e.g. `1.0000` → `1`, `1.50` → `1.5`). Preserves a trailing `.` while typing (`12.`).
 */
export function compactNumberString(
  input: string | number | undefined | null
): string {
  if (input === null || input === undefined) return ''
  const raw = stripGrouping(typeof input === 'number' ? String(input) : String(input)).trim()
  if (raw === '') return ''
  if (/^\d+\.$/.test(raw)) return raw
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return raw
  return String(n).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

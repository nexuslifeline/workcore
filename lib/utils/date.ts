import { endOfDay, format, isSameDay, isValid, parse, startOfDay } from 'date-fns'

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parses a strict calendar date (`yyyy-MM-dd`) into a `Date`, or `null` if the value is
 * missing, malformed, or not a real calendar day (e.g. `2026-02-30`). Use for query params,
 * filters, and APIs that exchange date-only strings—not full ISO datetimes.
 */
export function parseYyyyMmDd(raw: string | null | undefined): Date | null {
  if (raw == null) return null
  const s = raw.trim()
  if (!YYYY_MM_DD.test(s)) return null
  const d = parse(s, 'yyyy-MM-dd', new Date())
  if (!isValid(d) || format(d, 'yyyy-MM-dd') !== s) return null
  return d
}

/** Local start of the calendar day for `yyyy-MM-dd`, or `null` if invalid. */
export function startOfYyyyMmDd(raw: string | null | undefined): Date | null {
  const d = parseYyyyMmDd(raw)
  return d ? startOfDay(d) : null
}

/** Local end of the calendar day for `yyyy-MM-dd`, or `null` if invalid. Inclusive upper bound. */
export function endOfYyyyMmDd(raw: string | null | undefined): Date | null {
  const d = parseYyyyMmDd(raw)
  return d ? endOfDay(d) : null
}

/**
 * Local calendar `yyyy-MM-dd` for a `Date`. Never use `toISOString().split('T')[0]` —
 * UTC conversion shifts the day in timezones ahead of UTC (e.g. PH).
 */
export function toYyyyMmDdLocal(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export const START_ON_NOT_IN_PAST_MESSAGE = 'Start date cannot be in the past'

/** True when `date` is before today's local calendar day. */
export function isStartOnBeforeToday(date: Date, now = new Date()): boolean {
  return startOfDay(date) < startOfDay(now)
}

/** True when `startOn` is the same local calendar day as an already-saved start. */
export function isUnchangedExistingStartOn(
  startOn: Date,
  existingStartOn: Date | null | undefined
): boolean {
  return !!existingStartOn && isSameDay(startOn, existingStartOn)
}

/** `MMMM d, yyyy` (or `pattern`) for a `yyyy-MM-dd` string, or `null` if invalid. */
export function formatYyyyMmDdLabel(
  raw: string | null | undefined,
  pattern = 'MMMM d, yyyy'
): string | null {
  const d = parseYyyyMmDd(raw)
  if (!d) return null
  return format(d, pattern)
}

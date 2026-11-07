import { format } from 'date-fns'
import { parseYyyyMmDd } from '@/lib/utils/date'

/**
 * First day of the fiscal year containing `asOfDate` (`YYYY-MM-DD`).
 * `fiscalYearStartMonth` is 1–12 (e.g. 7 = July); rolls the year back when as-of is before that month.
 */
export function getFiscalYearStartDate(
  asOfDate: string,
  fiscalYearStartMonth: number
): string | null {
  const asOf = parseYyyyMmDd(asOfDate)
  if (!asOf) return null

  const month = asOf.getMonth() + 1 // 1-12
  const startMonth = Math.min(Math.max(Math.trunc(fiscalYearStartMonth) || 1, 1), 12)
  const startYear = month >= startMonth ? asOf.getFullYear() : asOf.getFullYear() - 1
  return format(new Date(startYear, startMonth - 1, 1), 'yyyy-MM-dd')
}

/** Calendar day before `dateStr` (`YYYY-MM-DD`), or null if invalid. */
export function dayBeforeYyyyMmDd(dateStr: string): string | null {
  const d = parseYyyyMmDd(dateStr)
  if (!d) return null
  d.setDate(d.getDate() - 1)
  return format(d, 'yyyy-MM-dd')
}

import { stripGrouping } from '@/lib/utils/numeric-string'

/**
 * Coerce report/API amounts that may be numbers or numeric strings (e.g. serialized JSON).
 */
export function coerceReportAmount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === 'string') {
    const n = Number(stripGrouping(value).trim())
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

/**
 * Sum values selected from each row, using {@link coerceReportAmount} per cell.
 */
export function sumCoerced<T>(rows: readonly T[], pick: (row: T) => unknown): number {
  return rows.reduce((sum, row) => sum + coerceReportAmount(pick(row)), 0)
}

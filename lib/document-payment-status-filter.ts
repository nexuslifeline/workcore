import {
  and,
  eq,
  inArray,
  ne,
  or,
  sql,
  type AnyColumn,
  type SQL,
} from 'drizzle-orm'

export const STORED_DOCUMENT_PAYMENT_STATUSES = [
  'unpaid',
  'partially_paid',
  'paid',
] as const

export const OVERDUE_PAYMENT_STATUS_FILTER = 'overdue'

export type StoredDocumentPaymentStatus =
  (typeof STORED_DOCUMENT_PAYMENT_STATUSES)[number]

const STORED_PAYMENT_STATUS_SET = new Set<string>(STORED_DOCUMENT_PAYMENT_STATUSES)

type DocumentPaymentStatusColumns = {
  paymentStatus: AnyColumn
  dueDate: AnyColumn
  status: AnyColumn
}

/** Matches list footer overdue totals: past due, finalized, and not paid. */
export function documentIsOverdueCondition(
  cols: DocumentPaymentStatusColumns
): SQL {
  return and(
    sql`${cols.dueDate} < NOW()`,
    eq(cols.status, 'finalized'),
    ne(cols.paymentStatus, 'paid')
  )!
}

/**
 * Builds a list-query predicate for Payment Status.
 * Stored values use `payment_status`; `overdue` is derived at query time.
 * Multiple selected values are OR'd. Returns undefined when none are valid.
 */
export function documentPaymentStatusFilterCondition(
  values: string[] | undefined,
  cols: DocumentPaymentStatusColumns
): SQL | undefined {
  if (!values || values.length === 0) return undefined

  const stored = values.filter((value) =>
    STORED_PAYMENT_STATUS_SET.has(value)
  ) as StoredDocumentPaymentStatus[]
  const includeOverdue = values.includes(OVERDUE_PAYMENT_STATUS_FILTER)

  const parts: SQL[] = []
  if (stored.length > 0) {
    parts.push(inArray(cols.paymentStatus, stored))
  }
  if (includeOverdue) {
    parts.push(documentIsOverdueCondition(cols))
  }

  if (parts.length === 0) return undefined
  if (parts.length === 1) return parts[0]
  return or(...parts)
}

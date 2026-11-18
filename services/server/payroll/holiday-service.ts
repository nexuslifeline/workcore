import { and, eq, ilike, or } from 'drizzle-orm'
import { holidays } from '@/db/schema'
import { db } from '@/lib/db'
import type { Holiday, HolidayInput, HolidayListItem, HolidayType } from '@/types/holiday'

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}

function toRow(input: HolidayInput) {
  return {
    date: input.date,
    name: input.name.trim(),
    description: blankToNull(input.description),
    type: input.type,
    isRecurring: input.isRecurring,
  }
}

function toHoliday(row: typeof holidays.$inferSelect): Holiday {
  return {
    id: row.id,
    organizationId: row.organizationId,
    date: row.date,
    name: row.name,
    description: row.description,
    type: row.type,
    isRecurring: row.isRecurring,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function occurrenceDate(year: number, month: number, day: number): string | null {
  if (month === 2 && day === 29 && !isLeapYear(year)) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  const monthText = String(month).padStart(2, '0')
  const dayText = String(day).padStart(2, '0')
  return `${year}-${monthText}-${dayText}`
}

function expandHoliday(holiday: Holiday, from: string, to: string): HolidayListItem[] {
  const storedDate = holiday.date.slice(0, 10)
  if (!holiday.isRecurring) {
    if (storedDate >= from && storedDate <= to) {
      return [{ ...holiday, date: storedDate, storedDate }]
    }
    return []
  }

  const [, monthText, dayText] = storedDate.split('-')
  const month = Number(monthText)
  const day = Number(dayText)
  const startYear = Number(from.slice(0, 4))
  const endYear = Number(to.slice(0, 4))
  const rows: HolidayListItem[] = []
  for (let year = startYear; year <= endYear; year += 1) {
    const date = occurrenceDate(year, month, day)
    if (date && date >= from && date <= to) {
      rows.push({ ...holiday, date, storedDate })
    }
  }
  return rows
}

export function thisYearRange(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return { from: `${year}-01-01`, to: `${year}-${month}-${day}` }
}

export async function listHolidays(params: {
  organizationId: string
  page: number
  pageSize: number
  search?: string
  from: string
  to: string
  recurring?: string[]
}) {
  const conditions = [eq(holidays.organizationId, params.organizationId)]
  const recurring = (params.recurring ?? []).filter(
    (value) => value === 'recurring' || value === 'one-off'
  )
  if (recurring.length === 1) {
    conditions.push(eq(holidays.isRecurring, recurring[0] === 'recurring'))
  }
  if (params.search) {
    const term = `%${params.search}%`
    conditions.push(or(ilike(holidays.name, term), ilike(holidays.description, term))!)
  }
  const rows = await db
    .select()
    .from(holidays)
    .where(and(...conditions))

  const occurrences = rows
    .flatMap((row) => expandHoliday(toHoliday(row), params.from, params.to))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))

  const start = (params.page - 1) * params.pageSize
  return {
    holidays: occurrences.slice(start, start + params.pageSize),
    total: occurrences.length,
  }
}

export async function getHoliday(organizationId: string, id: string) {
  const [row] = await db
    .select()
    .from(holidays)
    .where(and(eq(holidays.id, id), eq(holidays.organizationId, organizationId)))
    .limit(1)
  return row ? toHoliday(row) : null
}

export async function createHoliday(
  organizationId: string,
  userId: string,
  input: HolidayInput
) {
  const [row] = await db
    .insert(holidays)
    .values({
      organizationId,
      ...toRow(input),
      createdBy: userId,
      updatedBy: userId,
    })
    .returning()
  return toHoliday(row)
}

export async function updateHoliday(
  organizationId: string,
  id: string,
  userId: string,
  input: HolidayInput
) {
  const [row] = await db
    .update(holidays)
    .set({
      ...toRow(input),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(holidays.id, id), eq(holidays.organizationId, organizationId)))
    .returning()
  return row ? toHoliday(row) : null
}

export async function deleteHoliday(organizationId: string, id: string) {
  const [row] = await db
    .delete(holidays)
    .where(and(eq(holidays.id, id), eq(holidays.organizationId, organizationId)))
    .returning({ id: holidays.id })
  return row ?? null
}

export function isHolidayType(value: unknown): value is HolidayType {
  return value === 'regular_holiday' || value === 'special_holiday'
}

import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { createPaginationResponse, parseArrayFilterParam, parseListQuery } from '@/lib/pagination-helpers'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  createHoliday,
  isHolidayType,
  listHolidays,
  thisYearRange,
} from '@/services/server/payroll/holiday-service'
import type { HolidayInput } from '@/types/holiday'

function parseDateOnly(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return value
}

function parseHolidayBody(body: Record<string, unknown>): { input: HolidayInput } | { error: string } {
  const date = parseDateOnly(body.date)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!date) return { error: 'A valid date is required' }
  if (!name) return { error: 'Name is required' }
  if (!isHolidayType(body.type)) {
    return { error: 'Type must be regular_holiday or special_holiday' }
  }
  if (typeof body.isRecurring !== 'boolean') {
    return { error: 'Recurring must be true or false' }
  }
  return {
    input: {
      date,
      name,
      description: typeof body.description === 'string' ? body.description : null,
      type: body.type,
      isRecurring: body.isRecurring,
    },
  }
}

function parseRange(searchParams: URLSearchParams) {
  const fallback = thisYearRange()
  const from = parseDateOnly(searchParams.get('from')) ?? fallback.from
  const to = parseDateOnly(searchParams.get('to')) ?? fallback.to
  if (from > to) return { error: 'The start date must be on or before the end date' as const }
  return { from, to }
}

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const { searchParams } = new URL(request.url)
    const { page, pageSize, search } = parseListQuery(searchParams)
    const range = parseRange(searchParams)
    if ('error' in range) return badRequestResponse(range.error)
    const { holidays, total } = await listHolidays({
      organizationId: ctx.organization.id,
      page,
      pageSize,
      search: search || undefined,
      from: range.from,
      to: range.to,
      recurring: parseArrayFilterParam(searchParams, 'recurring'),
    })
    return NextResponse.json({
      holidays,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch holidays', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const body = await request.json()
    const parsed = parseHolidayBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const holiday = await createHoliday(ctx.organization.id, ctx.user.id, parsed.input)
    return NextResponse.json({ holiday }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to create holiday', 500, error)
  }
}

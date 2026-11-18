import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  deleteHoliday,
  getHoliday,
  isHolidayType,
  updateHoliday,
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const holiday = await getHoliday(ctx.organization.id, id)
    if (!holiday) return notFoundResponse('Holiday not found')
    return NextResponse.json({ holiday })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch holiday', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const body = await request.json()
    const parsed = parseHolidayBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const holiday = await updateHoliday(ctx.organization.id, id, ctx.user.id, parsed.input)
    if (!holiday) return notFoundResponse('Holiday not found')
    return NextResponse.json({ holiday })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to update holiday', 500, error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const holiday = await deleteHoliday(ctx.organization.id, id)
    if (!holiday) return notFoundResponse('Holiday not found')
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to delete holiday', 500, error)
  }
}

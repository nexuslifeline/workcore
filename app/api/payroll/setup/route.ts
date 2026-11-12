import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  getPayrollSetup,
  updatePayrollSetup,
} from '@/services/server/payroll/payroll-setup-service'
import type { PayrollSetupInput } from '@/types/payroll-setup'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function parseWholeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number(value.trim())
  return null
}

function parsePayrollSetupBody(body: Record<string, unknown>):
  | { input: PayrollSetupInput }
  | { error: string } {
  const defaultBreakMinutes = parseWholeNumber(body.defaultBreakMinutes)
  const maxRegularShiftHours = parseWholeNumber(body.maxRegularShiftHours)
  const startTime =
    typeof body.nightShiftDifferentialStartTime === 'string'
      ? body.nightShiftDifferentialStartTime.trim()
      : ''
  const endTime =
    typeof body.nightShiftDifferentialEndTime === 'string'
      ? body.nightShiftDifferentialEndTime.trim()
      : ''

  if (defaultBreakMinutes === null) {
    return { error: 'Break minutes must be a whole number' }
  }
  if (defaultBreakMinutes < 0) {
    return { error: 'Break minutes cannot be negative' }
  }
  if (maxRegularShiftHours === null) {
    return { error: 'Regular shift hours must be a whole number' }
  }
  if (maxRegularShiftHours < 1 || maxRegularShiftHours > 24) {
    return { error: 'Regular shift hours must be between 1 and 24' }
  }
  if (!TIME_PATTERN.test(startTime)) {
    return { error: 'Night shift start time must be a valid time' }
  }
  if (!TIME_PATTERN.test(endTime)) {
    return { error: 'Night shift end time must be a valid time' }
  }

  return {
    input: {
      defaultBreakMinutes,
      maxRegularShiftHours,
      nightShiftDifferentialStartTime: startTime,
      nightShiftDifferentialEndTime: endTime,
    },
  }
}

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const payrollSetup = await getPayrollSetup(ctx.organization.id)
    if (!payrollSetup) return notFoundResponse('Payroll setup not found')
    return NextResponse.json({ payrollSetup })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch payroll setup', 500, error)
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SETTINGS_PAYROLL)
    const body = await request.json()
    const parsed = parsePayrollSetupBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const payrollSetup = await updatePayrollSetup(ctx.organization.id, parsed.input)
    if (!payrollSetup) return notFoundResponse('Payroll setup not found')
    return NextResponse.json({ payrollSetup })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to update payroll setup', 500, error)
  }
}

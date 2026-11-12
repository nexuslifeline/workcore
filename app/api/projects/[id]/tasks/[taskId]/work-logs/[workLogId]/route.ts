import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  deleteProjectWorkLog,
  ProjectWorkLogEmployeeError,
  updateProjectWorkLog,
} from '@/services/server/projects/project-service'

function parseBreakMinutes(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim())
  return null
}

function parseBody(body: Record<string, unknown>) {
  const employeeId = typeof body.employeeId === 'string' ? body.employeeId.trim() : ''
  const startDatetime = typeof body.startDatetime === 'string' ? body.startDatetime.trim() : ''
  const endDatetime = typeof body.endDatetime === 'string' ? body.endDatetime.trim() : ''
  const workDate = typeof body.workDate === 'string' ? body.workDate.trim() : ''
  const breakMinutes = parseBreakMinutes(body.breakMinutes)
  if (!employeeId) return { error: 'Employee is required' as const }
  if (!startDatetime) return { error: 'Start is required' as const }
  if (!endDatetime) return { error: 'End is required' as const }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) return { error: 'Work date is required' as const }
  if (breakMinutes === null) return { error: 'Break must be zero or more' as const }
  if (typeof body.hourlyRate !== 'string' && typeof body.hourlyRate !== 'number') {
    return { error: 'Hourly rate is required' as const }
  }
  return {
    input: {
      employeeId,
      startDatetime,
      endDatetime,
      workDate,
      breakMinutes,
      hourlyRate: String(body.hourlyRate),
      notes: typeof body.notes === 'string' ? body.notes : null,
    },
  }
}

function isWorkLogInputError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message.endsWith('is not valid') ||
      error.message === 'End must be after start' ||
      error.message.startsWith('Hourly rate') ||
      error.message.startsWith('Break') ||
      error.message.startsWith('Work date'))
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string; workLogId: string }> }
) {
  try {
    const { id, taskId, workLogId } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const body = await request.json()
    const parsed = parseBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const workLog = await updateProjectWorkLog(
      ctx.organization.id,
      ctx.user.id,
      id,
      taskId,
      workLogId,
      parsed.input
    )
    if (!workLog) return notFoundResponse('Work log not found')
    return NextResponse.json({ workLog })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof ProjectWorkLogEmployeeError) return badRequestResponse(error.message)
    if (isWorkLogInputError(error)) return badRequestResponse(error.message)
    return errorResponse('Failed to update work log', 500, error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string; workLogId: string }> }
) {
  try {
    const { id, taskId, workLogId } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const deleted = await deleteProjectWorkLog(ctx.organization.id, id, taskId, workLogId)
    if (!deleted) return notFoundResponse('Work log not found')
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to delete work log', 500, error)
  }
}

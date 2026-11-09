import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  createProjectWorkLog,
  ProjectWorkLogEmployeeError,
} from '@/services/server/projects/project-service'

function parseBody(body: Record<string, unknown>) {
  const employeeId = typeof body.employeeId === 'string' ? body.employeeId.trim() : ''
  const startDatetime = typeof body.startDatetime === 'string' ? body.startDatetime.trim() : ''
  const endDatetime = typeof body.endDatetime === 'string' ? body.endDatetime.trim() : ''
  if (!employeeId) return { error: 'Employee is required' as const }
  if (!startDatetime) return { error: 'Start is required' as const }
  if (!endDatetime) return { error: 'End is required' as const }
  if (typeof body.hourlyRate !== 'string' && typeof body.hourlyRate !== 'number') {
    return { error: 'Hourly rate is required' as const }
  }
  return {
    input: {
      employeeId,
      startDatetime,
      endDatetime,
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
      error.message.startsWith('Hourly rate'))
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const body = await request.json()
    const parsed = parseBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const workLog = await createProjectWorkLog(
      ctx.organization.id,
      ctx.user.id,
      id,
      taskId,
      parsed.input
    )
    if (!workLog) return notFoundResponse('Task not found')
    return NextResponse.json({ workLog }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof ProjectWorkLogEmployeeError) return badRequestResponse(error.message)
    if (isWorkLogInputError(error)) return badRequestResponse(error.message)
    return errorResponse('Failed to create work log', 500, error)
  }
}

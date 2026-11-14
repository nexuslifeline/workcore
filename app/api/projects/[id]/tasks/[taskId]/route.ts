import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { deleteProjectTask, updateProjectTask } from '@/services/server/projects/project-service'

function parseUpdateBody(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return { error: 'Task name is required' as const }
  if (body.budget != null && typeof body.budget !== 'string' && typeof body.budget !== 'number') {
    return { error: 'Budget is required' as const }
  }
  if (
    body.estimatedHours != null &&
    typeof body.estimatedHours !== 'string' &&
    typeof body.estimatedHours !== 'number'
  ) {
    return { error: 'Estimated hours is required' as const }
  }
  const text = (value: unknown) => (typeof value === 'string' ? value : null)
  return {
    input: {
      name,
      description: text(body.description),
      budget: body.budget == null || body.budget === '' ? '0' : String(body.budget),
      estimatedHours:
        body.estimatedHours == null || body.estimatedHours === '' ? '0' : String(body.estimatedHours),
      plannedStartDate: text(body.plannedStartDate),
      plannedEndDate: text(body.plannedEndDate),
    },
  }
}

function isTaskInputError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message.startsWith('Dates') ||
      error.message.startsWith('Budget') ||
      error.message.startsWith('Estimated hours') ||
      error.message.startsWith('Due date') ||
      error.message.startsWith('Status'))
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const body = await request.json()
    const parsed = parseUpdateBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const task = await updateProjectTask(ctx.organization.id, ctx.user.id, id, taskId, parsed.input)
    if (!task) return notFoundResponse('Task not found')
    return NextResponse.json({ task })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (isTaskInputError(error)) return badRequestResponse(error.message)
    return errorResponse('Failed to update task', 500, error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const deleted = await deleteProjectTask(ctx.organization.id, id, taskId)
    if (!deleted) return notFoundResponse('Task not found')
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (isTaskInputError(error)) return badRequestResponse(error.message)
    return errorResponse('Failed to delete task', 500, error)
  }
}

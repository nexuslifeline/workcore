import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { updateProjectTaskStatus } from '@/services/server/projects/project-service'
import { PROJECT_TASK_STATUSES, type ProjectTaskStatus } from '@/types/project'

function isStatusError(error: unknown): error is Error {
  return error instanceof Error && error.message.startsWith('Status')
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
    const status = typeof body.status === 'string' ? body.status : ''
    if (!PROJECT_TASK_STATUSES.includes(status as ProjectTaskStatus)) {
      return badRequestResponse('Status is not valid')
    }
    const task = await updateProjectTaskStatus(
      ctx.organization.id,
      ctx.user.id,
      id,
      taskId,
      status as ProjectTaskStatus
    )
    if (!task) return notFoundResponse('Task not found')
    return NextResponse.json({ task })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (isStatusError(error)) return badRequestResponse(error.message)
    return errorResponse('Failed to update task status', 500, error)
  }
}

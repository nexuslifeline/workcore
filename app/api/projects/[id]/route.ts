import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  getProject,
  listProjectTasks,
  ProjectCodeConflictError,
  ProjectSupervisorError,
  updateProject,
} from '@/services/server/projects/project-service'
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/project'

function parseUpdateBody(body: Record<string, unknown>) {
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const status = body.status
  if (!code) return { error: 'Project code is required' as const }
  if (!name) return { error: 'Project name is required' as const }
  if (typeof status !== 'string' || !PROJECT_STATUSES.includes(status as ProjectStatus)) {
    return { error: 'Status is not valid' as const }
  }
  if (typeof body.budget !== 'string' && typeof body.budget !== 'number') {
    return { error: 'Budget is required' as const }
  }
  const supervisorEmployeeId =
    typeof body.supervisorEmployeeId === 'string' ? body.supervisorEmployeeId.trim() : ''
  if (!supervisorEmployeeId) return { error: 'Supervisor is required' as const }
  const text = (value: unknown) => (typeof value === 'string' ? value : null)
  return {
    input: {
      code,
      name,
      description: text(body.description),
      startDate: text(body.startDate),
      dueDate: text(body.dueDate),
      budget: String(body.budget),
      status: status as ProjectStatus,
      supervisorEmployeeId,
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
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const project = await getProject(ctx.organization.id, id)
    if (!project) return notFoundResponse('Project not found')
    const tasks = await listProjectTasks(ctx.organization.id, id)
    return NextResponse.json({ project, tasks: tasks ?? [] })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch project', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const body = await request.json()
    const parsed = parseUpdateBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const project = await updateProject(ctx.organization.id, ctx.user.id, id, parsed.input)
    if (!project) return notFoundResponse('Project not found')
    const tasks = await listProjectTasks(ctx.organization.id, id)
    return NextResponse.json({ project, tasks: tasks ?? [] })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof ProjectCodeConflictError) return badRequestResponse(error.message)
    if (error instanceof ProjectSupervisorError) return badRequestResponse(error.message)
    if (error instanceof Error && (error.message.startsWith('Dates') || error.message.startsWith('Budget'))) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to update project', 500, error)
  }
}

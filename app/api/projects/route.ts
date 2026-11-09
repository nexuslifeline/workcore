import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  createPaginationResponse,
  parseArrayFilterParam,
  parseListQuery,
} from '@/lib/pagination-helpers'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  createProject,
  listProjects,
  ProjectCodeConflictError,
  ProjectSupervisorError,
} from '@/services/server/projects/project-service'

function parseCreateBody(body: Record<string, unknown>) {
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!code) return { error: 'Project code is required' as const }
  if (!name) return { error: 'Project name is required' as const }
  const supervisorEmployeeId =
    typeof body.supervisorEmployeeId === 'string' ? body.supervisorEmployeeId.trim() : ''
  if (!supervisorEmployeeId) return { error: 'Supervisor is required' as const }
  const description = typeof body.description === 'string' ? body.description : null
  const startDate = typeof body.startDate === 'string' ? body.startDate : null
  const dueDate = typeof body.dueDate === 'string' ? body.dueDate : null
  const budget =
    typeof body.budget === 'string' || typeof body.budget === 'number' ? String(body.budget) : '0'
  return { input: { code, name, description, startDate, dueDate, budget, supervisorEmployeeId } }
}

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search } = parseListQuery(searchParams)
    const status = parseArrayFilterParam(searchParams, 'status')
    const { projects, total } = await listProjects({
      organizationId: ctx.organization.id,
      page,
      pageSize,
      skip,
      search: search || undefined,
      status,
    })
    return NextResponse.json({
      projects,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch projects', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const body = await request.json()
    const parsed = parseCreateBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const project = await createProject(ctx.organization.id, ctx.user.id, parsed.input)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof ProjectCodeConflictError) return badRequestResponse(error.message)
    if (error instanceof ProjectSupervisorError) return badRequestResponse(error.message)
    if (
      error instanceof Error &&
      (error.message.startsWith('Dates') || error.message.startsWith('Budget'))
    ) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to create project', 500, error)
  }
}

import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { createProjectTask } from '@/services/server/projects/project-service'

function parseCreateBody(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return { error: 'Task name is required' as const }
  if (body.budget != null && typeof body.budget !== 'string' && typeof body.budget !== 'number') {
    return { error: 'Budget is required' as const }
  }
  const text = (value: unknown) => (typeof value === 'string' ? value : null)
  return {
    input: {
      name,
      description: text(body.description),
      dueDate: text(body.dueDate),
      budget: body.budget == null || body.budget === '' ? '0' : String(body.budget),
    },
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.PROJECTS)
    const body = await request.json()
    const parsed = parseCreateBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const task = await createProjectTask(ctx.organization.id, ctx.user.id, id, parsed.input)
    if (!task) return notFoundResponse('Project not found')
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (
      error instanceof Error &&
      (error.message.startsWith('Dates') || error.message.startsWith('Budget'))
    ) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to create task', 500, error)
  }
}

import { NextResponse } from 'next/server'
import {
  unauthorizedResponse,
  noPermissionResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  parseListQuery,
  createPaginationResponse,
  parseArrayFilterParam,
} from '@/lib/pagination-helpers'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import { asc, desc } from 'drizzle-orm'
import { getRoles, createRole } from '@/services/server/roles/role-service'

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ROLES)
    const { organization } = ctx

    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search, sortBy, sortOrder } =
      parseListQuery(searchParams)
    const isActive = parseArrayFilterParam(searchParams, 'isActive')

    const { roles: rolesResult, total } = await getRoles({
      organizationId: organization.id,
      page,
      pageSize,
      skip,
      search: search || undefined,
      isActive,
      sortBy,
      sortOrder: sortOrder ?? undefined,
    })

    return NextResponse.json({
      roles: rolesResult,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to fetch roles', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ROLES)
    const { organization } = ctx

    const body = await request.json()
    const { name, description, isActive } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return badRequestResponse('Name is required')
    }

    const role = await createRole({
      organizationId: organization.id,
      name,
      description,
      isActive,
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to create role', 500, error)
  }
}

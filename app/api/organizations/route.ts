import { NextResponse } from 'next/server'
import {
  unauthorizedResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  parsePaginationParams,
  createPaginationResponse,
  parseSearchParam,
  parseArrayFilterParam,
} from '@/lib/pagination-helpers'
import { getAuthenticatedUser } from '@/services/server/auth/auth-service'
import {
  resolveRequestContext,
  validateRequestContext,
  listOrganizationsForUser,
  createOrganization,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip } = parsePaginationParams(searchParams)
    const search = parseSearchParam(searchParams)
    const status = parseArrayFilterParam(searchParams, 'status')
    const industry = parseArrayFilterParam(searchParams, 'industry')

    const { organizations: organizationsResult, total } = await listOrganizationsForUser({
      userId: user.id,
      page,
      pageSize,
      skip,
      search,
      status,
      industry,
    })

    return NextResponse.json({
      organizations: organizationsResult,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch organizations', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ORGANIZATIONS)
    const { user } = ctx

    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return badRequestResponse('Organization name is required')
    }

    const organization = await createOrganization({
      ownerId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    })

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to create organization', 500, error)
  }
}

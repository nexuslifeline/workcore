import { NextResponse } from 'next/server'
import { errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  parseListQuery,
  createPaginationResponse,
  parseArrayFilterParam,
} from '@/lib/pagination-helpers'
import {
  resolveRequestContextForOrganization,
  validateRequestContext,
  getOrganizationMembers,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const ctx = validateRequestContext(
      await resolveRequestContextForOrganization(organizationId)
    )
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ORGANIZATIONS)

    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search } = parseListQuery(searchParams)
    const status = parseArrayFilterParam(searchParams, 'status')
    const roleIds = parseArrayFilterParam(searchParams, 'roleId')

    const { members, total } = await getOrganizationMembers({
      organizationId,
      ownerId: ctx.organization.ownerId,
      page,
      pageSize,
      skip,
      search: search || undefined,
      status: status.length > 0 ? status : undefined,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
    })

    return NextResponse.json({
      members,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch organization members', 500, error)
  }
}

import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  resolveRequestContextForOrganization,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import { listRoleOptionsForOrganization } from '@/services/server/roles/role-service'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const ctx = validateRequestContext(
      await resolveRequestContextForOrganization(organizationId)
    )
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ORGANIZATIONS)

    const roles = await listRoleOptionsForOrganization(organizationId)
    return NextResponse.json({ roles })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch organization roles', 500, error)
  }
}

import { NextResponse } from 'next/server'
import {
  errorResponse,
  notFoundResponse,
  badRequestResponse,
  noPermissionResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  setRolePermissions,
  getRolePermissions,
} from '@/services/server/roles/role-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ROLES)
    const { organization } = ctx

    const { id: roleId } = await params
    const permissions = await getRolePermissions(roleId, organization.id)

    if (permissions === null) {
      return notFoundResponse('Role not found')
    }

    return NextResponse.json({ permissions })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to fetch role permissions', 500, error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    const perms = await resolvePermissions(ctx)
    try {
      validatePermissions(perms, PERMISSIONS.SYSTEM_ROLES)
    } catch (err) {
      if (err instanceof NextResponse) {
        return noPermissionResponse()
      }
      throw err
    }
    const { organization } = ctx

    const { id: roleId } = await params

    const body = await request.json()
    const permissionsPayload = Array.isArray(body) ? body : body?.permissions

    if (!Array.isArray(permissionsPayload)) {
      return badRequestResponse(
        'Payload must be an array of { permission_id, is_allowed }'
      )
    }

    for (const item of permissionsPayload) {
      if (
        typeof item?.permission_id !== 'string' ||
        typeof item?.is_allowed !== 'boolean'
      ) {
        return badRequestResponse(
          'Each item must have permission_id (string) and is_allowed (boolean)'
        )
      }
    }

    const permissions = await setRolePermissions(
      roleId,
      organization.id,
      permissionsPayload
    )

    if (permissions === null) {
      return notFoundResponse('Role not found')
    }

    if (permissionsPayload.length === 0) {
      return NextResponse.json({
        permissions,
        message: 'No permissions to set',
      })
    }

    return NextResponse.json({ permissions })
  } catch (error) {
    return errorResponse('Failed to set role permissions', 500, error)
  }
}

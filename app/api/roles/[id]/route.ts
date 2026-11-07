import { NextResponse } from 'next/server'
import {
  unauthorizedResponse,
  noPermissionResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import { getRoleById, updateRole, deleteRole } from '@/services/server/roles/role-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ROLES)
    const { organization } = ctx

    const { id } = await params

    const role = await getRoleById(id, organization.id)

    if (!role) {
      return notFoundResponse('Role not found')
    }

    return NextResponse.json({ role })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to fetch role', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ROLES)
    const { organization } = ctx

    const { id } = await params
    const body = await request.json()

    const role = await getRoleById(id, organization.id)

    if (!role) {
      return notFoundResponse('Role not found')
    }

    const updatedRole = await updateRole(id, organization.id, {
      name: body.name,
      description: body.description,
      isActive: body.isActive,
    })

    return NextResponse.json({ role: updatedRole })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to update role', 500, error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ROLES)
    const { organization } = ctx

    const { id } = await params

    const role = await getRoleById(id, organization.id)

    if (!role) {
      return notFoundResponse('Role not found')
    }

    await deleteRole(id, organization.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to delete role', 500, error)
  }
}

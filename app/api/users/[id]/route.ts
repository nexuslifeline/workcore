import { NextResponse } from 'next/server'
import {
  errorResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  getProfileWithOrgRole,
  getRoleByIdAndOrganization,
  updateProfile,
  updateOrganizationUserRole,
} from '@/services/server/users/user-service'
import { updateAuthUserPasswordAdmin } from '@/services/server/auth/auth-service'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET a single user (profile) by profile id. User must be in the active organization.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_USERS)
    const { organization } = ctx

    const { id: profileId } = await params

    const result = await getProfileWithOrgRole(profileId, organization.id)
    if (!result) {
      return notFoundResponse('User not found')
    }

    const { profile, orgUser } = result

    return NextResponse.json({
      user: {
        id: profile.id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        status: profile.status,
        roleId: orgUser.roleId,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to fetch user', 500, error)
  }
}

/**
 * PATCH update a user (profile + optional role in org). Id is profile id.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_USERS)
    const { organization } = ctx

    const { id: profileId } = await params
    const body = await request.json()
    const { firstName, lastName, phoneNumber, password, roleId } = body

    const result = await getProfileWithOrgRole(profileId, organization.id)
    if (!result) {
      return notFoundResponse('User not found')
    }

    const { profile } = result

    if (firstName !== undefined || lastName !== undefined) {
      const parts = (profile.name ?? '').split(' ')
      const first = firstName !== undefined ? String(firstName).trim() : (parts[0] ?? '')
      const last = lastName !== undefined ? String(lastName).trim() : parts.slice(1).join(' ')
      const name = [first, last].filter(Boolean).join(' ')
      await updateProfile(profile.userId, { name })
    }

    if (phoneNumber !== undefined) {
      await updateProfile(profile.userId, {
        phone: phoneNumber === '' ? null : String(phoneNumber).trim(),
      })
    }

    if (typeof password === 'string' && password.trim().length > 0) {
      if (password.length < 8) {
        return badRequestResponse('Password must be at least 8 characters long')
      }
      const { error: updateError } = await updateAuthUserPasswordAdmin(
        profile.userId,
        password.trim()
      )
      if (updateError) {
        return errorResponse(updateError.message, 400)
      }
    }

    if (roleId !== undefined) {
      if (roleId !== null && typeof roleId === 'string') {
        const role = await getRoleByIdAndOrganization(roleId, organization.id)
        if (!role) {
          return badRequestResponse('Invalid role for this organization')
        }
      }
      await updateOrganizationUserRole(
        profile.userId,
        organization.id,
        roleId === '' || roleId === null ? null : roleId
      )
    }

    const updated = await getProfileWithOrgRole(profileId, organization.id)
    if (!updated) {
      return errorResponse('User not found after update', 404)
    }

    return NextResponse.json({
      user: {
        id: updated.profile.id,
        userId: updated.profile.userId,
        name: updated.profile.name,
        email: updated.profile.email,
        phone: updated.profile.phone,
        status: updated.profile.status,
        roleId: updated.orgUser.roleId ?? null,
        createdAt: updated.profile.createdAt,
        updatedAt: updated.profile.updatedAt,
      },
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to update user', 500, error)
  }
}

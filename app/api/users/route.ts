import { NextResponse } from 'next/server'
import {
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
import { isOwnerOrAdmin } from '@/services/server/organizations/organization-service'
import {
  getUsersWithRoles,
  emailExists,
  ensureProfileForNewAuthUser,
  addUserToOrganization,
  getRoleByIdAndOrganization,
} from '@/services/server/users/user-service'
import { createAuthUserAdmin } from '@/services/server/auth/auth-service'

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_USERS)
    const { organization } = ctx

    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search, sortBy, sortOrder } =
      parseListQuery(searchParams)
    const status = parseArrayFilterParam(searchParams, 'status')
    const roleIds = parseArrayFilterParam(searchParams, 'roleId')

    const { users, total } = await getUsersWithRoles({
      organizationId: organization.id,
      ownerId: organization.ownerId,
      page,
      pageSize,
      skip,
      search: search || undefined,
      status,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
    })

    return NextResponse.json({
      users,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to fetch users', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_USERS)
    const { user, organization } = ctx

    const canAddUser = await isOwnerOrAdmin(user.id, organization.id)
    if (!canAddUser) {
      return errorResponse('Organization not found or access denied', 403)
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      roleId,
      organizationId,
    } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return badRequestResponse('Valid email is required')
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return badRequestResponse('Password must be at least 8 characters long')
    }
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return badRequestResponse('First name is required')
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return badRequestResponse('Last name is required')
    }
    if (!roleId || typeof roleId !== 'string') {
      return badRequestResponse('Role is required')
    }
    if (!organizationId || typeof organizationId !== 'string') {
      return badRequestResponse('Organization ID is required')
    }
    if (organizationId !== organization.id) {
      return errorResponse('Can only add users to your active organization', 403)
    }

    const role = await getRoleByIdAndOrganization(roleId, organization.id)
    if (!role) {
      return badRequestResponse('Invalid role for this organization')
    }

    if (await emailExists(email)) {
      return badRequestResponse('User with this email already exists')
    }

    const { user: authUser, error: authError } = await createAuthUserAdmin({
      email: email.toLowerCase().trim(),
      password,
      emailConfirm: true,
      userMetadata: {
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        created_via_admin: true,
      },
    })

    if (authError || !authUser) {
      return errorResponse(
        authError?.message || 'Failed to create user in authentication system',
        500
      )
    }

    const newUserId = authUser.id

    const profile = await ensureProfileForNewAuthUser(newUserId, {
      email: email.toLowerCase().trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phoneNumber?.trim() || null,
    })

    await addUserToOrganization({
      organizationId: organization.id,
      userId: newUserId,
      roleId,
    })

    return NextResponse.json(
      {
        user: {
          id: profile.id,
          userId: newUserId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: profile.email,
          phoneNumber: profile.phone || '',
          status: profile.status,
          roleId,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to create user', 500, error)
  }
}

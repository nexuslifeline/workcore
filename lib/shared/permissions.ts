import type { RequestContext } from '@/services/server/organizations/organization-service'
import type { CurrentUserPermissionItem } from '@/services/server/auth/auth-service'
import { getPermissions } from '@/services/server/auth/auth-service'
import { errorResponse } from '@/lib/api-helpers'

/**
 * Resolve all role permissions for a validated RequestContext.
 *
 * This is a shared helper that:
 * - Uses the already-resolved user and organization from RequestContext
 * - Does not perform any additional auth or organization access checks
 * - Returns the full list of permissions for the user's role (or all permissions if owner)
 */
export async function resolvePermissions(
  ctx: RequestContext & {
    user: NonNullable<RequestContext['user']>
    organization: NonNullable<RequestContext['organization']>
  }
): Promise<CurrentUserPermissionItem[]> {
  const isOwner = ctx.organization.ownerId === ctx.user.id
  const roleId = isOwner ? undefined : ctx.organization.roleId ?? null

  const permissions = await getPermissions(roleId)
  return permissions ?? []
}

/**
 * Validate that the user has at least one of the required permission codes.
 * Throws a 403 error response if no required permission is present.
 */
export function validatePermissions<T extends CurrentUserPermissionItem[]>(
  perms: T,
  requiredCodes: string | string[]
): T {
  const required = Array.isArray(requiredCodes)
    ? requiredCodes
    : [requiredCodes].filter((code): code is string => Boolean(code))

  // If no required codes are provided, treat as misconfigured permission
  // and deny access rather than allowing everything implicitly.
  if (required.length === 0) {
    throw errorResponse(
      'Permission configuration error: no permission code specified for this operation.',
      403
    )
  }

  const allowedCodes = new Set(
    perms
      .filter((p) => p.rolePermissions.isAllowed)
      .map((p) => p.permission.code)
  )

  const hasRequired = required.some((code) => allowedCodes.has(code))

  if (!hasRequired) {
    throw errorResponse(
      'You do not have permission to access this resource in this organization.',
      403
    )
  }

  return perms
}


import type { CurrentUserPermissionItem } from '@/services/client/auth/current-user-permissions-service'

/** Permission codes where `rolePermissions.isAllowed` is true. */
export function getAllowedPermissionCodes(
  permissions: CurrentUserPermissionItem[]
): Set<string> {
  return new Set(
    permissions
      .filter((p) => p.rolePermissions.isAllowed)
      .map((p) => p.permission.code)
  )
}

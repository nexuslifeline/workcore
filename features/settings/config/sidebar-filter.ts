import type { SidebarNavItem } from './sidebar-items'
import type { CurrentUserPermissionItem } from '@/services/client/auth/current-user-permissions-service'
import { getAllowedPermissionCodes } from '@/lib/shared/role-permissions-client'

/**
 * Filter settings sidebar items by current user permissions.
 * - Item with code: show only if code is in allowed set (rolePermissions.isAllowed).
 * - Item without code: always show (no permission required).
 * - When permissions haven't loaded yet (undefined): only show items without a code
 *   so we never show permission-gated items until access is confirmed.
 */
export function filterSidebarItemsByPermissions(
  items: SidebarNavItem[],
  permissions: CurrentUserPermissionItem[] | undefined
): SidebarNavItem[] {
  const allowedSet = permissions
    ? getAllowedPermissionCodes(permissions)
    : null

  return items.filter((item) => {
    const hasCode = item.code !== undefined && item.code !== ''
    if (!hasCode) return true
    if (allowedSet === null) return false
    return allowedSet.has(item.code!)
  })
}

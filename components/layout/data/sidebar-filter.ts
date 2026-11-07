import type { NavGroup, NavItem } from '../types'
import type { CurrentUserPermissionItem } from '@/services/client/auth/current-user-permissions-service'

/**
 * Build a set of permission codes that the current user is allowed.
 */
function getAllowedPermissionCodes(
  permissions: CurrentUserPermissionItem[]
): Set<string> {
  return new Set(
    permissions
      .filter((p) => p.rolePermissions.isAllowed)
      .map((p) => p.permission.code)
  )
}

/**
 * Filter a single nav item by allowed permission codes.
 * - Item with anyOfCodes: show if any listed code is in the allowed set.
 * - Item with code: show only if code is in allowed set.
 * - Item without code / anyOfCodes: show (no permission required).
 * - Collapsible: show only if at least one child is allowed; children are filtered recursively.
 */
function filterNavGroupsWithAllowedSet(
  navGroups: NavGroup[],
  allowedSet: Set<string>
): NavGroup[] {
  return navGroups
    .map((group) => {
      const filteredItems = group.items
        .map((item) => filterNavItem(item, allowedSet))
        .filter((x): x is NavItem => x !== null)
      if (filteredItems.length === 0) return null
      return { ...group, items: filteredItems }
    })
    .filter((x): x is NavGroup => x !== null)
}

function isAllowedByPermissions(
  item: { code?: string; anyOfCodes?: string[] },
  allowedSet: Set<string>
): boolean {
  if (item.anyOfCodes && item.anyOfCodes.length > 0) {
    return item.anyOfCodes.some((code) => allowedSet.has(code))
  }
  const hasCode = item.code !== undefined && item.code !== ''
  return !hasCode || allowedSet.has(item.code!)
}

function filterNavItem(
  item: NavItem,
  allowedSet: Set<string>
): NavItem | null {
  if ('items' in item && item.items) {
    const filteredChildren = item.items
      .map((child) => filterNavItem(child as NavItem, allowedSet))
      .filter((x): x is NavItem => x !== null)
    if (filteredChildren.length === 0) return null
    return { ...item, items: filteredChildren } as NavItem
  }

  return isAllowedByPermissions(item, allowedSet) ? item : null
}

/**
 * Filter using plain permission code strings (e.g. from server-side resolution).
 */
export function filterNavGroupsByAllowedCodes(
  navGroups: NavGroup[],
  allowedCodes: ReadonlySet<string> | string[]
): NavGroup[] {
  const allowedSet =
    allowedCodes instanceof Set ? allowedCodes : new Set(allowedCodes)
  return filterNavGroupsWithAllowedSet(navGroups, allowedSet)
}

export function filterNavGroupsByPermissions(
  navGroups: NavGroup[],
  permissions: CurrentUserPermissionItem[]
): NavGroup[] {
  const allowedSet = getAllowedPermissionCodes(permissions)
  return filterNavGroupsWithAllowedSet(navGroups, allowedSet)
}

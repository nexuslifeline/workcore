import { useCurrentUserRolePermissions } from '@/hooks/use-current-user-role-permissions'
import { getAllowedPermissionCodes } from '@/lib/shared/role-permissions-client'

export type UseHasRolePermissionsOptions = {
  /** For multiple codes: require any match (default) or every match. */
  mode?: 'some' | 'every'
  /**
   * When permission data is not available yet (`data` undefined), treat as allowed or denied.
   * Use `'allow'` for optimistic UI (e.g. don’t block controls until loaded).
   */
  whenPending?: 'allow' | 'deny'
  /** Passed through to `useCurrentUserRolePermissions`. */
  enabled?: boolean
}

export type UseHasRolePermissionsResult = {
  /** Effective access for the given code(s), including `whenPending` while data is missing. */
  allowed: boolean
  /** True while the permissions query has no resolved data yet (initial load or disabled with no cache). */
  isPending: boolean
  /** True while a permissions request is in flight (including background refetch). */
  isFetching: boolean
}

/**
 * Client-side check against `GET /me/permissions` for the active organization (from the store).
 * Uses the same cache as `useCurrentUserRolePermissions` (key includes that org id).
 */
export function useHasRolePermissions(
  codes: string | readonly string[],
  options: UseHasRolePermissionsOptions = {}
): UseHasRolePermissionsResult {
  const { mode = 'some', whenPending = 'deny', enabled = true } = options
  const { data, isPending, isFetching } = useCurrentUserRolePermissions({
    enabled,
  })

  const codeList = typeof codes === 'string' ? [codes] : [...codes]

  let allowed = false
  if (codeList.length === 0) {
    allowed = true
  } else if (!data) {
    allowed = whenPending === 'allow'
  } else {
    const allowedSet = getAllowedPermissionCodes(data)
    allowed =
      mode === 'every'
        ? codeList.every((c) => allowedSet.has(c))
        : codeList.some((c) => allowedSet.has(c))
  }

  return { allowed, isPending, isFetching }
}

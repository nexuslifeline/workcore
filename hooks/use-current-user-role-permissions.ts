import { useQuery } from '@tanstack/react-query'
import { getCurrentUserRolePermissions } from '@/services/client/auth/current-user-permissions-service'
import type { CurrentUserPermissionItem } from '@/services/client/auth/current-user-permissions-service'
import { useOrganizationStore } from '@/stores/organization-store'

type UseCurrentUserRolePermissionsParams = {
  /** When false, the query is disabled. Use when no active organization is set. */
  enabled?: boolean
}

export function useCurrentUserRolePermissions({
  enabled = true,
}: UseCurrentUserRolePermissionsParams = {}) {
  const { activeOrganizationId } = useOrganizationStore()

  return useQuery<CurrentUserPermissionItem[]>({
    queryKey: ['me', 'permissions', activeOrganizationId],
    queryFn: () => getCurrentUserRolePermissions(activeOrganizationId!),
    enabled: enabled && !!activeOrganizationId,
    // 1 hour: org role permissions change infrequently; longer stale reduces repeat fetches.
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

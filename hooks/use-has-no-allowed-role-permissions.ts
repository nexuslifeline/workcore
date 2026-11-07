import { useCurrentUserRolePermissions } from '@/hooks/use-current-user-role-permissions'
import { getAllowedPermissionCodes } from '@/lib/shared/role-permissions-client'

export function useHasNoAllowedRolePermissions(): boolean {
  const { data, isSuccess } = useCurrentUserRolePermissions()
  if (!isSuccess || !data) return false
  return getAllowedPermissionCodes(data).size === 0
}

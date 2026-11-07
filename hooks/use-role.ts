import { useQuery } from '@tanstack/react-query'
import {
  getRole,
  getRolePermissions,
  type RolePermissionItem,
} from '@/services/client/roles/role-service'
import type { Role } from '@/types/role'

type UseRoleParams = {
  roleId: string | null | undefined
  enabled?: boolean
}

export function useRole({ roleId, enabled = true }: UseRoleParams) {
  return useQuery<Role | null>({
    queryKey: ['role', roleId],
    queryFn: () => (roleId ? getRole(roleId) : null),
    enabled: enabled && !!roleId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useRolePermissions({
  roleId,
  enabled = true,
  staleTime = 2 * 60 * 1000,
}: {
  roleId: string | null | undefined
  enabled?: boolean
  staleTime?: number
}) {
  return useQuery<RolePermissionItem[]>({
    queryKey: ['role', roleId, 'permissions'],
    queryFn: () => (roleId ? getRolePermissions(roleId) : []),
    enabled: enabled && !!roleId,
    staleTime,
    retry: 1,
  })
}

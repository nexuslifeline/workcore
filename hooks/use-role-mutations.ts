import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  type RolePermissionItem,
} from '@/services/client/roles/role-service'
import type { Role } from '@/types/role'

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; description?: string; isActive?: boolean }) =>
      createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name?: string; description?: string; isActive?: boolean }
    }) => updateRole(id, data),
    onSuccess: (updatedRole: Role, variables) => {
      queryClient.setQueryData(['role', variables.id], updatedRole)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['role', id] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      permissions,
    }: {
      id: string
      permissions: RolePermissionItem[]
    }) => setRolePermissions(id, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['me', 'permissions'] })
    },
  })
}

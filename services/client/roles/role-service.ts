import { api } from '@/lib/api'
import type { Role } from '@/types/role'

type GetRolesParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

type GetRolesResponse = {
  roles: Role[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function getRoles(
  params?: GetRolesParams
): Promise<GetRolesResponse> {
  const searchParams = new URLSearchParams()

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10

  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))

  if (params?.search) {
    searchParams.set('search', params.search)
  }

  if (params?.filters) {
    const isActive = params.filters.isActive
    if (isActive) {
      if (Array.isArray(isActive)) {
        isActive.forEach((s) => searchParams.append('isActive', s))
      } else if (typeof isActive === 'string' && isActive.trim() !== '') {
        searchParams.append('isActive', isActive)
      }
    }
  }

  if (params?.sortBy) {
    searchParams.set('sortBy', params.sortBy)
  }

  if (params?.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder)
  }

  const queryString = searchParams.toString()
  const url = queryString ? `/roles?${queryString}` : '/roles'

  const { data } = await api.get<GetRolesResponse>(url)
  return data
}

export async function getRole(id: string): Promise<Role> {
  const { data } = await api.get<{ role: Role }>(`/roles/${id}`)
  return data.role
}

export async function createRole(payload: {
  name: string
  description?: string
  isActive?: boolean
}): Promise<Role> {
  const { data } = await api.post<{ role: Role }>('/roles', payload)
  return data.role
}

export async function updateRole(
  id: string,
  payload: {
    name?: string
    description?: string
    isActive?: boolean
  }
): Promise<Role> {
  const { data } = await api.patch<{ role: Role }>(`/roles/${id}`, payload)
  return data.role
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`)
}

export type RolePermissionItem = {
  permission_id: string
  is_allowed: boolean
}

type SetRolePermissionsResponse = {
  permissions: RolePermissionItem[]
  message?: string
}

export async function getRolePermissions(
  id: string
): Promise<RolePermissionItem[]> {
  const { data } = await api.get<{ permissions: RolePermissionItem[] }>(
    `/roles/${id}/permissions`
  )
  return data.permissions
}

export async function setRolePermissions(
  id: string,
  permissions: RolePermissionItem[]
): Promise<RolePermissionItem[]> {
  const { data } = await api.put<SetRolePermissionsResponse>(
    `/roles/${id}/permissions`,
    permissions
  )
  return data.permissions
}

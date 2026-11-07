import { useQuery } from '@tanstack/react-query'
import { getRoles } from '@/services/client/roles/role-service'
import type { Role } from '@/types/role'

type UseRolesParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  enabled?: boolean
  staleTime?: number
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

export function useRoles(params?: UseRolesParams) {
  const { enabled, staleTime, ...listParams } = params ?? {}

  return useQuery<GetRolesResponse>({
    queryKey: ['roles', listParams],
    queryFn: () => getRoles(listParams),
    staleTime: staleTime ?? 5 * 60 * 1000,
    retry: 1,
    enabled: enabled !== false,
  })
}

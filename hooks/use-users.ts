import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/client/users/user-service'
import type { User } from '@/types/user'

type UseUsersParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
  enabled?: boolean
}

type GetUsersResponse = {
  users: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Hook for fetching users with pagination and filtering (for list pages)
 */
export function useUsers(params?: UseUsersParams) {
  return useQuery<GetUsersResponse>({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: params?.enabled !== false,
  })
}


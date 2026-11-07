import { useQuery } from '@tanstack/react-query'
import { getOrganizationMembers } from '@/services/client/organizations/organization-members-service'
import type { User } from '@/types/user'

type UseOrganizationMembersParams = {
  organizationId: string
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
  enabled?: boolean
}

type GetOrganizationMembersResponse = {
  members: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Hook for fetching organization members with pagination and filtering
 */
export function useOrganizationMembers(params: UseOrganizationMembersParams) {
  return useQuery<GetOrganizationMembersResponse>({
    queryKey: ['organization-members', params.organizationId, params],
    queryFn: () => getOrganizationMembers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: params?.enabled !== false && !!params.organizationId,
  })
}

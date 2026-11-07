import { useQuery } from '@tanstack/react-query'
import { getOrganizations } from '@/services/client/organizations/organization-service'
import type { Organization } from '@/types/organization'

type UseOrganizationsParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
  enabled?: boolean
}

type GetOrganizationsResponse = {
  organizations: Organization[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Hook for fetching organizations with pagination and filtering (for list pages)
 */
export function useOrganizations(params?: UseOrganizationsParams) {
  return useQuery<GetOrganizationsResponse>({
    queryKey: ['organizations', params],
    queryFn: () => getOrganizations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: params?.enabled !== false,
  })
}

/**
 * Hook for fetching all organizations without pagination (for dropdowns, etc.)
 */
export function useAllOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ['organizations', 'all'],
    queryFn: async () => {
      const response = await getOrganizations({ page: 1, pageSize: 1000 })
      return response.organizations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}


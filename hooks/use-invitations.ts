import { useQuery } from '@tanstack/react-query'
import { getInvitations } from '@/services/client/invitations/invitation-service'
import { useOrganizationStore } from '@/stores/organization-store'
import type { User } from '@/types/user'

type UseInvitationsParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
  enabled?: boolean
}

type GetInvitationsResponse = {
  invitations: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Hook for fetching invitations with pagination and filtering
 */
export function useInvitations(params?: UseInvitationsParams) {
  const { activeOrganizationId } = useOrganizationStore()

  return useQuery<GetInvitationsResponse>({
    queryKey: ['invitations', activeOrganizationId, params],
    queryFn: () => getInvitations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!activeOrganizationId && params?.enabled !== false,
  })
}


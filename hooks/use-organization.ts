import { useQuery } from '@tanstack/react-query'
import { getOrganization } from '@/services/client/organizations/organization-service'
import type { Organization } from '@/types/organization'

export function useOrganization(id: string | null) {
  return useQuery<Organization>({
    queryKey: ['organization', id],
    queryFn: () => getOrganization(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}




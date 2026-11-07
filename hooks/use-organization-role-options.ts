import { useQuery } from '@tanstack/react-query'
import {
  getOrganizationRoleOptions,
  type OrganizationRoleOption,
} from '@/services/client/organizations/organization-roles-service'

export function useOrganizationRoleOptions(organizationId: string | null) {
  return useQuery<OrganizationRoleOption[]>({
    queryKey: ['organization-role-options', organizationId],
    queryFn: () => getOrganizationRoleOptions(organizationId!),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!organizationId,
  })
}

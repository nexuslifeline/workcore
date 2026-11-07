import { api } from '@/lib/api'

export type OrganizationRoleOption = {
  id: string
  name: string
}

export async function getOrganizationRoleOptions(
  organizationId: string
): Promise<OrganizationRoleOption[]> {
  const { data } = await api.get<{ roles: OrganizationRoleOption[] }>(
    `/organizations/${organizationId}/roles`
  )
  return data.roles
}

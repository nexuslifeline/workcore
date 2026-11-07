import { api } from '@/lib/api'
import type { User } from '@/types/user'

type GetOrganizationMembersParams = {
  organizationId: string
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
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
 * Fetch members of a specific organization with pagination and filtering
 */
export async function getOrganizationMembers(
  params: GetOrganizationMembersParams
): Promise<GetOrganizationMembersResponse> {
  const searchParams = new URLSearchParams()
  
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  
  if (params.search) {
    searchParams.set('search', params.search)
  }
  
  if (params.filters) {
    const status = params.filters.status
    const roleId = params.filters.roleId
    const statusValues = Array.isArray(status) ? status : status ? [status] : []
    const roleIdValues = Array.isArray(roleId) ? roleId : roleId ? [roleId] : []

    statusValues.filter(Boolean).forEach((s) => searchParams.append('status', s))
    roleIdValues.filter(Boolean).forEach((id) => searchParams.append('roleId', id))
  }

  const queryString = searchParams.toString()
  const url = queryString 
    ? `/organizations/${params.organizationId}/members?${queryString}`
    : `/organizations/${params.organizationId}/members`
  
  const { data } = await api.get<GetOrganizationMembersResponse>(url)
  return data
}

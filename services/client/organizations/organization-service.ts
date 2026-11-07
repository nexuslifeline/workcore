import { api } from '@/lib/api'
import type { Organization } from '@/types/organization'

type GetOrganizationsParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
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
 * Fetch organizations for the current user with pagination and filtering
 */
export async function getOrganizations(
  params?: GetOrganizationsParams
): Promise<GetOrganizationsResponse> {
  const searchParams = new URLSearchParams()
  
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  
  if (params?.search) {
    searchParams.set('search', params.search)
  }
  
  if (params?.filters) {
    const status = params.filters.status as string[] | undefined
    const industry = params.filters.industry as string[] | undefined
    
    if (status && Array.isArray(status) && status.length > 0) {
      status.forEach((s) => searchParams.append('status', s))
    }
    if (industry && Array.isArray(industry) && industry.length > 0) {
      industry.forEach((i) => searchParams.append('industry', i))
    }
  }

  const queryString = searchParams.toString()
  const url = queryString ? `/organizations?${queryString}` : '/organizations'
  
  const { data } = await api.get<GetOrganizationsResponse>(url)
  return data
}

/**
 * Fetch a single organization by ID
 */
export async function getOrganization(id: string): Promise<Organization> {
  const { data } = await api.get<{ organization: Organization }>(`/organizations/${id}`)
  return data.organization
}

/**
 * Create a new organization
 */
export async function createOrganization(
  payload: { name: string; description?: string }
): Promise<Organization> {
  const { data } = await api.post<{ organization: Organization }>('/organizations', payload)
  return data.organization
}

/**
 * Update an organization
 */
export async function updateOrganization(
  id: string,
  payload: Partial<Organization>
): Promise<Organization> {
  const { data } = await api.patch<{ organization: Organization }>(
    `/organizations/${id}`,
    payload
  )
  return data.organization
}





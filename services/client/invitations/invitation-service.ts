import { api } from '@/lib/api'
import type { User } from '@/types/user'

type GetInvitationsParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
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
 * Fetch invitations for the active organization with pagination and filtering
 */
export async function getInvitations(
  params?: GetInvitationsParams
): Promise<GetInvitationsResponse> {
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
    
    if (status && Array.isArray(status) && status.length > 0) {
      status.forEach((s) => searchParams.append('status', s))
    }
  }

  const queryString = searchParams.toString()
  const url = queryString ? `/invitations?${queryString}` : '/invitations'
  
  const { data } = await api.get<GetInvitationsResponse>(url)
  return data
}

export type CreateOrganizationInviteParams = {
  organizationId: string
  email: string
  roleId: string
  message?: string
}

export type CreateOrganizationInviteResponse = {
  invitationUrl: string
  invitation: {
    id: string
    email: string
    roleId: string
    role: string
    message: string | null
    status: string
    expiresAt: string
    createdAt: string
  }
}

export async function createOrganizationInvite(
  params: CreateOrganizationInviteParams
): Promise<CreateOrganizationInviteResponse> {
  const { organizationId, email, roleId, message } = params
  const { data } = await api.post<CreateOrganizationInviteResponse>(
    `/organizations/${organizationId}/invites`,
    { email, roleId, message }
  )
  return data
}


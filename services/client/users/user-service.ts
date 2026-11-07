import { api } from '@/lib/api'
import type { User } from '@/types/user'

type GetUsersParams = {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
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
 * Fetch users for the current user with pagination and filtering
 */
export async function getUsers(
  params?: GetUsersParams
): Promise<GetUsersResponse> {
  const searchParams = new URLSearchParams()
  
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  
  if (params?.search) {
    searchParams.set('search', params.search)
  }
  
  if (params?.filters) {
    const status = params.filters.status
    const roleId = params.filters.roleId
    const statusValues = Array.isArray(status) ? status : status ? [status] : []
    const roleIdValues = Array.isArray(roleId) ? roleId : roleId ? [roleId] : []

    statusValues.filter(Boolean).forEach((s) => searchParams.append('status', s))
    roleIdValues.filter(Boolean).forEach((id) => searchParams.append('roleId', id))
  }

  const queryString = searchParams.toString()
  const url = queryString ? `/users?${queryString}` : '/users'
  
  const { data } = await api.get<GetUsersResponse>(url)
  return data
}

/**
 * Fetch a single user by ID (profile id)
 */
export async function getUser(id: string): Promise<User> {
  const { data } = await api.get<{ user: User }>(`/users/${id}`)
  return data.user
}

export type CreateUserPayload = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  roleId: string
  organizationId: string
}

export type UpdateUserPayload = {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  password?: string
  /** Role id for the org; null = owner (optional when editing owner) */
  roleId?: string | null
}

type CreateUserResponse = {
  user: {
    id: string
    userId: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    status: string
    roleId: string
    createdAt: string
    updatedAt: string
  }
}

/**
 * Create a new user in the organization (auth user + profile + org membership)
 */
export async function createUser(payload: CreateUserPayload): Promise<CreateUserResponse['user']> {
  const { data } = await api.post<CreateUserResponse>('/users', payload)
  return data.user
}

/**
 * Update an existing user (profile and optionally org role). Id is the profile id.
 */
export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<{ user: User }> {
  const { data } = await api.patch<{ user: User }>(`/users/${id}`, payload)
  return data
}





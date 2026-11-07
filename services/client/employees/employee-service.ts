import { api } from '@/lib/api'
import type { Employee, EmployeeInput } from '@/types/employee'

type ListResponse = {
  employees: Employee[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function getEmployees(params?: {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
}): Promise<ListResponse> {
  const searchParams = new URLSearchParams()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  if (params?.search) searchParams.set('search', params.search)
  const status = params?.filters?.status
  const statusValues = Array.isArray(status) ? status : status ? [status] : []
  statusValues.filter(Boolean).forEach((value) => searchParams.append('status', value))
  const query = searchParams.toString()
  const { data } = await api.get<ListResponse>(query ? `/employees?${query}` : '/employees')
  return data
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data } = await api.get<{ employee: Employee }>(`/employees/${id}`)
  return data.employee
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const { data } = await api.post<{ employee: Employee }>('/employees', input, {
    skipErrorToast: true,
  })
  return data.employee
}

export async function updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
  const { data } = await api.patch<{ employee: Employee }>(`/employees/${id}`, input, {
    skipErrorToast: true,
  })
  return data.employee
}

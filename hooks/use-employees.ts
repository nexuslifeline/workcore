import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from '@/services/client/employees/employee-service'
import type { EmployeeInput } from '@/types/employee'

export function useEmployees(params?: {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
}) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployees(params),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id),
    enabled: Boolean(id),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) =>
      updateEmployee(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}

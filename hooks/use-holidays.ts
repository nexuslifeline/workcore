import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createHoliday,
  getHoliday,
  getHolidays,
  updateHoliday,
} from '@/services/client/payroll/holiday-service'
import type { HolidayInput } from '@/types/holiday'

export function useHolidays(params?: {
  page?: number
  pageSize?: number
  search?: string
  from?: string
  to?: string
  recurring?: string[]
}) {
  return useQuery({
    queryKey: ['holidays', params],
    queryFn: () => getHolidays(params),
  })
}

export function useHoliday(id: string) {
  return useQuery({
    queryKey: ['holiday', id],
    queryFn: () => getHoliday(id),
    enabled: Boolean(id),
  })
}

export function useCreateHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HolidayInput) => createHoliday(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
    },
  })
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: HolidayInput }) => updateHoliday(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      queryClient.invalidateQueries({ queryKey: ['holiday', variables.id] })
    },
  })
}

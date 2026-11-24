import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDriverRouteLog,
  getDriverRouteLog,
  getDriverRouteLogs,
  updateDriverRouteLog,
} from '@/services/client/driver-route-logs/driver-route-log-service'
import type { DriverRouteLogInput } from '@/types/driver-route-log'

export function useDriverRouteLogs(params?: {
  page?: number
  pageSize?: number
  search?: string
  status?: string[]
  from?: string
  to?: string
}) {
  return useQuery({
    queryKey: ['driver-route-logs', params],
    queryFn: () => getDriverRouteLogs(params),
  })
}

export function useDriverRouteLog(id: string) {
  return useQuery({
    queryKey: ['driver-route-log', id],
    queryFn: () => getDriverRouteLog(id),
    enabled: Boolean(id),
  })
}

export function useCreateDriverRouteLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DriverRouteLogInput) => createDriverRouteLog(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-route-logs'] })
    },
  })
}

export function useUpdateDriverRouteLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DriverRouteLogInput }) =>
      updateDriverRouteLog(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-route-logs'] })
      queryClient.invalidateQueries({ queryKey: ['driver-route-log', variables.id] })
    },
  })
}

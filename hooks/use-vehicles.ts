import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVehicle,
  getVehicle,
  getVehicles,
  updateVehicle,
} from '@/services/client/vehicles/vehicle-service'
import type { VehicleInput } from '@/types/vehicle'

export function useVehicles(params?: {
  page?: number
  pageSize?: number
  search?: string
}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => getVehicles(params),
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VehicleInput) => createVehicle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VehicleInput }) =>
      updateVehicle(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] })
    },
  })
}

import { api } from '@/lib/api'
import type { Vehicle, VehicleInput } from '@/types/vehicle'

type ListResponse = {
  vehicles: Vehicle[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function getVehicles(params?: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<ListResponse> {
  const searchParams = new URLSearchParams()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  if (params?.search) searchParams.set('search', params.search)
  const query = searchParams.toString()
  const { data } = await api.get<ListResponse>(query ? `/vehicles?${query}` : '/vehicles')
  return data
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.get<{ vehicle: Vehicle }>(`/vehicles/${id}`)
  return data.vehicle
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post<{ vehicle: Vehicle }>('/vehicles', input, {
    skipErrorToast: true,
  })
  return data.vehicle
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.patch<{ vehicle: Vehicle }>(`/vehicles/${id}`, input, {
    skipErrorToast: true,
  })
  return data.vehicle
}

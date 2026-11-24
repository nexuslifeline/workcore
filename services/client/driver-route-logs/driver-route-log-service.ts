import { api } from '@/lib/api'
import type { DriverRouteLog, DriverRouteLogInput } from '@/types/driver-route-log'

type ListResponse = {
  driverRouteLogs: DriverRouteLog[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function getDriverRouteLogs(params?: {
  page?: number
  pageSize?: number
  search?: string
  status?: string[]
  from?: string
  to?: string
}): Promise<ListResponse> {
  const searchParams = new URLSearchParams()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  if (params?.search) searchParams.set('search', params.search)
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  params?.status?.filter(Boolean).forEach((value) => searchParams.append('status', value))
  const query = searchParams.toString()
  const { data } = await api.get<ListResponse>(
    query ? `/driver-route-logs?${query}` : '/driver-route-logs'
  )
  return data
}

export async function getDriverRouteLog(id: string): Promise<DriverRouteLog> {
  const { data } = await api.get<{ driverRouteLog: DriverRouteLog }>(`/driver-route-logs/${id}`)
  return data.driverRouteLog
}

export async function createDriverRouteLog(input: DriverRouteLogInput): Promise<DriverRouteLog> {
  const { data } = await api.post<{ driverRouteLog: DriverRouteLog }>('/driver-route-logs', input, {
    skipErrorToast: true,
  })
  return data.driverRouteLog
}

export async function updateDriverRouteLog(
  id: string,
  input: DriverRouteLogInput
): Promise<DriverRouteLog> {
  const { data } = await api.patch<{ driverRouteLog: DriverRouteLog }>(
    `/driver-route-logs/${id}`,
    input,
    { skipErrorToast: true }
  )
  return data.driverRouteLog
}

export async function deleteDriverRouteLog(id: string): Promise<void> {
  await api.delete(`/driver-route-logs/${id}`)
}

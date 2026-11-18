import { api } from '@/lib/api'
import type { Holiday, HolidayInput, HolidayListItem } from '@/types/holiday'

type ListResponse = {
  holidays: HolidayListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function getHolidays(params?: {
  page?: number
  pageSize?: number
  search?: string
  from?: string
  to?: string
  recurring?: string[]
}): Promise<ListResponse> {
  const searchParams = new URLSearchParams()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  if (params?.search) searchParams.set('search', params.search)
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  params?.recurring?.filter(Boolean).forEach((value) => searchParams.append('recurring', value))
  const query = searchParams.toString()
  const { data } = await api.get<ListResponse>(query ? `/holidays?${query}` : '/holidays')
  return data
}

export async function getHoliday(id: string): Promise<Holiday> {
  const { data } = await api.get<{ holiday: Holiday }>(`/holidays/${id}`)
  return data.holiday
}

export async function createHoliday(input: HolidayInput): Promise<Holiday> {
  const { data } = await api.post<{ holiday: Holiday }>('/holidays', input, {
    skipErrorToast: true,
  })
  return data.holiday
}

export async function updateHoliday(id: string, input: HolidayInput): Promise<Holiday> {
  const { data } = await api.patch<{ holiday: Holiday }>(`/holidays/${id}`, input, {
    skipErrorToast: true,
  })
  return data.holiday
}

export async function deleteHoliday(id: string): Promise<void> {
  await api.delete(`/holidays/${id}`)
}

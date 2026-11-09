import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { getEmployees } from '@/services/client/employees/employee-service'
import type { Employee } from '@/types/employee'

type UseEmployeesInfiniteParams = {
  search?: string
  filters?: Record<string, string | string[]>
  enabled?: boolean
  pageSize?: number
}

type GetEmployeesResponse = {
  employees: Employee[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function useEmployeesInfinite(params?: UseEmployeesInfiniteParams) {
  const { search, filters, enabled = true, pageSize = 20 } = params || {}
  const [debouncedSearch, setDebouncedSearch] = useState(search || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search || '')
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const query = useInfiniteQuery<GetEmployeesResponse>({
    queryKey: ['employees-infinite', { search: debouncedSearch, filters, pageSize }],
    queryFn: ({ pageParam = 1 }) =>
      getEmployees({
        page: pageParam as number,
        pageSize,
        search: debouncedSearch.trim() || undefined,
        filters,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  })

  const employees = useMemo(() => {
    if (!query.data?.pages) return []
    const seen = new Set<string>()
    return query.data.pages.flatMap((page) => page.employees).filter((employee) => {
      if (seen.has(employee.id)) return false
      seen.add(employee.id)
      return true
    })
  }, [query.data])

  return {
    employees,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchNextPage: query.fetchNextPage,
  }
}

import { useInfiniteQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/client/users/user-service'
import type { User } from '@/types/user'
import { useMemo, useState, useEffect } from 'react'

type UseUsersInfiniteParams = {
  search?: string
  filters?: Record<string, string | string[]>
  enabled?: boolean
  pageSize?: number
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

export function useUsersInfinite(params?: UseUsersInfiniteParams) {
  const { search, filters, enabled = true, pageSize = 20 } = params || {}
  const [debouncedSearch, setDebouncedSearch] = useState(search || '')

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search || '')
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [search])

  const query = useInfiniteQuery<GetUsersResponse>({
    queryKey: ['users-infinite', { search: debouncedSearch, filters, pageSize }],
    queryFn: ({ pageParam = 1 }) =>
      getUsers({
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
    enabled: enabled !== false,
  })

  // Flatten all pages into a single array
  const users = useMemo(() => {
    if (!query.data?.pages) return []
    return query.data.pages.flatMap((page) => page.users)
  }, [query.data])

  // Remove duplicates by userId (in case of race conditions)
  const uniqueUsers = useMemo(() => {
    const seen = new Set<string>()
    return users.filter((user) => {
      if (seen.has(user.userId)) {
        return false
      }
      seen.add(user.userId)
      return true
    })
  }, [users])

  const hasNextPage = query.hasNextPage
  const isFetchingNextPage = query.isFetchingNextPage

  return {
    users: uniqueUsers,
    hasNextPage,
    isFetchingNextPage,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    error: query.error,
  }
}

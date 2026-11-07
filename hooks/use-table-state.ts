import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { SortingState } from '@tanstack/react-table'

/**
 * Query params owned by slide-over panels (e.g. `?action=edit&id=…`).
 * They are not table filters: treating them as filters would put them back
 * on the next table URL rewrite after the panel removed them.
 */
const PANEL_QUERY_KEYS = ['action', 'id', 'tab', 'preview']

const RESERVED_LIST_QUERY_KEYS = new Set([
  'page',
  'pageSize',
  'search',
  'sortBy',
  'sortOrder',
  ...PANEL_QUERY_KEYS,
])

function isReservedListQueryKey(key: string) {
  return RESERVED_LIST_QUERY_KEYS.has(key)
}

export type UseTableStateReturn = {
  // State values
  search: string
  filters: Record<string, string | string[]>
  page: number
  pageSize: number
  sorting: SortingState
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  paginatedQueryParams: {
    page: number
    pageSize: number
    search?: string
    filters: Record<string, string | string[]>
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  // Query object containing all query string key-value pairs (for reference)
  query: Record<string, string | string[]>
  // Setters
  setSearch: (value: string) => void
  setFilters: (filters: Record<string, string | string[]>) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSorting: (updater: SortingState | ((prev: SortingState) => SortingState)) => void
}

export function useTableState(): UseTableStateReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read all query params from URL (only on mount)
  const query = useMemo(() => {
    const result: Record<string, string | string[]> = {}
    searchParams.forEach((_value, key) => {
      const allValues = searchParams.getAll(key)
      if (allValues.length === 1) {
        result[key] = allValues[0]
      } else {
        result[key] = allValues
      }
    })
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only compute once on mount

  // Initialize state from query
  const [search, setSearchState] = useState(() => {
    return (query.search as string) || ''
  })

  const [filters, setFiltersState] = useState<Record<string, string | string[]>>(() => {
    const result: Record<string, string | string[]> = {}
    // Extract filter params. Paging, sort, and panel keys stay out of the list request.
    Object.entries(query).forEach(([key, value]) => {
      if (!isReservedListQueryKey(key)) {
        // Normalize filter values: if it's a string, keep it as string (for single values)
        // If it's an array, keep it as array (for multiple values)
        // This preserves the format from the query string
        result[key] = value
      }
    })
    return result
  })

  const [page, setPageState] = useState(() => {
    return query.page ? Number(query.page) : 1
  })

  const [pageSize, setPageSizeState] = useState(() => {
    return query.pageSize ? Number(query.pageSize) : 10
  })

  // Initialize sorting from query string
  // Format: sortBy=columnId&sortOrder=asc|desc
  const [sorting, setSortingState] = useState<SortingState>(() => {
    const sortBy = query.sortBy as string | undefined
    const sortOrder = query.sortOrder as 'asc' | 'desc' | undefined
    
    if (sortBy && sortOrder) {
      return [{ id: sortBy, desc: sortOrder === 'desc' }]
    }
    return []
  })

  // Track if component is mounted (to skip initial sync)
  const isMounted = useRef(false)

  // Track initial values to avoid resetting page on mount
  const initialFiltersRef = useRef(filters)
  const initialSearchRef = useRef(search)

  // Mark as mounted after first render
  useEffect(() => {
    isMounted.current = true
  }, [])

  // Reset page to 1 when filters or search change (but not on initial load)
  useEffect(() => {
    if (!isMounted.current) return

    const filtersChanged =
      JSON.stringify(filters) !== JSON.stringify(initialFiltersRef.current)
    const searchChanged = search !== initialSearchRef.current

    if (filtersChanged || searchChanged) {
      setPageState(1)
    }
  }, [filters, search])

  // Helper function to update filters in URL params
  const updateFiltersInParams = useCallback(
    (params: URLSearchParams, filters: Record<string, string | string[]>) => {
      Object.entries(filters).forEach(([key, value]) => {
        // Early return for empty arrays
        if (Array.isArray(value) && value.length === 0) {
          params.delete(key)
          return
        }

        // Handle array values
        if (Array.isArray(value)) {
          params.delete(key)
          value.forEach((v) => {
            if (v === undefined || v === null || v === '') return
            params.append(key, String(v))
          })
          return
        }

        // Handle single values
        params.set(key, String(value))
      })
    },
    []
  )

  // Helper function to update URL
  const updateUrl = (
    updates: {
      page?: number
      pageSize?: number
      search?: string
      filters?: Record<string, string | string[]>
      sorting?: SortingState
    }
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update page
    if (updates.page !== undefined) {
      if (updates.page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(updates.page))
      }
    }

    // Update pageSize
    if (updates.pageSize !== undefined) {
      if (updates.pageSize === 10) {
        params.delete('pageSize')
      } else {
        params.set('pageSize', String(updates.pageSize))
      }
    }

    // Update search
    if (updates.search !== undefined) {
      if (updates.search.trim() === '') {
        params.delete('search')
      } else {
        params.set('search', updates.search)
      }
    }

    // Update sorting
    if (updates.sorting !== undefined) {
      params.delete('sortBy')
      params.delete('sortOrder')
      
      if (updates.sorting.length > 0) {
        const firstSort = updates.sorting[0]
        params.set('sortBy', firstSort.id)
        params.set('sortOrder', firstSort.desc ? 'desc' : 'asc')
      }
    }

    // Update filters
    if (updates.filters !== undefined) {
      // Delete existing filter params. Reserved keys (paging, sort, panel) stay.
      const keysToDelete: string[] = []
      params.forEach((_value, key) => {
        if (!isReservedListQueryKey(key)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach((key) => params.delete(key))
      
      // Then, add the new filter params
      if (Object.keys(updates.filters).length > 0) {
        updateFiltersInParams(params, updates.filters)
      }
    }

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(url)
  }

  // Observe page changes
  useEffect(() => {
    if (!isMounted.current) return
    updateUrl({ page })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Observe pageSize changes
  useEffect(() => {
    if (!isMounted.current) return
    updateUrl({ pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize])

  // Observe sorting changes
  useEffect(() => {
    if (!isMounted.current) return
    updateUrl({ sorting })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting])

  // Observe search and filters changes together to avoid race conditions
  // This ensures both are updated in a single URL update call
  useEffect(() => {
    if (!isMounted.current) return
    updateUrl({ search, filters })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters])

  // Setters that update state (which will sync to URL via effect above)
  const setSearch = useCallback((value: string) => {
    setSearchState(value)
  }, [])

  const setFilters = useCallback((newFilters: Record<string, string | string[]>) => {
    setFiltersState(newFilters)
  }, [])

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage)
  }, [])

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize)
  }, [])

  const setSorting = useCallback((updater: SortingState | ((prev: SortingState) => SortingState)) => {
    setSortingState((prev) => {
      if (typeof updater === 'function') {
        return updater(prev)
      }
      return updater
    })
  }, [])

  // Extract sortBy and sortOrder from sorting state for convenience
  const sortBy = sorting.length > 0 ? sorting[0].id : undefined
  const sortOrder: 'asc' | 'desc' | undefined =
    sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined

  const paginatedQueryParams = useMemo(
    () => ({
      page,
      pageSize,
      search: search.trim() ? search : undefined,
      filters,
      sortBy,
      sortOrder,
    }),
    [page, pageSize, search, filters, sortBy, sortOrder]
  )

  return {
    search,
    filters,
    page,
    pageSize,
    sorting,
    sortBy,
    sortOrder,
    paginatedQueryParams,
    query,
    setSearch,
    setFilters,
    setPage,
    setPageSize,
    setSorting,
  }
}

/** Params derived from URL/table state; pass to list fetch hooks. */
export type PaginatedTableQueryParams = UseTableStateReturn['paginatedQueryParams']


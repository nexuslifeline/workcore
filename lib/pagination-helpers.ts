import { URLSearchParams } from 'url'

export type PaginationParams = {
  page: number
  pageSize: number
  skip: number
}

export type PaginationResponse = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const skip = (page - 1) * pageSize

  return { page, pageSize, skip }
}

/**
 * Create pagination response object
 */
export function createPaginationResponse(
  page: number,
  pageSize: number,
  total: number
): PaginationResponse {
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    total,
    totalPages,
  }
}

/**
 * Parse search parameter from URL search params
 */
export function parseSearchParam(searchParams: URLSearchParams): string {
  return searchParams.get('search') || ''
}

/**
 * Parse array filter parameter from URL search params
 */
export function parseArrayFilterParam(
  searchParams: URLSearchParams,
  key: string
): string[] {
  return searchParams.getAll(key)
}

/**
 * Parse common list query params: page, pageSize, search, sortBy, sortOrder.
 */
export function parseListQuery(searchParams: URLSearchParams) {
  const { page, pageSize, skip } = parsePaginationParams(searchParams)
  const search = parseSearchParam(searchParams)
  const sortBy = searchParams.get('sortBy') || undefined
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) || undefined

  return {
    page,
    pageSize,
    skip,
    search,
    sortBy,
    sortOrder,
  }
}

// Journal-entries endpoints use parseListQuery + parseArrayFilterParam directly in the route.





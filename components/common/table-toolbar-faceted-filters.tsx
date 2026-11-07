'use client'

import type { ComponentType } from 'react'
import { FacetedFilter } from '@/components/common/faceted-filter'

export type TableToolbarFacetedFilterOption = {
  columnId: string
  title: string
  options: {
    label: string
    value: string
    icon?: ComponentType<{ className?: string }>
  }[]
}

export function filterValueToStringArray(
  filters: Record<string, string | string[]>,
  columnId: string
): string[] | undefined {
  const raw = filters[columnId]
  if (raw == null) return undefined
  return Array.isArray(raw) ? raw : [raw]
}

type TableToolbarFacetedFiltersProps = {
  filterOptions: TableToolbarFacetedFilterOption[]
  filters: Record<string, string | string[]>
  onFiltersChange: (next: Record<string, string | string[]>) => void
}

/**
 * Renders a row of {@link FacetedFilter}s and merges selections into table URL/filter state.
 */
export function TableToolbarFacetedFilters({
  filterOptions,
  filters,
  onFiltersChange,
}: TableToolbarFacetedFiltersProps) {
  return (
    <>
      {filterOptions.map((filter) => (
        <FacetedFilter
          key={filter.columnId}
          value={filterValueToStringArray(filters, filter.columnId)}
          onChange={(value) => {
            const next = { ...filters }
            if (value && value.length > 0) {
              next[filter.columnId] = value
            } else {
              delete next[filter.columnId]
            }
            onFiltersChange(next)
          }}
          title={filter.title}
          options={filter.options}
        />
      ))}
    </>
  )
}

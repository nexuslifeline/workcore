'use client'

import { useState, type ReactNode } from 'react'
import type { ColumnDef, VisibilityState, Updater } from '@tanstack/react-table'
import { Cross2Icon } from '@radix-ui/react-icons'
import { ListFilter } from 'lucide-react'
import { Input } from '@/components/common/input'
import { Button } from '@/components/common/button'
import { Badge } from '@/components/common/badges/badge'
import { DataTableViewOptions } from '@/components/data-table/view-options'
import {
  TableToolbarFacetedFilters,
  type TableToolbarFacetedFilterOption,
} from '@/components/common/table-toolbar-faceted-filters'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'
import { cn } from '@/lib/utils'

export type { TableToolbarFacetedFilterOption }

export type DataTableToolbarColumnViewOptions<TData> = {
  columns: ColumnDef<TData>[]
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void
}

export type DataTableToolbarProps<TData = unknown> = {
  /** Defaults to `"Search"`. */
  searchPlaceholder?: string
  /** Committed search (e.g. URL / table state). Updates after debounce from the input. */
  search: string
  /** Updates committed search after debounce while typing, on reset (`''`), etc. */
  setSearch: (value: string) => void
  /** Debounce delay before `setSearch` is called from the input; default 500. */
  searchDebounceMs?: number
  /** Reset clears the local input, then calls `setSearch('')` and `setFilters({})`. */
  setFilters: (filters: Record<string, string | string[]>) => void
  /** Extra controls between search and faceted filters (e.g. date range, category). */
  children?: ReactNode
  /** Faceted column filters; omit or pass `[]` to hide. */
  facetedFilterOptions?: TableToolbarFacetedFilterOption[]
  filters: Record<string, string | string[]>
  onFacetedFiltersChange: (next: Record<string, string | string[]>) => void
  /** Column visibility dropdown; omitted when not provided. */
  columnViewOptions?: DataTableToolbarColumnViewOptions<TData>
}

/** Count applied filters, ignoring date bound keys that often exist for the default range. */
function countActiveFilters(filters: Record<string, string | string[]>): number {
  let count = 0
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'from' || key === 'to') continue
    if (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '') {
      count += 1
    }
  }
  return count
}

/**
 * Shared toolbar layout for list tables: search, custom filter slot, reset, optional column view options.
 */
export function DataTableToolbar<TData = unknown>({
  searchPlaceholder = 'Search',
  search,
  setSearch,
  searchDebounceMs = 500,
  setFilters,
  children,
  facetedFilterOptions,
  filters,
  onFacetedFiltersChange,
  columnViewOptions,
}: DataTableToolbarProps<TData>) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { inputValue, setInputValue } = useDebouncedSearch({
    value: search,
    onDebouncedChange: setSearch,
    delayMs: searchDebounceMs,
  })

  const showFaceted =
    facetedFilterOptions !== undefined && facetedFilterOptions.length > 0

  const hasFilterPanel = Boolean(children) || showFaceted
  const activeFilterCount = countActiveFilters(filters)

  const showReset =
    Object.keys(filters).length > 0 || search.length > 0 || inputValue.length > 0

  const handleReset = () => {
    setInputValue('')
    setSearch('')
    setFilters({})
  }

  const filterControls = (
    <>
      {children}
      {showFaceted ? (
        <TableToolbarFacetedFilters
          filterOptions={facetedFilterOptions}
          filters={filters}
          onFiltersChange={onFacetedFiltersChange}
        />
      ) : null}
      {showReset ? (
        <Button
          variant='ghost'
          onClick={handleReset}
          className='h-8 w-full px-2 md:w-auto lg:px-3'
        >
          Reset
          <Cross2Icon className='ms-2 h-4 w-4' />
        </Button>
      ) : null}
    </>
  )

  const viewOptions = columnViewOptions ? (
    <DataTableViewOptions
      columns={columnViewOptions.columns}
      columnVisibility={columnViewOptions.columnVisibility}
      onColumnVisibilityChange={columnViewOptions.onColumnVisibilityChange}
    />
  ) : null

  return (
    <div className='grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:flex md:flex-row md:items-center'>
      <Input
        placeholder={searchPlaceholder}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        className='col-start-1 row-start-1 h-8 min-w-0 md:w-[150px] md:flex-none lg:w-[250px]'
      />
      {hasFilterPanel ? (
        <Button
          type='button'
          variant='outline'
          size='sm'
          aria-expanded={filtersOpen}
          aria-label='Filters'
          onClick={() => setFiltersOpen((open) => !open)}
          className='col-start-2 row-start-1 h-8 shrink-0 px-2 md:hidden'
        >
          <ListFilter className='size-4' />
          {activeFilterCount > 0 ? (
            <Badge
              variant='secondary'
              className='rounded-sm px-1 font-normal'
            >
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      ) : null}
      <div
        className={cn(
          'col-span-3 row-start-2 flex w-full flex-col gap-2 [&_button]:w-full [&_button]:justify-start',
          'md:col-auto md:row-auto md:flex-1 md:flex-row md:flex-wrap md:items-center md:gap-x-2 md:[&_button]:w-auto',
          !filtersOpen && 'max-md:hidden'
        )}
      >
        {filterControls}
      </div>
      {viewOptions ? (
        <div
          className={cn(
            'row-start-1 shrink-0 md:order-last md:ms-auto',
            hasFilterPanel ? 'col-start-3' : 'col-start-2'
          )}
        >
          {viewOptions}
        </div>
      ) : null}
    </div>
  )
}

import { Cross2Icon } from '@radix-ui/react-icons'
import type { ColumnDef, VisibilityState, Updater } from '@tanstack/react-table'
import { Button } from '@/components/common/button'
import { Input } from '@/components/common/input'
import { FacetedFilter } from '@/components/common/faceted-filter'
import { DataTableViewOptions } from '@/components/data-table/view-options'

type TableToolbarProps<TData> = {
  // Optional columns (for DataTableViewOptions)
  columns?: ColumnDef<TData>[]
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (updater: Updater<VisibilityState>) => void
  // Values (from parent state/URL) - plain object format
  filterValues?: Record<string, string | string[]>
  searchValue?: string
  // Callbacks - emit values that parent should set as state
  onFilterChange?: (filters: Record<string, string | string[]>) => void
  onSearchChange?: (value: string) => void
  onReset?: () => void
  // UI props
  searchPlaceholder?: string
  searchKey?: string
  filterOptions?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
    facets?: Map<string, number>
  }[]
}

export function TableToolbar<TData>({
  columns,
  columnVisibility = {},
  onColumnVisibilityChange,
  filterValues = {},
  searchValue: searchValueProp = '',
  onFilterChange,
  onSearchChange,
  onReset,
  searchPlaceholder = 'Search',
  searchKey,
  filterOptions = [],
}: TableToolbarProps<TData>) {
  // Determine if filters are active
  const hasActiveFilters = Object.keys(filterValues).some((key) => {
    const value = filterValues[key]
    if (Array.isArray(value)) return value.length > 0
    return typeof value === 'string' && value.trim() !== ''
  })
  const isFiltered = hasActiveFilters || searchValueProp.length > 0

  // Handle column filter changes
  const handleColumnFilterChange = (columnId: string, value: string[] | undefined) => {
    const newFilters = { ...filterValues }
    if (value && value.length > 0) {
      newFilters[columnId] = value
    } else {
      delete newFilters[columnId]
    }
    onFilterChange?.(newFilters)
  }

  // Handle reset
  const handleReset = () => {
    onReset?.()
    onFilterChange?.({})
    onSearchChange?.('')
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={(filterValues[searchKey] as string) ?? ''}
            onChange={(event) => {
              const value = event.target.value
              const newFilters = { ...filterValues }
              if (value.trim()) {
                newFilters[searchKey] = value
              } else {
                delete newFilters[searchKey]
              }
              onFilterChange?.(newFilters)
            }}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={searchValueProp}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        <div className='flex gap-x-2'>
          {filterOptions.map((filter) => {
            const rawValue = filterValues[filter.columnId]
            // Normalize to array: if string, wrap in array; if array, use as-is; if undefined, pass undefined
            const filterValue: string[] | undefined = rawValue
              ? Array.isArray(rawValue)
                ? rawValue
                : [rawValue]
              : undefined
            return (
              <FacetedFilter
                key={filter.columnId}
                value={filterValue}
                onChange={(value) => handleColumnFilterChange(filter.columnId, value)}
                title={filter.title}
                options={filter.options}
                facets={filter.facets}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleReset}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      {columns && columnVisibility !== undefined && onColumnVisibilityChange && (
        <DataTableViewOptions
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      )}
    </div>
  )
}


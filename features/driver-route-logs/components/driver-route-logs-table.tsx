'use client'

import { DATE_RANGE_PRESETS } from '@/components/common/date-range-combobox'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { useDriverRouteLogs } from '@/hooks/use-driver-route-logs'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'
import type { DriverRouteLog } from '@/types/driver-route-log'
import { driverRouteLogStatuses } from '../data'
import { getDriverRouteLogStartRange } from '../start-date-range'
import { driverRouteLogColumns } from './driver-route-logs-columns'

const startDatePresets = [
  { value: 'all', label: 'All' },
  ...DATE_RANGE_PRESETS.filter((preset) => preset.value !== 'custom'),
]

function textFilter(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function listFilter(value: string | string[] | undefined) {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).filter(Boolean)
}

function filtersWithoutDate(filters: Record<string, string | string[]>) {
  const next = { ...filters }
  delete next.datePreset
  delete next.from
  delete next.to
  return next
}

function useDriverRouteLogsListQuery(params: PaginatedTableQueryParams) {
  const from = textFilter(params.filters.from)
  const to = textFilter(params.filters.to)
  const hasRange = Boolean(from && to)
  const query = useDriverRouteLogs({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    status: listFilter(params.filters.status),
    from: hasRange ? from : undefined,
    to: hasRange ? to : undefined,
  })
  return {
    rows: query.data?.driverRouteLogs ?? [],
    isLoading: query.isLoading,
    error: query.error,
    totalPages: query.data?.pagination.totalPages ?? 0,
  }
}

const DriverRouteLogsListTableShell = createListTableQueryShell<DriverRouteLog>(
  useDriverRouteLogsListQuery
)

function StartDateRangeFilter({
  filters,
  setFilters,
}: {
  filters: Record<string, string | string[]>
  setFilters: (next: Record<string, string | string[]>) => void
}) {
  const preset = textFilter(filters.datePreset)
  const from = textFilter(filters.from)
  const to = textFilter(filters.to)

  return (
    <DateRangeFilter
      title='Start date'
      presets={startDatePresets}
      getRangeForPreset={getDriverRouteLogStartRange}
      value={preset || 'all'}
      from={from}
      to={to}
      onDateRangeChange={(nextPreset, nextFrom, nextTo) => {
        const next = filtersWithoutDate(filters)
        if (nextPreset !== 'all' && nextFrom && nextTo) {
          next.datePreset = nextPreset
          next.from = nextFrom
          next.to = nextTo
        }
        setFilters(next)
      }}
    />
  )
}

export function DriverRouteLogsTable() {
  return (
    <DriverRouteLogsListTableShell
      name='driver-route-logs'
      tableClassName='w-full'
      toolbar={{
        searchPlaceholder: 'Search route logs',
        facetedFilterOptions: [
          {
            columnId: 'status',
            title: 'Status',
            options: driverRouteLogStatuses,
          },
        ],
        children: ({ filters, setFilters }) => (
          <StartDateRangeFilter filters={filters} setFilters={setFilters} />
        ),
      }}
      columns={driverRouteLogColumns}
      dataTableProps={{
        enableSorting: false,
      }}
    />
  )
}

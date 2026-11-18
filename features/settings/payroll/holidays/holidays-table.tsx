'use client'

import { getDateRangeForPreset } from '@/components/common/date-range-combobox'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { useHolidays } from '@/hooks/use-holidays'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'
import type { HolidayListItem } from '@/types/holiday'
import { holidayRecurringOptions } from './data'
import { holidayColumns } from './holidays-columns'

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

function useHolidaysListQuery(params: PaginatedTableQueryParams) {
  const defaults = getDateRangeForPreset('this_year')
  const from = textFilter(params.filters.from) || defaults?.from
  const to = textFilter(params.filters.to) || defaults?.to
  const query = useHolidays({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    from,
    to,
    recurring: listFilter(params.filters.recurring),
  })
  return {
    rows: query.data?.holidays ?? [],
    isLoading: query.isLoading,
    error: query.error,
    totalPages: query.data?.pagination.totalPages ?? 0,
  }
}

const HolidaysListTableShell = createListTableQueryShell<HolidayListItem>(useHolidaysListQuery)

function HolidayDateRangeFilter({
  filters,
  setFilters,
}: {
  filters: Record<string, string | string[]>
  setFilters: (next: Record<string, string | string[]>) => void
}) {
  const defaults = getDateRangeForPreset('this_year') ?? { from: '', to: '' }
  const preset = textFilter(filters.datePreset)
  const from = textFilter(filters.from)
  const to = textFilter(filters.to)

  return (
    <DateRangeFilter
      value={preset || 'this_year'}
      from={from || defaults.from}
      to={to || defaults.to}
      onDateRangeChange={(nextPreset, nextFrom, nextTo) => {
        setFilters({
          ...filtersWithoutDate(filters),
          datePreset: nextPreset,
          from: nextFrom,
          to: nextTo,
        })
      }}
    />
  )
}

export function HolidaysTable() {
  return (
    <HolidaysListTableShell
      name='holidays'
      toolbar={{
        searchPlaceholder: 'Search holidays',
        facetedFilterOptions: [
          {
            columnId: 'recurring',
            title: 'Recurring',
            options: holidayRecurringOptions,
          },
        ],
        children: ({ filters, setFilters }) => (
          <HolidayDateRangeFilter filters={filters} setFilters={setFilters} />
        ),
      }}
      columns={holidayColumns}
      dataTableProps={{
        enableSorting: false,
        getRowId: (row) => `${row.id}:${row.date}`,
      }}
    />
  )
}

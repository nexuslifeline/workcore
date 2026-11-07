'use client'

import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { useEmployees } from '@/hooks/use-employees'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'
import type { Employee } from '@/types/employee'
import { employeeStatuses } from '../data/data'
import { employeeColumns } from './employees-columns'

function useEmployeesListQuery(params: PaginatedTableQueryParams) {
  const query = useEmployees({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    filters: params.filters,
  })
  return {
    rows: query.data?.employees ?? [],
    isLoading: query.isLoading,
    error: query.error,
    totalPages: query.data?.pagination.totalPages ?? 0,
  }
}

const EmployeesListTableShell = createListTableQueryShell<Employee>(useEmployeesListQuery)

export function EmployeesTable() {
  return (
    <EmployeesListTableShell
      name='employees'
      toolbar={{
        facetedFilterOptions: [
          {
            columnId: 'status',
            title: 'Status',
            options: employeeStatuses,
          },
        ],
      }}
      columns={employeeColumns}
      dataTableProps={{
        enableSorting: false,
      }}
    />
  )
}

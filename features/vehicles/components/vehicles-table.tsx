'use client'

import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { useVehicles } from '@/hooks/use-vehicles'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'
import type { Vehicle } from '@/types/vehicle'
import { vehicleColumns } from './vehicles-columns'

function useVehiclesListQuery(params: PaginatedTableQueryParams) {
  const query = useVehicles({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
  })
  return {
    rows: query.data?.vehicles ?? [],
    isLoading: query.isLoading,
    error: query.error,
    totalPages: query.data?.pagination.totalPages ?? 0,
  }
}

const VehiclesListTableShell = createListTableQueryShell<Vehicle>(useVehiclesListQuery)

export function VehiclesTable() {
  return (
    <VehiclesListTableShell
      name='vehicles'
      toolbar={{}}
      columns={vehicleColumns}
      dataTableProps={{
        enableSorting: false,
      }}
    />
  )
}

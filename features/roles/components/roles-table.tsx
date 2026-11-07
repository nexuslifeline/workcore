import { rolesColumns as columns } from './roles-columns'
import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { useRoles as useRolesQuery } from '@/hooks/use-roles'
import type { Role } from '@/features/roles/data/schema'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'

const filterOptions = [
  {
    columnId: 'isActive',
    title: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
]

function useRolesListQuery(params: PaginatedTableQueryParams) {
  const q = useRolesQuery(params)
  return {
    rows: q.data?.roles ?? [],
    isLoading: q.isLoading,
    error: q.error,
    totalPages: q.data?.pagination.totalPages ?? 0,
  }
}

const RolesListTableShell = createListTableQueryShell<Role>(useRolesListQuery)

export function RolesTable() {
  return (
    <RolesListTableShell
      name='roles'
      toolbar={{ facetedFilterOptions: filterOptions }}
      columns={columns}
    />
  )
}

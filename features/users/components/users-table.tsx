import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { usersColumns as columns } from './users-columns'
import { useUsers as useUsersQuery } from '@/hooks/use-users'
import { useRoles } from '@/hooks/use-roles'
import type { User } from '@/types/user'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'

const statusFilterOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
]

function useUsersListQuery(params: PaginatedTableQueryParams) {
  const q = useUsersQuery({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    filters: params.filters,
  })
  return {
    rows: q.data?.users ?? [],
    isLoading: q.isLoading,
    error: q.error,
    totalPages: q.data?.pagination.totalPages ?? 0,
  }
}

const UsersListTableShell = createListTableQueryShell<User>(useUsersListQuery)

export function UsersTable() {
  const { data: rolesData } = useRoles({ pageSize: 100, staleTime: 5 * 60 * 1000 })
  const roleFilterOptions = (rolesData?.roles ?? []).map((role) => ({
    label: role.name,
    value: role.id,
  }))

  return (
    <UsersListTableShell
      name='users'
      toolbar={{
        facetedFilterOptions: [
          {
            columnId: 'status',
            title: 'Status',
            options: statusFilterOptions,
          },
          {
            columnId: 'roleId',
            title: 'Role',
            options: roleFilterOptions,
          },
        ],
      }}
      columns={columns}
      dataTableProps={{
        enableSorting: false,
      }}
    />
  )
}

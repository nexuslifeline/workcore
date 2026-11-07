import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { statuses, industries } from '../data/data'
import { organizationsColumns as columns } from './organizations-columns'
import { useOrganizations as useOrganizationsQuery } from '@/hooks/use-organizations'
import type { OrganizationListItem } from '../data/schema'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'

const filterOptions = [
  {
    columnId: 'status',
    title: 'Status',
    options: statuses,
  },
  {
    columnId: 'industry',
    title: 'Industry',
    options: industries,
  },
]

function useOrganizationsListQuery(params: PaginatedTableQueryParams) {
  const q = useOrganizationsQuery({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    filters: params.filters,
  })
  return {
    rows: q.data?.organizations ?? [],
    isLoading: q.isLoading,
    error: q.error,
    totalPages: q.data?.pagination.totalPages ?? 0,
  }
}

const OrganizationsListTableShell =
  createListTableQueryShell<OrganizationListItem>(useOrganizationsListQuery)

export function OrganizationsTable() {
  return (
    <OrganizationsListTableShell
      name='organizations'
      toolbar={{
        facetedFilterOptions: filterOptions,
      }}
      columns={columns}
      dataTableProps={{
        enableSorting: false,
      }}
    />
  )
}

import { cn } from '@/lib/utils'
import { useTableState } from '@/hooks/use-table-state'
import { useColumnVisibility } from '@/hooks/use-column-visibility'
import { TableToolbar } from '@/components/common/table-toolbar'
import { TablePagination } from '@/components/common/table-pagination'
import { DataTable } from '@/components/common/data-table'
import { organizationMembersColumns as columns } from './organization-members-columns'
import { useOrganizationMembers } from '@/hooks/use-organization-members'
import { useOrganizationRoleOptions } from '@/hooks/use-organization-role-options'
import { FallbackSection } from '@/components/common/fallback-section'

type OrganizationMembersTableProps = {
  organizationId: string
}

const statusFilterOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending', value: 'pending' },
]

export function OrganizationMembersTable({
  organizationId,
}: OrganizationMembersTableProps) {
  // Column visibility state (persisted in localStorage)
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(
    'organization-members-table-column-visibility'
  )
  const { data: orgRoles } = useOrganizationRoleOptions(organizationId)
  const filterOptions = [
    {
      columnId: 'status',
      title: 'Status',
      options: statusFilterOptions,
    },
    {
      columnId: 'roleId',
      title: 'Role',
      options: [
        { label: 'Owner', value: 'owner' },
        ...(orgRoles ?? []).map((role) => ({
          label: role.name,
          value: role.id,
        })),
      ],
    },
  ]

  // Get state and setters from hook
  const {
    search,
    filters,
    page,
    pageSize,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
  } = useTableState()

  // Fetch data with server-side pagination
  const { data, isLoading, error } = useOrganizationMembers({
    organizationId,
    page,
    pageSize,
    search: search?.trim() ? search : undefined,
    filters,
  })

  const members = data?.members || []
  const paginationData = data?.pagination

  // Handle toolbar reset
  const handleToolbarReset = () => {
    setFilters({})
    setSearch('')
    // Page will be reset to 1 automatically by hook when filters/search change
  }

  if (error) {
    return (
      <FallbackSection
        title='Failed to load members'
        message='An error occurred while fetching organization members. Please try again.'
      />
    )
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <TableToolbar
        columns={columns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        filterValues={filters}
        searchValue={search}
        onFilterChange={setFilters}
        onSearchChange={setSearch}
        onReset={handleToolbarReset}
        filterOptions={filterOptions}
      />
      <div className='flex flex-1 flex-col gap-4'>
        <DataTable
          columns={columns}
          data={members}
          isLoading={isLoading}
          tableClassName="min-w-xl"
          pageCount={paginationData?.totalPages || 0}
          initialPage={page}
          initialPageSize={pageSize}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
        <TablePagination
          currentPage={page}
          totalPages={paginationData?.totalPages || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize)
            setPage(1)
          }}
          className='mt-auto'
        />
      </div>
    </div>
  )
}

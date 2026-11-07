import { cn } from '@/lib/utils'
import { useTableState } from '@/hooks/use-table-state'
import { useColumnVisibility } from '@/hooks/use-column-visibility'
import { TableToolbar } from '@/components/common/table-toolbar'
import { TablePagination } from '@/components/common/table-pagination'
import { DataTable } from '@/components/common/data-table'
import { invitationsColumns as columns } from './invitations-columns'
import { useInvitations } from '@/hooks/use-invitations'
import { FallbackSection } from '@/components/common/fallback-section'

const filterOptions = [
  {
    columnId: 'status',
    title: 'Status',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Accepted', value: 'accepted' },
      { label: 'Revoked', value: 'revoked' },
      { label: 'Expired', value: 'expired' },
    ],
  },
]

export function InvitationsTable() {
  // Column visibility state (persisted in localStorage)
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(
    'invitations-table-column-visibility'
  )

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
  const { data, isLoading, error } = useInvitations({
    page,
    pageSize,
    search: search?.trim() ? search : undefined,
    filters,
  })

  const invitations = data?.invitations || []
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
        title='Failed to load invitations'
        message='An error occurred while fetching invitations. Please try again.'
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
          data={invitations}
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


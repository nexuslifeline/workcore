import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableState } from '@/hooks/use-table-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/table'
import { TableToolbar } from '@/components/common/table-toolbar'
import { TablePagination } from '@/components/common/table-pagination'
import { priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { tasksColumns as columns } from './tasks-columns'

type DataTableProps = {
  data: Task[]
}

export function TasksTable({ data }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Get state from hook
  const {
    search,
    filters,
    page,
    pageSize,
    setSearch,
    setFilters,
    setPage,
    setPageSize,
  } = useTableState()

  // Convert filters to ColumnFiltersState for useReactTable
  const columnFilters = Object.entries(filters)
    .filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return typeof value === 'string' && value.trim() !== ''
    })
    .map(([id, value]) => ({ id, value }))

  const pagination = { pageIndex: page - 1, pageSize }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter: search,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const id = String(row.getValue('id')).toLowerCase()
      const title = String(row.getValue('title')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return id.includes(searchValue) || title.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      setPage(next.pageIndex + 1)
      setPageSize(next.pageSize)
    },
    onGlobalFilterChange: setSearch,
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater
      const newFilters: Record<string, string | string[]> = {}
      next.forEach((filter) => {
        if (Array.isArray(filter.value)) {
          newFilters[filter.id] = filter.value
        } else if (typeof filter.value === 'string' && filter.value.trim() !== '') {
          newFilters[filter.id] = filter.value
        }
      })
      setFilters(newFilters)
    },
  })


  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
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
        filterOptions={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses,
          },
          {
            columnId: 'priority',
            title: 'Priority',
            options: priorities,
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        currentPage={page}
        totalPages={table.getPageCount()}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize)
          setPage(1)
        }}
        className='mt-auto'
      />
      <DataTableBulkActions table={table} />
    </div>
  )
}

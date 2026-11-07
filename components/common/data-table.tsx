import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  type Updater,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/table'
import { Skeleton } from '@/components/common/skeletons'

export type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  pageCount: number
  // Optional props with defaults
  isLoading?: boolean
  emptyMessage?: string
  tableClassName?: string
  rowClassName?: string
  cellClassName?: string
  enableRowSelection?: boolean
  initialPage?: number
  initialPageSize?: number
  containerClassName?: string
  onPaginationChange?: (pagination: PaginationState) => void
  // Column visibility props
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (updater: Updater<VisibilityState>) => void
  // Sorting props (optional - for server-side sorting)
  sorting?: SortingState
  onSortingChange?: (updater: Updater<SortingState>) => void
  enableSorting?: boolean
  // Expandable rows (Option B - QuickBooks/Xero style)
  expandable?: boolean
  getRowId?: (row: TData) => string
  /** When `onExpandedChange` is omitted, expansion state is kept inside the table. */
  expandedRowIds?: Set<string>
  onExpandedChange?: (ids: Set<string>) => void
  renderExpandedContent?: (row: TData) => React.ReactNode
  /** Return true to show the row expand control; defaults to `row.hasChildren === true` when omitted. */
  showExpandIcon?: (row: TData) => boolean
  /** Optional summary bar pinned to the bottom of the table pane. */
  footer?: React.ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  isLoading = false,
  emptyMessage = 'No results.',
  tableClassName = '',
  rowClassName,
  cellClassName,
  enableRowSelection = true,
  initialPage = 1,
  initialPageSize = 10,
  containerClassName,
  onPaginationChange,
  columnVisibility,
  onColumnVisibilityChange,
  sorting,
  onSortingChange,
  enableSorting = true,
  expandable = false,
  getRowId,
  expandedRowIds: expandedRowIdsProp,
  onExpandedChange,
  renderExpandedContent,
  showExpandIcon,
  footer,
}: DataTableProps<TData>) {
  // Essential states for pagination and filtering
  const [filters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, initialPage - 1),
    pageSize: initialPageSize,
  })
  
  // Optional states (only if needed)
  const [rowSelection, setRowSelection] = useState({})
  
  // Sorting state (internal if not provided externally)
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const finalSorting = sorting ?? internalSorting
  const handleSortingChange = onSortingChange ?? setInternalSorting
  
  // Column visibility state (internal if not provided externally)
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const finalColumnVisibility = columnVisibility ?? internalColumnVisibility
  const handleColumnVisibilityChange = onColumnVisibilityChange ?? setInternalColumnVisibility

  const expansionControlled = onExpandedChange !== undefined
  const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<Set<string>>(
    () => new Set()
  )
  const expandedRowIds = expansionControlled
    ? (expandedRowIdsProp ?? new Set())
    : internalExpandedRowIds

  // Wrapped handlers that call external onChange if provided
  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination)
    onPaginationChange?.(newPagination)
  }

  const handleSortingChangeWrapper = (updater: Updater<SortingState>) => {
    if (typeof updater === 'function') {
      handleSortingChange((prev) => updater(prev))
    } else {
      handleSortingChange(updater)
    }
  }

  const handleExpandToggle = React.useCallback(
    (rowId: string) => {
      const next = new Set(expandedRowIds)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      if (expansionControlled) {
        onExpandedChange?.(next)
      } else {
        setInternalExpandedRowIds(next)
      }
    },
    [expandedRowIds, expansionControlled, onExpandedChange]
  )

  const expandColumn: ColumnDef<TData> = React.useMemo(
    () => ({
      id: 'expand',
      header: () => null,
      cell: ({ row }) => {
        const rowData = row.original
        const rowId = getRowId?.(rowData) ?? row.id
        const expandVisible = showExpandIcon
          ? showExpandIcon(rowData)
          : // Fallback: try to read a boolean field named hasChildren if present
            (rowData as any)?.hasChildren === true

        if (!expandVisible) {
          return <span className='inline-block w-4' />
        }

        const isExpanded = expandedRowIds.has(rowId)
        return (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              handleExpandToggle(rowId)
            }}
            className='p-1 rounded hover:bg-muted transition-colors'
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDownIcon className='h-4 w-4 text-muted-foreground' />
            ) : (
              <ChevronRightIcon className='h-4 w-4 text-muted-foreground' />
            )}
          </button>
        )
      },
      meta: { className: 'w-10' },
    }),
    [expandedRowIds, getRowId, handleExpandToggle, showExpandIcon]
  )

  const finalColumns = React.useMemo(
    () =>
      expandable && renderExpandedContent
        ? ([expandColumn, ...columns] as ColumnDef<TData>[])
        : columns,
    [expandable, renderExpandedContent, expandColumn, columns]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    state: {
      ...(enableRowSelection && { rowSelection }),
      // Filters for server-side filtering (synced via onColumnFiltersChange)
      columnFilters: filters,
      pagination,
      columnVisibility: finalColumnVisibility,
      ...(enableSorting && { sorting: finalSorting }),
    },
    ...(enableRowSelection && {
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
    }),
    onColumnFiltersChange: () => {}, // Not used - filters managed by toolbar
    onPaginationChange: handlePaginationChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    ...(enableSorting && {
      onSortingChange: handleSortingChangeWrapper,
      manualSorting: true, // Enable server-side sorting
    }),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  // Ensure page is in range
  useEffect(() => {
    if (pageCount && pagination.pageIndex >= pageCount) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(0, pageCount - 1),
      }))
    }
  }, [pageCount, pagination.pageIndex])


  const showFooter =
    Boolean(footer) && !isLoading && table.getRowModel().rows.length > 0

  return (
    <div
      className={cn(
        'rounded-md border',
        showFooter ? 'overflow-visible' : 'overflow-hidden',
        containerClassName
      )}
    >
      <TableComponent className={tableClassName}>
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
          {isLoading ? (
            // Show skeleton rows on initial load
            Array.from({ length: 2 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {table.getAllColumns().map((column, colIndex) => (
                  <TableCell
                    key={`skeleton-${index}-${colIndex}`}
                    className={cn(
                      column.columnDef.meta?.className,
                      column.columnDef.meta?.tdClassName
                    )}
                  >
                    <Skeleton className='h-5 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.flatMap((row) => {
              const rowData = row.original
              const rowId = getRowId?.(rowData) ?? row.id
              const isExpanded =
                expandable && expandedRowIds.has(rowId) && renderExpandedContent
              return [
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={rowClassName}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cellClassName,
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
                </TableRow>,
                ...(isExpanded
                  ? [
                      <TableRow key={`${row.id}-expanded`}>
                        <TableCell
                          colSpan={table.getVisibleFlatColumns().length}
                          className='p-0 align-top'
                        >
                          {renderExpandedContent(rowData)}
                        </TableCell>
                      </TableRow>,
                    ]
                  : []),
              ]
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleFlatColumns().length}
                className='h-24 text-center'
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableComponent>
      {showFooter ? (
        <div className='sticky bottom-0 z-20 min-w-0 rounded-b-[inherit] border-t bg-background'>
          {footer}
        </div>
      ) : null}
    </div>
  )
}


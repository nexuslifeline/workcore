'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type {
  ColumnDef,
  SortingState,
  Updater,
} from '@tanstack/react-table'
import { DataTable, type DataTableProps } from '@/components/common/data-table'
import {
  DataTableToolbar,
  type DataTableToolbarProps,
} from '@/components/common/data-table-toolbar'
import { TablePagination } from '@/components/common/table-pagination'
import { FallbackSection } from '@/components/common/fallback-section'
import { useColumnVisibility } from '@/hooks/use-column-visibility'
import {
  useTableState,
  type PaginatedTableQueryParams,
} from '@/hooks/use-table-state'

/** Outer layout for list pages using {@link DataTableToolbar} + {@link DataTable} + {@link TablePagination}. */
export const listTableShellClassName = cn(
  'max-sm:has-[div[role="toolbar"]]:mb-16',
  'flex flex-1 flex-col gap-4'
)

/** localStorage key for column visibility persistence. */
export function listTableColumnVisibilityStorageKey(name: string): string {
  return `${name}-table-column-visibility`
}

type ShellOwnedDataTableKeys =
  | 'columns'
  | 'data'
  | 'pageCount'
  | 'isLoading'
  | 'initialPage'
  | 'initialPageSize'
  | 'columnVisibility'
  | 'onColumnVisibilityChange'
  | 'sorting'
  | 'onSortingChange'
  | 'tableClassName'

/** Extra {@link DataTable} props; keys owned by the shell are omitted so they cannot conflict. */
export type ListTableShellDataTableProps<TData> = Partial<
  Omit<DataTableProps<TData>, ShellOwnedDataTableKeys>
>

export type ListTableShellPagination = {
  page: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (pageSize: number) => void
  totalPages: number
}

/** Toolbar props for the shell: {@link DataTableToolbar} without `columnViewOptions` (built from top-level `columns`). */
export type ListTableShellToolbarProps<TData> = Omit<
  DataTableToolbarProps<TData>,
  'columnViewOptions'
>

export type ListTableShellProps<TData> = {
  /**
   * Short id for this list; column visibility is stored under
   * `{name}-table-column-visibility` (see {@link listTableColumnVisibilityStorageKey}).
   */
  name: string
  toolbar: ListTableShellToolbarProps<TData>
  pagination: ListTableShellPagination
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  sorting: SortingState
  onSortingChange: (updater: Updater<SortingState>) => void
  /** Passed to {@link DataTable}; default `min-w-xl`. */
  tableClassName?: string
  dataTableProps?: ListTableShellDataTableProps<TData>
  footer?: ReactNode
}

export type ListTableFilterContext = {
  filters: Record<string, string | string[]>
  setFilters: (next: Record<string, string | string[]>) => void
}

/** Normalized list fetch for {@link createListTableQueryShell}; typically wraps `useQuery` + entity list + pagination. */
export type ListTableQueryResult<TData> = {
  rows: TData[]
  isLoading: boolean
  error: unknown
  totalPages: number
  footer?: ReactNode | ((ctx: ListTableFilterContext) => ReactNode)
}

/** Stable hook passed to {@link createListTableQueryShell} (one closure per feature module). */
export type ListTableQueryHook<TData> = (
  params: PaginatedTableQueryParams
) => ListTableQueryResult<TData>

export type ListTableQueryToolbarSlot<TData> = Omit<
  ListTableShellToolbarProps<TData>,
  | 'search'
  | 'setSearch'
  | 'setFilters'
  | 'filters'
  | 'onFacetedFiltersChange'
  | 'children'
> & {
  children?:
    | ReactNode
    | ((ctx: {
        filters: Record<string, string | string[]>
        setFilters: (next: Record<string, string | string[]>) => void
      }) => ReactNode)
}

/** e.g. `journal-entries` → `journal entries` (for default error copy). */
export function listTableQueryHumanLabel(name: string): string {
  return name.replace(/-/g, ' ')
}

export function listTableQueryDefaultErrorFallback(name: string): {
  title: string
  message: string
} {
  const label = listTableQueryHumanLabel(name)
  return {
    title: `Failed to load ${label}`,
    message: `An error occurred while fetching ${label}. Please try again.`,
  }
}

export type ListTableQueryShellProps<TData> = {
  name: string
  /** Overrides copy from {@link listTableQueryDefaultErrorFallback} when omitted. */
  errorFallback?: { title: string; message: string }
  toolbar: ListTableQueryToolbarSlot<TData>
  columns: ColumnDef<TData>[]
  tableClassName?: string
  dataTableProps?: ListTableShellDataTableProps<TData>
}

function resolveQueryFooter<TData>(
  footer: ListTableQueryResult<TData>['footer'],
  filters: Record<string, string | string[]>,
  setFilters: (next: Record<string, string | string[]>) => void
): ReactNode {
  if (typeof footer === 'function') {
    return footer({ filters, setFilters })
  }
  return footer
}

function resolveQueryToolbarChildren<TData>(
  children: ListTableQueryToolbarSlot<TData>['children'],
  filters: Record<string, string | string[]>,
  setFilters: (next: Record<string, string | string[]>) => void
): ReactNode {
  if (typeof children === 'function') {
    return children({ filters, setFilters })
  }
  return children
}

/**
 * Builds a list page component that calls {@link useTableState} and a **fixed** list hook (closed over at the call site).
 * This avoids passing hooks as props while keeping each screen’s data hook colocated with its feature.
 */
export function createListTableQueryShell<TData>(useListQuery: ListTableQueryHook<TData>) {
  function ListTableQueryShell({
    name,
    errorFallback,
    toolbar: toolbarInput,
    columns,
    tableClassName,
    dataTableProps,
  }: ListTableQueryShellProps<TData>) {
    const {
      search,
      filters,
      page,
      pageSize,
      sorting,
      setSearch,
      setPage,
      setPageSize,
      setFilters,
      setSorting,
      paginatedQueryParams,
    } = useTableState()

    const { rows, isLoading, error, totalPages, footer } =
      useListQuery(paginatedQueryParams)

    if (error) {
      const fb =
        errorFallback ?? listTableQueryDefaultErrorFallback(name)
      return (
        <FallbackSection title={fb.title} message={fb.message} />
      )
    }

    const { children: toolbarChildren, ...toolbarRest } = toolbarInput

    const toolbar: ListTableShellToolbarProps<TData> = {
      ...toolbarRest,
      search,
      setSearch,
      setFilters,
      filters,
      onFacetedFiltersChange: setFilters,
      children: resolveQueryToolbarChildren(
        toolbarChildren,
        filters,
        setFilters
      ),
    }

    return (
      <ListTableShell<TData>
        name={name}
        toolbar={toolbar}
        pagination={{
          page,
          setPage,
          pageSize,
          setPageSize,
          totalPages,
        }}
        columns={columns}
        data={rows}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
        tableClassName={tableClassName}
        dataTableProps={dataTableProps}
        footer={resolveQueryFooter(footer, filters, setFilters)}
      />
    )
  }

  ListTableQueryShell.displayName = `ListTableQueryShell(${
    useListQuery.name || 'listQuery'
  })`
  return ListTableQueryShell
}

export function ListTableShell<TData>({
  name,
  toolbar,
  pagination,
  columns,
  data,
  isLoading = false,
  sorting,
  onSortingChange,
  tableClassName = 'min-w-xl',
  dataTableProps,
  footer,
}: ListTableShellProps<TData>) {
  const { page, setPage, pageSize, setPageSize, totalPages } = pagination

  const [columnVisibility, onColumnVisibilityChange] = useColumnVisibility(
    listTableColumnVisibilityStorageKey(name)
  )

  const toolbarProps: DataTableToolbarProps<TData> = {
    ...toolbar,
    columnViewOptions: {
      columns,
      columnVisibility,
      onColumnVisibilityChange,
    },
  }

  return (
    <div className={listTableShellClassName}>
      <DataTableToolbar<TData> {...toolbarProps} />
      <div className='flex flex-1 flex-col gap-4'>
        <DataTable<TData>
          {...dataTableProps}
          columns={columns}
          data={data}
          isLoading={isLoading}
          pageCount={totalPages}
          initialPage={page}
          initialPageSize={pageSize}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          tableClassName={tableClassName}
          footer={footer}
        />
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
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

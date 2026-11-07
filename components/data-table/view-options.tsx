import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import type { ColumnDef, VisibilityState, Updater } from '@tanstack/react-table'
import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/common/dropdown-menu'
import { DataTableViewOptionsItem } from '@/components/data-table/view-options-item'

type DataTableViewOptionsProps<TData> = {
  columns: ColumnDef<TData>[]
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void
}

export function DataTableViewOptions<TData>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: DataTableViewOptionsProps<TData>) {
  // Filter columns that can be hidden (have accessorFn and enableHiding is not false)
  const hideableColumns = columns.filter((column) => {
    if (column.id === 'select' || column.enableHiding === false) {
      return false
    }
    return typeof (column as any).accessorFn !== 'undefined' || typeof (column as any).accessorKey !== 'undefined'
  })

  if (hideableColumns.length === 0) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          aria-label='View'
          className='h-8 px-2 lg:px-3'
        >
          <MixerHorizontalIcon className='size-4' />
          <span className='hidden lg:inline'>View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => {
          const columnId = column.id || (column as any).accessorKey || ''
          const isVisible = columnVisibility[columnId] !== false
          const label =
            (column as any).meta?.toggleLabel ??
            (column as any).meta?.label ??
            columnId

          return (
            <DataTableViewOptionsItem
              key={columnId}
              columnId={columnId}
              label={label}
              isVisible={isVisible}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={onColumnVisibilityChange}
            />
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

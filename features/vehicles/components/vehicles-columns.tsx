'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { Vehicle } from '@/types/vehicle'
import { VehiclesRowActions } from './vehicles-row-actions'

export const vehicleColumns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => (
      <div className='flex w-full items-center gap-3 ps-3'>
        <ListEditNameLink
          id={row.original.id}
          name={row.original.name}
          listPath='/vehicles'
          className='min-w-0 flex-1'
        />
        <div className='ms-auto shrink-0'>
          <VehiclesRowActions row={row} />
        </div>
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 sticky start-0 z-10 rounded-tl-[inherit]'
      ),
      tdClassName: 'pe-0',
    },
    enableHiding: false,
  },
  {
    accessorKey: 'plateNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Plate number' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.plateNumber}</span>,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    cell: ({ row }) => (
      <span className='line-clamp-2 max-w-md text-muted-foreground'>
        {row.original.description || '—'}
      </span>
    ),
  },
]

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Avatar } from '@/components/common/avatar'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { Employee } from '@/types/employee'
import { employeeStatuses } from '../data/data'
import { EmployeesRowActions } from './employees-row-actions'

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => (
      <div className='flex w-full items-center gap-3 ps-3'>
        <Avatar src={row.original.imageUrl} name={row.original.name} size={32} />
        <ListEditNameLink
          id={row.original.id}
          name={row.original.name}
          listPath='/employees'
          className='min-w-0 flex-1'
        />
        <div className='ms-auto shrink-0'>
          <EmployeesRowActions row={row} />
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
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.code}</span>,
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />,
    cell: ({ row }) => (row.original.gender === 'male' ? 'Male' : 'Female'),
  },
  {
    accessorKey: 'contactNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Contact' />,
    cell: ({ row }) => row.original.contactNumber || '—',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <StatusBadge value={row.original.status} statusConfigs={employeeStatuses} />
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
]

'use client'

import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Repeat } from 'lucide-react'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/common/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { HolidayListItem } from '@/types/holiday'
import { holidayTypes } from './data'
import { HolidaysRowActions } from './holidays-row-actions'

function formatDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return '-'
  return format(new Date(year, month - 1, day), 'MMM dd, yyyy')
}

export const holidayColumns: ColumnDef<HolidayListItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => (
      <div className='flex w-full items-center gap-2 ps-3'>
        <ListEditNameLink
          id={row.original.id}
          name={row.original.name}
          listPath='/settings/payroll/holidays'
          className='min-w-0'
        />
        {row.original.isRecurring ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground'>
                <Repeat className='size-3.5' aria-label='Recurring' />
              </span>
            </TooltipTrigger>
            <TooltipContent>Recurring</TooltipContent>
          </Tooltip>
        ) : null}
        <div className='ms-auto shrink-0'>
          <HolidaysRowActions row={row} />
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
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    cell: ({ row }) => (
      <span className='block max-w-64 truncate'>{row.original.description || '—'}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    cell: ({ row }) => formatDateOnly(row.original.date),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
    cell: ({ row }) => <StatusBadge value={row.original.type} statusConfigs={holidayTypes} />,
  },
]

'use client'

import type { ReactNode } from 'react'
import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { DriverRouteLog } from '@/types/driver-route-log'
import { driverRouteLogStatuses } from '../data'
import { DriverRouteLogsRowActions } from './driver-route-logs-row-actions'

function formatDateTime(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'MMM dd, yyyy h:mm a')
}

function formatOdometer(value: number | null) {
  if (value == null) return '—'
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function StackedPair({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <div className='flex flex-col gap-0.5 py-0.3 leading-5'>
      <span>{top}</span>
      <span>{bottom}</span>
    </div>
  )
}

const stackedColumnMeta = {
  className: 'px-4',
  thClassName: 'h-auto py-3',
  tdClassName: 'py-3',
}

export const driverRouteLogColumns: ColumnDef<DriverRouteLog>[] = [
  {
    accessorKey: 'vehicleName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vehicle' className='ps-3' />
    ),
    cell: ({ row }) => (
      <div className='flex w-full items-center gap-3 ps-3'>
        <div className='min-w-0 flex-1'>
          <ListEditNameLink
            id={row.original.id}
            name={row.original.vehicleName}
            listPath='/driver-route-logs'
            className='block'
          />
          <div className='truncate text-xs text-muted-foreground'>
            {row.original.vehiclePlateNumber}
          </div>
        </div>
        <div className='ms-auto shrink-0'>
          <DriverRouteLogsRowActions row={row} />
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
    enableSorting: false,
  },
  {
    accessorKey: 'employeeName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Driver' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.employeeName}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'origin',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Origin' />,
    cell: ({ row }) => (
      <p className='line-clamp-3 max-w-xs whitespace-normal break-words' title={row.original.origin}>
        {row.original.origin}
      </p>
    ),
    meta: { tdClassName: 'whitespace-normal max-w-xs align-top' },
    enableSorting: false,
  },
  {
    accessorKey: 'destination',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Destination' />,
    cell: ({ row }) => (
      <p
        className='line-clamp-3 max-w-xs whitespace-normal break-words'
        title={row.original.destination}
      >
        {row.original.destination}
      </p>
    ),
    meta: { tdClassName: 'whitespace-normal max-w-xs align-top' },
    enableSorting: false,
  },
  {
    id: 'schedule',
    header: () => <StackedPair top='Start date' bottom='End date' />,
    cell: ({ row }) => (
      <StackedPair
        top={formatDateTime(row.original.startDatetime)}
        bottom={formatDateTime(row.original.endDatetime)}
      />
    ),
    meta: stackedColumnMeta,
    enableSorting: false,
  },
  {
    id: 'odometer',
    header: () => <StackedPair top='Starting odo (km)' bottom='Ending odo (km)' />,
    cell: ({ row }) => (
      <StackedPair
        top={<span className='tabular-nums'>{formatOdometer(row.original.startingOdometer)}</span>}
        bottom={<span className='tabular-nums'>{formatOdometer(row.original.endingOdometer)}</span>}
      />
    ),
    meta: stackedColumnMeta,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <StatusBadge value={row.original.status} statusConfigs={driverRouteLogStatuses} />
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
]

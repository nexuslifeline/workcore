'use client'

import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import { toCurrency } from '@/lib/utils/currency'
import { useCurrencyStore } from '@/stores/currency-store'
import type { Project } from '@/types/project'
import { projectStatuses } from '../data/data'

function formatDateOnly(value: string | null) {
  if (!value) return '-'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return '-'
  return format(new Date(year, month - 1, day), 'MMM dd, yyyy')
}

function MoneyCell({ amount }: { amount: string }) {
  const { activeCurrency } = useCurrencyStore.getState()
  const numAmount = Number(amount)
  return (
    <div className='text-right'>
      {Number.isNaN(numAmount) ? '-' : toCurrency(numAmount, activeCurrency.code)}
    </div>
  )
}

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => (
      <div className='flex min-w-0 flex-col'>
        <ListEditNameLink
          id={row.original.id}
          name={row.original.name}
          href={`/projects/${row.original.id}/edit`}
        />
        <span className='mt-0.5 truncate text-xs text-muted-foreground'>{row.original.code}</span>
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Start date' />,
    cell: ({ row }) => formatDateOnly(row.original.startDate),
    enableSorting: false,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Due date' />,
    cell: ({ row }) => formatDateOnly(row.original.dueDate),
    enableSorting: false,
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Budget' className='w-full text-right' />
    ),
    cell: ({ row }) => <MoneyCell amount={row.original.budget} />,
    meta: { className: cn('text-right') },
    enableSorting: false,
  },
  {
    accessorKey: 'spent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expenses' className='w-full text-right' />
    ),
    cell: ({ row }) => <MoneyCell amount={row.original.spent} />,
    meta: { className: cn('text-right') },
    enableSorting: false,
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Balance' className='w-full text-right' />
    ),
    cell: ({ row }) => <MoneyCell amount={row.original.balance} />,
    meta: { className: cn('text-right') },
    enableSorting: false,
  },
  {
    accessorKey: 'progress',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Progress' />,
    cell: ({ row }) => `${row.original.progress}%`,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <StatusBadge value={row.original.status} statusConfigs={projectStatuses} />
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
]

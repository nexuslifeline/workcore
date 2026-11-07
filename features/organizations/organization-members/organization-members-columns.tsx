import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { cn } from '@/lib/utils'
import { callTypes } from '@/features/users/data/data'
import { type User } from '@/types/user'

export const organizationMembersColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null
      return (
        <LongText className='max-w-36 ps-3'>
          {name || '-'}
        </LongText>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 sticky start-0 z-10 rounded-tl-[inherit]'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      return (
        <div className='w-fit ps-2 text-nowrap'>{email || '-'}</div>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null
      return <div>{phone || '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.original.role?.trim()
      if (!role) return <div className='text-muted-foreground'>-</div>
      return <div>{role}</div>
    },
    meta: {
      className: 'whitespace-nowrap min-w-28',
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'joinedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Joined' />
    ),
    cell: ({ row }) => {
      const joinedAt = row.original.joinedAt
      if (!joinedAt) return <div className='text-muted-foreground'>-</div>
      return <div>{format(new Date(joinedAt), 'MMM d, yyyy')}</div>
    },
    meta: {
      className: 'whitespace-nowrap w-[7.5rem] min-w-[7.5rem]',
    },
    enableSorting: false,
  },
  {
    id: 'invitedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Invited by' />
    ),
    cell: ({ row }) => {
      const invitedBy = row.original.invitedByName?.trim()
      if (!invitedBy) return <div className='text-muted-foreground'>-</div>
      return <div>{invitedBy}</div>
    },
    meta: {
      className: 'whitespace-nowrap min-w-36',
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colorClasses = callTypes.get(status)
      return (
        <StatusBadge
          value={status}
          colorClasses={colorClasses}
          showIcon={false}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
]

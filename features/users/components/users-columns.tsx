'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Avatar } from '@/components/common/avatar'
import { cn } from '@/lib/utils'
import { avatarNameForInitials } from '@/lib/utils/avatar-name-for-initials'
import { callTypes } from '../data/data'
import { type User } from '@/types/user'
import { useUsersInteractionStore } from '@/stores/users-interaction-store'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

function UserNameEditButton({ user }: { user: User }) {
  const setDialogOpen = useUsersInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useUsersInteractionStore((state) => state.setCurrentRow)
  const displayLabel = user.name?.trim() || user.email || '-'

  return (
    <button
      type='button'
      className='min-w-0 flex-1 truncate text-left hover:underline'
      onClick={() => {
        setCurrentRow(user)
        setDialogOpen('edit')
      }}
    >
      {displayLabel}
    </button>
  )
}

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null
      const email = row.original.email
      const avatarUrl = row.original.avatarUrl
      return (
        <div className='flex w-full min-w-0 items-center gap-3 ps-3'>
          <Avatar
            src={avatarUrl}
            name={avatarNameForInitials(name, email)}
            size={32}
          />
          <UserNameEditButton user={row.original} />
          <div className='ms-auto shrink-0'>
            <DataTableRowActions row={row} />
          </div>
        </div>
      )
    },
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      return (
        <div className='ps-2 text-nowrap'>{email || '-'}</div>
      )
    },
    meta: {
      className: 'min-w-48',
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
    meta: {
      className: 'whitespace-nowrap min-w-32',
    },
    enableSorting: false,
  },
  {
    id: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.original.role
      return (
        <div className='capitalize'>
          {role ?? 'Owner'}
        </div>
      )
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
    id: 'lastLoginAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last login' />
    ),
    cell: ({ row }) => {
      const lastLoginAt = row.original.lastLoginAt
      if (!lastLoginAt) return <div className='text-muted-foreground'>-</div>
      return <div>{format(new Date(lastLoginAt), 'MMM d, yyyy')}</div>
    },
    meta: {
      className: 'whitespace-nowrap w-[7.5rem] min-w-[7.5rem]',
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
    meta: {
      className: 'whitespace-nowrap min-w-28',
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
]

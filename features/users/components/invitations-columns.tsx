import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Avatar } from '@/components/common/avatar'
import { cn } from '@/lib/utils'
import { avatarNameForInitials } from '@/lib/utils/avatar-name-for-initials'
import { callTypes } from '../data/data'
import { type User } from '@/types/user'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const invitationsColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      const name = row.original.name
      const avatarUrl = row.original.avatarUrl
      const displayLabel = name?.trim() || email || '-'
      return (
        <div className='flex w-full min-w-0 items-center gap-3 ps-3'>
          <Avatar
            src={avatarUrl}
            name={avatarNameForInitials(name, email)}
            size={32}
          />
          <span className='min-w-0 flex-1 truncate font-medium'>{displayLabel}</span>
          <div className='ms-auto shrink-0'>
            <DataTableRowActions row={row} />
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'min-w-48',
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 sticky start-0 z-10 rounded-tl-[inherit]'
      ),
      tdClassName: 'pe-0',
    },
    enableHiding: false,
  },
  {
    id: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.original.role
      const display = role ? (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) : 'Owner'
      return <div className='capitalize'>{display}</div>
    },
    meta: {
      className: 'whitespace-nowrap min-w-28',
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
    id: 'sentAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sent' />
    ),
    cell: ({ row }) => {
      const sentAt = row.original.createdAt
      if (!sentAt) return <div className='text-muted-foreground'>-</div>
      return <div>{format(new Date(sentAt), 'MMM d, yyyy')}</div>
    },
    meta: {
      className: 'whitespace-nowrap w-[7.5rem] min-w-[7.5rem]',
    },
    enableSorting: false,
  },
  {
    id: 'expiresAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expires' />
    ),
    cell: ({ row }) => {
      const expiresAt = row.original.invitationExpiresAt
      if (!expiresAt) return <div className='text-muted-foreground'>-</div>
      
      const isExpired = new Date(expiresAt) < new Date()
      return (
        <div className={isExpired ? 'text-destructive' : ''}>
          {format(new Date(expiresAt), 'MMM d, yyyy')}
        </div>
      )
    },
    meta: {
      className: 'whitespace-nowrap w-[7.5rem] min-w-[7.5rem]',
    },
    enableSorting: false,
  },
  {
    id: 'acceptedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Accepted' />
    ),
    cell: ({ row }) => {
      const acceptedAt = row.original.invitationAcceptedAt
      if (!acceptedAt) return <div className='text-muted-foreground'>-</div>
      return <div>{format(new Date(acceptedAt), 'MMM d, yyyy')}</div>
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
      const colorClasses = callTypes.get(status) || callTypes.get('pending')
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


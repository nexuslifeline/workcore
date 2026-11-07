import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Avatar } from '@/components/common/avatar'
import { cn } from '@/lib/utils'
import { type Role } from '@/features/roles/data/schema'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { DataTableRowActions } from './data-table-row-actions'

function RoleMembersCell({ role }: { role: Role }) {
  const count = role.memberCount ?? 0
  const previews = role.memberPreviews ?? []
  const remaining = Math.max(count - previews.length, 0)

  if (count === 0) {
    return <div className='text-muted-foreground'>0</div>
  }

  return (
    <Link
      href={`/users?roleId=${role.id}`}
      className='flex w-fit items-center -space-x-2 text-inherit no-underline'
      aria-label={`${count} members`}
    >
      {previews.map((user) => (
        <Avatar
          key={user.id}
          src={user.avatarUrl}
          name={user.name ?? 'Member'}
          size={24}
          className='border-background border-2'
        />
      ))}
      {remaining > 0 ? (
        <span className='bg-muted text-muted-foreground border-background flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-medium'>
          +{remaining}
        </span>
      ) : null}
    </Link>
  )
}

export const rolesColumns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className='flex w-full items-center gap-1.5 ps-3'>
          <ListEditNameLink
            id={row.original.id}
            name={name}
            listPath='/roles'
            className='min-w-0 max-w-36 flex-1'
          />
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
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      return <div>{description || '-'}</div>
    },
    enableSorting: false,
  },
  {
    id: 'memberCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Members' />
    ),
    cell: ({ row }) => <RoleMembersCell role={row.original} />,
    meta: {
      className: 'whitespace-nowrap min-w-28',
    },
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      const status = isActive ? 'active' : 'inactive'
      const colorClasses = isActive
        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
        : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
      return (
        <StatusBadge
          value={status}
          colorClasses={colorClasses}
          showIcon={false}
        />
      )
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) as boolean
      const status = isActive ? 'active' : 'inactive'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false,
  },
]

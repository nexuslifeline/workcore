import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Avatar } from '@/components/common/avatar'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { cn } from '@/lib/utils'
import { statuses, industries } from '../data/data'
import { type OrganizationListItem } from '../data/schema'
import { ListEditNameLink } from '@/components/common/list-edit-name-link'
import { DataTableRowActions } from './data-table-row-actions'

export const organizationsColumns: ColumnDef<OrganizationListItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Organization' />
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 sticky start-0 z-10 rounded-tl-[inherit]'
      ),
      tdClassName: 'pe-0',
    },
    cell: ({ row }) => {
      const organization = row.original
      return (
        <div className='flex w-full min-w-0 items-center gap-3 ps-3'>
          <Avatar
            src={organization.logoUrl}
            name={organization.name}
            size={32}
            square
          />
          <div className='flex min-w-0 flex-1 flex-col'>
            <ListEditNameLink
              id={organization.id}
              name={organization.name}
              href={`/organizations/${organization.id}/edit`}
            />
            {organization.description && (
              <span className='truncate text-xs text-muted-foreground'>
                {organization.description}
              </span>
            )}
          </div>
          <div className='ms-auto shrink-0'>
            <DataTableRowActions row={row} />
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const statusValue = row.getValue('status') as string | null
      return (
        <StatusBadge
          value={statusValue}
          statusConfigs={statuses}
          showIcon={false}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'industry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Industry' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const industryValue = row.getValue('industry') as string | null
      if (!industryValue) return <span className='text-muted-foreground'>-</span>

      const industry = industries.find((i) => i.value === industryValue)

      if (!industry) {
        return <span>{industryValue}</span>
      }

      return (
        <div className='flex items-center gap-2'>
          {industry.icon && (
            <industry.icon className='size-4 text-muted-foreground' />
          )}
          <span>{industry.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      return email ? (
        <span className='text-sm'>{email}</span>
      ) : (
        <span className='text-muted-foreground'>-</span>
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
      return phone ? (
        <span className='text-sm'>{phone}</span>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
  },
]




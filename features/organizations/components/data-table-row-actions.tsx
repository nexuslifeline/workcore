import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { Trash2, Settings, Users } from 'lucide-react'
import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { organizationSchema } from '../data/schema'
import { useOrganizationsInteractionStore } from '@/stores/organizations-interaction-store'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const organization = organizationSchema.parse(row.original)
  const setDialogOpen = useOrganizationsInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useOrganizationsInteractionStore((state) => state.setCurrentRow)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsVerticalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            router.push(`/organizations/${organization.id}/edit`)
          }}
        >
          <Settings className='mr-2 size-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push(`/organizations/${organization.id}/members`)
          }}
        >
          <Users className='mr-2 size-4' />
          Members
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(organization)
            setDialogOpen('delete')
          }}
          className='text-destructive'
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


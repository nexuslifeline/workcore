import { type Row } from '@tanstack/react-table'
import { KeyRound, Trash2, UserPen } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTableRowActions as BaseDataTableRowActions, type RowAction } from '@/components/data-table/row-actions'
import { type Role } from '@/features/roles/data/schema'
import { useRolesInteractionStore } from '@/stores/roles-interaction-store'

type DataTableRowActionsProps = {
  row: Row<Role>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setDialogOpen = useRolesInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useRolesInteractionStore((state) => state.setCurrentRow)

  const actions: RowAction<Role>[] = [
    {
      label: 'Edit',
      icon: UserPen,
      onClick: () => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('action', 'edit')
        params.set('id', row.original.id)
        router.push(`/roles?${params.toString()}`)
      },
    },
    {
      label: 'Permissions',
      icon: KeyRound,
      onClick: () => {
        setCurrentRow(row.original)
        setDialogOpen('permissions')
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        setCurrentRow(row.original)
        setDialogOpen('delete')
      },
      className: 'text-red-500!',
      separatorBefore: true,
    },
  ]

  return <BaseDataTableRowActions row={row} actions={actions} />
}

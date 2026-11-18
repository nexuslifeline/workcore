'use client'

import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DeleteDialog } from '@/components/common/delete-dialog'
import { DataTableRowActions, type RowAction } from '@/components/data-table/row-actions'
import { deleteHoliday } from '@/services/client/payroll/holiday-service'
import type { HolidayListItem } from '@/types/holiday'

export function HolidaysRowActions({ row }: { row: Row<HolidayListItem> }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const actions: RowAction<HolidayListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: () => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('action', 'edit')
        params.set('id', row.original.id)
        router.push(`${pathname}?${params.toString()}`)
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: true,
      onClick: () => setDeleteOpen(true),
    },
  ]

  return (
    <>
      <DataTableRowActions row={row} actions={actions} />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        id={row.original.id}
        displayName={row.original.name}
        entityName='Holiday'
        entityNameLower='holiday'
        onDelete={deleteHoliday}
        queryKey={['holidays']}
      />
    </>
  )
}

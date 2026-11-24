'use client'

import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DeleteDialog } from '@/components/common/delete-dialog'
import { DataTableRowActions, type RowAction } from '@/components/data-table/row-actions'
import { deleteDriverRouteLog } from '@/services/client/driver-route-logs/driver-route-log-service'
import type { DriverRouteLog } from '@/types/driver-route-log'

export function DriverRouteLogsRowActions({ row }: { row: Row<DriverRouteLog> }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const log = row.original

  const actions: RowAction<DriverRouteLog>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: () => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('action', 'edit')
        params.set('id', log.id)
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
        id={log.id}
        displayName={`${log.origin} to ${log.destination}`}
        entityName='Driver route log'
        entityNameLower='driver route log'
        onDelete={deleteDriverRouteLog}
        queryKey={['driver-route-logs']}
      />
    </>
  )
}

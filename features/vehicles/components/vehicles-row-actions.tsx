'use client'

import { type Row } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTableRowActions, type RowAction } from '@/components/data-table/row-actions'
import type { Vehicle } from '@/types/vehicle'

export function VehiclesRowActions({ row }: { row: Row<Vehicle> }) {
  const router = useRouter()

  const actions: RowAction<Vehicle>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: () => {
        const pathname = window.location.pathname
        router.push(`${pathname}?action=edit&id=${row.original.id}`)
      },
    },
  ]

  return <DataTableRowActions row={row} actions={actions} />
}

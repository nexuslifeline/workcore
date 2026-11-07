'use client'

import { type Row } from '@tanstack/react-table'
import { UserPen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTableRowActions, type RowAction } from '@/components/data-table/row-actions'
import type { Employee } from '@/types/employee'

export function EmployeesRowActions({ row }: { row: Row<Employee> }) {
  const router = useRouter()

  const actions: RowAction<Employee>[] = [
    {
      label: 'Edit',
      icon: UserPen,
      onClick: () => {
        const pathname = window.location.pathname
        router.push(`${pathname}?action=edit&id=${row.original.id}`)
      },
    },
  ]

  return <DataTableRowActions row={row} actions={actions} />
}

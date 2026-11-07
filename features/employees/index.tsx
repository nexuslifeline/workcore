'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/common/button'
import { EmployeePanel } from './components/employee-panel'
import { EmployeesTable } from './components/employees-table'

export function Employees() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <PageHeader
        title='Employees'
        description='Keep employee records for the current organization.'
        actions={
          <Button className='space-x-1' onClick={() => router.push(`${pathname}?action=new`)}>
            <span>Add employee</span> <Plus size={18} />
          </Button>
        }
      />
      <EmployeesTable />
      <EmployeePanel />
    </>
  )
}

'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/common/button'
import { DriverRouteLogPanel } from './components/driver-route-log-panel'
import { DriverRouteLogsTable } from './components/driver-route-logs-table'

export function DriverRouteLogs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const openCreate = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('action', 'new')
    params.delete('id')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      <PageHeader
        title='Driver route logs'
        description='Trips recorded for vehicles in the current organization.'
        actions={
          <Button className='space-x-1' onClick={openCreate}>
            <span>Add route log</span> <Plus size={18} />
          </Button>
        }
      />
      <DriverRouteLogsTable />
      <DriverRouteLogPanel />
    </>
  )
}

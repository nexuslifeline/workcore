'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/common/button'
import { VehiclePanel } from './components/vehicle-panel'
import { VehiclesTable } from './components/vehicles-table'

export function Vehicles() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <PageHeader
        title='Vehicles'
        description='Manage vehicles used by the current organization.'
        actions={
          <Button className='space-x-1' onClick={() => router.push(`${pathname}?action=new`)}>
            <span>Add vehicle</span> <Plus size={18} />
          </Button>
        }
      />
      <VehiclesTable />
      <VehiclePanel />
    </>
  )
}

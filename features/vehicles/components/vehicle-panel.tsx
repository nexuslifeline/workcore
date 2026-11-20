'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidePanel } from '@/components/common/slide-panel'
import { Skeleton } from '@/components/common/skeleton'
import { useVehicle } from '@/hooks/use-vehicles'
import { VehicleForm } from './vehicle-form'

export function VehiclePanel() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [vehicleId, setVehicleId] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  useEffect(() => {
    const actionParam = searchParams.get('action')
    const idParam = searchParams.get('id')

    if ((actionParam === 'new' || actionParam === 'edit') && (actionParam === 'new' || idParam)) {
      setIsOpen(true)
      setAction(actionParam)
      setVehicleId(actionParam === 'edit' ? idParam : null)
    } else {
      setIsOpen(false)
      setAction(null)
      setVehicleId(null)
    }
  }, [searchParams])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')
      params.delete('id')
      const newSearch = params.toString()
      const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname
      router.push(newUrl)
    }
  }

  const { data: vehicle, isLoading } = useVehicle(vehicleId ?? '')

  const isEdit = action === 'edit' && !!vehicleId
  const isAdd = action === 'new'

  if (!isOpen || (!isAdd && !isEdit)) {
    return null
  }

  const title = isEdit
    ? `Edit Vehicle - ${vehicle?.name || 'Vehicle'}`
    : 'Add New Vehicle'

  return (
    <SlidePanel
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={title}
      showDefaultActions={false}
      className='w-full sm:max-w-xl'
      contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
    >
      {isEdit && isLoading ? (
        <div className='grid gap-4 px-6 py-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-24 w-full' />
        </div>
      ) : isEdit && !vehicle ? (
        <p className='px-6 py-4 text-sm text-muted-foreground'>
          This vehicle is not in the current organization.
        </p>
      ) : (
        <VehicleForm
          key={isEdit ? vehicle?.id ?? vehicleId : 'new'}
          vehicle={isEdit ? vehicle : undefined}
          onClose={() => handleOpenChange(false)}
        />
      )}
    </SlidePanel>
  )
}

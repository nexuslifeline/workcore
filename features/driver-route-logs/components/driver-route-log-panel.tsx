'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidePanel } from '@/components/common/slide-panel'
import { Skeleton } from '@/components/common/skeleton'
import { useDriverRouteLog } from '@/hooks/use-driver-route-logs'
import { DriverRouteLogForm } from './driver-route-log-form'

export function DriverRouteLogPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [logId, setLogId] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  useEffect(() => {
    const actionParam = searchParams.get('action')
    const idParam = searchParams.get('id')

    if ((actionParam === 'new' || actionParam === 'edit') && (actionParam === 'new' || idParam)) {
      setIsOpen(true)
      setAction(actionParam)
      setLogId(actionParam === 'edit' ? idParam : null)
    } else {
      setIsOpen(false)
      setAction(null)
      setLogId(null)
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

  const { data: driverRouteLog, isLoading } = useDriverRouteLog(logId ?? '')

  const isEdit = action === 'edit' && !!logId
  const isAdd = action === 'new'

  if (!isOpen || (!isAdd && !isEdit)) {
    return null
  }

  const title = isEdit
    ? `Edit route log${driverRouteLog ? ` - ${driverRouteLog.origin} to ${driverRouteLog.destination}` : ''}`
    : 'Add route log'

  return (
    <SlidePanel
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={title}
      showDefaultActions={false}
      className='w-full sm:max-w-2xl'
      contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
    >
      {isEdit && isLoading ? (
        <div className='grid gap-4 px-6 py-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <div className='grid grid-cols-2 gap-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-24 w-full' />
        </div>
      ) : isEdit && !driverRouteLog ? (
        <p className='px-6 py-4 text-sm text-muted-foreground'>
          This route log is not in the current organization.
        </p>
      ) : (
        <DriverRouteLogForm
          key={isEdit ? driverRouteLog?.id ?? logId : 'new'}
          driverRouteLog={isEdit ? driverRouteLog : undefined}
          onClose={() => handleOpenChange(false)}
        />
      )}
    </SlidePanel>
  )
}

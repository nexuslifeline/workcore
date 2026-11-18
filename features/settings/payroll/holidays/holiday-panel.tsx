'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidePanel } from '@/components/common/slide-panel'
import { Skeleton } from '@/components/common/skeleton'
import { useHoliday } from '@/hooks/use-holidays'
import { HolidayForm } from './holiday-form'

export function HolidayPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [holidayId, setHolidayId] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  useEffect(() => {
    const actionParam = searchParams.get('action')
    const idParam = searchParams.get('id')

    if ((actionParam === 'new' || actionParam === 'edit') && (actionParam === 'new' || idParam)) {
      setIsOpen(true)
      setAction(actionParam)
      setHolidayId(actionParam === 'edit' ? idParam : null)
    } else {
      setIsOpen(false)
      setAction(null)
      setHolidayId(null)
    }
  }, [searchParams])

  const handleOpenChange = (open: boolean) => {
    if (open) return
    setIsOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('action')
    params.delete('id')
    const nextSearch = params.toString()
    router.push(nextSearch ? `${pathname}?${nextSearch}` : pathname)
  }

  const { data: holiday, isLoading } = useHoliday(holidayId ?? '')
  const isEdit = action === 'edit' && !!holidayId
  const isAdd = action === 'new'

  if (!isOpen || (!isAdd && !isEdit)) return null

  return (
    <SlidePanel
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={isEdit ? `Edit holiday${holiday?.name ? ` - ${holiday.name}` : ''}` : 'Add holiday'}
      showDefaultActions={false}
      className='w-full sm:max-w-xl'
      contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
    >
      {isEdit && isLoading ? (
        <div className='grid gap-4 px-6 py-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      ) : isEdit && !holiday ? (
        <p className='px-6 py-4 text-sm text-muted-foreground'>
          This holiday is not in the current organization.
        </p>
      ) : (
        <HolidayForm
          key={isEdit ? holiday?.id ?? holidayId : 'new'}
          holiday={isEdit ? holiday : undefined}
          onClose={() => handleOpenChange(false)}
        />
      )}
    </SlidePanel>
  )
}

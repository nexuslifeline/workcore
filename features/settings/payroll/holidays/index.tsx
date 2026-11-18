'use client'

import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/common/button'
import { getDateRangeForPreset } from '@/components/common/date-range-combobox'
import { HolidayPanel } from './holiday-panel'
import { HolidaysTable } from './holidays-table'

export function SettingsHolidays() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasDateFilter = Boolean(
    searchParams.get('datePreset') && searchParams.get('from') && searchParams.get('to')
  )

  useEffect(() => {
    if (hasDateFilter) return
    const range = getDateRangeForPreset('this_year')
    if (!range) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('datePreset', 'this_year')
    params.set('from', range.from)
    params.set('to', range.to)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [hasDateFilter, pathname, router, searchParams])

  const openCreate = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('action', 'new')
    params.delete('id')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <div className='flex flex-none items-start justify-between gap-4'>
        <div>
          <h3 className='text-lg font-medium'>Holidays</h3>
          <p className='text-sm text-muted-foreground'>
            Regular and special holidays for this organization.
          </p>
        </div>
        <Button className='space-x-1' onClick={openCreate}>
          <span>Add holiday</span> <Plus size={18} />
        </Button>
      </div>
      {hasDateFilter ? <HolidaysTable /> : null}
      <HolidayPanel />
    </div>
  )
}

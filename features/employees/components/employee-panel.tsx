'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FormSectionNavSkeleton } from '@/components/common/form-section-nav'
import { SlidePanel } from '@/components/common/slide-panel'
import { Skeleton } from '@/components/common/skeleton'
import { useEmployee } from '@/hooks/use-employees'
import { EmployeeForm } from './employee-form'

export function EmployeePanel() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [action, setAction] = useState<string | null>(null)

  useEffect(() => {
    const actionParam = searchParams.get('action')
    const idParam = searchParams.get('id')

    if ((actionParam === 'new' || actionParam === 'edit') && (actionParam === 'new' || idParam)) {
      setIsOpen(true)
      setAction(actionParam)
      setEmployeeId(actionParam === 'edit' ? idParam : null)
    } else {
      setIsOpen(false)
      setAction(null)
      setEmployeeId(null)
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

  const { data: employee, isLoading } = useEmployee(employeeId ?? '')

  const isEdit = action === 'edit' && !!employeeId
  const isAdd = action === 'new'

  if (!isOpen || (!isAdd && !isEdit)) {
    return null
  }

  const title = isEdit
    ? `Edit Employee - ${employee?.name || 'Employee'}`
    : 'Add New Employee'

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
        <div>
          <FormSectionNavSkeleton tabCount={3} />
          <div className='grid gap-4 px-6 py-4'>
            <Skeleton className='h-24 w-24' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-24 w-full' />
          </div>
        </div>
      ) : isEdit && !employee ? (
        <p className='px-6 py-4 text-sm text-muted-foreground'>
          This employee is not in the current organization.
        </p>
      ) : (
        <EmployeeForm
          key={isEdit ? employee?.id ?? employeeId : 'new'}
          employee={isEdit ? employee : undefined}
          onClose={() => handleOpenChange(false)}
        />
      )}
    </SlidePanel>
  )
}

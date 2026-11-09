'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidePanel } from '@/components/common/slide-panel'
import { ProjectCreateForm } from './project-create-form'

export function ProjectPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(searchParams.get('action') === 'new')
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

  if (!isOpen) return null

  return (
    <SlidePanel
      open={isOpen}
      onOpenChange={handleOpenChange}
      title='Add project'
      showDefaultActions={false}
      className='w-full sm:max-w-xl'
      contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
    >
      <ProjectCreateForm onClose={() => handleOpenChange(false)} />
    </SlidePanel>
  )
}

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SlidePanel } from '@/components/common/slide-panel'
import { RoleForm } from './role-form'

export function RolesPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [roleId, setRoleId] = useState<string | null>(null)
  const [footer, setFooter] = useState<React.ReactNode>(null)

  useEffect(() => {
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (action === 'new') {
      setIsOpen(true)
      setRoleId(null)
    } else if (action === 'edit' && id) {
      setIsOpen(true)
      setRoleId(id)
    } else {
      setIsOpen(false)
      setRoleId(null)
    }
  }, [searchParams])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')
      params.delete('id')
      const newSearch = params.toString()
      const newUrl = newSearch
        ? `${pathname}?${newSearch}`
        : pathname
      router.push(newUrl)
    }
  }

  const isEdit = roleId !== null
  const title = isEdit ? 'Edit Role' : 'Add New Role'
  const description = isEdit
    ? 'Update role information.'
    : 'Enter role details to create a new role.'

  return (
    <SlidePanel
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      footer={footer}
      showDefaultActions={false}
      className="w-full sm:max-w-2xl"
    >
      <RoleForm
        roleId={roleId || undefined}
        onFooterChange={setFooter}
      />
    </SlidePanel>
  )
}

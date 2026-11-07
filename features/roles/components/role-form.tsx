'use client'

import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import { Skeleton } from '@/components/common/skeletons/skeleton'
import { useOrganizationStore } from '@/stores/organization-store'
import { createRole, updateRole, getRole } from '@/services/client/roles/role-service'
import { RoleFormContent } from './role-form-content'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type RoleFormType = z.infer<typeof formSchema>

type RoleFormProps = {
  roleId?: string
  onFooterChange?: (footer: React.ReactNode) => void
}

export function RoleForm({ roleId: id, onFooterChange }: RoleFormProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isEdit = !!id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const queryClient = useQueryClient()
  const { activeOrganizationId } = useOrganizationStore()

  useEffect(() => {
    if (!onFooterChange) return

    const footerButtons = (
      <div className='flex gap-4 justify-end'>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('action')
            params.delete('id')
            const newSearch = params.toString()
            const newUrl = newSearch
              ? `${pathname}?${newSearch}`
              : pathname
            router.push(newUrl)
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          form='role-form'
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    )

    onFooterChange(footerButtons)
  }, [isSubmitting, isEdit, onFooterChange, router, pathname, searchParams])

  const form = useForm<RoleFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (isEdit && id) {
      const loadRole = async () => {
        try {
          setIsLoading(true)
          const role = await getRole(id)
          form.reset({
            name: role.name,
            description: role.description || '',
            isActive: role.isActive,
          })
        } catch (error) {
          toast.error('Failed to load role')
          router.push(pathname || '/roles')
        } finally {
          setIsLoading(false)
        }
      }
      loadRole()
    }
  }, [id, isEdit, form, router, pathname])

  const onSubmit = async (values: RoleFormType) => {
    if (!activeOrganizationId) {
      toast.error('Please select an organization first')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive,
      }

      if (isEdit && id) {
        await updateRole(id, payload)
        toast.success('Role updated successfully!')
      } else {
        await createRole(payload)
        toast.success('Role created successfully!')
      }
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')
      params.delete('id')
      const newSearch = params.toString()
      router.push(newSearch ? `${pathname}?${newSearch}` : pathname || '/roles')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} role`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-0'>
        <div id='general' className='space-y-0'>
          <div className='grid grid-cols-[2fr_3fr] gap-6 py-4 border-b border-border px-6'>
            <div className='space-y-1'>
              <Skeleton className='h-5 w-12' />
              <Skeleton className='h-4 w-40' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
          <div className='grid grid-cols-[2fr_3fr] gap-6 py-4 border-b border-border px-6'>
            <div className='space-y-1'>
              <Skeleton className='h-5 w-20' />
              <Skeleton className='h-4 w-36' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-24 w-full' />
            </div>
          </div>
        </div>
        <div id='settings' className='space-y-0'>
          <div className='grid grid-cols-[2fr_3fr] gap-6 py-4 border-b border-border px-6 items-center'>
            <div className='space-y-1'>
              <Skeleton className='h-5 w-14' />
              <Skeleton className='h-4 w-52' />
            </div>
            <div className='flex justify-end'>
              <Skeleton className='h-6 w-11 rounded-full' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RoleFormContent
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      isEdit={isEdit}
    />
  )
}

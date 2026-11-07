'use client'

import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Input } from '@/components/common/input'
import { Textarea } from '@/components/common/textarea'
import { Checkbox } from '@/components/common/checkbox'
import { type Role } from '@/features/roles/data/schema'
import { useOrganizationStore } from '@/stores/organization-store'
import { createRole, updateRole } from '@/services/client/roles/role-service'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type RoleForm = z.infer<typeof formSchema>

type RolesActionDialogProps = {
  currentRow?: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RolesActionDialogProps) {
  const isEdit = !!currentRow
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { activeOrganizationId } = useOrganizationStore()

  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          name: currentRow.name,
          description: currentRow.description || '',
          isActive: currentRow.isActive,
        }
      : {
          name: '',
          description: '',
          isActive: true,
        },
  })

  const onSubmit = async (values: RoleForm) => {
    if (!activeOrganizationId) {
      toast.error('Please select an organization first')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && currentRow) {
        await updateRole(currentRow.id, values)
        toast.success('Role updated successfully!')
      } else {
        await createRole(values)
        toast.success('Role created successfully!')
      }
      form.reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} role`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the role here. ' : 'Create new role here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='role-form-dialog'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Manager' autoComplete='off' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Role description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 pt-8'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Active</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='role-form-dialog'
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

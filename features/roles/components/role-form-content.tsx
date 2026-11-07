'use client'

import { type UseFormReturn } from 'react-hook-form'
import {
  Form,
  FormField,
} from '@/components/common/form'
import { Input } from '@/components/common/input'
import { Textarea } from '@/components/common/textarea'
import { Switch } from '@/components/common/switch'
import { FormFieldRow } from '@/components/common/form-field-row'

type RoleFormContentProps = {
  form: UseFormReturn<{ name: string; description?: string; isActive: boolean }>
  onSubmit: (values: { name: string; description?: string; isActive: boolean }) => Promise<void>
  isSubmitting: boolean
  isEdit: boolean
}

export function RoleFormContent({
  form,
  onSubmit,
  isSubmitting,
  isEdit,
}: RoleFormContentProps) {
  return (
    <Form {...form}>
      <form id='role-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-0'>
        <div id='general' className='space-y-0'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormFieldRow
                label={
                  <>
                    Name <span className='text-destructive'>*</span>
                  </>
                }
                description='Role name for identification.'
              >
                <Input placeholder='Manager' autoComplete='off' {...field} />
              </FormFieldRow>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormFieldRow
                label='Description'
                description='Additional details about the role.'
                isLast
              >
                <Textarea placeholder='Role description' {...field} />
              </FormFieldRow>
            )}
          />
        </div>

        <div id='settings' className='space-y-0'>
          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormFieldRow
                label='Active'
                description='Active roles appear in dropdowns and can be assigned.'
                alignItems='center'
                alignControl='right'
                isLast
              >
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormFieldRow>
            )}
          />
        </div>
      </form>
    </Form>
  )
}

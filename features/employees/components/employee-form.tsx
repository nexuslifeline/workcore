'use client'

import { useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileDigit, IdCard, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import { FormSectionNav } from '@/components/common/form-section-nav'
import {
  firstInvalidTabField,
  invalidTabValues,
  useRevealInvalidTab,
} from '@/components/common/form-tab-errors'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { ImageUpload } from '@/components/common/image-upload'
import { Input } from '@/components/common/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { Switch } from '@/components/common/switch'
import { Tabs } from '@/components/common/tabs'
import { Textarea } from '@/components/common/textarea'
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees'
import { uploadEmployeeImage } from '@/services/client/storage/image-upload-service'
import type { Employee } from '@/types/employee'

const employeeFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  imageUrl: z.string().nullable().optional(),
  birthdate: z.string().optional(),
  tin: z.string().optional(),
  gender: z.enum(['male', 'female']),
  currentAddress: z.string().optional(),
  homeAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  sssNumber: z.string().optional(),
  philhealthNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

const EMPLOYEE_FORM_TAB_FIELDS = {
  general: [
    'imageUrl',
    'code',
    'name',
    'gender',
    'birthdate',
    'contactNumber',
    'status',
  ],
  address: ['currentAddress', 'homeAddress'],
  statutory: ['sssNumber', 'philhealthNumber', 'tin'],
} as const

const EMPLOYEE_TAB_ORDER = ['general', 'address', 'statutory'] as const

const EMPLOYEE_FORM_SECTIONS = [
  { value: 'general', label: 'General', icon: <IdCard className='size-4' /> },
  { value: 'address', label: 'Address', icon: <MapPin className='size-4' /> },
  { value: 'statutory', label: 'Statutory numbers', icon: <FileDigit className='size-4' /> },
]

function toDateInput(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 10)
}

export function EmployeeForm({
  employee,
  onClose,
}: {
  employee?: Employee
  onClose: () => void
}) {
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const isEdit = Boolean(employee)
  const [activeTab, setActiveTab] = useState('general')
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      code: employee?.code ?? '',
      name: employee?.name ?? '',
      imageUrl: employee?.imageUrl ?? '',
      birthdate: toDateInput(employee?.birthdate),
      tin: employee?.tin ?? '',
      gender: employee?.gender ?? 'male',
      currentAddress: employee?.currentAddress ?? '',
      homeAddress: employee?.homeAddress ?? '',
      contactNumber: employee?.contactNumber ?? '',
      sssNumber: employee?.sssNumber ?? '',
      philhealthNumber: employee?.philhealthNumber ?? '',
      status: employee?.status ?? 'active',
    },
  })

  const pending = createEmployee.isPending || updateEmployee.isPending

  const revealInvalidTab = useRevealInvalidTab(activeTab, setActiveTab, (field) => {
    form.setFocus(field as keyof EmployeeFormValues)
  })

  const onSubmit = async (values: EmployeeFormValues) => {
    const input = {
      ...values,
      imageUrl: values.imageUrl?.trim() ? values.imageUrl : null,
      birthdate: values.birthdate || null,
      tin: values.tin || null,
      currentAddress: values.currentAddress || null,
      homeAddress: values.homeAddress || null,
      contactNumber: values.contactNumber || null,
      sssNumber: values.sssNumber || null,
      philhealthNumber: values.philhealthNumber || null,
    }
    try {
      if (employee) {
        await updateEmployee.mutateAsync({ id: employee.id, input })
        toast.success('Employee updated')
      } else {
        await createEmployee.mutateAsync(input)
        toast.success('Employee created')
      }
      onClose()
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || (error instanceof Error ? error.message : 'Failed to save employee'))
    }
  }

  const onSubmitInvalid = (submitErrors: FieldErrors<EmployeeFormValues>) => {
    const first = firstInvalidTabField(submitErrors, EMPLOYEE_FORM_TAB_FIELDS, EMPLOYEE_TAB_ORDER)
    if (!first) return
    revealInvalidTab(first.tab, first.field)
  }

  const invalidTabs = invalidTabValues(form.formState.errors, EMPLOYEE_FORM_TAB_FIELDS, EMPLOYEE_TAB_ORDER)

  return (
    <Form {...form}>
      <form
        id='employee-form'
        onSubmit={form.handleSubmit(onSubmit, onSubmitInvalid)}
        className='flex h-full min-h-0 flex-col'
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex min-h-0 flex-1 flex-col'>
          <FormSectionNav
            sections={EMPLOYEE_FORM_SECTIONS}
            value={activeTab}
            onValueChange={setActiveTab}
            invalidValues={invalidTabs}
          />

          <div className='min-h-0 flex-1 overflow-y-auto'>
            {activeTab === 'general' ? (
              <div className='space-y-4 px-6 py-4'>
                <div className='flex items-start gap-4'>
                  <FormField
                    control={form.control}
                    name='imageUrl'
                    render={({ field }) => (
                      <FormItem className='w-24 shrink-0'>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onUpload={(file) => uploadEmployeeImage(file, employee?.id)}
                            name={form.watch('name') || 'Employee'}
                            disabled={pending}
                            size='md'
                            className='w-auto'
                          />
                        </FormControl>
                        <FormDescription className='text-xs leading-4'>
                          JPG, PNG, WebP, or GIF. 5MB max.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='min-w-0 flex-1 space-y-4'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder='Full name' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='code'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input placeholder='EMP-001' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='birthdate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthdate</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem className='min-w-0'>
                        <FormLabel>Gender</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select gender' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='male'>Male</SelectItem>
                            <SelectItem value='female'>Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='contactNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <FormLabel>Status</FormLabel>
                          <FormDescription>
                            Enable to mark this employee as active.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            className='mt-0.5 shrink-0'
                            checked={field.value === 'active'}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? 'active' : 'inactive')
                            }
                            disabled={pending}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            {activeTab === 'address' ? (
              <div className='space-y-4 px-6 py-4'>
                <FormField
                  control={form.control}
                  name='currentAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current address</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='homeAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home address</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            {activeTab === 'statutory' ? (
              <div className='space-y-4 px-6 py-4'>
                <FormField
                  control={form.control}
                  name='sssNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSS number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='philhealthNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PhilHealth number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='tin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TIN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}
          </div>
        </Tabs>

        <div className='flex-none border-t bg-background px-6 py-3'>
          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type='submit' disabled={pending}>
              {pending ? <Loader2 className='me-2 h-4 w-4 animate-spin' /> : null}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

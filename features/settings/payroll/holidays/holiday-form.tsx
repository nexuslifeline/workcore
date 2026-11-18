'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Input } from '@/components/common/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { Switch } from '@/components/common/switch'
import { Textarea } from '@/components/common/textarea'
import { useCreateHoliday, useUpdateHoliday } from '@/hooks/use-holidays'
import type { Holiday } from '@/types/holiday'
import { holidayTypes } from './data'

const holidayFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['regular_holiday', 'special_holiday']),
  isRecurring: z.boolean(),
})

type HolidayFormValues = z.infer<typeof holidayFormSchema>

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

function toFormValues(holiday?: Holiday): HolidayFormValues {
  return {
    date: holiday?.date.slice(0, 10) ?? '',
    name: holiday?.name ?? '',
    description: holiday?.description ?? '',
    type: holiday?.type ?? 'regular_holiday',
    isRecurring: holiday?.isRecurring ?? false,
  }
}

export function HolidayForm({ holiday, onClose }: { holiday?: Holiday; onClose: () => void }) {
  const createHoliday = useCreateHoliday()
  const updateHoliday = useUpdateHoliday()
  const pending = createHoliday.isPending || updateHoliday.isPending
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: toFormValues(holiday),
  })

  const onSubmit = async (values: HolidayFormValues) => {
    const input = {
      date: values.date,
      name: values.name,
      description: values.description || null,
      type: values.type,
      isRecurring: values.isRecurring,
    }
    try {
      if (holiday) {
        await updateHoliday.mutateAsync({ id: holiday.id, input })
        toast.success('Holiday updated')
      } else {
        await createHoliday.mutateAsync(input)
        toast.success('Holiday created')
      }
      onClose()
    } catch (error) {
      toast.error(errorMessage(error, holiday ? 'Failed to update holiday' : 'Failed to create holiday'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col'>
        <div className='flex-1 space-y-4 overflow-y-auto px-6 py-4'>
          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete='off' />
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
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {holidayTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='isRecurring'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <FormLabel>Recurring</FormLabel>
                    <FormDescription>
                      Show this holiday every year on the same month and day.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      className='mt-0.5 shrink-0'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={pending}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-end gap-2 border-t px-6 py-4'>
          <Button type='button' variant='outline' onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type='submit' disabled={pending}>
            {pending ? <Loader2 className='size-4 animate-spin' /> : null}
            {holiday ? 'Save holiday' : 'Create holiday'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

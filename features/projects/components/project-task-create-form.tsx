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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Input } from '@/components/common/input'
import { NumberInput } from '@/components/common/number-input'
import { Textarea } from '@/components/common/textarea'
import { useCreateProjectTask } from '@/hooks/use-projects'

const taskCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  budget: z
    .string()
    .min(1, 'Budget is required')
    .refine((value) => {
      const num = Number(value)
      return Number.isFinite(num) && num >= 0
    }, 'Budget must be zero or more'),
})

type TaskCreateValues = z.infer<typeof taskCreateSchema>

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

export function ProjectTaskCreateForm({
  projectId,
  onClose,
}: {
  projectId: string
  onClose: () => void
}) {
  const createTask = useCreateProjectTask(projectId)
  const form = useForm<TaskCreateValues>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      dueDate: '',
      budget: '0.00',
    },
  })

  const onSubmit = async (values: TaskCreateValues) => {
    try {
      await createTask.mutateAsync({
        name: values.name,
        description: values.description || null,
        dueDate: values.dueDate || null,
        budget: values.budget,
      })
      toast.success('Task created')
      onClose()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to create task'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col'>
        <div className='flex-1 space-y-4 overflow-y-auto px-6 py-4'>
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
            name='dueDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='budget'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <NumberInput
                    value={field.value}
                    onValueChange={field.onChange}
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-end gap-2 border-t px-6 py-4'>
          <Button type='button' variant='outline' onClick={onClose} disabled={createTask.isPending}>
            Cancel
          </Button>
          <Button type='submit' disabled={createTask.isPending}>
            {createTask.isPending ? <Loader2 className='size-4 animate-spin' /> : null}
            Create task
          </Button>
        </div>
      </form>
    </Form>
  )
}

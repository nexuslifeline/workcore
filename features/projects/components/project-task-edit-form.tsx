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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { Textarea } from '@/components/common/textarea'
import { useUpdateProjectTask } from '@/hooks/use-projects'
import type { ProjectTaskListItem } from '@/types/project'
import { projectTaskStatuses } from '../data/data'

const amountSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((value) => {
      const num = Number(value)
      return Number.isFinite(num) && num >= 0
    }, `${label} must be zero or more`)

const taskEditSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    budget: amountSchema('Budget'),
    estimatedHours: amountSchema('Estimated hours'),
  })
  .refine((values) => !values.startDate || !values.dueDate || values.dueDate >= values.startDate, {
    path: ['dueDate'],
    message: 'Due date must be on or after the start date',
  })

type TaskEditValues = z.infer<typeof taskEditSchema>

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : ''
}

export function ProjectTaskEditForm({
  projectId,
  task,
  onClose,
}: {
  projectId: string
  task: ProjectTaskListItem
  onClose: () => void
}) {
  const updateTask = useUpdateProjectTask(projectId)
  const form = useForm<TaskEditValues>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      name: task.name,
      description: task.description ?? '',
      status: task.status,
      startDate: dateInputValue(task.plannedStartDate),
      dueDate: dateInputValue(task.plannedEndDate),
      budget: task.budget,
      estimatedHours: task.estimatedHours,
    },
  })

  const onSubmit = async (values: TaskEditValues) => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        input: {
          name: values.name,
          description: values.description || null,
          status: values.status,
          plannedStartDate: values.startDate || null,
          plannedEndDate: values.dueDate || null,
          budget: values.budget,
          estimatedHours: values.estimatedHours,
        },
      })
      toast.success('Task saved')
      onClose()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to save task'))
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
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectTaskStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
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
            name='startDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
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
          <FormField
            control={form.control}
            name='estimatedHours'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated hours</FormLabel>
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
          <Button type='button' variant='outline' onClick={onClose} disabled={updateTask.isPending}>
            Cancel
          </Button>
          <Button type='submit' disabled={updateTask.isPending}>
            {updateTask.isPending ? <Loader2 className='size-4 animate-spin' /> : null}
            Save task
          </Button>
        </div>
      </form>
    </Form>
  )
}

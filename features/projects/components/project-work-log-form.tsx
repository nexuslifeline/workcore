'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EmployeeSelector } from '@/components/common/employee-selector'
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
import { usePayrollSetup } from '@/hooks/use-payroll-setup'
import { useCreateProjectWorkLog, useUpdateProjectWorkLog } from '@/hooks/use-projects'
import { getEmployee } from '@/services/client/employees/employee-service'
import { useOrganizationStore } from '@/stores/organization-store'
import type { ProjectWorkLogListItem } from '@/types/project'

function manilaDate(value: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

const workLogSchema = z
  .object({
    employeeId: z.string().min(1, 'Employee is required'),
    startDatetime: z.string().min(1, 'Start is required'),
    endDatetime: z.string().min(1, 'End is required'),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Work date is required'),
    breakMinutes: z.string().refine((value) => {
      if (!/^\d+$/.test(value.trim())) return false
      return Number.isInteger(Number(value)) && Number(value) >= 0
    }, 'Break must be zero or more'),
    hourlyRate: z
      .string()
      .min(1, 'Hourly rate is required')
      .refine((value) => {
        const num = Number(value)
        return Number.isFinite(num) && num >= 0
      }, 'Hourly rate must be zero or more'),
    notes: z.string().optional(),
  })
  .refine((values) => new Date(values.endDatetime) > new Date(values.startDatetime), {
    message: 'End must be after start',
    path: ['endDatetime'],
  })
  .refine(
    (values) => {
      const start = new Date(values.startDatetime)
      const end = new Date(values.endDatetime)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return true
      return Number(values.breakMinutes) * 60 <= (end.getTime() - start.getTime()) / 1000
    },
    { message: 'Break cannot be longer than the shift', path: ['breakMinutes'] }
  )
  .refine(
    (values) => {
      const start = new Date(values.startDatetime)
      const end = new Date(values.endDatetime)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true
      const startDate = manilaDate(start)
      const endDate = manilaDate(end)
      return values.workDate >= startDate && values.workDate <= endDate
    },
    { message: 'Work date must be a date the shift covers', path: ['workDate'] }
  )

type WorkLogValues = z.infer<typeof workLogSchema>

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

function toDatetimeLocal(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function hourlyRateFromEmployee(employee: object) {
  if (!('hourlyRate' in employee)) return null
  const value = (employee as { hourlyRate?: unknown }).hourlyRate
  const num = Number(value)
  if (!Number.isFinite(num)) return null
  return num.toFixed(2)
}

export function ProjectWorkLogForm({
  projectId,
  taskId,
  workLog,
  onClose,
}: {
  projectId: string
  taskId: string
  workLog: ProjectWorkLogListItem | null
  onClose: () => void
}) {
  const createWorkLog = useCreateProjectWorkLog(projectId)
  const updateWorkLog = useUpdateProjectWorkLog(projectId)
  const { activeOrganizationId } = useOrganizationStore()
  const { data: payrollSetup } = usePayrollSetup(activeOrganizationId)
  const isPending = createWorkLog.isPending || updateWorkLog.isPending
  const form = useForm<WorkLogValues>({
    resolver: zodResolver(workLogSchema),
    defaultValues: {
      employeeId: workLog?.employeeId ?? '',
      startDatetime: workLog ? toDatetimeLocal(workLog.startDatetime) : '',
      endDatetime: workLog ? toDatetimeLocal(workLog.endDatetime) : '',
      workDate: workLog?.workDate ?? '',
      breakMinutes: workLog ? String(workLog.breakMinutes) : '60',
      hourlyRate: workLog?.hourlyRate ?? '0.00',
      notes: workLog?.notes ?? '',
    },
  })
  const startDatetime = form.watch('startDatetime')
  const workDateDirty = form.formState.dirtyFields.workDate
  const breakDirty = form.formState.dirtyFields.breakMinutes

  useEffect(() => {
    if (workLog || !startDatetime || workDateDirty) return
    form.setValue('workDate', startDatetime.slice(0, 10))
  }, [form, startDatetime, workDateDirty, workLog])

  useEffect(() => {
    if (workLog || breakDirty || !payrollSetup) return
    form.setValue('breakMinutes', String(payrollSetup.defaultBreakMinutes))
  }, [breakDirty, form, payrollSetup, workLog])

  const onEmployeeChange = (employeeId: string, onChange: (value: string) => void) => {
    onChange(employeeId)
    if (!employeeId) return
    getEmployee(employeeId)
      .then((employee) => {
        const rate = hourlyRateFromEmployee(employee)
        if (rate) form.setValue('hourlyRate', rate, { shouldValidate: true })
      })
      .catch(() => undefined)
  }

  const onSubmit = async (values: WorkLogValues) => {
    const input = {
      employeeId: values.employeeId,
      startDatetime: new Date(values.startDatetime).toISOString(),
      endDatetime: new Date(values.endDatetime).toISOString(),
      workDate: values.workDate,
      breakMinutes: Number(values.breakMinutes),
      hourlyRate: values.hourlyRate,
      notes: values.notes || null,
    }
    try {
      if (workLog) {
        await updateWorkLog.mutateAsync({ taskId, workLogId: workLog.id, input })
        toast.success('Work log updated')
      } else {
        await createWorkLog.mutateAsync({ taskId, input })
        toast.success('Work log added')
      }
      onClose()
    } catch (error) {
      toast.error(errorMessage(error, workLog ? 'Failed to update work log' : 'Failed to add work log'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col'>
        <div className='flex-1 space-y-4 overflow-y-auto px-6 py-4'>
          <FormField
            control={form.control}
            name='employeeId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <FormControl>
                  <EmployeeSelector
                    value={field.value}
                    placeholder='Select employee'
                    onValueChange={(value) => onEmployeeChange(value, field.onChange)}
                    initialEmployee={
                      workLog
                        ? {
                            id: workLog.employeeId,
                            name: workLog.employeeName,
                            code: workLog.employeeCode,
                            imageUrl: workLog.employeeImageUrl,
                          }
                        : null
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='workDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='startDatetime'
              render={({ field }) => (
                <FormItem className='min-w-0'>
                  <FormLabel>Time in</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endDatetime'
              render={({ field }) => (
                <FormItem className='min-w-0'>
                  <FormLabel>Time out</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='breakMinutes'
              render={({ field }) => (
                <FormItem className='min-w-0'>
                  <FormLabel>Break (minutes)</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onValueChange={field.onChange}
                      decimalScale={0}
                      allowNegative={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='hourlyRate'
              render={({ field }) => (
                <FormItem className='min-w-0'>
                  <FormLabel>Hourly rate</FormLabel>
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
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-end gap-2 border-t px-6 py-4'>
          <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending ? <Loader2 className='size-4 animate-spin' /> : null}
            {workLog ? 'Save' : 'Add work log'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

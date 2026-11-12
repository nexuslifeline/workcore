'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useUpdatePayrollSetup } from '@/hooks/use-payroll-setup'
import type { PayrollSetup } from '@/types/payroll-setup'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const payrollSetupSchema = z.object({
  defaultBreakMinutes: z
    .string()
    .trim()
    .min(1, 'Break minutes is required')
    .regex(/^\d+$/, 'Break minutes must be a whole number'),
  maxRegularShiftHours: z
    .string()
    .trim()
    .min(1, 'Regular shift hours is required')
    .regex(/^\d+$/, 'Regular shift hours must be a whole number')
    .refine((value) => {
      const hours = Number(value)
      return hours >= 1 && hours <= 24
    }, 'Regular shift hours must be between 1 and 24'),
  nightShiftDifferentialStartTime: z
    .string()
    .regex(timePattern, 'Enter a valid start time'),
  nightShiftDifferentialEndTime: z
    .string()
    .regex(timePattern, 'Enter a valid end time'),
})

type PayrollSetupFormValues = z.infer<typeof payrollSetupSchema>

function toFormValues(payrollSetup: PayrollSetup): PayrollSetupFormValues {
  return {
    defaultBreakMinutes: String(payrollSetup.defaultBreakMinutes),
    maxRegularShiftHours: String(payrollSetup.maxRegularShiftHours),
    nightShiftDifferentialStartTime: payrollSetup.nightShiftDifferentialStartTime,
    nightShiftDifferentialEndTime: payrollSetup.nightShiftDifferentialEndTime,
  }
}

type PayrollSetupFormProps = {
  payrollSetup: PayrollSetup
}

export function PayrollSetupForm({ payrollSetup }: PayrollSetupFormProps) {
  const updatePayrollSetup = useUpdatePayrollSetup()
  const form = useForm<PayrollSetupFormValues>({
    resolver: zodResolver(payrollSetupSchema),
    defaultValues: toFormValues(payrollSetup),
  })

  useEffect(() => {
    form.reset(toFormValues(payrollSetup))
  }, [payrollSetup, form])

  const onSubmit = (values: PayrollSetupFormValues) => {
    updatePayrollSetup.mutate(
      {
        defaultBreakMinutes: Number(values.defaultBreakMinutes),
        maxRegularShiftHours: Number(values.maxRegularShiftHours),
        nightShiftDifferentialStartTime: values.nightShiftDifferentialStartTime,
        nightShiftDifferentialEndTime: values.nightShiftDifferentialEndTime,
      },
      {
        onSuccess: () => {
          toast.success('Payroll settings updated')
        },
        onError: (error: unknown) => {
          const response =
            error && typeof error === 'object' && 'response' in error
              ? (error as { response?: { data?: { error?: string } } }).response
              : undefined
          toast.error(response?.data?.error || 'Failed to update payroll settings')
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='defaultBreakMinutes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default break (minutes)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  inputMode='numeric'
                  disabled={updatePayrollSetup.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>Default break length in minutes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='maxRegularShiftHours'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max regular shift (hours)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={1}
                  max={24}
                  step={1}
                  inputMode='numeric'
                  disabled={updatePayrollSetup.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>Maximum hours in a regular shift.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='nightShiftDifferentialStartTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Night differential start</FormLabel>
              <FormControl>
                <Input type='time' disabled={updatePayrollSetup.isPending} {...field} />
              </FormControl>
              <FormDescription>Night differential begins at this time.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='nightShiftDifferentialEndTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Night differential end</FormLabel>
              <FormControl>
                <Input type='time' disabled={updatePayrollSetup.isPending} {...field} />
              </FormControl>
              <FormDescription>
                Night differential ends at this time. The window can cross midnight.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={updatePayrollSetup.isPending}>
          {updatePayrollSetup.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save payroll settings
        </Button>
      </form>
    </Form>
  )
}

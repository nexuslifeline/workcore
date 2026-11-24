'use client'

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
import {
  useCreateDriverRouteLog,
  useUpdateDriverRouteLog,
} from '@/hooks/use-driver-route-logs'
import type { DriverRouteLog } from '@/types/driver-route-log'
import { VehicleSelector } from './vehicle-selector'

function odometerNumber(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : Number.NaN
}

const driverRouteLogFormSchema = z
  .object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    employeeId: z.string().min(1, 'Driver is required'),
    origin: z.string().trim().min(1, 'Origin is required'),
    destination: z.string().trim().min(1, 'Destination is required'),
    startDatetime: z.string().min(1, 'Start date is required'),
    endDatetime: z.string().optional(),
    startingOdometer: z.string().refine((value) => {
      const num = odometerNumber(value)
      return num == null || (Number.isFinite(num) && num >= 0)
    }, 'Starting odometer must be zero or more'),
    endingOdometer: z.string().refine((value) => {
      const num = odometerNumber(value)
      return num == null || (Number.isFinite(num) && num >= 0)
    }, 'Ending odometer must be zero or more'),
    notes: z.string().optional(),
  })
  .refine(
    (values) => {
      if (!values.endDatetime?.trim()) return true
      const start = new Date(values.startDatetime)
      const end = new Date(values.endDatetime)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
      return end >= start
    },
    { message: 'End date must be on or after the start date', path: ['endDatetime'] }
  )
  .refine(
    (values) => {
      const starting = odometerNumber(values.startingOdometer)
      const ending = odometerNumber(values.endingOdometer)
      if (starting == null || ending == null) return true
      if (!Number.isFinite(starting) || !Number.isFinite(ending)) return true
      return ending >= starting
    },
    {
      message: 'Ending odometer must be greater than or equal to the starting odometer',
      path: ['endingOdometer'],
    }
  )

type DriverRouteLogFormValues = z.infer<typeof driverRouteLogFormSchema>

function toDatetimeLocal(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toOdometerInput(value: number | null) {
  return value == null ? '' : String(value)
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

export function DriverRouteLogForm({
  driverRouteLog,
  onClose,
}: {
  driverRouteLog?: DriverRouteLog
  onClose: () => void
}) {
  const createLog = useCreateDriverRouteLog()
  const updateLog = useUpdateDriverRouteLog()
  const isEdit = Boolean(driverRouteLog)
  const form = useForm<DriverRouteLogFormValues>({
    resolver: zodResolver(driverRouteLogFormSchema),
    defaultValues: {
      vehicleId: driverRouteLog?.vehicleId ?? '',
      employeeId: driverRouteLog?.employeeId ?? '',
      origin: driverRouteLog?.origin ?? '',
      destination: driverRouteLog?.destination ?? '',
      startDatetime: toDatetimeLocal(driverRouteLog?.startDatetime ?? null),
      endDatetime: toDatetimeLocal(driverRouteLog?.endDatetime ?? null),
      startingOdometer: toOdometerInput(driverRouteLog?.startingOdometer ?? null),
      endingOdometer: toOdometerInput(driverRouteLog?.endingOdometer ?? null),
      notes: driverRouteLog?.notes ?? '',
    },
  })

  const pending = createLog.isPending || updateLog.isPending

  const onSubmit = async (values: DriverRouteLogFormValues) => {
    const input = {
      vehicleId: values.vehicleId,
      employeeId: values.employeeId,
      origin: values.origin,
      destination: values.destination,
      startDatetime: new Date(values.startDatetime).toISOString(),
      endDatetime: values.endDatetime?.trim()
        ? new Date(values.endDatetime).toISOString()
        : null,
      startingOdometer: odometerNumber(values.startingOdometer),
      endingOdometer: odometerNumber(values.endingOdometer),
      notes: values.notes?.trim() ? values.notes : null,
    }
    try {
      if (driverRouteLog) {
        await updateLog.mutateAsync({ id: driverRouteLog.id, input })
        toast.success('Driver route log updated')
      } else {
        await createLog.mutateAsync(input)
        toast.success('Driver route log created')
      }
      onClose()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to save driver route log'))
    }
  }

  return (
    <Form {...form}>
      <form
        id='driver-route-log-form'
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex h-full min-h-0 flex-col'
      >
        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4'>
          <FormField
            control={form.control}
            name='vehicleId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <FormControl>
                  <VehicleSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    initialVehicle={
                      driverRouteLog
                        ? {
                            id: driverRouteLog.vehicleId,
                            name: driverRouteLog.vehicleName,
                            plateNumber: driverRouteLog.vehiclePlateNumber,
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
            name='employeeId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver</FormLabel>
                <FormControl>
                  <EmployeeSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select driver'
                    initialEmployee={
                      driverRouteLog
                        ? {
                            id: driverRouteLog.employeeId,
                            name: driverRouteLog.employeeName,
                            code: driverRouteLog.employeeCode,
                            imageUrl: driverRouteLog.employeeImageUrl,
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
            name='origin'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <FormControl>
                  <Input placeholder='Warehouse' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='destination'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder='Site' {...field} />
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
                  <FormLabel>Start date</FormLabel>
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
                  <FormLabel>End date</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='startingOdometer'
              render={({ field }) => (
                <FormItem className='min-w-0'>
                  <FormLabel>Starting odo (km)</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onValueChange={field.onChange}
                      decimalScale={1}
                      allowNegative={false}
                      placeholder='0.0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endingOdometer'
              render={({ field }) => (
                <FormItem className='min-w-0'>
                  <FormLabel>Ending odo (km)</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value}
                      onValueChange={field.onChange}
                      decimalScale={1}
                      allowNegative={false}
                      placeholder='0.0'
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
                  <Textarea rows={3} placeholder='Optional notes' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

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
import { Textarea } from '@/components/common/textarea'
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/use-vehicles'
import type { Vehicle } from '@/types/vehicle'

const vehicleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  plateNumber: z.string().min(1, 'Plate number is required'),
  description: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

export function VehicleForm({
  vehicle,
  onClose,
}: {
  vehicle?: Vehicle
  onClose: () => void
}) {
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const isEdit = Boolean(vehicle)
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: vehicle?.name ?? '',
      plateNumber: vehicle?.plateNumber ?? '',
      description: vehicle?.description ?? '',
    },
  })

  const pending = createVehicle.isPending || updateVehicle.isPending

  const onSubmit = async (values: VehicleFormValues) => {
    const input = {
      name: values.name,
      plateNumber: values.plateNumber,
      description: values.description?.trim() ? values.description : null,
    }
    try {
      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, input })
        toast.success('Vehicle updated')
      } else {
        await createVehicle.mutateAsync(input)
        toast.success('Vehicle created')
      }
      onClose()
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || (error instanceof Error ? error.message : 'Failed to save vehicle'))
    }
  }

  return (
    <Form {...form}>
      <form
        id='vehicle-form'
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex h-full min-h-0 flex-col'
      >
        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Delivery van' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='plateNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plate number</FormLabel>
                <FormControl>
                  <Input placeholder='ABC-1234' {...field} />
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
                  <Textarea rows={3} placeholder='Optional notes about this vehicle' {...field} />
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

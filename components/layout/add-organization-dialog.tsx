'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCreateOrganization } from '@/hooks/use-organization-mutations'
import { useOrganizationStore } from '@/stores/organization-store'

const formSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
})

type OrganizationForm = z.infer<typeof formSchema>

type AddOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddOrganizationDialog({
  open,
  onOpenChange,
}: AddOrganizationDialogProps) {
  const router = useRouter()
  const { setActiveOrganizationId } = useOrganizationStore()
  const createMutation = useCreateOrganization()

  const form = useForm<OrganizationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = (values: OrganizationForm) => {
    createMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
      },
      {
        onSuccess: (organization) => {
          toast.success('Organization created successfully')
          // Set the newly created organization as active
          setActiveOrganizationId(organization.id)
          router.refresh()

          // Reset form and close dialog
          form.reset()
          onOpenChange(false)
        },
      }
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Organization</DialogTitle>
          <DialogDescription>
            Create a new organization. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Acme Inc.'
                      autoComplete='off'
                      {...field}
                    />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='A brief description of your organization...'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


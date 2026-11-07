'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateOrganization } from '@/hooks/use-organization-mutations'
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
import { Textarea } from '@/components/common/textarea'
import { ImageUpload } from '@/components/common/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Organization } from '@/types/organization'
import { uploadOrganizationImage } from '@/services/client/storage/image-upload-service'

const organizationFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contactPerson: z.string().optional(),
  industry: z.string().optional(),
  currencyCode: z.string().min(1, 'Currency is required'),
  status: z.enum(['active', 'inactive']),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

type OrganizationEditFormProps = {
  organization: Organization
}

export function OrganizationEditForm({ organization }: OrganizationEditFormProps) {
  const updateOrganization = useUpdateOrganization()
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization.name || '',
      description: organization.description || '',
      logoUrl: organization.logoUrl,
      address: organization.address || '',
      phone: organization.phone || '',
      email: organization.email || '',
      website: organization.website || '',
      contactPerson: organization.contactPerson || '',
      industry: organization.industry || '',
      currencyCode: organization.currencyCode || 'PHP',
      status: organization.status === 'inactive' ? 'inactive' : 'active',
    },
  })

  const onSubmit = async (values: OrganizationFormValues) => {
    try {
      await updateOrganization.mutateAsync({
        id: organization.id,
        data: {
          name: values.name,
          description: values.description || null,
          logoUrl: values.logoUrl || null,
          address: values.address || null,
          phone: values.phone || null,
          email: values.email || null,
          website: values.website || null,
          contactPerson: values.contactPerson || null,
          industry: values.industry || null,
          currencyCode: values.currencyCode,
          status: values.status,
        },
      })
      toast.success('Organization updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update organization')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder='Acme Inc.' {...field} />
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
                <Textarea placeholder='A brief description of your organization...' rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='logoUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onUpload={(file) => uploadOrganizationImage(file, organization.id)}
                  name={form.watch('name') || 'Organization'}
                  disabled={false}
                  size='md'
                />
              </FormControl>
              <FormDescription>
                Upload your organization logo. Max size 5MB. A square image works best.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder='Street, city, region' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type='tel' placeholder='+63 900 000 0000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='contact@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='website'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input type='url' placeholder='https://example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='contactPerson'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder='Jane Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='industry'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder='Professional services' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='currencyCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder='PHP' {...field} />
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
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type='submit' disabled={updateOrganization.isPending}>
          {updateOrganization.isPending ? <Loader2 className='animate-spin' /> : null}
          Save changes
        </Button>
      </form>
    </Form>
  )
}

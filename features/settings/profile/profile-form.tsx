import React from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile } from '@/hooks/use-profile'
import { useUpdateProfile } from '@/hooks/use-profile-mutations'
import { toYyyyMmDdLocal } from '@/lib/utils/date'
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
import { uploadProfileImage } from '@/services/client/storage/image-upload-service'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ProfileFormSkeleton } from './profile-form-skeleton'

const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  birthdate: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile()
  const updateMutation = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      avatarUrl: '',
      phone: '',
      website: '',
      address: '',
      birthdate: '',
    },
    mode: 'onChange',
  })
  const profileName = useWatch({ control: form.control, name: 'name' })

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        birthdate: profile.birthdate
          ? toYyyyMmDdLocal(new Date(profile.birthdate))
          : '',
      })
    }
  }, [profile, form])

  const onSubmit = (values: ProfileFormValues) => {
    const payload = {
      name: values.name || null,
      bio: values.bio || null,
      avatarUrl: values.avatarUrl || null,
      phone: values.phone || null,
      website: values.website || null,
      address: values.address || null,
      birthdate: values.birthdate ? new Date(values.birthdate) : null,
    }
    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Profile updated successfully')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update profile')
      }
    })
  }

  if (isLoading) {
    return <ProfileFormSkeleton />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
      <FormField
          control={form.control}
          name='avatarUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onUpload={(file) => uploadProfileImage(file, profile?.userId || undefined)}
                  name={profileName || 'Profile'}
                  disabled={updateMutation.isPending}
                  size='md'
                />
              </FormControl>
              <FormDescription>
                Max size: 5MB. Formats: JPG, PNG, WebP, GIF.
              </FormDescription>
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
                <Input placeholder='Your full name' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description about yourself.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

       
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type='tel' placeholder='+1 (555) 123-4567' {...field} />
              </FormControl>
              <FormDescription>
                Your contact phone number.
              </FormDescription>
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
                <Input
                  type='url'
                  placeholder='https://example.com'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your personal website or blog URL.
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
                <Textarea
                  placeholder='123 Main St, City, State, ZIP'
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your physical address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='birthdate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormDescription>
                Your date of birth.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            'Update profile'
          )}
        </Button>
      </form>
    </Form>
  )
}

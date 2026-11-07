'use client'

import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { PasswordInput } from '@/components/password-input'
import { RoleCombobox } from '@/components/common/combobox/role-combobox'
import { type User } from '@/types/user'
import { useOrganizationStore } from '@/stores/organization-store'
import { createUser, updateUser } from '@/services/client/users/user-service'

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First Name is required.'),
    lastName: z.string().min(1, 'Last Name is required.'),
    phoneNumber: z.string().min(1, 'Phone number is required.'),
    email: z.email({
      error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    roleId: z.string(),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
    isOwner: z.boolean(),
  })
  .refine(
    (data) =>
      (data.isEdit && data.isOwner) || (data.roleId?.trim()?.length ?? 0) > 0,
    { message: 'Role is required when the user is not the owner.', path: ['roleId'] }
  )
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'Password must be at least 8 characters long.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: 'Password must contain at least one lowercase letter.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: 'Password must contain at least one number.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId?: string // Optional: if provided, use it; otherwise use store
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  organizationId: propOrganizationId,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { activeOrganizationId: storeOrganizationId } = useOrganizationStore()
  // Use prop if provided, otherwise fall back to store (backward compatible)
  const activeOrganizationId = propOrganizationId || storeOrganizationId

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          firstName: currentRow.name?.split(' ')[0] || '',
          lastName: currentRow.name?.split(' ').slice(1).join(' ') || '',
          email: currentRow.email || '',
          phoneNumber: currentRow.phone || '',
          roleId: currentRow.roleId ?? '',
          password: '',
          confirmPassword: '',
          isEdit,
          isOwner: currentRow.role === 'Owner',
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          roleId: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          isEdit,
          isOwner: false,
        },
  })

  const onSubmit = async (values: UserForm) => {
    if (!activeOrganizationId) {
      toast.error('Please select an organization first')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && currentRow) {
        const payload: Parameters<typeof updateUser>[1] = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          roleId: values.roleId?.trim() || null,
        }
        if (values.password?.trim()) {
          payload.password = values.password
        }
        await updateUser(currentRow.id, payload)
        toast.success('User updated successfully!')
      } else {
        await createUser({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          phoneNumber: values.phoneNumber.trim(),
          password: values.password,
          roleId: values.roleId,
          organizationId: activeOrganizationId,
        })
        toast.success('User created successfully!')
      }
      form.reset()
      onOpenChange(false)

      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['me', 'permissions'] })
      if (activeOrganizationId) {
        queryClient.invalidateQueries({
          queryKey: ['organization-members', activeOrganizationId],
        })
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      const message = err.response?.data?.error ?? (error instanceof Error ? error.message : 'Failed to save user')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the user here. '
              : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='w-full py-1'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
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
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
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
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john.doe@gmail.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='+123456789' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!(isEdit && currentRow?.role === 'Owner') && (
                <FormField
                  control={form.control}
                  name='roleId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <RoleCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select a role'
                        enabled={!!activeOrganizationId}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!isEdit && (
                <>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='e.g., S3cur3P@ssw0rd'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            disabled={!isPasswordTouched}
                            placeholder='e.g., S3cur3P@ssw0rd'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='user-form'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update user' : 'Create user'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

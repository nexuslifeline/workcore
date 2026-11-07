import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { MailPlus, Send, Copy, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/common/button'
import {
  Dialog,
  DialogClose,
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
import { RoleCombobox } from '@/components/common/combobox/role-combobox'
import { useOrganizationStore } from '@/stores/organization-store'
import { toast } from 'sonner'
import { useCreateOrganizationInvite } from '@/hooks/use-invitation-mutations'
import { useRoles } from '@/hooks/use-roles'
import { useHasRolePermissions } from '@/hooks/use-has-role-permissions'
import { PERMISSIONS } from '@/lib/constants/permission-codes'

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  roleId: z.string().min(1, 'Role is required.'),
  desc: z.string().optional(),
})

type UserInviteForm = z.infer<typeof formSchema>

type UserInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId?: string
}

export function UsersInviteDialog({
  open,
  onOpenChange,
  organizationId: propOrganizationId,
}: UserInviteDialogProps) {
  const { activeOrganizationId: storeOrganizationId } = useOrganizationStore()
  const organizationId = propOrganizationId || storeOrganizationId
  const createInvite = useCreateOrganizationInvite()
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', roleId: '', desc: '' },
  })

  const handleCopy = async () => {
    if (invitationUrl) {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      toast.success('Invitation link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const onSubmit = async (values: UserInviteForm) => {
    if (!organizationId) {
      toast.error('Please select an organization first')
      return
    }

    try {
      const data = await createInvite.mutateAsync({
        organizationId,
        email: values.email.trim().toLowerCase(),
        roleId: values.roleId,
        message: values.desc?.trim() || undefined,
      })
      setInvitationUrl(data.invitationUrl)
      toast.success('Invitation created. Copy the link if the email is delayed.')
      form.reset()
    } catch {
      // api interceptor already toasts the error
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setInvitationUrl(null)
      form.reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <MailPlus /> Invite User
          </DialogTitle>
          <DialogDescription>
            Invite a user to join your team. We email the accept link and also
            show it here so you can share it yourself.
          </DialogDescription>
        </DialogHeader>

        {invitationUrl ? (
          <div className='space-y-4'>
            <div className='rounded-lg border bg-muted/50 p-4'>
              <p className='text-sm font-medium mb-2'>Invitation Link</p>
              <div className='flex items-center gap-2'>
                <Input
                  value={invitationUrl}
                  readOnly
                  className='font-mono text-xs'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                Share this link if the invitation email does not arrive. The
                invited user can open it to accept.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form
                id='user-invite-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='eg: john.doe@gmail.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        enabled={!!organizationId}
                      />
                      <RoleEmptyPermissionsHint roleId={field.value} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='desc'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='resize-none'
                          placeholder='Add a personal note to your invitation (optional)'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <DialogFooter className='gap-y-2'>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button
                type='submit'
                form='user-invite-form'
                disabled={createInvite.isPending}
              >
                {createInvite.isPending ? 'Creating...' : 'Invite'} <Send />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function RoleEmptyPermissionsHint({ roleId }: { roleId: string }) {
  const { allowed: canManageRoles } = useHasRolePermissions(
    PERMISSIONS.SYSTEM_ROLES
  )
  const { data } = useRoles({
    filters: { isActive: ['active'] },
    pageSize: 100,
    enabled: !!roleId,
    staleTime: 0,
  })
  const selectedRole = data?.roles.find((role) => role.id === roleId)
  const hasNoAllowedPermissions =
    !!roleId && selectedRole?.permissionCount === 0

  if (!hasNoAllowedPermissions) return null

  return (
    <p className='flex items-start gap-2 text-sm text-amber-700 dark:text-amber-500'>
      <AlertTriangle className='mt-0.5 size-4 shrink-0' />
      <span>
        This role has no permissions yet. They can join, but they will not see
        most of the app.
        {canManageRoles && (
          <>
            {' '}
            <a
              href={`/roles?action=permissions&id=${encodeURIComponent(roleId)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium underline underline-offset-4'
            >
              Set permissions
            </a>
          </>
        )}
      </span>
    </p>
  )
}

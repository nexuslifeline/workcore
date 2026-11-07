import { useState } from 'react'
import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/common/button'
import { UsersInviteDialog } from '@/features/users/components/users-invite-dialog'
import { UsersActionDialog } from '@/features/users/components/users-action-dialog'

type OrganizationMembersPrimaryButtonsProps = {
  organizationId: string
}

export function OrganizationMembersPrimaryButtons({
  organizationId,
}: OrganizationMembersPrimaryButtonsProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setInviteDialogOpen(true)}
        >
          <span>Invite User</span> <MailPlus size={18} />
        </Button>
        <Button className='space-x-1' onClick={() => setAddDialogOpen(true)}>
          <span>Add User</span> <UserPlus size={18} />
        </Button>
      </div>

      <UsersInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        organizationId={organizationId}
      />

      <UsersActionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        organizationId={organizationId}
      />
    </>
  )
}

import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/common/button'
import { useUsersInteractionStore } from '@/stores/users-interaction-store'

export function UsersPrimaryButtons() {
  const setDialogOpen = useUsersInteractionStore((state) => state.setDialogOpen)
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setDialogOpen('invite')}
      >
        <span>Invite User</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setDialogOpen('add')}>
        <span>Add User</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}

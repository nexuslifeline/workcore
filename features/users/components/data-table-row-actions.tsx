import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen, Copy, Send, X } from 'lucide-react'
import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { type User } from '@/types/user'
import { useUsersInteractionStore } from '@/stores/users-interaction-store'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const setDialogOpen = useUsersInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useUsersInteractionStore((state) => state.setCurrentRow)
  const queryClient = useQueryClient()
  const user = row.original
  const isInvitation = user.type === 'invitation' || user.status === 'invited'

  const handleCopyLink = async () => {
    if (!user.invitationToken) {
      toast.error('Invitation link not available')
      return
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const invitationUrl = `${baseUrl}/invite/accept?token=${user.invitationToken}`

    try {
      await navigator.clipboard.writeText(invitationUrl)
      toast.success('Invitation link copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleResend = async () => {
    try {
      const response = await fetch(`/api/invites/${user.id}/resend`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to resend invitation')
      }

      const data = await response.json()
      if (data.emailSent === false) {
        if (data.invitationUrl) {
          await navigator.clipboard.writeText(data.invitationUrl)
        }
        toast.success(
          'Invitation email could not be sent. Link copied to clipboard'
        )
      } else {
        toast.success('Invitation sent')
      }
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend invitation'
      )
    }
  }

  const handleRevoke = async () => {
    if (
      !confirm(
        `Are you sure you want to revoke the invitation for ${user.email}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/invites/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revoke invitation')
      }

      toast.success('Invitation revoked')
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to revoke invitation'
      )
    }
  }

  if (isInvitation) {
    const canManageInvite = user.status === 'pending'

    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsVerticalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            disabled={!canManageInvite || !user.invitationToken}
            onClick={handleCopyLink}
          >
            Copy Link
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canManageInvite} onClick={handleResend}>
            Resend
            <DropdownMenuShortcut>
              <Send size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!canManageInvite}
            onClick={handleRevoke}
            className='text-red-500!'
          >
            Revoke
            <DropdownMenuShortcut>
              <X size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsVerticalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setDialogOpen('edit')
          }}
        >
          Edit
          <DropdownMenuShortcut>
            <UserPen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setDialogOpen('delete')
          }}
          className='text-red-500!'
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

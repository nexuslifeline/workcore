'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { notifyWithData } from '@/lib/notify-with-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert'
import { Input } from '@/components/common/input'
import { Label } from '@/components/common/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '@/types/user'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const displayName = currentRow.name || currentRow.email || 'this user'

  const handleDelete = () => {
    if (value.trim() !== displayName) return

    onOpenChange(false)
    notifyWithData(currentRow, 'The following user has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== displayName}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{displayName}</span>?
            <br />
            This action will permanently remove the user from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter "${displayName}" to confirm deletion.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}

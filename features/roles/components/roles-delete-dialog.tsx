'use client'

import { DeleteDialog } from '@/components/common/delete-dialog'
import { type Role } from '@/features/roles/data/schema'
import { deleteRole } from '@/services/client/roles/role-service'

type RolesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Role
}

export function RolesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: RolesDeleteDialogProps) {
  const displayName = currentRow.name || 'this role'

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      id={currentRow.id}
      displayName={displayName}
      entityName='Role'
      entityNameLower='role'
      onDelete={deleteRole}
      queryKey={['roles']}
    />
  )
}

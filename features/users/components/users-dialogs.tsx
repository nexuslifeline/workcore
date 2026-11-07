import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsersInteractionStore } from '@/stores/users-interaction-store'

export function UsersDialogs() {
  const dialogOpen = useUsersInteractionStore((state) => state.dialogOpen)
  const currentRow = useUsersInteractionStore((state) => state.currentRow)
  const setDialogOpen = useUsersInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useUsersInteractionStore((state) => state.setCurrentRow)

  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={dialogOpen === 'add'}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen ? 'add' : null)
        }}
      />

      <UsersInviteDialog
        key='user-invite'
        open={dialogOpen === 'invite'}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen ? 'invite' : null)
        }}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={dialogOpen === 'edit'}
            onOpenChange={(isOpen) => {
              setDialogOpen(isOpen ? 'edit' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={dialogOpen === 'delete'}
            onOpenChange={(isOpen) => {
              setDialogOpen(isOpen ? 'delete' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}

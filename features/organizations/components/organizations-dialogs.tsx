import { ConfirmDialog } from '@/components/confirm-dialog'
import { AddOrganizationDialog } from '@/components/layout/add-organization-dialog'
import { useOrganizationsInteractionStore } from '@/stores/organizations-interaction-store'

export function OrganizationsDialogs() {
  const dialogOpen = useOrganizationsInteractionStore((state) => state.dialogOpen)
  const currentRow = useOrganizationsInteractionStore((state) => state.currentRow)
  const setDialogOpen = useOrganizationsInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useOrganizationsInteractionStore((state) => state.setCurrentRow)

  return (
    <>
      <AddOrganizationDialog
        open={dialogOpen === 'create'}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen ? 'create' : null)
        }}
      />

      {currentRow && (
        <ConfirmDialog
          key='organization-delete'
          destructive
          open={dialogOpen === 'delete'}
          onOpenChange={() => {
            setDialogOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          handleConfirm={() => {
            setDialogOpen(null)
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
            // TODO: Implement delete functionality
          }}
          className='max-w-md'
          title={`Delete organization: ${currentRow.name}?`}
          desc={
            <>
              You are about to delete the organization{' '}
              <strong>{currentRow.name}</strong>. <br />
              This action cannot be undone.
            </>
          }
          confirmText='Delete'
        />
      )}
    </>
  )
}


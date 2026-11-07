import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { RolesActionDialog } from './roles-action-dialog'
import { RolesDeleteDialog } from './roles-delete-dialog'
import { RolePermissionsDialog } from './role-permissions-dialog'
import { useRole } from '@/hooks/use-role'
import { useRolesInteractionStore } from '@/stores/roles-interaction-store'
import type { Role } from '@/features/roles/data/schema'

function clearPermissionsSearchParams(
  pathname: string,
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>
) {
  if (searchParams.get('action') !== 'permissions') return
  const params = new URLSearchParams(searchParams.toString())
  params.delete('action')
  params.delete('id')
  const next = params.toString()
  router.replace(next ? `${pathname}?${next}` : pathname)
}

export function RolesDialogs() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dialogOpen = useRolesInteractionStore((state) => state.dialogOpen)
  const currentRow = useRolesInteractionStore((state) => state.currentRow)
  const setDialogOpen = useRolesInteractionStore((state) => state.setDialogOpen)
  const setCurrentRow = useRolesInteractionStore((state) => state.setCurrentRow)
  const openPermissionsForRole = useRolesInteractionStore(
    (state) => state.openPermissionsForRole
  )

  const permissionsRoleId =
    searchParams.get('action') === 'permissions'
      ? searchParams.get('id')
      : null
  const { data: permissionsRole } = useRole({
    roleId: permissionsRoleId,
    enabled: !!permissionsRoleId,
  })

  useEffect(() => {
    if (!permissionsRole || dialogOpen === 'permissions') return
    openPermissionsForRole(permissionsRole as Role)
  }, [permissionsRole, dialogOpen, openPermissionsForRole])

  const closePermissions = (isOpen: boolean) => {
    setDialogOpen(isOpen ? 'permissions' : null)
    if (!isOpen) {
      clearPermissionsSearchParams(pathname, searchParams, router)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
    }
  }

  return (
    <>
      <RolesActionDialog
        key='role-add'
        open={dialogOpen === 'add'}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen ? 'add' : null)
        }}
      />

      {currentRow && (
        <>
          <RolesActionDialog
            key={`role-edit-${currentRow.id}`}
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

          <RolesDeleteDialog
            key={`role-delete-${currentRow.id}`}
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

          <RolePermissionsDialog
            key={`role-permissions-${currentRow.id}`}
            open={dialogOpen === 'permissions'}
            onOpenChange={closePermissions}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}

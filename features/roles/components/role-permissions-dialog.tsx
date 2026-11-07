'use client'

import { useMemo, useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import { Skeleton } from '@/components/common/skeletons'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/common/sheet'
import { Switch } from '@/components/common/switch'
import { type Role } from '@/features/roles/data/schema'
import type { Permission } from '@/services/client/permissions/permission-service'
import { usePermissions } from '@/hooks/use-permissions'
import { useSetRolePermissions } from '@/hooks/use-role-mutations'
import { useRolePermissions } from '@/hooks/use-role'

type RolePermissionsDialogProps = {
  currentRow: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PermissionRow = { perm: Permission; depth: 0 | 1 }

export function RolePermissionsDialog({
  currentRow,
  open,
  onOpenChange,
}: RolePermissionsDialogProps) {
  const [localAllowed, setLocalAllowed] = useState<Record<string, boolean>>({})
  const { data: allPermissions, isLoading: loadingPermissions } = usePermissions()
  const {
    data: rolePermissions,
    isLoading: loadingRole,
    isFetched: rolePermissionsFetched,
  } = useRolePermissions({ roleId: currentRow.id, enabled: open })
  const setPermissions = useSetRolePermissions()

  const allowedByPermissionId = useMemo(() => {
    const map: Record<string, boolean> = {}
    if (rolePermissions) {
      rolePermissions.forEach((p) => {
        map[p.permission_id] = p.is_allowed
      })
    }
    return map
  }, [rolePermissions])

  const codeToPermission = useMemo(() => {
    const map: Record<string, Permission> = {}
    allPermissions?.forEach((p) => {
      map[p.code] = p
    })
    return map
  }, [allPermissions])

  const sortedPermissions = useMemo(() => {
    if (!allPermissions) return []
    return [...allPermissions].sort((a, b) => a.code.localeCompare(b.code))
  }, [allPermissions])

  /** Groups by group label (order = first occurrence), then within each group builds parent/child rows (children indented under parent via depth). */
  const groupedPermissionRows = useMemo(() => {
    if (!sortedPermissions.length) return []
    const groupOrder: string[] = []
    const byGroup = new Map<string, Permission[]>()
    for (const perm of sortedPermissions) {
      const label = perm.group ?? 'Other'
      if (!byGroup.has(label)) {
        groupOrder.push(label)
        byGroup.set(label, [])
      }
      byGroup.get(label)!.push(perm)
    }
    const groups: { groupLabel: string; rows: PermissionRow[] }[] = []
    for (const groupLabel of groupOrder) {
      const perms = byGroup.get(groupLabel)!
      const codesInGroup = new Set(perms.map((p) => p.code))
      const roots = perms.filter(
        (p) => !p.parentCode || !codesInGroup.has(p.parentCode)
      )
      roots.sort((a, b) => a.code.localeCompare(b.code))
      const rows: PermissionRow[] = []
      for (const root of roots) {
        rows.push({ perm: root, depth: 0 })
        const children = perms
          .filter((p) => p.parentCode === root.code)
          .sort((a, b) => a.code.localeCompare(b.code))
        for (const child of children) {
          rows.push({ perm: child, depth: 1 })
        }
      }
      groups.push({ groupLabel, rows })
    }
    return groups
  }, [sortedPermissions])

  /** Child permission ids by parent permission id (for cascade-off). */
  const childrenByParentId = useMemo(() => {
    const map: Record<string, string[]> = {}
    allPermissions?.forEach((p) => {
      if (p.parentCode) {
        const parent = codeToPermission[p.parentCode]
        if (parent) {
          if (!map[parent.id]) map[parent.id] = []
          map[parent.id].push(p.id)
        }
      }
    })
    return map
  }, [allPermissions, codeToPermission])

  /** Parent permission id by child permission id (for cascade-on). */
  const parentIdByChildId = useMemo(() => {
    const map: Record<string, string> = {}
    allPermissions?.forEach((p) => {
      if (p.parentCode) {
        const parent = codeToPermission[p.parentCode]
        if (parent) map[p.id] = parent.id
      }
    })
    return map
  }, [allPermissions, codeToPermission])

  useEffect(() => {
    if (rolePermissionsFetched && rolePermissions) {
      const next: Record<string, boolean> = {}
      allPermissions?.forEach((perm) => {
        next[perm.id] = allowedByPermissionId[perm.id] ?? false
      })
      setLocalAllowed(next)
    }
  }, [allPermissions, allowedByPermissionId, rolePermissionsFetched, rolePermissions])

  const handleToggle = (permissionId: string, checked: boolean) => {
    setLocalAllowed((prev) => {
      const next = { ...prev, [permissionId]: checked }
      if (!checked) {
        const childIds = childrenByParentId[permissionId]
        if (childIds?.length) {
          childIds.forEach((id) => (next[id] = false))
        }
        // When a child is turned off, turn off parent if all children are now off
        const parentId = parentIdByChildId[permissionId]
        if (parentId) {
          const siblingIds = childrenByParentId[parentId] ?? []
          const allChildrenOff = siblingIds.every((id) => !(next[id] ?? false))
          if (allChildrenOff) next[parentId] = false
        }
      } else {
        const parentId = parentIdByChildId[permissionId]
        if (parentId) next[parentId] = true
      }
      return next
    })
  }

  /** Effective checked state: for parents, true if self or any child is on. */
  const effectiveChecked = (perm: Permission) => {
    const self = localAllowed[perm.id] ?? false
    const childIds = childrenByParentId[perm.id]
    if (!childIds?.length) return self
    const anyChildOn = childIds.some((id) => localAllowed[id] ?? false)
    return self || anyChildOn
  }

  const handleSave = async () => {
    if (!allPermissions) return
    const payload = allPermissions.map((p) => ({
      permission_id: p.id,
      is_allowed: localAllowed[p.id] ?? false,
    }))
    try {
      await setPermissions.mutateAsync({
        id: currentRow.id,
        permissions: payload,
      })
      toast.success('Permissions updated successfully')
      onOpenChange(false)
    } catch {
      toast.error('Failed to update permissions')
    }
  }

  const isLoading = loadingPermissions || loadingRole
  const isSaving = setPermissions.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-4 p-6 sm:max-w-[712px] w-full"
      >
        <SheetHeader className="flex flex-col gap-2 text-start p-0">
          <SheetTitle className="text-lg leading-none font-semibold">
            Role permissions
          </SheetTitle>
          <SheetDescription>
            Set which permissions are allowed for the role &quot;{currentRow.name}&quot;.
            Toggle each permission on or off, then save.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 min-h-0 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          {isLoading ? (
            <div className="space-y-4 px-0.5">
              {[1, 2, 3].map((groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <div className="space-y-1 pt-1.5">
                    {[1, 2, 3, 4].map((rowIndex) => (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : sortedPermissions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No permissions defined.
            </p>
          ) : (
            <div className="space-y-4 px-0.5">
              {groupedPermissionRows.map(({ groupLabel, rows }, index) => {
                const blocks: PermissionRow[][] = []
                for (const row of rows) {
                  if (row.depth === 0) blocks.push([row])
                  else if (blocks.length > 0) blocks[blocks.length - 1].push(row)
                }
                return (
                  <div key={`${groupLabel}-${index}`} className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sticky top-0 bg-background py-1.5">
                      {groupLabel}
                    </h4>
                    {blocks.map((blockRows, blockIndex) => {
                      const [parentRow, ...childRows] = blockRows
                      return (
                        <div
                          key={`${groupLabel}-${index}-${blockIndex}`}
                          className="rounded-lg border flex flex-col gap-2 p-2"
                        >
                          <div className="flex items-center justify-between gap-4 px-2 py-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {parentRow.perm.name}
                              </p>
                              {parentRow.perm.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {parentRow.perm.description}
                                </p>
                              )}
                            </div>
                            <Switch
                              checked={effectiveChecked(parentRow.perm)}
                              onCheckedChange={(checked) =>
                                handleToggle(parentRow.perm.id, checked)
                              }
                            />
                          </div>
                          {childRows.length > 0 && (
                            <>
                              <div className="border-t border-border shrink-0" />
                              <div className="flex flex-col gap-1">
                                {childRows.map(({ perm }) => (
                                  <div
                                    key={perm.id}
                                    className="flex items-center justify-between gap-4 px-2 py-1"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium">
                                        {perm.name}
                                      </p>
                                      {perm.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {perm.description}
                                        </p>
                                      )}
                                    </div>
                                    <Switch
                                      checked={effectiveChecked(perm)}
                                      onCheckedChange={(checked) =>
                                        handleToggle(perm.id, checked)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <SheetFooter className="flex flex-col-reverse gap-2 p-0 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

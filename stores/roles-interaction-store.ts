import { create } from 'zustand'
import type { Role } from '@/features/roles/data/schema'

type RolesDialogType = 'add' | 'edit' | 'delete' | 'permissions'

interface RolesInteractionState {
  dialogOpen: RolesDialogType | null
  currentRow: Role | null
  setDialogOpen: (type: RolesDialogType | null) => void
  setCurrentRow: (row: Role | null) => void
  openPermissionsForRole: (row: Role) => void
  reset: () => void
}

export const useRolesInteractionStore = create<RolesInteractionState>((set) => ({
  dialogOpen: null,
  currentRow: null,
  setDialogOpen: (type) =>
    set((state) => ({
      dialogOpen: state.dialogOpen === type ? null : type,
    })),
  setCurrentRow: (row) => set({ currentRow: row }),
  openPermissionsForRole: (row) =>
    set({ currentRow: row, dialogOpen: 'permissions' }),
  reset: () => set({ dialogOpen: null, currentRow: null }),
}))

import { create } from 'zustand'
import type { OrganizationListItem } from '@/features/organizations/data/schema'

type OrganizationsDialogType = 'create' | 'update' | 'delete'

interface OrganizationsInteractionState {
  dialogOpen: OrganizationsDialogType | null
  currentRow: OrganizationListItem | null
  setDialogOpen: (type: OrganizationsDialogType | null) => void
  setCurrentRow: (row: OrganizationListItem | null) => void
  reset: () => void
}

export const useOrganizationsInteractionStore = create<OrganizationsInteractionState>((set) => ({
  dialogOpen: null,
  currentRow: null,
  setDialogOpen: (type) =>
    set((state) => ({
      dialogOpen: state.dialogOpen === type ? null : type,
    })),
  setCurrentRow: (row) => set({ currentRow: row }),
  reset: () => set({ dialogOpen: null, currentRow: null }),
}))





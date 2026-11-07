import { create } from 'zustand'
import type { User } from '@/types/user'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersInteractionState {
  dialogOpen: UsersDialogType | null
  currentRow: User | null
  setDialogOpen: (type: UsersDialogType | null) => void
  setCurrentRow: (row: User | null) => void
  reset: () => void
}

export const useUsersInteractionStore = create<UsersInteractionState>((set) => ({
  dialogOpen: null,
  currentRow: null,
  setDialogOpen: (type) =>
    set((state) => ({
      dialogOpen: state.dialogOpen === type ? null : type,
    })),
  setCurrentRow: (row) => set({ currentRow: row }),
  reset: () => set({ dialogOpen: null, currentRow: null }),
}))





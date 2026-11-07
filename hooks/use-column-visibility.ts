import { useState, useEffect, useCallback } from 'react'
import type { VisibilityState, Updater } from '@tanstack/react-table'

/**
 * Hook to persist column visibility state in localStorage
 * @param storageKey - Unique key for localStorage (e.g., 'organizations-table-column-visibility')
 * @param defaultVisibility - Default visibility state (empty object = all visible)
 */
export function useColumnVisibility(
  storageKey: string,
  defaultVisibility: VisibilityState = {}
): [VisibilityState, (updater: Updater<VisibilityState>) => void] {
  // Initialize state from localStorage or default
  const [columnVisibility, setColumnVisibilityState] = useState<VisibilityState>(() => {
    if (typeof window === 'undefined') return defaultVisibility

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as VisibilityState
        return parsed
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to parse column visibility from localStorage for key "${storageKey}":`, error)
    }

    return defaultVisibility
  })

  // Persist to localStorage whenever visibility changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(storageKey, JSON.stringify(columnVisibility))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to save column visibility to localStorage for key "${storageKey}":`, error)
    }
  }, [columnVisibility, storageKey])

  // Handler that supports both function and direct value updates
  const setColumnVisibility = useCallback((updater: Updater<VisibilityState>) => {
    setColumnVisibilityState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }, [])

  return [columnVisibility, setColumnVisibility]
}


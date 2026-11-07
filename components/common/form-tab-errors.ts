'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FieldErrors } from 'react-hook-form'

export type TabFieldMap<T extends string> = Record<T, readonly string[]>

function fieldHasError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  if (Array.isArray(error)) return error.some((item) => fieldHasError(item))

  const record = error as Record<string, unknown>
  if (typeof record.message === 'string' && record.message.length > 0) return true

  return Object.entries(record).some(([key, value]) => {
    if (key === 'message' || key === 'type' || key === 'ref' || key === 'types') return false
    return fieldHasError(value)
  })
}

export function invalidTabValues<T extends string>(
  errors: FieldErrors,
  fieldsByTab: TabFieldMap<T>,
  tabOrder: readonly T[]
): T[] {
  return tabOrder.filter((tab) =>
    fieldsByTab[tab].some((field) => fieldHasError(errors[field]))
  )
}

export function firstInvalidTabField<T extends string>(
  errors: FieldErrors,
  fieldsByTab: TabFieldMap<T>,
  tabOrder: readonly T[]
): { tab: T; field: string } | null {
  for (const tab of tabOrder) {
    for (const field of fieldsByTab[tab]) {
      if (fieldHasError(errors[field])) return { tab, field }
    }
  }
  return null
}

function joinTabLabels(labels: string[]): string {
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  const head = labels.slice(0, -1).join(', ')
  return `${head}, and ${labels[labels.length - 1]}`
}

export function tabsNeedAttentionMessage(labels: string[]): string | null {
  if (labels.length === 0) return null
  const names = joinTabLabels(labels)
  const verb = labels.length === 1 ? 'still has' : 'still have'
  return `${names} ${verb} a few details to finish. Take a look there, then you can save.`
}

export function useRevealInvalidTab(
  activeTab: string,
  setActiveTab: (tab: string) => void,
  setFocus: (field: string) => void
) {
  const pendingField = useRef<string | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)

  const reveal = useCallback(
    (tab: string, field: string) => {
      pendingField.current = field
      if (tab !== activeTab) setActiveTab(tab)
      setFocusRequest((current) => current + 1)
    },
    [activeTab, setActiveTab]
  )

  useEffect(() => {
    const field = pendingField.current
    if (!field) return
    pendingField.current = null
    setFocus(field)
  }, [activeTab, focusRequest, setFocus])

  return reveal
}

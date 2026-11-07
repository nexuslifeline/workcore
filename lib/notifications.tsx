'use client'

import type { ReactNode } from 'react'

import { toast, type ExternalToast } from 'sonner'

type NotifyInput = {
  title: string
  message: string
  icon?: ReactNode
} & Omit<ExternalToast, 'description' | 'icon'>

export function notify({ title, message, icon, ...overrides }: NotifyInput) {
  return toast(title, {
    description: message,
    icon,
    ...overrides,
  })
}


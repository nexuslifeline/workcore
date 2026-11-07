'use client'

import type { ReactNode } from 'react'

import type { ToasterProps } from 'sonner'

import { Toaster } from '@/components/common/sonner'

export type NotificationPosition = NonNullable<ToasterProps['position']>

type NotificationProviderProps = {
  children: ReactNode
  duration?: number
  position?: NotificationPosition
}

export function NotificationProvider({
  children,
  duration = 3000,
  position = 'top-right',
}: NotificationProviderProps) {
  return (
    <>
      {children}
      <Toaster duration={duration} position={position} />
    </>
  )
}


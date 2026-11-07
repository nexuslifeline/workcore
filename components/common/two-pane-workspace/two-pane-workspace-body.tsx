'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TwoPaneWorkspaceBodyProps = {
  children: ReactNode
  className?: string
}

/** Flex row under the top bar: holds primary column, optional divider, optional secondary column. */
export function TwoPaneWorkspaceBody({ children, className }: TwoPaneWorkspaceBodyProps) {
  return (
    <div
      className={cn('flex flex-1 min-h-0 relative overflow-hidden', className)}
      data-slot='two-pane-workspace-body'
    >
      {children}
    </div>
  )
}

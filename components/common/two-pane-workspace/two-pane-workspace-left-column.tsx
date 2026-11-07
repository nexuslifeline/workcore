'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TwoPaneWorkspaceLeftColumnProps = {
  /**
   * Optional title row above the scroll area (plain string/number is wrapped in a styled `h2`).
   * Pass custom markup (e.g. heading + badge) for a compound title; keep it in a horizontal row with `actions` on the end.
   */
  title?: ReactNode
  actions?: ReactNode
  /** Wrapper around scroll region (e.g. padding) */
  contentClassName?: string
  /** Inner width constraint (default: max-w-3xl mx-auto) */
  innerClassName?: string
  children: ReactNode
}

/** Matches right column header; sized for `sm` action buttons (h-8). */
export const twoPaneWorkspaceHeaderClassName =
  'flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4'

export const twoPaneWorkspaceTitleClassName =
  'truncate text-lg font-semibold leading-8'

export function TwoPaneWorkspaceLeftColumn({
  title,
  actions,
  contentClassName,
  innerClassName,
  children,
}: TwoPaneWorkspaceLeftColumnProps) {
  const showHeader = Boolean(title) || Boolean(actions)

  return (
    <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
      {showHeader && (
        <div className={twoPaneWorkspaceHeaderClassName}>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            {title ? (
              typeof title === 'string' || typeof title === 'number' ? (
                <h2 className={twoPaneWorkspaceTitleClassName}>{title}</h2>
              ) : (
                title
              )
            ) : null}
          </div>
          {actions ? (
            <div className='flex shrink-0 items-center gap-2'>{actions}</div>
          ) : null}
        </div>
      )}
      <div className={cn('flex-1 overflow-y-auto p-4 min-h-0', contentClassName)}>
        <div className={cn('max-w-3xl mx-auto', innerClassName)}>{children}</div>
      </div>
    </div>
  )
}

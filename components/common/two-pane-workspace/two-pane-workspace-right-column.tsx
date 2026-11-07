'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  twoPaneWorkspaceHeaderClassName,
  twoPaneWorkspaceTitleClassName,
} from './two-pane-workspace-left-column'

export type TwoPaneWorkspaceRightColumnProps = {
  title?: string
  actions?: ReactNode
  children: ReactNode
}

export function TwoPaneWorkspaceRightColumn({
  title,
  actions,
  children,
}: TwoPaneWorkspaceRightColumnProps) {
  return (
    <div className='hidden h-full min-w-0 flex-1 overflow-hidden xl:block'>
      {title ? (
        <div className='flex h-full flex-col overflow-hidden'>
          <div className={cn(twoPaneWorkspaceHeaderClassName, 'bg-background')}>
            <h2 className={twoPaneWorkspaceTitleClassName}>{title}</h2>
            {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
          </div>
          <div className='min-h-0 flex-1 overflow-y-auto'>{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

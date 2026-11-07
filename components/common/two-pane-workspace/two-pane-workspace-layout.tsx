'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useSidebar } from '@/components/common/sidebar'
import { TwoPaneWorkspaceTopBar } from './two-pane-workspace-top-bar'
import { TwoPaneWorkspaceBody } from './two-pane-workspace-body'

export type TwoPaneWorkspaceLayoutProps = {
  /** Main header title */
  title: string
  /** Main header description (below title) */
  description?: string
  /** Action buttons in the main header (e.g. Save, Cancel) */
  headerActions?: ReactNode
  /** URL for the back button navigation */
  backUrl: string

  /**
   * Main workspace row (wrapped in {@link TwoPaneWorkspaceBody}).
   * Typically: {@link TwoPaneWorkspaceLeftColumn}, optional {@link TwoPaneWorkspaceColumnDivider} + {@link TwoPaneWorkspaceRightColumn}.
   */
  children: ReactNode

  /** Whether to collapse the sidebar on mount and restore on unmount (default: true) */
  collapseSidebar?: boolean
}

export function TwoPaneWorkspaceLayout({
  title,
  description,
  headerActions,
  backUrl,
  children,
  collapseSidebar = true,
}: TwoPaneWorkspaceLayoutProps) {
  const { setOpen, open } = useSidebar()
  const previousSidebarState = useRef<boolean | null>(null)

  // Collapse sidebar on mount and restore on unmount
  useEffect(() => {
    if (!collapseSidebar) return

    if (previousSidebarState.current === null) {
      previousSidebarState.current = open
    }

    setOpen(false)

    return () => {
      if (previousSidebarState.current !== null) {
        setOpen(previousSidebarState.current)
        previousSidebarState.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className='flex h-full min-h-0 flex-1 flex-col'
      data-layout='two-pane-workspace'
    >
      <TwoPaneWorkspaceTopBar
        backUrl={backUrl}
        title={title}
        description={description}
        headerActions={headerActions}
      />

      <TwoPaneWorkspaceBody>{children}</TwoPaneWorkspaceBody>
    </div>
  )
}

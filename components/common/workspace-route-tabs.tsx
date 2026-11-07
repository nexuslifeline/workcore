'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { TabsList, TabsTrigger } from '@/components/common/tabs'
import { cn } from '@/lib/utils'

export type WorkspaceRouteTab = {
  value: string
  label: string
  href?: string
  icon?: ReactNode
  count?: number
  trailing?: ReactNode
  invalid?: boolean
}

type WorkspaceRouteTabsProps = {
  tabs: WorkspaceRouteTab[]
  activeValue: string
  formatCount?: (count: number) => string
  onValueChange?: (value: string) => void
  className?: string
  size?: 'default' | 'sm'
  /** `scroll` keeps each tab at its natural width. `fit` shares the row so nothing overflows. */
  layout?: 'scroll' | 'fit'
}

function TabLabel({
  tab,
  formatCount,
}: {
  tab: WorkspaceRouteTab
  formatCount?: (count: number) => string
}) {
  const countLabel =
    typeof tab.count === 'number'
      ? ` (${formatCount ? formatCount(tab.count) : String(tab.count)})`
      : ''

  return (
    <>
      {tab.icon ? <span aria-hidden='true'>{tab.icon}</span> : null}
      {tab.invalid ? (
        <span className='size-1.5 shrink-0 rounded-full bg-destructive' aria-hidden='true' />
      ) : null}
      <span className='truncate'>{tab.label}{countLabel}</span>
      {tab.trailing}
    </>
  )
}

export function WorkspaceRouteTabs({
  tabs,
  activeValue,
  formatCount,
  className,
  size = 'default',
  layout = 'scroll',
}: WorkspaceRouteTabsProps) {
  const triggerClassName = cn(
    'data-[state=active]:after:right-2 data-[state=active]:after:left-2',
    layout === 'scroll' ? 'shrink-0' : 'min-w-0 flex-1',
    size === 'sm' && 'px-3 py-2.5 text-xs [&_svg]:size-3.5'
  )

  return (
    <TabsList
      className={cn(
        'flex min-w-0 gap-0',
        layout === 'scroll' ? 'overflow-x-auto' : 'w-full overflow-hidden',
        className
      )}
    >
      {tabs.map((tab) => {
        const label = <TabLabel tab={tab} formatCount={formatCount} />

        if (tab.href) {
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              className={triggerClassName}
            >
              <Link
                href={tab.href}
                className={cn(activeValue === tab.value && 'pointer-events-none')}
              >
                {label}
              </Link>
            </TabsTrigger>
          )
        }

        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(triggerClassName, tab.invalid && 'text-destructive')}
          >
            {label}
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}

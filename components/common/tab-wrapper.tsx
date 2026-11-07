'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabWrapperProps = {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

type TabListProps = {
  children: React.ReactNode
  className?: string
}

type TabTriggerProps = {
  value: string
  children: React.ReactNode
  className?: string
}

type TabContentProps = {
  value: string
  children: React.ReactNode
  className?: string
}

const TabContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

export function TabWrapper({ value, onValueChange, children, className }: TabWrapperProps) {
  return (
    <TabContext.Provider value={{ value, onValueChange }}>
      <div className={cn('flex flex-col h-full', className)}>{children}</div>
    </TabContext.Provider>
  )
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={cn('flex items-center gap-6 border-b', className)}>
      {children}
    </div>
  )
}

export function TabTrigger({ value, children, className }: TabTriggerProps) {
  const { value: activeValue, onValueChange } = React.useContext(TabContext)
  const isActive = activeValue === value

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        'relative px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground transition-colors',
        'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive && 'text-foreground',
        className
      )}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-sm" />
      )}
    </button>
  )
}

export function TabContent({ value, children, className }: TabContentProps) {
  const { value: activeValue } = React.useContext(TabContext)
  
  if (activeValue !== value) {
    return null
  }

  return <div className={cn('flex-1 overflow-y-auto min-h-0', className)}>{children}</div>
}

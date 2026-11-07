'use client'

import { DotsHorizontalIcon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import type { ComponentType } from 'react'
import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'

export type RowAction<TData> = {
  label: string
  icon?: ComponentType<{ className?: string }>
  onClick: (row: Row<TData>) => void
  className?: string
  variant?: 'default' | 'destructive'
  disabled?: boolean
  shortcut?: React.ReactNode
  separatorBefore?: boolean
}

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
  actions: RowAction<TData>[]
  menuWidth?: string
  triggerIcon?: 'horizontal' | 'vertical'
}

export function DataTableRowActions<TData>({
  row,
  actions,
  menuWidth = 'w-[160px]',
  triggerIcon = 'vertical',
}: DataTableRowActionsProps<TData>) {
  if (actions.length === 0) {
    return null
  }

  const TriggerIcon =
    triggerIcon === 'vertical' ? DotsVerticalIcon : DotsHorizontalIcon

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 shrink-0 p-0 data-[state=open]:bg-muted'
        >
          <TriggerIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className={menuWidth}>
        {actions.map((action, index) => {
          const Icon = action.icon
          const variant =
            action.variant ??
            (action.className?.includes('text-red') ? 'destructive' : 'default')

          return (
            <div key={index}>
              {action.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={variant}
                onClick={() => action.onClick(row)}
                disabled={action.disabled}
                className={action.className}
              >
                {Icon && (
                  <Icon className='mr-2 h-4 w-4 flex-shrink-0' />
                )}
                <span className='flex-1'>{action.label}</span>
                {action.shortcut && (
                  <DropdownMenuShortcut>
                    {action.shortcut}
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client'

import * as React from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { cn } from '@/lib/utils'

type SplitButtonMenuItem = {
  label: string
  onClick: () => void
  disabled?: boolean
}

type SplitButtonProps = {
  /** Label for the main action button. */
  label: string
  /** Called when the main button is clicked. Caller handles form submission, etc. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Optional type for the main button. Defaults to 'button'. */
  type?: 'button' | 'submit'
  /** Optional form attribute for the main button (e.g. form id). */
  form?: string
  /** Disable both main and menu trigger buttons. */
  disabled?: boolean
  /** Whether to show a loading spinner in the main button. */
  isLoading?: boolean
  /** Additional className for the main button. */
  className?: string
  /** Menu items shown in the dropdown. */
  menuItems: SplitButtonMenuItem[]
  /** Optional icon to show before the label in the main button. */
  icon?: React.ReactNode
}

export function SplitButton({
  label,
  onClick,
  type = 'button',
  form,
  disabled,
  isLoading,
  className,
  menuItems,
  icon,
}: SplitButtonProps) {
  return (
    <div className='flex'>
      <Button
        type={type}
        form={form}
        disabled={disabled}
        onClick={onClick}
        className={cn('rounded-r-none border-r-0', className)}
      >
        {isLoading && (
          // Consumers can also pass in their own spinner if needed,
          // but this keeps the API simple for common cases.
          <span className='me-1 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-middle' />
        )}
        {icon && <span className='me-1 inline-flex items-center'>{icon}</span>}
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            disabled={disabled}
            className='rounded-l-none px-2'
            aria-label='More actions'
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


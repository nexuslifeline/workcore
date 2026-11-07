'use client'

import * as React from 'react'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { X, Loader2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Skeleton } from './skeleton'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

export type ComboboxOption = {
  /** Plain text used for cmdk filtering when `onSearchChange` is not used. */
  label: string
  value: string
  /** Rich row (e.g. avatar + lines). Falls back to `label` when omitted. */
  display?: React.ReactNode
  /** Closed trigger when this option is selected; defaults to `display`. */
  triggerDisplay?: React.ReactNode
  onEdit?: (e: React.MouseEvent, value: string) => void
}

type ComboboxProps = {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
  onSearchChange?: (search: string) => void
  onLoadMore?: () => void
  isLoadingMore?: boolean
  isLoading?: boolean
  /** When true, the dropdown shows placeholder rows instead of the empty state while data loads. */
  listLoading?: boolean
  footer?: React.ReactNode
  /** When false, hides the clear (X) control. Defaults to true. */
  allowClear?: boolean
  /** Accessible name for the closed combobox trigger (e.g. when no visible label). */
  ariaLabel?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  className,
  buttonClassName,
  disabled = false,
  onSearchChange,
  onLoadMore,
  isLoadingMore = false,
  isLoading = false,
  listLoading = false,
  footer,
  allowClear = true,
  ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selectedOption = options.find((option) => option.value === value)

  // Handle search change with debouncing
  const handleSearchChange = React.useCallback((searchValue: string) => {
    setSearch(searchValue)
    // Call onSearchChange immediately for external components to handle debouncing
    onSearchChange?.(searchValue)
  }, [onSearchChange])

  const handleListScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!open || !onLoadMore || isLoadingMore) {
        return
      }
      const listElement = event.currentTarget
      const distanceFromBottom =
        listElement.scrollHeight - listElement.scrollTop - listElement.clientHeight
      if (distanceFromBottom < 50) {
        onLoadMore()
      }
    },
    [open, onLoadMore, isLoadingMore]
  )

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearch('')
    onSearchChange?.('')
    onValueChange('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'w-full justify-between relative',
            !value && 'text-muted-foreground',
            buttonClassName
          )}
        >
          <div className='flex items-center gap-2 flex-1 min-w-0 overflow-hidden'>
            {isLoading && (
              <Loader2 className='h-4 w-4 shrink-0 animate-spin text-muted-foreground' />
            )}
            {selectedOption ? (
              selectedOption.triggerDisplay ??
              selectedOption.display ?? (
                <span className='text-left truncate'>{selectedOption.label}</span>
              )
            ) : (
              <span className='text-left truncate'>{placeholder}</span>
            )}
          </div>
          <div className='flex items-center gap-1 shrink-0'>
            {allowClear && value && (
              <span
                role='button'
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClear(e as unknown as React.MouseEvent)
                  }
                }}
                className='rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer'
                aria-label='Clear selection'
              >
                <X className='h-4 w-4' />
              </span>
            )}
            <CaretSortIcon className='h-4 w-4 shrink-0 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)}>
        <Command shouldFilter={!onSearchChange}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={search}
            onValueChange={handleSearchChange}
          />
          {!listLoading && <CommandEmpty>{emptyMessage}</CommandEmpty>}
          <CommandList onScroll={handleListScroll}>
            <CommandGroup>
              {listLoading ? (
                <>
                  <CommandItem
                    value='__list-loading-1'
                    disabled
                    className='pointer-events-none aria-selected:bg-transparent'
                    aria-hidden
                  >
                    <div className='flex w-full flex-col gap-2 py-0.5'>
                      <Skeleton className='h-4 w-14' />
                      <Skeleton className='h-3 w-full max-w-[90%]' />
                    </div>
                  </CommandItem>
                  <CommandItem
                    value='__list-loading-2'
                    disabled
                    className='pointer-events-none aria-selected:bg-transparent'
                    aria-hidden
                  >
                    <div className='flex w-full flex-col gap-2 py-0.5'>
                      <Skeleton className='h-4 w-20' />
                      <Skeleton className='h-3 w-full max-w-[85%]' />
                    </div>
                  </CommandItem>
                </>
              ) : (
                options.map((option) => (
                  <CommandItem
                    value={option.label}
                    key={option.value}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                      setSearch('')
                    }}
                    className='group'
                  >
                    <CheckIcon
                      className={cn(
                        'size-4 shrink-0',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='min-w-0 flex-1'>
                      {option.display ?? <span>{option.label}</span>}
                    </div>
                    {option.onEdit && (
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          option.onEdit?.(e, option.value)
                        }}
                        className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-sm'
                        aria-label='Edit'
                      >
                        <Pencil className='h-3.5 w-3.5 text-muted-foreground' />
                      </button>
                    )}
                  </CommandItem>
                ))
              )}
              {isLoadingMore && !listLoading && (
                <CommandItem disabled>
                  <div className='flex items-center justify-center w-full py-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
          {footer && (
            <div className='border-t'>
              {footer}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

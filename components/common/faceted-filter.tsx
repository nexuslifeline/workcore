import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/common/badges/badge'
import { Button } from '@/components/common/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/common/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/common/popover'
import { Separator } from '@/components/common/separator'

type FacetedFilterProps = {
  value?: string[]
  onChange?: (value: string[] | undefined) => void
  title?: string
  isMultiselect?: boolean
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  facets?: Map<string, number>
  /** Optional class for the popover content (e.g. wider width for long labels) */
  contentClassName?: string
}

export function FacetedFilter({
  value = [],
  onChange,
  title,
  isMultiselect = true,
  options,
  facets,
  contentClassName,
}: FacetedFilterProps) {
  const selectedValues = new Set(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[200px] p-0', contentClassName)}
        align='start'
      >
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    className={cn(
                      !isMultiselect &&
                        isSelected &&
                        'bg-accent text-accent-foreground'
                    )}
                    onSelect={() => {
                      if (isMultiselect) {
                        const newSelectedValues = new Set(selectedValues)
                        if (isSelected) {
                          newSelectedValues.delete(option.value)
                        } else {
                          newSelectedValues.add(option.value)
                        }
                        const filterValues = Array.from(newSelectedValues)
                        onChange?.(
                          filterValues.length > 0 ? filterValues : undefined
                        )
                      } else {
                        onChange?.(isSelected ? undefined : [option.value])
                      }
                    }}
                  >
                    {isMultiselect && (
                      <div
                        className={cn(
                          'flex size-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className={cn('h-4 w-4 text-background')} />
                      </div>
                    )}
                    {option.icon && (
                      <option.icon className='size-4 text-muted-foreground' />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value='__clear_filters__'
                    onSelect={() => onChange?.(undefined)}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


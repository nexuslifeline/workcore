'use client'

import { Button } from '@/components/common/button'
import { Label } from '@/components/common/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/common/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { Separator } from '@/components/common/separator'
import { Badge } from '@/components/common/badges/badge'
import { LayoutList } from 'lucide-react'

export type ViewTypeFilterOption = {
  value: string
  label: string
}

export type ViewTypeFilterProps = {
  /** Current selected value */
  value: string
  /** Called when selection changes */
  onValueChange: (value: string) => void
  /** Options to show in the dropdown */
  options: readonly ViewTypeFilterOption[]
  /** Label for the trigger button (default: "View") */
  title?: string
  /** Label inside popover (default: "View type") */
  optionsLabel?: string
}

export function ViewTypeFilter({
  value,
  onValueChange,
  options,
  title = 'View',
  optionsLabel = 'View type',
}: ViewTypeFilterProps) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? (value || 'Select')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <LayoutList className='size-4' />
          {title}
          <Separator orientation='vertical' className='mx-2 h-4' />
          <Badge
            variant='secondary'
            className='rounded-sm px-1 font-normal'
          >
            {selectedLabel}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-4' align='start'>
        <div className='space-y-2'>
          <Label className='text-xs'>
            {optionsLabel}
          </Label>
          <Select value={value || options[0]?.value} onValueChange={onValueChange}>
            <SelectTrigger className='h-9 w-full min-w-[140px]'>
              <SelectValue placeholder='Select…' />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

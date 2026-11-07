'use client'

import { useCallback, useState } from 'react'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import {
  DATE_RANGE_PRESETS,
  getDateRangeForPreset,
} from '@/components/common/date-range-combobox'

export type DatePresetOption = { value: string; label: string }

const DEFAULT_PRESET_LIST: DatePresetOption[] = DATE_RANGE_PRESETS.filter(
  (p) => p.value !== 'custom'
)
import { Button } from '@/components/common/button'
import { Input } from '@/components/common/input'
import { Label } from '@/components/common/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/common/popover'
import { Separator } from '@/components/common/separator'
import { Badge } from '@/components/common/badges/badge'
import { formatShortDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export type DateRangeFilterProps = {
  /** Current preset value (e.g. 'this_month', 'custom') */
  value: string
  /** Current from date (YYYY-MM-DD), used when preset is 'custom' */
  from: string
  /** Current to date (YYYY-MM-DD), used when preset is 'custom' */
  to: string
  /** Called when preset or custom range is applied */
  onDateRangeChange: (preset: string, from: string, to: string) => void
  /** Default from (e.g. for reset comparison) */
  defaultFrom?: string
  /** Default to (e.g. for reset comparison) */
  defaultTo?: string
  title?: string
  contentClassName?: string
  /** When set, only these presets are listed (e.g. dashboard). Omit for full journal list. */
  presets?: readonly DatePresetOption[]
  /** Override range resolution (defaults to `getDateRangeForPreset`). */
  getRangeForPreset?: (preset: string) => { from: string; to: string } | null
  /** When false, hide custom range (default true). */
  showCustomRange?: boolean
  /** Popover alignment (default start). Use end when the trigger sits on the right. */
  align?: 'start' | 'center' | 'end'
  /** Extra classes for the trigger button. */
  className?: string
}

/** Default range when user first selects Custom (this month) */
function getDefaultCustomRange(): { from: string; to: string } {
  return getDateRangeForPreset('this_month') ?? { from: '', to: '' }
}

function getTriggerLabel(
  value: string,
  from: string,
  to: string,
  presetList: readonly DatePresetOption[]
): string {
  const preset = presetList.find((p) => p.value === value)
  if (preset && preset.value !== 'custom') return preset.label
  if (from && to) {
    return `Custom: ${formatShortDate(from)} – ${formatShortDate(to)}`
  }
  return 'Custom'
}

function resolvePresetRange(
  preset: string,
  getRangeForPreset?: DateRangeFilterProps['getRangeForPreset']
): { from: string; to: string } | null {
  const resolver = getRangeForPreset ?? getDateRangeForPreset
  return resolver(preset)
}

export function DateRangeFilter({
  value,
  from,
  to,
  onDateRangeChange,
  title = 'Date range',
  contentClassName,
  presets,
  getRangeForPreset,
  showCustomRange = true,
  align = 'start',
  className,
}: DateRangeFilterProps) {
  const presetList = presets ?? DEFAULT_PRESET_LIST
  const [open, setOpen] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customFrom, setCustomFrom] = useState(from || getDefaultCustomRange().from)
  const [customTo, setCustomTo] = useState(to || getDefaultCustomRange().to)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setShowCustomForm(false)
      } else {
        setCustomFrom(from || getDefaultCustomRange().from)
        setCustomTo(to || getDefaultCustomRange().to)
        setShowCustomForm(showCustomRange && value === 'custom')
      }
    },
    [value, from, to, showCustomRange]
  )

  const handlePresetSelect = useCallback(
    (preset: string) => {
      const range = resolvePresetRange(preset, getRangeForPreset)
      if (range) {
        onDateRangeChange(preset, range.from, range.to)
        setOpen(false)
      }
    },
    [onDateRangeChange, getRangeForPreset]
  )

  const handleCustomRangeClick = useCallback(() => {
    const def = getDefaultCustomRange()
    setCustomFrom(from || def.from)
    setCustomTo(to || def.to)
    setShowCustomForm(true)
  }, [from, to])

  const handleCustomApply = useCallback(() => {
    const fromVal = customFrom.trim()
    const toVal = customTo.trim()
    if (fromVal && toVal && toVal >= fromVal) {
      onDateRangeChange('custom', fromVal, toVal)
      setOpen(false)
      setShowCustomForm(false)
    }
  }, [customFrom, customTo, onDateRangeChange])

  const customInvalid = customFrom && customTo && customTo < customFrom
  const triggerLabel = getTriggerLabel(value, from, to, presetList)

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-8 border-dashed', className)}
        >
          <PlusCircledIcon className='size-4' />
          {title}
          <Separator orientation='vertical' className='mx-2 h-4' />
          <Badge
            variant='secondary'
            className='ml-auto rounded-sm px-1 font-normal md:ml-0'
          >
            {triggerLabel}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0 w-[280px] max-md:w-[var(--radix-popover-trigger-width)]',
          contentClassName
        )}
        align={align}
      >
        {showCustomForm ? (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between p-3'>
              <span className='text-sm font-medium'>Custom range</span>
              <Button
                variant='ghost'
                size='sm'
                className='h-7 text-xs'
                onClick={() => setShowCustomForm(false)}
              >
                Back to presets
              </Button>
            </div>
            <div className='border-t border-border p-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='date-range-start' className='text-xs'>
                    Start
                  </Label>
                  <Input
                    id='date-range-start'
                    type='date'
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className='h-9 text-right [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100'
                    aria-invalid={customInvalid}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='date-range-end' className='text-xs'>
                    End
                  </Label>
                  <Input
                    id='date-range-end'
                    type='date'
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className='h-9 text-right [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100'
                    aria-invalid={customInvalid}
                  />
                </div>
              </div>
              {customInvalid && (
                <p className='mt-2 text-xs text-destructive'>
                  End must be on or after Start
                </p>
              )}
            </div>
            <div className='border-t border-border p-3'>
              <Button
                size='sm'
                className='w-full'
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo || customInvalid}
              >
                Apply
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className='max-h-[300px] overflow-y-auto p-1'>
              {presetList.map((preset) => (
                <li key={preset.value}>
                  <button
                    type='button'
                    className={cn(
                      'flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                      value === preset.value && 'bg-accent'
                    )}
                    onClick={() => handlePresetSelect(preset.value)}
                  >
                    {preset.label}
                  </button>
                </li>
              ))}
            </ul>
            {showCustomRange ? (
              <div className='border-t border-border'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='w-full rounded-none justify-start h-auto py-3 px-3'
                  onClick={handleCustomRangeClick}
                >
                  <PlusCircledIcon className='size-4 mr-2' />
                  Custom range
                </Button>
              </div>
            ) : null}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

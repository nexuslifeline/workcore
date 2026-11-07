'use client'

import React, { useCallback } from 'react'
import { Combobox } from '@/components/common/combobox'
import { Input } from '@/components/common/input'
import { Label } from '@/components/common/label'

export const DATE_RANGE_PRESETS = [
  { value: 'this_day', label: 'This Day' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'this_fiscal_year', label: 'This Fiscal Year' },
  { value: 'last_fiscal_year', label: 'Last Fiscal Year' },
  { value: 'custom', label: 'Custom' },
] as const

export const DEFAULT_DATE_PRESET = 'this_month'

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Returns the date range (from, to in YYYY-MM-DD) for a given preset.
 * Uses local date; "This Week" is Sunday–today; quarters are calendar; fiscal = calendar year.
 */
export function getDateRangeForPreset(
  preset: string
): { from: string; to: string } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const y = today.getFullYear()
  const m = today.getMonth()
  const date = today.getDate()
  const dayOfWeek = today.getDay()
  const sundayOffset = dayOfWeek

  switch (preset) {
    case 'this_day':
      return { from: toYYYYMMDD(today), to: toYYYYMMDD(today) }
    case 'this_week': {
      const start = new Date(today)
      start.setDate(date - sundayOffset)
      return { from: toYYYYMMDD(start), to: toYYYYMMDD(today) }
    }
    case 'last_week': {
      const start = new Date(today)
      start.setDate(date - sundayOffset - 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) }
    }
    case 'this_month': {
      const start = new Date(y, m, 1)
      return { from: toYYYYMMDD(start), to: toYYYYMMDD(today) }
    }
    case 'last_month': {
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 0)
      return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) }
    }
    case 'this_quarter': {
      const q = Math.floor(m / 3) + 1
      const start = new Date(y, (q - 1) * 3, 1)
      return { from: toYYYYMMDD(start), to: toYYYYMMDD(today) }
    }
    case 'last_quarter': {
      const q = Math.floor(m / 3) + 1
      const start = new Date(y, (q - 2) * 3, 1)
      const end = new Date(y, (q - 1) * 3, 0)
      return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) }
    }
    case 'this_year':
      return {
        from: `${y}-01-01`,
        to: toYYYYMMDD(today),
      }
    case 'last_year':
      return {
        from: `${y - 1}-01-01`,
        to: `${y - 1}-12-31`,
      }
    case 'this_fiscal_year':
      return {
        from: `${y}-01-01`,
        to: toYYYYMMDD(today),
      }
    case 'last_fiscal_year':
      return {
        from: `${y - 1}-01-01`,
        to: `${y - 1}-12-31`,
      }
    default:
      return null
  }
}

export type DateRangeComboboxProps = {
  value: string
  onValueChange: (preset: string, range?: { from: string; to: string }) => void
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  buttonClassName?: string
}

export function DateRangeCombobox({
  value,
  onValueChange,
  from,
  to,
  onFromChange,
  onToChange,
  placeholder = 'Date range',
  label = 'Date range',
  className,
  buttonClassName = 'w-full justify-between h-9',
}: DateRangeComboboxProps) {
  const handlePresetChange = useCallback(
    (preset: string) => {
      const range = getDateRangeForPreset(preset)
      onValueChange(preset, range ?? undefined)
    },
    [onValueChange]
  )

  return (
    <>
      <div className={className}>
        <Label className="mb-1.5 block">{label}</Label>
        <Combobox
          options={DATE_RANGE_PRESETS.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
          value={value}
          onValueChange={handlePresetChange}
          placeholder={placeholder}
          buttonClassName={buttonClassName}
          className="w-full"
        />
      </div>
      {value === 'custom' && (
        <div className="flex gap-2">
          <div>
            <Label className="mb-1.5 block">From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      )}
    </>
  )
}

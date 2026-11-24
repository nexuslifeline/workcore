import { getDateRangeForPreset } from '@/components/common/date-range-combobox'

function toYyyyMmDd(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Start-date presets for route logs. Open periods run through the end of the
 * week, month, quarter, or year so trips scheduled after today stay included.
 */
export function getDriverRouteLogStartRange(
  preset: string
): { from: string; to: string } | null {
  if (preset === 'all') return { from: '', to: '' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()

  if (preset === 'this_week') {
    const start = new Date(today)
    start.setDate(date - today.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { from: toYyyyMmDd(start), to: toYyyyMmDd(end) }
  }
  if (preset === 'this_month') {
    return {
      from: toYyyyMmDd(new Date(year, month, 1)),
      to: toYyyyMmDd(new Date(year, month + 1, 0)),
    }
  }
  if (preset === 'this_quarter') {
    const quarter = Math.floor(month / 3)
    return {
      from: toYyyyMmDd(new Date(year, quarter * 3, 1)),
      to: toYyyyMmDd(new Date(year, quarter * 3 + 3, 0)),
    }
  }
  if (preset === 'this_year' || preset === 'this_fiscal_year') {
    return { from: `${year}-01-01`, to: `${year}-12-31` }
  }
  return getDateRangeForPreset(preset)
}

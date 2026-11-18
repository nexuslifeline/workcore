export const HOLIDAY_TYPES = ['regular_holiday', 'special_holiday'] as const

export type HolidayType = (typeof HOLIDAY_TYPES)[number]

export type Holiday = {
  id: string
  organizationId: string
  date: string
  name: string
  description: string | null
  type: HolidayType
  isRecurring: boolean
  createdBy: string | null
  updatedBy: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export type HolidayListItem = Holiday & {
  storedDate: string
}

export type HolidayInput = {
  date: string
  name: string
  description?: string | null
  type: HolidayType
  isRecurring: boolean
}

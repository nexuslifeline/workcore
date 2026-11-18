'use client'

import { Settings } from '@/features/settings'
import { payrollSidebarItems } from '@/features/settings/config/sidebar-items'
import { SettingsHolidays } from '@/features/settings/payroll/holidays'

export default function SettingsPayrollHolidaysPage() {
  return (
    <Settings sidebarItems={payrollSidebarItems}>
      <SettingsHolidays />
    </Settings>
  )
}

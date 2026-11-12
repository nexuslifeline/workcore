'use client'

import { Settings } from '@/features/settings'
import { payrollSidebarItems } from '@/features/settings/config/sidebar-items'
import { SettingsPayroll } from '@/features/settings/payroll'

export default function SettingsPayrollPage() {
  return (
    <Settings sidebarItems={payrollSidebarItems}>
      <SettingsPayroll />
    </Settings>
  )
}

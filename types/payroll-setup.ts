export type PayrollSetup = {
  id: string
  organizationId: string
  defaultBreakMinutes: number
  maxRegularShiftHours: number
  nightShiftDifferentialStartTime: string
  nightShiftDifferentialEndTime: string
  createdAt: string | Date
  updatedAt: string | Date
}

export type PayrollSetupInput = {
  defaultBreakMinutes: number
  maxRegularShiftHours: number
  nightShiftDifferentialStartTime: string
  nightShiftDifferentialEndTime: string
}

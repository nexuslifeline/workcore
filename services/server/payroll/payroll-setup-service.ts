import { eq } from 'drizzle-orm'
import { payrollSetup } from '@/db/schema'
import { db } from '@/lib/db'
import type { PayrollSetupInput } from '@/types/payroll-setup'

function toClockTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  return match ? `${match[1]}:${match[2]}` : value
}

function toRow(input: PayrollSetupInput) {
  return {
    defaultBreakMinutes: input.defaultBreakMinutes,
    maxRegularShiftHours: input.maxRegularShiftHours,
    nightShiftDifferentialStartTime: `${input.nightShiftDifferentialStartTime}:00`,
    nightShiftDifferentialEndTime: `${input.nightShiftDifferentialEndTime}:00`,
    updatedAt: new Date(),
  }
}

function toPayrollSetup(row: typeof payrollSetup.$inferSelect) {
  return {
    ...row,
    nightShiftDifferentialStartTime: toClockTime(row.nightShiftDifferentialStartTime),
    nightShiftDifferentialEndTime: toClockTime(row.nightShiftDifferentialEndTime),
  }
}

export async function getPayrollSetup(organizationId: string) {
  const [row] = await db
    .select()
    .from(payrollSetup)
    .where(eq(payrollSetup.organizationId, organizationId))
    .limit(1)
  return row ? toPayrollSetup(row) : null
}

export async function updatePayrollSetup(organizationId: string, input: PayrollSetupInput) {
  const [row] = await db
    .update(payrollSetup)
    .set(toRow(input))
    .where(eq(payrollSetup.organizationId, organizationId))
    .returning()
  return row ? toPayrollSetup(row) : null
}

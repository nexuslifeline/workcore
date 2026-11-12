import { api } from '@/lib/api'
import type { PayrollSetup, PayrollSetupInput } from '@/types/payroll-setup'

export async function getPayrollSetup(): Promise<PayrollSetup> {
  const { data } = await api.get<{ payrollSetup: PayrollSetup }>('/payroll/setup')
  return data.payrollSetup
}

export async function updatePayrollSetup(payload: PayrollSetupInput): Promise<PayrollSetup> {
  const { data } = await api.patch<{ payrollSetup: PayrollSetup }>('/payroll/setup', payload)
  return data.payrollSetup
}

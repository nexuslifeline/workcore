import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPayrollSetup,
  updatePayrollSetup,
} from '@/services/client/settings/payroll-setup-service'
import type { PayrollSetup, PayrollSetupInput } from '@/types/payroll-setup'

export function usePayrollSetup(organizationId: string | null) {
  return useQuery({
    queryKey: ['payroll-setup', organizationId],
    queryFn: () => getPayrollSetup(),
    enabled: Boolean(organizationId),
  })
}

export function useUpdatePayrollSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PayrollSetupInput) => updatePayrollSetup(input),
    onSuccess: (payrollSetup: PayrollSetup) => {
      queryClient.setQueryData(['payroll-setup', payrollSetup.organizationId], payrollSetup)
    },
  })
}

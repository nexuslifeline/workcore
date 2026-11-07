'use client'

import { AlertTriangle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert'
import { useHasNoAllowedRolePermissions } from '@/hooks/use-has-no-allowed-role-permissions'
import { NO_ROLE_PERMISSIONS_FALLBACK_PATH } from '@/lib/constants/no-role-permissions'

const TITLE = 'No permissions yet'
const BODY =
  'Your role does not have any permissions yet. You can update your account. Ask an administrator to turn on access for your role.'

export function NoRolePermissionsAlert() {
  const hasNone = useHasNoAllowedRolePermissions()
  if (!hasNone) return null

  return (
    <Alert className='mb-6 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100'>
      <AlertTriangle />
      <AlertTitle>{TITLE}</AlertTitle>
      <AlertDescription className='text-amber-900/80 dark:text-amber-100/80'>
        {BODY}
      </AlertDescription>
    </Alert>
  )
}

export function NoRolePermissionsBanner() {
  const pathname = usePathname()
  const hasNone = useHasNoAllowedRolePermissions()
  if (!hasNone) return null
  if (pathname === NO_ROLE_PERMISSIONS_FALLBACK_PATH) return null
  if (pathname === '/access-denied') return null

  return (
    <div
      role='status'
      className='flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
    >
      <AlertTriangle className='mt-0.5 size-4 shrink-0' />
      <p>{BODY}</p>
    </div>
  )
}

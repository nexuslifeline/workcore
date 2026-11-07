import Link from 'next/link'

import { Button } from '@/components/common/button'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { NO_ROLE_PERMISSIONS_FALLBACK_PATH } from '@/lib/constants/no-role-permissions'
import { getSessionPermissions } from '@/lib/server/get-session-permissions'

export default async function AccessDeniedPage() {
  const allowed = await getSessionPermissions()
  const hasNoPermissions = allowed.length === 0
  const canOpenDashboard = allowed.includes(PERMISSIONS.DASHBOARD)
  const fallbackHref = canOpenDashboard
    ? '/'
    : NO_ROLE_PERMISSIONS_FALLBACK_PATH
  const fallbackLabel = canOpenDashboard ? 'Go to dashboard' : 'Go to account'

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center'>
      <h1 className='text-2xl font-semibold'>Access denied</h1>
      <p className='max-w-md text-muted-foreground text-sm'>
        {hasNoPermissions
          ? 'Your role does not have any permissions yet. You can update your account. Ask an administrator to turn on access for your role.'
          : "You don't have permission to open this page. If you think this is a mistake, contact your organization administrator."}
      </p>
      <Button asChild>
        <Link href={fallbackHref}>{fallbackLabel}</Link>
      </Button>
    </div>
  )
}

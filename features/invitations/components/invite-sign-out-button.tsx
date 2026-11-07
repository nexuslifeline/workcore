'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import { authService } from '@/services/client/auth/auth-service'
import { useOrganizationStore } from '@/stores/organization-store'
import { inviteAcceptPath } from '@/features/invitations/lib/invite-paths'

export function InviteSignOutButton({ token }: { token: string }) {
  const queryClient = useQueryClient()
  const resetOrganization = useOrganizationStore((state) => state.reset)
  const [isSigningOut, setIsSigningOut] = useState(false)

  return (
    <Button
      className='w-full'
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true)
        const result = await authService.signOut()
        queryClient.clear()
        resetOrganization()
        if (!result.success) {
          toast.error(result.error?.message || 'Failed to sign out')
          setIsSigningOut(false)
          return
        }
        window.location.assign(inviteAcceptPath(token))
      }}
    >
      {isSigningOut ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <LogOut className='h-4 w-4' />
      )}
      Sign out to continue
    </Button>
  )
}

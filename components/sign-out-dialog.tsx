'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/services/client/auth/auth-service'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganizationStore } from '@/stores/organization-store'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { reset: resetOrganization } = useOrganizationStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      const result = await authService.signOut()

      queryClient.invalidateQueries()
      resetOrganization()

      if (result.success) {
        toast.success('Signed out successfully')
      } else {
        toast.error(result.error?.message || 'Failed to sign out')
      }

      router.push('/sign-in')
    } catch (_error) {
      queryClient.invalidateQueries()
      resetOrganization()
      toast.error('An unexpected error occurred while signing out')
      router.push('/sign-in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      isLoading={isLoading}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/button'
import { useOrganizationStore } from '@/stores/organization-store'

export function AcceptInvitationButton({
  token,
  organizationName,
}: {
  token: string
  organizationName: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId
  )
  const [isAccepting, setIsAccepting] = useState(false)

  const handleAccept = async () => {
    if (!token) return

    setIsAccepting(true)
    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to accept invitation')
      }

      const data = await response.json()
      toast.success(`Joined ${data.organization.name}`)

      if (data.organization?.id) {
        setActiveOrganizationId(data.organization.id)
      }
      await queryClient.invalidateQueries({ queryKey: ['organizations'] })
      await queryClient.invalidateQueries({ queryKey: ['me', 'permissions'] })

      router.push('/')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to accept invitation'
      )
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <Button onClick={handleAccept} disabled={isAccepting} className='w-full'>
      {isAccepting ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <CheckCircle2 className='mr-2 h-4 w-4' />
      )}
      {isAccepting ? 'Joining...' : `Join ${organizationName}`}
    </Button>
  )
}

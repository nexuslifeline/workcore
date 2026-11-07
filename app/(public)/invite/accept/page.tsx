import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/services/server/auth/auth-service'
import { getInvitationByToken } from '@/services/server/invitations/invitation-service'
import { emailExists } from '@/services/server/users/user-service'
import {
  Invitation,
  type InvitationView,
} from '@/features/invitations/components/invitation'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

function toInvitationData(
  invitation: NonNullable<Awaited<ReturnType<typeof getInvitationByToken>>>
) {
  return {
    email: invitation.email,
    role: invitation.role ?? null,
    message: invitation.message,
    expiresAt: invitation.expiresAt.toISOString(),
    invitedByName: invitation.invitedByName,
    organization: invitation.organization,
  }
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const token = (await searchParams).token
  if (!token) return { title: 'Invitation' }
  const invitation = await getInvitationByToken(token)
  const name = invitation?.organization.name?.trim()
  return { title: name ? `Join ${name}` : 'Invitation' }
}

export default async function InviteAcceptPage({ searchParams }: PageProps) {
  const token = (await searchParams).token
  const user = await getAuthenticatedUser()

  if (!token) {
    return <Invitation view={{ kind: 'invalid' }} />
  }

  const invitation = await getInvitationByToken(token)
  if (!invitation) {
    return <Invitation view={{ kind: 'invalid' }} />
  }

  if (
    invitation.status === 'accepted' &&
    user &&
    invitation.acceptedByUserId === user.id
  ) {
    redirect('/')
  }

  const organizationName = invitation.organization.name || undefined
  const now = new Date()
  const isExpired =
    invitation.status === 'expired' || now > invitation.expiresAt

  let view: InvitationView

  if (isExpired && invitation.status !== 'accepted') {
    view = { kind: 'expired', organizationName }
  } else if (invitation.status === 'accepted') {
    view = { kind: 'used', organizationName, isAuthenticated: !!user }
  } else if (invitation.status !== 'pending') {
    view = { kind: 'revoked', organizationName }
  } else if (
    user?.email &&
    user.email.toLowerCase() !== invitation.email.toLowerCase()
  ) {
    view = {
      kind: 'wrong_account',
      token,
      signedInEmail: user.email,
      invitation: toInvitationData(invitation),
    }
  } else {
    const hasAccount = user ? true : await emailExists(invitation.email)
    view = {
      kind: 'ready',
      token,
      isAuthenticated: !!user,
      hasAccount,
      signedInEmail: user?.email ?? null,
      invitation: toInvitationData(invitation),
    }
  }

  return <Invitation view={view} />
}

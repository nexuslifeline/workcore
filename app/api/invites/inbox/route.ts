import { NextResponse } from 'next/server'
import { unauthorizedResponse, errorResponse } from '@/lib/api-helpers'
import { getAuthenticatedUser } from '@/services/server/auth/auth-service'
import { listPendingInvitationsInbox } from '@/services/server/invitations/invitation-service'

/**
 * Pending invitations for the signed-in user's email (not outbound org invites).
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (!user.email) {
      return NextResponse.json({ invitations: [], count: 0 })
    }

    const invitations = await listPendingInvitationsInbox({
      userId: user.id,
      email: user.email,
    })

    return NextResponse.json({
      invitations: invitations.map((item) => ({
        ...item,
        expiresAt: item.expiresAt.toISOString(),
      })),
      count: invitations.length,
    })
  } catch (error) {
    return errorResponse('Failed to fetch invitation inbox', 500, error)
  }
}

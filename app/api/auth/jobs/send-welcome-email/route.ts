import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse } from '@/lib/api-helpers'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { logger } from '@/lib/logger'
import {
  isWelcomeEmailUserId,
  sendWelcomeEmail,
} from '@/services/server/auth/welcome-email-service'

/**
 * POST /api/auth/jobs/send-welcome-email
 *
 * Called from the auth.users email-confirmed trigger via app_cron_http_post
 * (Vault secrets). pg_net does not wait for this response.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 * Body: { userId: string }
 */
export async function POST(request: Request) {
  const scope = 'welcome-email'
  logger.info('Welcome email job received', { scope })

  try {
    const authError = authorizeCronRequest(request)
    if (authError) {
      logger.warn('Welcome email job unauthorized', {
        scope,
        status: authError.status,
      })
      return authError
    }

    const body = (await request.json().catch(() => null)) as {
      userId?: unknown
    } | null
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''

    if (!isWelcomeEmailUserId(userId)) {
      logger.warn('Welcome email job rejected: invalid userId', { scope })
      return badRequestResponse('userId is required')
    }

    const result = await sendWelcomeEmail(userId)
    logger.info('Welcome email job finished', { scope, userId, ...result })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof NextResponse) return error
    logger.error('Welcome email job failed', error, { scope })
    return errorResponse('Failed to send welcome email', 500, error)
  }
}

import React from 'react'
import { eq } from 'drizzle-orm'
import { profiles } from '@/db/schema'
import { WelcomeEmail } from '@/emails/templates/welcome-email'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  EmailConfigError,
  EmailSendError,
} from '@/services/server/email/email-errors'
import { getAppBaseUrl } from '@/services/server/email/email-helpers'
import { sendEmail } from '@/services/server/email/email-service'

const PRODUCT_NAME = 'Workcore'
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type SendWelcomeEmailResult = {
  sent: boolean
  skipped?: 'invalid_user' | 'not_confirmed' | 'no_email'
}

export function isWelcomeEmailUserId(value: string): boolean {
  return UUID_RE.test(value)
}

/**
 * Send the post-confirm welcome email. account_kind=internal never
 * reaches this job (Auth trigger). SMTP/config failures return sent=false.
 */
export async function sendWelcomeEmail(
  userId: string
): Promise<SendWelcomeEmailResult> {
  if (!isWelcomeEmailUserId(userId)) {
    return { sent: false, skipped: 'invalid_user' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  const user = data?.user

  if (error || !user) {
    logger.info('Welcome email skipped: auth user not found', {
      scope: 'welcome-email',
      userId,
    })
    return { sent: false, skipped: 'invalid_user' }
  }

  if (!user.email_confirmed_at) {
    return { sent: false, skipped: 'not_confirmed' }
  }

  const to = user.email?.trim()
  if (!to) {
    return { sent: false, skipped: 'no_email' }
  }

  const [profile] = await db
    .select({ name: profiles.name })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  const recipientName =
    profile?.name?.trim() ||
    (typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : '') ||
    (typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name.trim()
      : '') ||
    null

  const appUrl = getAppBaseUrl()
  const signInUrl = `${appUrl}/sign-in`
  const subject = `Welcome to ${PRODUCT_NAME}`

  logger.info('Sending welcome email', {
    scope: 'welcome-email',
    userId,
    to,
  })

  try {
    await sendEmail({
      to,
      subject,
      react: React.createElement(WelcomeEmail, {
        productName: PRODUCT_NAME,
        recipientName,
        signInUrl,
        appUrl,
      }),
    })
  } catch (error) {
    if (error instanceof EmailConfigError || error instanceof EmailSendError) {
      logger.error('Failed to send welcome email', error, {
        scope: 'welcome-email',
        userId,
        to,
      })
      return { sent: false }
    }
    throw error
  }

  return { sent: true }
}

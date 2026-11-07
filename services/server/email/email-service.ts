import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { logger } from '@/lib/logger'
import {
  EmailConfigError,
  EmailSendError,
} from '@/services/server/email/email-errors'

type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  from: string
  fromName?: string
}

let transporter: Transporter | null = null
let cachedConfig: SmtpConfig | null = null

function readSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  const port = Number(process.env.SMTP_PORT || '587')
  const secure =
    process.env.SMTP_SECURE === 'true' ||
    process.env.SMTP_SECURE === '1' ||
    port === 465
  const user = process.env.SMTP_USER?.trim() || undefined
  const pass = process.env.SMTP_PASS?.trim() || undefined
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || undefined

  if (!host) {
    throw new EmailConfigError('SMTP_HOST is not configured')
  }
  if (!from) {
    throw new EmailConfigError('EMAIL_FROM is not configured')
  }
  if (!Number.isFinite(port) || port <= 0) {
    throw new EmailConfigError('SMTP_PORT is invalid')
  }

  return { host, port, secure, user, pass, from, fromName }
}

function getTransporter(): { transporter: Transporter; config: SmtpConfig } {
  if (!transporter || !cachedConfig) {
    cachedConfig = readSmtpConfig()
    transporter = nodemailer.createTransport({
      host: cachedConfig.host,
      port: cachedConfig.port,
      secure: cachedConfig.secure,
      auth:
        cachedConfig.user && cachedConfig.pass
          ? { user: cachedConfig.user, pass: cachedConfig.pass }
          : undefined,
    })
  }
  return { transporter, config: cachedConfig }
}

function formatFrom(config: SmtpConfig): string {
  if (config.fromName) {
    return `"${config.fromName.replace(/"/g, '')}" <${config.from}>`
  }
  return config.from
}

export type SendEmailParams = {
  to: string | string[]
  subject: string
  react: ReactElement
  cc?: string | string[]
  replyTo?: string
}

export type SendEmailResult = {
  messageId: string
}

/**
 * Render a React Email component and send via Nodemailer.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, react, cc, replyTo } = params
  const { transporter: transport, config } = getTransporter()

  let html: string
  try {
    html = await render(react)
  } catch (error) {
    logger.error('Failed to render email template', error, {
      scope: 'email',
      subject,
    })
    throw new EmailSendError('Failed to render email template', error)
  }

  try {
    const info = await transport.sendMail({
      from: formatFrom(config),
      to,
      cc,
      replyTo,
      subject,
      html,
    })

    logger.info('Email sent', {
      scope: 'email',
      to,
      subject,
      messageId: info.messageId,
    })

    return { messageId: info.messageId || '' }
  } catch (error) {
    logger.error('Failed to send email', error, {
      scope: 'email',
      to,
      subject,
    })
    throw new EmailSendError('Failed to send email', error)
  }
}

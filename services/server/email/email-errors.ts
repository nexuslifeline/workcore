export class EmailConfigError extends Error {
  readonly code = 'EMAIL_CONFIG' as const

  constructor(message = 'Email is not configured') {
    super(message)
    this.name = 'EmailConfigError'
  }
}

export class EmailSendError extends Error {
  readonly code = 'EMAIL_SEND' as const
  readonly cause?: unknown

  constructor(message = 'Failed to send email', cause?: unknown) {
    super(message)
    this.name = 'EmailSendError'
    this.cause = cause
  }
}

export class EmailValidationError extends Error {
  readonly code = 'EMAIL_VALIDATION' as const

  constructor(message: string) {
    super(message)
    this.name = 'EmailValidationError'
  }
}

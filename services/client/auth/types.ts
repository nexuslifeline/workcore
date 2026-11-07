export type AuthProvider = 'google' | 'azure'

export function authProviderLabel(provider: AuthProvider): string {
  if (provider === 'azure') return 'Microsoft'
  return 'Google'
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  confirmPassword: string
  inviteToken?: string
  fullName?: string
}

export interface AuthError {
  message: string
  code?: string
}

export interface AuthResult {
  success: boolean
  error?: AuthError
  user?: {
    id: string
    email?: string
  }
}





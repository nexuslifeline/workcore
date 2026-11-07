'use client'

import { createClient } from '@/lib/supabase/client'
import {
  authProviderLabel,
  type AuthProvider,
  type SignInCredentials,
  type SignUpCredentials,
  type AuthResult,
  type AuthError,
} from './types'

// Create a single global Supabase client instance
const supabase = createClient()

function getAppBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/+$/, '')
  }
  return window.location.origin
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  credentials: SignInCredentials
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to sign in',
          code: error.status?.toString(),
        },
      }
    }

    if (data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }
    }

    return {
      success: false,
      error: { message: 'No user data returned' },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  credentials: SignUpCredentials
): Promise<AuthResult> {
  try {
    const userMetadata: Record<string, string> = {}
    if (credentials.inviteToken) {
      userMetadata.invite_token = credentials.inviteToken
    }
    if (credentials.fullName?.trim()) {
      userMetadata.full_name = credentials.fullName.trim()
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: `${getAppBaseUrl()}/auth/callback`,
        data:
          Object.keys(userMetadata).length > 0 ? userMetadata : undefined,
      },
    })

    if (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create account',
          code: error.status?.toString(),
        },
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: { message: 'No user data returned' },
      }
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Sign in with OAuth provider (Google, Microsoft via Azure AD / Entra ID).
 * Runs in the browser — Hostinger often breaks Next.js Server Actions (E394).
 */
export async function signInWithOAuth(
  provider: AuthProvider,
  options?: {
    redirectTo?: string
  }
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const queryParams: Record<string, string> = {}
    if (options?.redirectTo) {
      queryParams.next = options.redirectTo
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getAppBaseUrl()}/auth/callback`,
        scopes: provider === 'azure' ? 'email openid profile' : undefined,
        queryParams:
          Object.keys(queryParams).length > 0 ? queryParams : undefined,
      },
    })

    if (error) {
      return {
        success: false,
        error: {
          message:
            error.message ||
            `Failed to sign in with ${authProviderLabel(provider)}`,
          code: error.status?.toString(),
        },
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : `An unexpected error occurred with ${authProviderLabel(provider)} sign in`,
      },
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error signing out:', error)
      return {
        success: false,
        error: {
          message: error.message || 'Failed to sign out',
          code: error.status?.toString(),
        },
      }
    }

    return { success: true }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error signing out:', error)
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Reset password for email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppBaseUrl()}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to send reset email',
          code: error.status?.toString(),
        },
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return { session: null, error }
    }

    return { session, error: null }
  } catch (error) {
    return {
      session: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Wait briefly until a client session is available.
 * Useful before navigating to protected routes right after sign-in.
 */
export async function waitForSession(options?: {
  attempts?: number
  delayMs?: number
}): Promise<boolean> {
  const attempts = options?.attempts ?? 5
  const delayMs = options?.delayMs ?? 250

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { session } = await getSession()
    if (session) return true
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  return false
}

/**
 * Get current user
 */
export async function getUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error }
    }

    return { user, error: null }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

// Export a default object for backward compatibility
export const authService = {
  signInWithPassword,
  signUp,
  signInWithOAuth,
  signOut,
  resetPassword,
  getSession,
  waitForSession,
  getUser,
}





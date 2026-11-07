import { NextResponse } from 'next/server'
import {
  unauthorizedResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-helpers'
import {
  getAuthenticatedUser,
  updateAuthEmail,
  verifyCurrentPassword,
  updateAuthPassword,
} from '@/services/server/auth/auth-service'
import { getProfileByUserId, updateProfile } from '@/services/server/users/user-service'

/**
 * GET - Get account information (email from auth, locale from profile)
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return unauthorizedResponse()
    }

    const profile = await getProfileByUserId(user.id)

    // Check if user has a password set (OAuth users don't have passwords)
    // app_metadata.provider is 'email' for email/password users, or the OAuth provider name
    const authProvider = user.app_metadata?.provider || 'email'
    const hasPassword = authProvider === 'email'

    return NextResponse.json({
      email: user.email,
      locale: profile?.locale || null,
      hasPassword,
      authProvider,
    })
  } catch (error) {
    return errorResponse('Failed to fetch account information', 500, error)
  }
}

/**
 * PATCH - Update account settings (email, password, locale)
 */
export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Handle email update
    if (body.email !== undefined && body.email !== user.email) {
      const { error: emailError } = await updateAuthEmail(body.email)

      if (emailError) {
        return badRequestResponse(
          emailError.message || 'Failed to update email'
        )
      }
    }

    // Handle password update
    if (body.password !== undefined) {
      // Check if user has a password set (OAuth users don't have passwords)
      const authProvider = user.app_metadata?.provider || 'email'
      const hasPassword = authProvider === 'email'

      // For users with existing passwords, require current password verification
      if (hasPassword) {
        if (!body.currentPassword) {
          return badRequestResponse('Current password is required')
        }

        const { error: signInError } = await verifyCurrentPassword(
          user.email!,
          body.currentPassword
        )

        if (signInError) {
          return badRequestResponse('Current password is incorrect')
        }
      }
      // For OAuth users (no existing password), skip current password check
      // They can set a password directly

      const { error: passwordError } = await updateAuthPassword(body.password)

      if (passwordError) {
        return badRequestResponse(
          passwordError.message || 'Failed to update password'
        )
      }
    }

    // Handle locale update (stored in profile)
    if (body.locale !== undefined) {
      await updateProfile(user.id, {
        locale: body.locale?.trim() || null,
      })
    }

    // Get updated user info from auth service
    const updatedUser = await getAuthenticatedUser()

    const profile = await getProfileByUserId(user.id)

    // Check if user has a password set (after potential password update)
    const updatedAuthProvider = updatedUser?.app_metadata?.provider || 'email'
    const updatedHasPassword = updatedAuthProvider === 'email' || body.password !== undefined

    return NextResponse.json({
      email: updatedUser?.email,
      locale: profile?.locale || null,
      hasPassword: updatedHasPassword,
      authProvider: updatedAuthProvider,
    })
  } catch (error) {
    return errorResponse('Failed to update account', 500, error)
  }
}

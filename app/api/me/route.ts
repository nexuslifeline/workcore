import { NextResponse } from 'next/server'
import {
  unauthorizedResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-helpers'
import { getAuthenticatedUser } from '@/services/server/auth/auth-service'
import { getProfileByUserId, updateProfile } from '@/services/server/users/user-service'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return unauthorizedResponse()
    }

    const profile = await getProfileByUserId(user.id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    return errorResponse('Failed to fetch profile', 500, error)
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    const updatedProfile = await updateProfile(user.id, {
      name: body.name ?? undefined,
      bio: body.bio ?? undefined,
      avatarUrl: body.avatarUrl ?? undefined,
      phone: body.phone ?? undefined,
      website: body.website ?? undefined,
      birthdate: body.birthdate ? new Date(body.birthdate) : null,
      address: body.address ?? undefined,
      locale: body.locale ?? undefined,
    })

    if (!updatedProfile) {
      return errorResponse('Profile not found', 404)
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return errorResponse('Failed to update profile', 500, error)
  }
}


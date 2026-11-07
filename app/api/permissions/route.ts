import { NextResponse } from 'next/server'
import { unauthorizedResponse, errorResponse } from '@/lib/api-helpers'
import { getAuthenticatedUser, getAllPermissions } from '@/services/server/auth/auth-service'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const list = await getAllPermissions()
    return NextResponse.json({ permissions: list })
  } catch (error) {
    return errorResponse('Failed to fetch permissions', 500, error)
  }
}

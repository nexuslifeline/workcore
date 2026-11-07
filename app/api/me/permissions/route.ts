import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-helpers'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions } from '@/lib/shared/permissions'

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    const permissions = await resolvePermissions(ctx)
    return NextResponse.json({ permissions })
  } catch (err) {
    if (err instanceof NextResponse) return err
    return errorResponse('Failed to fetch current user role permissions', 500, err)
  }
}

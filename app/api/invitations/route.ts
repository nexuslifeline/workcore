import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-helpers'
import {
  parseListQuery,
  createPaginationResponse,
  parseArrayFilterParam,
} from '@/lib/pagination-helpers'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { listInvitationsForUser } from '@/services/server/invitations/invitation-service'

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    const { organization } = ctx

    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip } = parseListQuery(searchParams)
    const search = searchParams.get('search')?.trim() || undefined
    const status = parseArrayFilterParam(searchParams, 'status')

    const { invitations: invitationsList, total } = await listInvitationsForUser({
      organizationId: organization.id,
      page,
      pageSize,
      skip,
      search,
      status: status.length > 0 ? status : undefined,
    })

    return NextResponse.json({
      invitations: invitationsList,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to fetch invitations', 500, error)
  }
}

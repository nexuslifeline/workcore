import { NextResponse } from 'next/server'
import {
  errorResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  resolveRequestContextForOrganization,
  validateRequestContext,
  updateOrganization,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContextForOrganization(id))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ORGANIZATIONS)
    return NextResponse.json({ organization: ctx.organization })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch organization', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContextForOrganization(id))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.SYSTEM_ORGANIZATIONS)

    const body = await request.json()
    const updateData: Parameters<typeof updateOrganization>[1] = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return badRequestResponse('Organization name cannot be empty')
      }
      updateData.name = body.name.trim()
    }
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl?.trim() || null
    if (body.address !== undefined) updateData.address = body.address?.trim() || null
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null
    if (body.email !== undefined) updateData.email = body.email?.trim() || null
    if (body.website !== undefined) updateData.website = body.website?.trim() || null
    if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson?.trim() || null
    if (body.industry !== undefined) updateData.industry = body.industry?.trim() || null
    if (body.status !== undefined) updateData.status = body.status?.trim() || null
    if (body.currencyCode !== undefined) {
      if (typeof body.currencyCode !== 'string' || body.currencyCode.trim().length === 0) {
        return badRequestResponse('Currency code cannot be empty')
      }
      updateData.currencyCode = body.currencyCode.trim()
    }

    const updatedOrganization = await updateOrganization(id, updateData)
    if (!updatedOrganization) {
      return notFoundResponse('Organization not found')
    }
    return NextResponse.json({ organization: updatedOrganization })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to update organization', 500, error)
  }
}

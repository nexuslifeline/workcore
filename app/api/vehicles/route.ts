import { NextResponse } from 'next/server'
import {
  badRequestResponse,
  errorResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  createPaginationResponse,
  parseListQuery,
} from '@/lib/pagination-helpers'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  createVehicle,
  VehiclePlateConflictError,
  listVehicles,
} from '@/services/server/vehicles/vehicle-service'

function parseVehicleBody(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const plateNumber = typeof body.plateNumber === 'string' ? body.plateNumber.trim() : ''
  if (!name) return { error: 'Vehicle name is required' as const }
  if (!plateNumber) return { error: 'Plate number is required' as const }
  const text = (value: unknown) => (typeof value === 'string' ? value : null)
  return {
    input: {
      name,
      plateNumber,
      description: text(body.description),
    },
  }
}

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.VEHICLES)
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search } = parseListQuery(searchParams)
    const { vehicles, total } = await listVehicles({
      organizationId: ctx.organization.id,
      page,
      pageSize,
      skip,
      search: search || undefined,
    })
    return NextResponse.json({
      vehicles,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch vehicles', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.VEHICLES)
    const body = await request.json()
    const parsed = parseVehicleBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const vehicle = await createVehicle(ctx.organization.id, ctx.user.id, parsed.input)
    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof VehiclePlateConflictError) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to create vehicle', 500, error)
  }
}

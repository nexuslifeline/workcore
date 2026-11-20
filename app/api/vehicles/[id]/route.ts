import { NextResponse } from 'next/server'
import {
  badRequestResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  VehiclePlateConflictError,
  getVehicle,
  updateVehicle,
} from '@/services/server/vehicles/vehicle-service'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.VEHICLES)
    const vehicle = await getVehicle(ctx.organization.id, id)
    if (!vehicle) return notFoundResponse('Vehicle not found')
    return NextResponse.json({ vehicle })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch vehicle', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.VEHICLES)
    const body = await request.json()
    const parsed = parseVehicleBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const vehicle = await updateVehicle(
      ctx.organization.id,
      id,
      ctx.user.id,
      parsed.input
    )
    if (!vehicle) return notFoundResponse('Vehicle not found')
    return NextResponse.json({ vehicle })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof VehiclePlateConflictError) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to update vehicle', 500, error)
  }
}

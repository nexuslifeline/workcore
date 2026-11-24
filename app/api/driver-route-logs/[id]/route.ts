import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  DriverRouteLogReferenceError,
  DriverRouteLogValidationError,
  deleteDriverRouteLog,
  getDriverRouteLog,
  updateDriverRouteLog,
} from '@/services/server/driver-route-logs/driver-route-log-service'
import type { DriverRouteLogInput } from '@/types/driver-route-log'

function readOdometer(value: unknown): number | null {
  if (value == null || value === '') return null
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') return Number(value)
  return Number.NaN
}

function readInput(body: Record<string, unknown>): DriverRouteLogInput {
  return {
    vehicleId: typeof body.vehicleId === 'string' ? body.vehicleId : '',
    employeeId: typeof body.employeeId === 'string' ? body.employeeId : '',
    origin: typeof body.origin === 'string' ? body.origin : '',
    destination: typeof body.destination === 'string' ? body.destination : '',
    startDatetime: typeof body.startDatetime === 'string' ? body.startDatetime : '',
    endDatetime: typeof body.endDatetime === 'string' ? body.endDatetime : null,
    startingOdometer: readOdometer(body.startingOdometer),
    endingOdometer: readOdometer(body.endingOdometer),
    notes: typeof body.notes === 'string' ? body.notes : null,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.DRIVER_ROUTE_LOGS)
    const driverRouteLog = await getDriverRouteLog(ctx.organization.id, id)
    if (!driverRouteLog) return notFoundResponse('Driver route log not found')
    return NextResponse.json({ driverRouteLog })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch driver route log', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.DRIVER_ROUTE_LOGS)
    const body = await request.json()
    const driverRouteLog = await updateDriverRouteLog(
      ctx.organization.id,
      id,
      readInput(body && typeof body === 'object' ? (body as Record<string, unknown>) : {})
    )
    if (!driverRouteLog) return notFoundResponse('Driver route log not found')
    return NextResponse.json({ driverRouteLog })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (
      error instanceof DriverRouteLogValidationError ||
      error instanceof DriverRouteLogReferenceError
    ) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to update driver route log', 500, error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.DRIVER_ROUTE_LOGS)
    const driverRouteLog = await deleteDriverRouteLog(ctx.organization.id, id)
    if (!driverRouteLog) return notFoundResponse('Driver route log not found')
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to delete driver route log', 500, error)
  }
}

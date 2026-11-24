import { NextResponse } from 'next/server'
import { badRequestResponse, errorResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  createPaginationResponse,
  parseArrayFilterParam,
  parseListQuery,
} from '@/lib/pagination-helpers'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import { endOfYyyyMmDd, startOfYyyyMmDd } from '@/lib/utils/date'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  DriverRouteLogReferenceError,
  DriverRouteLogValidationError,
  createDriverRouteLog,
  listDriverRouteLogs,
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

function parseStartRange(searchParams: URLSearchParams) {
  const fromRaw = searchParams.get('from')
  const toRaw = searchParams.get('to')
  if (!fromRaw || !toRaw) return {}
  const from = startOfYyyyMmDd(fromRaw)
  const to = endOfYyyyMmDd(toRaw)
  if (!from || !to) return { error: 'Start date range is not valid' as const }
  if (from > to) return { error: 'The start date must be on or before the end date' as const }
  return { from, to }
}

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.DRIVER_ROUTE_LOGS)
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search } = parseListQuery(searchParams)
    const range = parseStartRange(searchParams)
    if ('error' in range) return badRequestResponse(range.error)
    const { driverRouteLogs, total } = await listDriverRouteLogs({
      organizationId: ctx.organization.id,
      page,
      pageSize,
      skip,
      search: search || undefined,
      status: parseArrayFilterParam(searchParams, 'status'),
      from: range.from,
      to: range.to,
    })
    return NextResponse.json({
      driverRouteLogs,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch driver route logs', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.DRIVER_ROUTE_LOGS)
    const body = await request.json()
    const driverRouteLog = await createDriverRouteLog(
      ctx.organization.id,
      readInput(body && typeof body === 'object' ? (body as Record<string, unknown>) : {})
    )
    return NextResponse.json({ driverRouteLog }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (
      error instanceof DriverRouteLogValidationError ||
      error instanceof DriverRouteLogReferenceError
    ) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to create driver route log', 500, error)
  }
}

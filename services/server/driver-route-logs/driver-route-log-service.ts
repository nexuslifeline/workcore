import { and, count, desc, eq, gte, ilike, inArray, lte, or } from 'drizzle-orm'
import { driverRouteLogs, employees, vehicles } from '@/db/schema'
import { db } from '@/lib/db'
import {
  DRIVER_ROUTE_LOG_STATUSES,
  type DriverRouteLog,
  type DriverRouteLogInput,
  type DriverRouteLogStatus,
} from '@/types/driver-route-log'

export class DriverRouteLogValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DriverRouteLogValidationError'
  }
}

export class DriverRouteLogReferenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DriverRouteLogReferenceError'
  }
}

type LogRow = {
  id: string
  organizationId: string
  vehicleId: string
  vehicleName: string
  vehiclePlateNumber: string
  employeeId: string
  employeeName: string
  employeeCode: string
  employeeImageUrl: string | null
  origin: string
  destination: string
  startDatetime: Date
  endDatetime: Date | null
  startingOdometer: string | null
  endingOdometer: string | null
  status: DriverRouteLogStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

const logSelect = {
  id: driverRouteLogs.id,
  organizationId: driverRouteLogs.organizationId,
  vehicleId: driverRouteLogs.vehicleId,
  vehicleName: vehicles.name,
  vehiclePlateNumber: vehicles.plateNumber,
  employeeId: driverRouteLogs.employeeId,
  employeeName: employees.name,
  employeeCode: employees.code,
  employeeImageUrl: employees.imageUrl,
  origin: driverRouteLogs.origin,
  destination: driverRouteLogs.destination,
  startDatetime: driverRouteLogs.startDatetime,
  endDatetime: driverRouteLogs.endDatetime,
  startingOdometer: driverRouteLogs.startingOdometer,
  endingOdometer: driverRouteLogs.endingOdometer,
  status: driverRouteLogs.status,
  notes: driverRouteLogs.notes,
  createdAt: driverRouteLogs.createdAt,
  updatedAt: driverRouteLogs.updatedAt,
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null
}

function toOdometer(value: string | null): number | null {
  if (value == null) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function toLog(row: LogRow): DriverRouteLog {
  return {
    id: row.id,
    organizationId: row.organizationId,
    vehicleId: row.vehicleId,
    vehicleName: row.vehicleName,
    vehiclePlateNumber: row.vehiclePlateNumber,
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    employeeCode: row.employeeCode,
    employeeImageUrl: row.employeeImageUrl,
    origin: row.origin,
    destination: row.destination,
    startDatetime: row.startDatetime.toISOString(),
    endDatetime: toIso(row.endDatetime),
    startingOdometer: toOdometer(row.startingOdometer),
    endingOdometer: toOdometer(row.endingOdometer),
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function requireText(value: string, label: string) {
  const trimmed = value.trim()
  if (!trimmed) throw new DriverRouteLogValidationError(`${label} is required`)
  return trimmed
}

function requireDate(value: string, label: string) {
  const trimmed = value.trim()
  const date = new Date(trimmed)
  if (!trimmed || Number.isNaN(date.getTime())) {
    throw new DriverRouteLogValidationError(`${label} is not valid`)
  }
  return date
}

function optionalDate(value: string | null | undefined, label: string) {
  if (value == null || value.trim() === '') return null
  return requireDate(value, label)
}

function optionalOdometer(value: number | null | undefined, label: string) {
  if (value == null) return null
  if (!Number.isFinite(value) || value < 0) {
    throw new DriverRouteLogValidationError(`${label} must be zero or more`)
  }
  return value.toFixed(1)
}

function toRow(input: DriverRouteLogInput) {
  const startDatetime = requireDate(input.startDatetime, 'Start date')
  const endDatetime = optionalDate(input.endDatetime, 'End date')
  if (endDatetime && endDatetime < startDatetime) {
    throw new DriverRouteLogValidationError('End date must be on or after the start date')
  }
  const startingOdometer = optionalOdometer(input.startingOdometer, 'Starting odometer')
  const endingOdometer = optionalOdometer(input.endingOdometer, 'Ending odometer')
  if (
    startingOdometer != null &&
    endingOdometer != null &&
    Number(endingOdometer) < Number(startingOdometer)
  ) {
    throw new DriverRouteLogValidationError(
      'Ending odometer must be greater than or equal to the starting odometer'
    )
  }
  const notes = input.notes?.trim() ?? ''
  return {
    vehicleId: requireText(input.vehicleId, 'Vehicle'),
    employeeId: requireText(input.employeeId, 'Driver'),
    origin: requireText(input.origin, 'Origin'),
    destination: requireText(input.destination, 'Destination'),
    startDatetime,
    endDatetime,
    startingOdometer,
    endingOdometer,
    notes: notes === '' ? null : notes,
  }
}

async function assertReferences(
  organizationId: string,
  vehicleId: string,
  employeeId: string
) {
  const [vehicle] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.organizationId, organizationId)))
    .limit(1)
  if (!vehicle) {
    throw new DriverRouteLogReferenceError('Vehicle is not in the current organization')
  }
  const [employee] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.organizationId, organizationId)))
    .limit(1)
  if (!employee) {
    throw new DriverRouteLogReferenceError('Driver is not in the current organization')
  }
}

function logQuery() {
  return db
    .select(logSelect)
    .from(driverRouteLogs)
    .innerJoin(vehicles, eq(driverRouteLogs.vehicleId, vehicles.id))
    .innerJoin(employees, eq(driverRouteLogs.employeeId, employees.id))
}

export async function listDriverRouteLogs(params: {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
  from?: Date
  to?: Date
}) {
  const conditions = [eq(driverRouteLogs.organizationId, params.organizationId)]
  if (params.search) {
    const term = `%${params.search}%`
    conditions.push(
      or(
        ilike(driverRouteLogs.origin, term),
        ilike(driverRouteLogs.destination, term),
        ilike(vehicles.name, term),
        ilike(vehicles.plateNumber, term),
        ilike(employees.name, term)
      )!
    )
  }
  const statuses = (params.status ?? []).filter((status): status is DriverRouteLogStatus =>
    DRIVER_ROUTE_LOG_STATUSES.includes(status as DriverRouteLogStatus)
  )
  if (statuses.length > 0) {
    conditions.push(inArray(driverRouteLogs.status, statuses))
  }
  if (params.from && params.to) {
    conditions.push(gte(driverRouteLogs.startDatetime, params.from))
    conditions.push(lte(driverRouteLogs.startDatetime, params.to))
  }
  const whereClause = and(...conditions)
  const [rows, totalResult] = await Promise.all([
    logQuery()
      .where(whereClause)
      .orderBy(desc(driverRouteLogs.startDatetime))
      .limit(params.pageSize)
      .offset(params.skip),
    db
      .select({ count: count() })
      .from(driverRouteLogs)
      .innerJoin(vehicles, eq(driverRouteLogs.vehicleId, vehicles.id))
      .innerJoin(employees, eq(driverRouteLogs.employeeId, employees.id))
      .where(whereClause),
  ])
  return {
    driverRouteLogs: rows.map((row) => toLog(row as LogRow)),
    total: totalResult[0]?.count ?? 0,
  }
}

export async function getDriverRouteLog(organizationId: string, id: string) {
  const [row] = await logQuery()
    .where(and(eq(driverRouteLogs.id, id), eq(driverRouteLogs.organizationId, organizationId)))
    .limit(1)
  return row ? toLog(row as LogRow) : null
}

export async function createDriverRouteLog(organizationId: string, input: DriverRouteLogInput) {
  const values = toRow(input)
  await assertReferences(organizationId, values.vehicleId, values.employeeId)
  const [row] = await db
    .insert(driverRouteLogs)
    .values({
      organizationId,
      ...values,
    })
    .returning({ id: driverRouteLogs.id })
  const created = await getDriverRouteLog(organizationId, row.id)
  if (!created) throw new DriverRouteLogValidationError('Failed to create driver route log')
  return created
}

export async function updateDriverRouteLog(
  organizationId: string,
  id: string,
  input: DriverRouteLogInput
) {
  const values = toRow(input)
  await assertReferences(organizationId, values.vehicleId, values.employeeId)
  const [row] = await db
    .update(driverRouteLogs)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(and(eq(driverRouteLogs.id, id), eq(driverRouteLogs.organizationId, organizationId)))
    .returning({ id: driverRouteLogs.id })
  if (!row) return null
  return getDriverRouteLog(organizationId, row.id)
}

export async function deleteDriverRouteLog(organizationId: string, id: string) {
  const [row] = await db
    .delete(driverRouteLogs)
    .where(and(eq(driverRouteLogs.id, id), eq(driverRouteLogs.organizationId, organizationId)))
    .returning({ id: driverRouteLogs.id })
  return row ?? null
}

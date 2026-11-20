import { and, count, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'
import { vehicles } from '@/db/schema'
import { db } from '@/lib/db'
import type { VehicleInput } from '@/types/vehicle'

export class VehiclePlateConflictError extends Error {
  constructor() {
    super('A vehicle with this plate number already exists in the organization')
    this.name = 'VehiclePlateConflictError'
  }
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}

function toRow(input: VehicleInput) {
  return {
    name: input.name.trim(),
    description: blankToNull(input.description),
    plateNumber: input.plateNumber.trim(),
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String((error as { code?: unknown }).code) : ''
  return code === '23505'
}

export async function vehiclePlateExists(params: {
  organizationId: string
  plateNumber: string
  excludeId?: string
}): Promise<boolean> {
  const conditions = [
    eq(vehicles.organizationId, params.organizationId),
    eq(sql`lower(${vehicles.plateNumber})`, params.plateNumber.trim().toLowerCase()),
  ]
  if (params.excludeId) {
    conditions.push(ne(vehicles.id, params.excludeId))
  }
  const [row] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(...conditions))
    .limit(1)
  return Boolean(row)
}

export async function listVehicles(params: {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
}) {
  const conditions = [eq(vehicles.organizationId, params.organizationId)]
  if (params.search) {
    const term = `%${params.search}%`
    conditions.push(or(ilike(vehicles.name, term), ilike(vehicles.plateNumber, term))!)
  }
  const whereClause = and(...conditions)
  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(vehicles)
      .where(whereClause)
      .orderBy(desc(vehicles.updatedAt))
      .limit(params.pageSize)
      .offset(params.skip),
    db.select({ count: count() }).from(vehicles).where(whereClause),
  ])
  return { vehicles: rows, total: totalResult[0]?.count ?? 0 }
}

export async function getVehicle(organizationId: string, id: string) {
  const [row] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)))
    .limit(1)
  return row ?? null
}

export async function createVehicle(
  organizationId: string,
  userId: string,
  input: VehicleInput
) {
  if (await vehiclePlateExists({ organizationId, plateNumber: input.plateNumber })) {
    throw new VehiclePlateConflictError()
  }
  try {
    const [row] = await db
      .insert(vehicles)
      .values({
        organizationId,
        ...toRow(input),
        createdBy: userId,
        updatedBy: userId,
      })
      .returning()
    return row
  } catch (error) {
    if (isUniqueViolation(error)) throw new VehiclePlateConflictError()
    throw error
  }
}

export async function updateVehicle(
  organizationId: string,
  id: string,
  userId: string,
  input: VehicleInput
) {
  if (
    await vehiclePlateExists({
      organizationId,
      plateNumber: input.plateNumber,
      excludeId: id,
    })
  ) {
    throw new VehiclePlateConflictError()
  }
  try {
    const [row] = await db
      .update(vehicles)
      .set({
        ...toRow(input),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)))
      .returning()
    return row ?? null
  } catch (error) {
    if (isUniqueViolation(error)) throw new VehiclePlateConflictError()
    throw error
  }
}

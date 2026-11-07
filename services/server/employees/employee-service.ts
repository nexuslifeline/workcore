import { and, count, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm'
import { employees } from '@/db/schema'
import { db } from '@/lib/db'
import type { EmployeeInput } from '@/types/employee'

export class EmployeeCodeConflictError extends Error {
  constructor() {
    super('An employee with this code already exists in the organization')
    this.name = 'EmployeeCodeConflictError'
  }
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}

function toRow(input: EmployeeInput) {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    imageUrl: blankToNull(input.imageUrl),
    birthdate: blankToNull(input.birthdate),
    tin: blankToNull(input.tin),
    gender: input.gender,
    currentAddress: blankToNull(input.currentAddress),
    homeAddress: blankToNull(input.homeAddress),
    contactNumber: blankToNull(input.contactNumber),
    sssNumber: blankToNull(input.sssNumber),
    philhealthNumber: blankToNull(input.philhealthNumber),
    status: input.status,
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String((error as { code?: unknown }).code) : ''
  return code === '23505'
}

export async function employeeCodeExists(params: {
  organizationId: string
  code: string
  excludeId?: string
}): Promise<boolean> {
  const conditions = [
    eq(employees.organizationId, params.organizationId),
    eq(sql`lower(${employees.code})`, params.code.trim().toLowerCase()),
  ]
  if (params.excludeId) {
    conditions.push(ne(employees.id, params.excludeId))
  }
  const [row] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(and(...conditions))
    .limit(1)
  return Boolean(row)
}

export async function listEmployees(params: {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
}) {
  const conditions = [eq(employees.organizationId, params.organizationId)]
  if (params.search) {
    const term = `%${params.search}%`
    conditions.push(or(ilike(employees.name, term), ilike(employees.code, term))!)
  }
  if (params.status && params.status.length > 0) {
    conditions.push(inArray(employees.status, params.status as Array<'active' | 'inactive'>))
  }
  const whereClause = and(...conditions)
  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(employees)
      .where(whereClause)
      .orderBy(desc(employees.updatedAt))
      .limit(params.pageSize)
      .offset(params.skip),
    db.select({ count: count() }).from(employees).where(whereClause),
  ])
  return { employees: rows, total: totalResult[0]?.count ?? 0 }
}

export async function getEmployee(organizationId: string, id: string) {
  const [row] = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, id), eq(employees.organizationId, organizationId)))
    .limit(1)
  return row ?? null
}

export async function createEmployee(organizationId: string, input: EmployeeInput) {
  if (await employeeCodeExists({ organizationId, code: input.code })) {
    throw new EmployeeCodeConflictError()
  }
  try {
    const [row] = await db
      .insert(employees)
      .values({
        organizationId,
        ...toRow(input),
      })
      .returning()
    return row
  } catch (error) {
    if (isUniqueViolation(error)) throw new EmployeeCodeConflictError()
    throw error
  }
}

export async function updateEmployee(
  organizationId: string,
  id: string,
  input: EmployeeInput
) {
  if (await employeeCodeExists({ organizationId, code: input.code, excludeId: id })) {
    throw new EmployeeCodeConflictError()
  }
  try {
    const [row] = await db
      .update(employees)
      .set({
        ...toRow(input),
        updatedAt: new Date(),
      })
      .where(and(eq(employees.id, id), eq(employees.organizationId, organizationId)))
      .returning()
    return row ?? null
  } catch (error) {
    if (isUniqueViolation(error)) throw new EmployeeCodeConflictError()
    throw error
  }
}

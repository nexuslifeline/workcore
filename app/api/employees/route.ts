import { NextResponse } from 'next/server'
import {
  badRequestResponse,
  errorResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  createPaginationResponse,
  parseArrayFilterParam,
  parseListQuery,
} from '@/lib/pagination-helpers'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  createEmployee,
  EmployeeCodeConflictError,
  listEmployees,
} from '@/services/server/employees/employee-service'
import type { EmployeeGender, EmployeeStatus } from '@/types/employee'

function parseEmployeeBody(body: Record<string, unknown>) {
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const gender = body.gender
  const status = body.status
  if (!code) return { error: 'Employee code is required' as const }
  if (!name) return { error: 'Employee name is required' as const }
  if (gender !== 'male' && gender !== 'female') {
    return { error: 'Gender must be male or female' as const }
  }
  if (status !== 'active' && status !== 'inactive') {
    return { error: 'Status must be active or inactive' as const }
  }
  const text = (value: unknown) => (typeof value === 'string' ? value : null)
  return {
    input: {
      code,
      name,
      imageUrl: text(body.imageUrl),
      birthdate: text(body.birthdate),
      tin: text(body.tin),
      gender: gender as EmployeeGender,
      currentAddress: text(body.currentAddress),
      homeAddress: text(body.homeAddress),
      contactNumber: text(body.contactNumber),
      sssNumber: text(body.sssNumber),
      philhealthNumber: text(body.philhealthNumber),
      status: status as EmployeeStatus,
    },
  }
}

export async function GET(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.EMPLOYEES)
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, search } = parseListQuery(searchParams)
    const status = parseArrayFilterParam(searchParams, 'status')
    const { employees, total } = await listEmployees({
      organizationId: ctx.organization.id,
      page,
      pageSize,
      skip,
      search: search || undefined,
      status,
    })
    return NextResponse.json({
      employees,
      pagination: createPaginationResponse(page, pageSize, total),
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch employees', 500, error)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.EMPLOYEES)
    const body = await request.json()
    const parsed = parseEmployeeBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const employee = await createEmployee(ctx.organization.id, parsed.input)
    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof EmployeeCodeConflictError) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to create employee', 500, error)
  }
}

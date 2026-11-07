import { NextResponse } from 'next/server'
import {
  badRequestResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  EmployeeCodeConflictError,
  getEmployee,
  updateEmployee,
} from '@/services/server/employees/employee-service'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.EMPLOYEES)
    const employee = await getEmployee(ctx.organization.id, id)
    if (!employee) return notFoundResponse('Employee not found')
    return NextResponse.json({ employee })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch employee', 500, error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))
    validatePermissions(await resolvePermissions(ctx), PERMISSIONS.EMPLOYEES)
    const body = await request.json()
    const parsed = parseEmployeeBody(body)
    if ('error' in parsed) return badRequestResponse(parsed.error)
    const employee = await updateEmployee(ctx.organization.id, id, parsed.input)
    if (!employee) return notFoundResponse('Employee not found')
    return NextResponse.json({ employee })
  } catch (error) {
    if (error instanceof NextResponse) return error
    if (error instanceof EmployeeCodeConflictError) {
      return badRequestResponse(error.message)
    }
    return errorResponse('Failed to update employee', 500, error)
  }
}

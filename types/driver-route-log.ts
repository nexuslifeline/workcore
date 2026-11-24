export const DRIVER_ROUTE_LOG_STATUSES = [
  'scheduled',
  'in_transit',
  'completed',
  'cancelled',
] as const

export type DriverRouteLogStatus = (typeof DRIVER_ROUTE_LOG_STATUSES)[number]

export type DriverRouteLog = {
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
  startDatetime: string
  endDatetime: string | null
  startingOdometer: number | null
  endingOdometer: number | null
  status: DriverRouteLogStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type DriverRouteLogInput = {
  vehicleId: string
  employeeId: string
  origin: string
  destination: string
  startDatetime: string
  endDatetime?: string | null
  startingOdometer?: number | null
  endingOdometer?: number | null
  notes?: string | null
}

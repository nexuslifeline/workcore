export type Vehicle = {
  id: string
  organizationId: string
  name: string
  description: string | null
  plateNumber: string
  createdBy: string | null
  updatedBy: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export type VehicleInput = {
  name: string
  description?: string | null
  plateNumber: string
}

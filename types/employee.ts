export type EmployeeGender = 'male' | 'female'
export type EmployeeStatus = 'active' | 'inactive'

export type Employee = {
  id: string
  organizationId: string
  code: string
  name: string
  imageUrl: string | null
  birthdate: string | null
  tin: string | null
  gender: EmployeeGender
  currentAddress: string | null
  homeAddress: string | null
  contactNumber: string | null
  sssNumber: string | null
  philhealthNumber: string | null
  status: EmployeeStatus
  createdAt: string | Date
  updatedAt: string | Date
}

export type EmployeeInput = {
  code: string
  name: string
  imageUrl?: string | null
  birthdate?: string | null
  tin?: string | null
  gender: EmployeeGender
  currentAddress?: string | null
  homeAddress?: string | null
  contactNumber?: string | null
  sssNumber?: string | null
  philhealthNumber?: string | null
  status: EmployeeStatus
}

export type Organization = {
  id: string
  ownerId: string
  name: string
  description: string | null
  logoUrl: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  contactPerson: string | null
  industry: string | null
  status: string | null
  currencyCode?: string | null
  createdAt: Date
  updatedAt: Date
  currentUserRole?: string | null
}

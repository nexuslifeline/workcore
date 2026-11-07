export type AgingExportOrganization = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  currencyCode?: string | null
}

/** Maps org context to the shape used by aging PDF/Excel exports. */
export function mapOrganizationForAgingExport(organization: {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  currencyCode?: string | null
}): AgingExportOrganization {
  return {
    id: organization.id,
    name: organization.name,
    address: organization.address,
    phone: organization.phone,
    email: organization.email,
    website: organization.website,
    currencyCode:
      typeof organization.currencyCode === 'string' && organization.currencyCode.trim()
        ? organization.currencyCode.trim()
        : 'PHP',
  }
}

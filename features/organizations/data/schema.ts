import { z } from 'zod'
import type { Organization } from '@/types/organization'

export const organizationSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  contactPerson: z.string().nullable(),
  industry: z.string().nullable(),
  status: z.string().nullable(),
  currencyCode: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  currentUserRole: z.string().nullable().optional(),
})

export type OrganizationListItem = z.infer<typeof organizationSchema>

export type { Organization }

import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
  z.literal('pending'),
  z.literal('accepted'),
  z.literal('revoked'),
  z.literal('expired'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('owner'),
  z.literal('admin'),
  z.literal('manager'),
  z.literal('member'),
  z.literal('viewer'),
])

const userSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  name: z.string().nullable(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable().optional(),
  birthdate: z.coerce.date().nullable().optional(),
  address: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  status: userStatusSchema,
  type: z.enum(['user', 'invitation']).optional(),
  role: userRoleSchema.optional(),
  invitationExpiresAt: z.coerce.date().optional(),
  invitationAcceptedAt: z.coerce.date().nullable().optional(),
  invitationToken: z.string().optional(),
  invitedByName: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  organizationName: z.string().optional(),
  joinedAt: z.coerce.date().nullable().optional(),
  lastLoginAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

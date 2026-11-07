import { z } from 'zod'

export const roleSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  permissionCount: z.coerce.number().int().nonnegative().optional(),
  memberCount: z.coerce.number().int().nonnegative().optional(),
  memberPreviews: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      })
    )
    .optional(),
})

export type Role = z.infer<typeof roleSchema>
export const roleListSchema = z.array(roleSchema)

export type Role = {
  id: string
  organizationId: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  /** Allowed permission count. Present on GET /roles list. */
  permissionCount?: number
  /** Members in this org with this role. Present on GET /roles list. */
  memberCount?: number
  /** First members for the Roles table stack. Present on GET /roles list. */
  memberPreviews?: {
    id: string
    name: string | null
    avatarUrl: string | null
  }[]
}

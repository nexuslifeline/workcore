export type User = {
  id: string
  userId: string | null
  name: string | null
  bio?: string | null
  avatarUrl: string | null
  phone: string | null
  email: string | null
  website?: string | null
  birthdate?: Date | null
  address?: string | null
  locale?: string | null
  status: 'active' | 'suspended' | 'inactive' | 'pending' | 'invited' | 'accepted' | 'revoked' | 'expired'
  type?: 'user' | 'invitation'
  role?: string
  roleId?: string | null
  invitationExpiresAt?: Date
  invitationAcceptedAt?: Date | null
  invitationToken?: string
  invitedByName?: string | null
  message?: string | null
  organizationName?: string
  joinedAt?: Date | null
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
}


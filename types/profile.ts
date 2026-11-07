export type Profile = {
  id: string
  userId: string
  name: string | null
  bio: string | null
  avatarUrl: string | null
  phone: string | null
  email: string | null
  website: string | null
  birthdate: Date | null
  address: string | null
  locale: string | null
  status: 'active' | 'suspended' | 'inactive' | 'pending'
  createdAt: Date
  updatedAt: Date
}


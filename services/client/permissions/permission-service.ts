import { api } from '@/lib/api'

export type Permission = {
  id: string
  code: string
  name: string
  description: string | null
  group: string | null
  parentCode: string | null
}

export async function getPermissions(): Promise<Permission[]> {
  const { data } = await api.get<{ permissions: Permission[] }>('/permissions')
  return data.permissions
}

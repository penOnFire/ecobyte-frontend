import { apiFetch } from './client'

export type BackendUserRole = 'RESIDENT' | 'OFFICIAL' | 'ADMIN'

export interface BackendUserRecord {
  id: string
  email: string
  fullName: string
  phone?: string
  role: BackendUserRole
  barangay?: {
    id: string
    name: string
    city: string
  }
  createdAt?: string
}

export const adminApi = {
  getUsers: () => apiFetch<BackendUserRecord[]>('/admin/users'),

  updateUserRole: (id: string, role: BackendUserRole) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
}

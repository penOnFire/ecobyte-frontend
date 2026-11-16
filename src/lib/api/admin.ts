import { apiFetch } from './client'

export type BackendUserRole =
  | 'RESIDENT'
  | 'OFFICIAL'
  | 'BARANGAY_OFFICIAL'
  | 'ADMIN'
  | 'Admin'
  | 'Official'
  | 'Deactivated'

export interface BackendUserRecord {
  id: string
  email: string
  name?: string
  fullName?: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  phone?: string
  idCode?: string
  role: BackendUserRole
  department?: string
  status?: 'Active' | 'Suspended' | 'Deactivated'
  accountStatus?: string
  twoFactorEnabled?: boolean
  mustChangePassword?: boolean
  notes?: string
  lastActive?: string
  isSelf?: boolean
  initials?: string
  barangay?: {
    id: string
    name: string
    city: string
  }
  createdAt?: string
}

export interface CreateAdminUserPayload {
  fullName?: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  email: string
  role?: string
  phone?: string
  idCode?: string
  department?: string
  status?: string
  twoFactorEnabled?: boolean
  mustChangePassword?: boolean
  notes?: string
  password?: string
}

export type UpdateAdminUserPayload = Partial<CreateAdminUserPayload>

export const adminApi = {
  getUsers: () => apiFetch<BackendUserRecord[]>('/admin/users'),

  createUser: (payload: CreateAdminUserPayload) =>
    apiFetch<BackendUserRecord>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateUser: (id: string, payload: UpdateAdminUserPayload) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateUserRole: (id: string, role: BackendUserRole) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  updateUserStatus: (id: string, status: string) =>
    apiFetch<BackendUserRecord>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

import { apiFetch } from './client'
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/types'

export const authApi = {
  login: (payload: LoginPayload) =>
    apiFetch<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiFetch<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () => apiFetch<User>('/auth/me'),

  logout: () => {
    localStorage.removeItem('ecobyte_token')
  },
}


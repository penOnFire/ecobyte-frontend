import { apiFetch } from './client'
import type {
  AuthSession,
  Barangay,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types'

export const COMMONWEALTH_BASES_FALLBACK: Barangay[] = [
  { id: '1', name: 'Base 1 - Brgy. Hall Complex (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '2', name: 'Base 2 - Martan St. (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '3', name: 'Base 3 - Don Fabian (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '4', name: 'Base 4 - Katuparan (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '5', name: 'Base 5 - Riverside (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '6', name: 'Base 6 - Kristong Hari (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '7', name: 'Base 7 - Upper Kamias (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '8', name: 'Base 8 - Pilot Area (Barangay Commonwealth)', city: 'Quezon City' },
  { id: '9', name: 'Base 9 - Lupang Pangako (Barangay Commonwealth)', city: 'Quezon City' },
]

const USER_CACHE_KEY = 'ecobyte_user'

export function clearStaleLocalRequests(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ecobyte_ongoing_requests')
  localStorage.removeItem('ecobyte_claimed_requests')
  localStorage.removeItem('ecobyte_user_reservations')
  localStorage.removeItem('ecobyte_dropoff_requests')
  localStorage.removeItem('ecobyte_reuse_listings')
  localStorage.removeItem('ecobyte_disposal_records')
  localStorage.removeItem('ecobyte_activity_logs')
}

export function getScopedOfficialBaseId(): string | null {
  const user = getCachedUser()
  const storedRole =
    typeof window !== 'undefined' ? localStorage.getItem('ecobyte_user_role') : null
  const role = resolveAuthRole(user?.role || storedRole, user?.email)
  if (role !== 'BARANGAY_OFFICIAL') return null
  return user?.barangay?.id ? String(user.barangay.id) : null
}

export function setCachedUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (!user) {
    localStorage.removeItem(USER_CACHE_KEY)
    localStorage.removeItem('ecobyte_user_name')
    clearStaleLocalRequests()
    return
  }
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
  localStorage.setItem('ecobyte_user_name', user.fullName)
}

export function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function extractFirstName(user: Partial<User> | null | undefined): string {
  if (user?.firstName?.trim()) return user.firstName.trim()
  if (user?.fullName?.trim()) return user.fullName.trim().split(/\s+/)[0]
  if (typeof window !== 'undefined') {
    const cachedName = localStorage.getItem('ecobyte_user_name')?.trim()
    if (cachedName) return cachedName.split(/\s+/)[0]
  }
  return 'Resident'
}

export type CanonicalAuthRole = 'ADMIN' | 'BARANGAY_OFFICIAL' | 'RESIDENT'

/** Resolves a canonical auth role from the explicit backend/stored role first, falling back to email hints only when absent. */
export function resolveAuthRole(
  role?: string | null,
  email?: string | null
): CanonicalAuthRole {
  const normalizedRole = (role || '').trim().toUpperCase()
  if (normalizedRole === 'ADMIN') return 'ADMIN'
  if (normalizedRole === 'BARANGAY_OFFICIAL' || normalizedRole === 'OFFICIAL') {
    return 'BARANGAY_OFFICIAL'
  }
  if (normalizedRole === 'RESIDENT') return 'RESIDENT'

  const lower = (email || '').trim().toLowerCase()
  if (lower.includes('admin') || lower === 'admin@ecobyte.gov') {
    return 'ADMIN'
  }
  if (
    lower.includes('official') ||
    lower.includes('barangay.gov.ph') ||
    lower.includes('gov.ph')
  ) {
    return 'BARANGAY_OFFICIAL'
  }
  return 'RESIDENT'
}

export const authApi = {
  finishWalkthrough: (outcome: 'completed' | 'skipped') =>
    apiFetch<{ walkthroughVersion: number; outcome: string }>('/auth/walkthrough', {
      method: 'PATCH',
      body: JSON.stringify({ outcome }),
    }),
  login: (payload: LoginPayload): Promise<AuthSession> =>
    apiFetch<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload): Promise<AuthSession> =>
    apiFetch<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: async (): Promise<User> => {
    try {
      const profile = await apiFetch<User>('/auth/me')
      if (profile) setCachedUser(profile)
      return profile
    } catch (err: any) {
      const isTransportFailure =
        !err?.status &&
        (err?.message?.includes('fetch') || err?.message?.includes('NetworkError'))
      if (isTransportFailure) {
        const cached = getCachedUser()
        if (cached) return cached
      }
      throw err
    }
  },

  updateProfile: async (payload: { phone?: string }): Promise<User> => {
    const updated = await apiFetch<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    if (updated) {
      setCachedUser(updated)
    }
    return updated
  },

  getBarangays: async (): Promise<Barangay[]> => {
    try {
      const list = await apiFetch<Barangay[]>('/barangays')
      return Array.isArray(list) && list.length > 0 ? list : COMMONWEALTH_BASES_FALLBACK
    } catch {
      return COMMONWEALTH_BASES_FALLBACK
    }
  },

  changePassword: async (
    payload: ChangePasswordPayload
  ): Promise<{ message: string; user: User }> => {
    const res = await apiFetch<{ message: string; user: User }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res?.user) {
      setCachedUser(res.user)
    }
    return res
  },

  logout: () => {
    localStorage.removeItem('ecobyte_token')
    localStorage.removeItem('ecobyte_user_role')
    try {
      sessionStorage.removeItem('ecobyte_scan_angles')
    } catch {}
    setCachedUser(null)
  },
}

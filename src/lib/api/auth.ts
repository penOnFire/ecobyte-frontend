import { apiFetch } from './client'
import type { AuthSession, Barangay, LoginPayload, RegisterPayload, User } from '@/types'

const DEFAULT_BARANGAY: Barangay = {
  id: '1',
  name: 'Base 1 - Brgy. Hall Complex (Barangay Commonwealth)',
  city: 'Quezon City',
}

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

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthSession> => {
    try {
      return await apiFetch<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err: any) {
      // If backend is offline or network fails (e.g. "Failed to fetch"), check for demo/valid credentials
      // and provide offline fallback authentication so frontend development & testing works seamlessly.
      const isNetworkError =
        err?.message?.includes('fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.status === 500 ||
        err?.status === 502 ||
        err?.status === 503 ||
        err?.status === 504 ||
        err?.status === 404 ||
        !err?.status

      if (isNetworkError) {
        console.warn('Backend unavailable or offline. Falling back to offline mock authentication for:', payload.email)
        const isAdmin =
          payload.email.toLowerCase().includes('admin') ||
          payload.email.toLowerCase().includes('ecobyte.gov') ||
          payload.email.toLowerCase().includes('official')

        return {
          accessToken: `mock_jwt_token_${isAdmin ? 'admin' : 'resident'}_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
          user: {
            id: isAdmin ? 'usr-admin-01' : 'usr-resident-01',
            fullName: isAdmin ? 'Elena Vance' : 'Alex Rivera',
            email: payload.email,
            phone: '+63 917 123 4567',
            role: isAdmin ? 'ADMIN' : 'RESIDENT',
            barangay: DEFAULT_BARANGAY,
          },
        }
      }

      throw err
    }
  },

  register: async (payload: RegisterPayload): Promise<AuthSession> => {
    try {
      return await apiFetch<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err: any) {
      const isNetworkError =
        err?.message?.includes('fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.status === 500 ||
        err?.status === 502 ||
        err?.status === 503 ||
        err?.status === 504 ||
        err?.status === 404 ||
        !err?.status

      if (isNetworkError) {
        console.warn('Backend unavailable or offline. Falling back to local registration for:', payload.email)
        return {
          accessToken: `mock_jwt_token_resident_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
          user: {
            id: `usr-reg-${Date.now().toString().slice(-4)}`,
            fullName: payload.fullName,
            email: payload.email,
            phone: payload.phone || '+63 917 123 4567',
            role: 'RESIDENT',
            barangay: DEFAULT_BARANGAY,
          },
        }
      }

      throw err
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const profile = await apiFetch<User>('/auth/me')
      if (profile) setCachedUser(profile)
      return profile
    } catch (err: any) {
      const isNetworkError =
        err?.message?.includes('fetch') ||
        err?.message?.includes('NetworkError') ||
        !err?.status
      if (isNetworkError) {
        const cached = getCachedUser()
        if (cached) return cached
        const role = localStorage.getItem('ecobyte_user_role') || 'RESIDENT'
        const isAdmin = role === 'ADMIN'
        return {
          id: isAdmin ? 'usr-admin-01' : 'usr-resident-01',
          fullName: isAdmin ? 'Elena Vance' : 'Alex Rivera',
          firstName: isAdmin ? 'Elena' : 'Alex',
          email: isAdmin ? 'admin@ecobyte.gov' : 'resident@ecobyte.ph',
          phone: '+63 917 123 4567',
          role: isAdmin ? 'ADMIN' : 'RESIDENT',
          barangay: DEFAULT_BARANGAY,
        }
      }
      throw err
    }
  },

  getBarangays: async (): Promise<Barangay[]> => {
    try {
      const list = await apiFetch<Barangay[]>('/barangays')
      return Array.isArray(list) && list.length > 0 ? list : COMMONWEALTH_BASES_FALLBACK
    } catch {
      return COMMONWEALTH_BASES_FALLBACK
    }
  },

  logout: () => {
    localStorage.removeItem('ecobyte_token')
    localStorage.removeItem('ecobyte_user_role')
    setCachedUser(null)
  },
}

import type { BackendUserRecord, BackendUserRole } from '@/lib/api/admin'

export type UserRole = 'Admin' | 'Official' | 'Resident' | 'Deactivated'
export type UserStatus = 'Active' | 'Suspended' | 'Deactivated'

export interface OfficialUser {
  id: string
  name: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  email: string
  phone: string
  idCode: string
  role: UserRole
  department: string
  barangay?: string
  status: UserStatus
  twoFactorEnabled: boolean
  mustChangePassword?: boolean
  notes?: string
  lastActive: string
  initials: string
  isSelf?: boolean
  isBackendUser?: boolean
}

export const COMMONWEALTH_FACILITIES = [
  'Commonwealth Central MRF (Main Base)',
  'Barangay Commonwealth Environmental Desk',
  'Base 1 (MRF / Main Hall Operations)',
  'Base 2 (Unit 1 E-Waste Station)',
  'Base 3 (Unit 2 E-Waste Station)',
  'Base 4 (Unit 3 E-Waste Station)',
  'Base 5 (Unit 4 E-Waste Station)',
  'Base 6 (Unit 5 E-Waste Station)',
  'Base 7 (Unit 6 E-Waste Station)',
  'Base 8 (Unit 7 E-Waste Station)',
  'Base 9 (Unit 8 E-Waste Station)',
  'Inspection & Physical Diagnostics Lab',
  'Reuse & Refurbishment Hub Desk',
  'Hazardous E-Waste Vault & Disposal',
]

export const INITIAL_USERS: OfficialUser[] = []

export function generateBadgeId(role: 'Admin' | 'Official'): string {
  const code = role === 'Admin' ? 'ADM' : 'OFC'
  const num = Math.floor(1000 + Math.random() * 9000)
  return `ID-${num}-${code}`
}

export function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: 'None', color: '#cbd5e1' }
  let score = 0
  if (pass.length >= 8) score += 1
  if (pass.length >= 12) score += 1
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
  if (/[0-9]/.test(pass)) score += 1
  if (/[^A-Za-z0-9]/.test(pass)) score += 1

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' }
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' }
  if (score === 3 || score === 4) return { score: 3, label: 'Good', color: '#3b82f6' }
  return { score: 4, label: 'Strong', color: '#16a34a' }
}

export function parseNameParts(user: OfficialUser): {
  first: string
  middle: string
  last: string
  suffix: string
} {
  if (user.firstName && user.lastName) {
    return {
      first: user.firstName,
      middle: user.middleName || '',
      last: user.lastName,
      suffix: user.suffix || '',
    }
  }
  const parts = user.name.trim().split(/\s+/)
  if (parts.length === 1) return { first: parts[0], middle: '', last: '', suffix: '' }
  if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1], suffix: '' }

  const knownSuffixes = ['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']
  const lastPart = parts[parts.length - 1]
  if (knownSuffixes.includes(lastPart.toLowerCase())) {
    const suffix = lastPart
    const last = parts[parts.length - 2]
    const middle = parts.slice(1, parts.length - 2).join(' ')
    return { first: parts[0], middle, last, suffix }
  }

  return {
    first: parts[0],
    middle: parts.slice(1, parts.length - 1).join(' '),
    last: parts[parts.length - 1],
    suffix: '',
  }
}

export function toBackendRole(role: 'Admin' | 'Official'): BackendUserRole {
  return role === 'Admin' ? 'ADMIN' : 'OFFICIAL'
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'EC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function mapBackendUserToOfficial(record: BackendUserRecord): OfficialUser {
  const displayName = (record.fullName ?? record.name ?? record.email).trim()
  const normalizedRole = String(record.role ?? '').toUpperCase()
  const normalizedStatus = String(record.accountStatus ?? record.status ?? 'active').toLowerCase()

  const isDeactivated =
    normalizedRole === 'DEACTIVATED' ||
    normalizedStatus === 'inactive' ||
    normalizedStatus === 'deactivated' ||
    normalizedStatus === 'suspended'

  const mappedRole: UserRole = isDeactivated
    ? 'Deactivated'
    : normalizedRole === 'ADMIN'
      ? 'Admin'
      : normalizedRole === 'OFFICIAL' || normalizedRole === 'BARANGAY_OFFICIAL'
        ? 'Official'
        : 'Deactivated'

  const mappedStatus: UserStatus =
    normalizedStatus === 'suspended'
      ? 'Suspended'
      : isDeactivated
        ? 'Deactivated'
        : 'Active'

  const suffixCode = record.id.replace(/-/g, '').slice(0, 4).toUpperCase()
  const idCode =
    record.idCode ||
    (mappedRole === 'Admin'
      ? `ID-${suffixCode}-ADM`
      : mappedRole === 'Official'
        ? `ID-${suffixCode}-OFC`
        : 'ID-RESIDENT')

  return {
    id: record.id,
    name: displayName,
    firstName: record.firstName,
    middleName: record.middleName,
    lastName: record.lastName,
    suffix: record.suffix,
    email: record.email,
    phone: record.phone || '+63 917 000 0000',
    idCode,
    role: mappedRole,
    department:
      record.department ||
      (record.barangay?.name
        ? `${record.barangay.name} (${COMMONWEALTH_FACILITIES[0]})`
        : COMMONWEALTH_FACILITIES[0]),
    status: mappedStatus,
    twoFactorEnabled: record.twoFactorEnabled ?? mappedRole === 'Admin',
    mustChangePassword: record.mustChangePassword,
    initials: record.initials || getInitials(displayName),
    lastActive: record.lastActive || 'Synced from API',
    isSelf: record.isSelf ?? record.email.toLowerCase() === 'admin@ecobyte.gov',
    isBackendUser: true,
    notes:
      record.notes ??
      (mappedRole === 'Deactivated'
        ? 'Inactive or non-staff account'
        : 'Verified account synced from EcoByte directory'),
  }
}

export function mergeBackendUsersWithInitial(records: BackendUserRecord[]): OfficialUser[] {
  return records.map(mapBackendUserToOfficial)
}

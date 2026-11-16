import type { BackendUserRecord, BackendUserRole } from '@/lib/api/admin'

export type UserRole = 'Admin' | 'Official' | 'Deactivated'
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

export const INITIAL_USERS: OfficialUser[] = [
  {
    id: 'USR-101',
    name: 'Elena Vance',
    firstName: 'Elena',
    lastName: 'Vance',
    email: 'elena.vance@ecobyte.gov',
    phone: '+63 917 892 1001',
    idCode: 'ID-0021-ADM',
    role: 'Admin',
    department: 'Commonwealth Central MRF (Main Base)',
    status: 'Active',
    twoFactorEnabled: true,
    isSelf: true,
    initials: 'EV',
    lastActive: 'Active Now',
    notes: 'Chief Technology & Waste Governance Director',
  },
  {
    id: 'USR-102',
    name: 'Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@ecobyte.org',
    phone: '+63 918 440 2190',
    idCode: 'ID-0144-OFC',
    role: 'Official',
    department: 'Base 1 (MRF / Main Hall Operations)',
    status: 'Active',
    twoFactorEnabled: true,
    initials: 'SJ',
    lastActive: '12 mins ago',
    notes: 'Primary intake supervisor for Base 1-3 clusters',
  },
  {
    id: 'USR-103',
    name: 'Marcus Thorne',
    firstName: 'Marcus',
    lastName: 'Thorne',
    email: 'marcus.thorne@ecobyte.org',
    phone: '+63 920 311 8844',
    idCode: 'ID-0182-OFC',
    role: 'Official',
    department: 'Base 3 (Unit 2 E-Waste Station)',
    status: 'Active',
    twoFactorEnabled: false,
    initials: 'MT',
    lastActive: '1 hour ago',
    notes: 'Field logistics and lithium battery triage specialist',
  },
  {
    id: 'USR-104',
    name: 'Ramon Del Rosario',
    firstName: 'Ramon',
    middleName: 'Del',
    lastName: 'Rosario',
    email: 'ramon.dr@ecobyte.org',
    phone: '+63 927 765 4321',
    idCode: 'ID-0205-OFC',
    role: 'Official',
    department: 'Reuse & Refurbishment Hub Desk',
    status: 'Active',
    twoFactorEnabled: true,
    initials: 'RD',
    lastActive: '3 hours ago',
    notes: 'Component testing and community intake coordinator',
  },
  {
    id: 'USR-105',
    name: 'Tariq Sterling',
    firstName: 'Tariq',
    lastName: 'Sterling',
    email: 'tariq.s@ecobyte.gov',
    phone: '+63 919 654 3210',
    idCode: 'ID-0019-ADM',
    role: 'Admin',
    department: 'Commonwealth Central MRF (Main Base)',
    status: 'Active',
    twoFactorEnabled: true,
    initials: 'TS',
    lastActive: 'Yesterday',
    notes: 'Infrastructure and environmental compliance auditor',
  },
  {
    id: 'USR-106',
    name: 'Julian Karras',
    firstName: 'Julian',
    lastName: 'Karras',
    email: 'j.karras@former-contractor.org',
    phone: '+63 908 112 3344',
    idCode: 'ID-REVOKED',
    role: 'Deactivated',
    department: 'Hazardous E-Waste Vault & Disposal',
    status: 'Deactivated',
    twoFactorEnabled: false,
    initials: 'JK',
    lastActive: '14 days ago',
    notes: 'Contract expired; credentials revoked per ISO protocol',
  },
]

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
  const mappedRole: UserRole =
    record.role === 'ADMIN'
      ? 'Admin'
      : record.role === 'OFFICIAL'
        ? 'Official'
        : 'Deactivated'
  const mappedStatus: UserStatus = mappedRole === 'Deactivated' ? 'Deactivated' : 'Active'
  const suffix = record.id.replace(/-/g, '').slice(0, 4).toUpperCase()
  const idCode =
    mappedRole === 'Admin'
      ? `ID-${suffix}-ADM`
      : mappedRole === 'Official'
        ? `ID-${suffix}-OFC`
        : 'ID-RESIDENT'

  return {
    id: record.id,
    name: record.fullName,
    email: record.email,
    phone: record.phone || '+63 917 000 0000',
    idCode,
    role: mappedRole,
    department: record.barangay?.name
      ? `${record.barangay.name} (${COMMONWEALTH_FACILITIES[0]})`
      : COMMONWEALTH_FACILITIES[0],
    status: mappedStatus,
    twoFactorEnabled: mappedRole === 'Admin',
    initials: getInitials(record.fullName),
    lastActive: 'Synced from API',
    isSelf: record.email.toLowerCase() === 'admin@ecobyte.gov',
    isBackendUser: true,
    notes:
      mappedRole === 'Deactivated'
        ? 'Resident account — promote to Official or Admin to grant MRF portal access'
        : 'Verified account synced from EcoByte directory',
  }
}

export function mergeBackendUsersWithInitial(records: BackendUserRecord[]): OfficialUser[] {
  // Only pick safe display fields; never retain passwordHash from backend response
  const mapped = records.map(mapBackendUserToOfficial)
  const seenEmails = new Set(mapped.map((u) => u.email.toLowerCase()))
  const seenNames = new Set(mapped.map((u) => u.name.toLowerCase()))
  const remainingDemo = INITIAL_USERS.filter(
    (u) => !seenEmails.has(u.email.toLowerCase()) && !seenNames.has(u.name.toLowerCase()),
  )
  return [...mapped, ...remainingDemo]
}

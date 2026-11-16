import { useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'

export type UserRole = 'Admin' | 'Official' | 'Deactivated'
export type UserStatus = 'Active' | 'Suspended' | 'Deactivated'

export interface OfficialUser {
  id: string
  name: string
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
}

const COMMONWEALTH_FACILITIES = [
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

const INITIAL_USERS: OfficialUser[] = [
  {
    id: 'USR-101',
    name: 'Elena Vance',
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

function generateBadgeId(role: 'Admin' | 'Official'): string {
  const code = role === 'Admin' ? 'ADM' : 'OFC'
  const num = Math.floor(1000 + Math.random() * 9000)
  return `ID-${num}-${code}`
}

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
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

export const AdminAccessPage: FC = () => {
  const [users, setUsers] = useState<OfficialUser[]>(INITIAL_USERS)
  const [selectedUser, setSelectedUser] = useState<OfficialUser | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'official' | 'deactivated'>('all')

  // Form Fields State (Only Official and Admin)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formIdCode, setFormIdCode] = useState(generateBadgeId('Official'))
  const [formRole, setFormRole] = useState<'Admin' | 'Official'>('Official')
  const [formDepartment, setFormDepartment] = useState(COMMONWEALTH_FACILITIES[0])
  const [formStatus, setFormStatus] = useState<UserStatus>('Active')
  const [formTwoFactor, setFormTwoFactor] = useState(true)
  const [formMustChangePassword, setFormMustChangePassword] = useState(true)
  const [formPassword, setFormPassword] = useState('')
  const [formConfirmPassword, setFormConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formNotes, setFormNotes] = useState('')

  // Validation & Feedback State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSelectUser = (user: OfficialUser) => {
    setSelectedUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormPhone(user.phone)
    setFormIdCode(user.idCode)
    setFormRole(user.role === 'Admin' ? 'Admin' : 'Official')
    setFormDepartment(user.department || COMMONWEALTH_FACILITIES[0])
    setFormStatus(user.status || (user.role === 'Deactivated' ? 'Deactivated' : 'Active'))
    setFormTwoFactor(user.twoFactorEnabled)
    setFormMustChangePassword(user.mustChangePassword ?? false)
    setFormNotes(user.notes || '')
    // Reset password fields when selecting an existing user (they can optionally input a new one)
    setFormPassword('')
    setFormConfirmPassword('')
    setValidationErrors({})
    setFeedbackBanner(null)
  }

  const handleResetForm = () => {
    setSelectedUser(null)
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormIdCode(generateBadgeId('Official'))
    setFormRole('Official')
    setFormDepartment(COMMONWEALTH_FACILITIES[0])
    setFormStatus('Active')
    setFormTwoFactor(true)
    setFormMustChangePassword(true)
    setFormPassword('')
    setFormConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFormNotes('')
    setValidationErrors({})
    setFeedbackBanner(null)
  }

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*+'
    let generated = 'Eco#'
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormPassword(generated)
    setFormConfirmPassword(generated)
    setShowPassword(true)
    setShowConfirmPassword(true)
    if (validationErrors.password || validationErrors.confirmPassword) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next.password
        delete next.confirmPassword
        return next
      })
    }
  }

  const handleRoleChange = (newRole: 'Admin' | 'Official') => {
    if (selectedUser?.isSelf) return
    setFormRole(newRole)
    if (!selectedUser) {
      setFormIdCode(generateBadgeId(newRole))
    }
  }

  const handleRegenerateBadge = () => {
    setFormIdCode(generateBadgeId(formRole))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formName.trim()) {
      errors.name = 'Full name is required.'
    } else if (formName.trim().length < 2) {
      errors.name = 'Please provide a valid full name.'
    }

    if (!formEmail.trim()) {
      errors.email = 'Official email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Please enter a valid official email address.'
    }

    if (!formPhone.trim()) {
      errors.phone = 'Contact number is required.'
    }

    if (!formIdCode.trim()) {
      errors.idCode = 'Badge / ID Code is required.'
    }

    // Password validation: Required for new users, optional when updating
    if (!selectedUser) {
      if (!formPassword) {
        errors.password = 'Initial password is required for new accounts.'
      } else if (formPassword.length < 8) {
        errors.password = 'Password must be at least 8 characters.'
      }
      if (formPassword !== formConfirmPassword) {
        errors.confirmPassword = 'Passwords do not match.'
      }
    } else if (formPassword) {
      // If updating and entered a new password
      if (formPassword.length < 8) {
        errors.password = 'New password must be at least 8 characters.'
      }
      if (formPassword !== formConfirmPassword) {
        errors.confirmPassword = 'Passwords do not match.'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      setFeedbackBanner({
        type: 'error',
        message: 'Please review and resolve the highlighted errors before submitting.',
      })
      return
    }

    const calculatedInitials = formName
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OF'

    if (selectedUser) {
      // Update existing official
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: formName.trim(),
                email: formEmail.trim(),
                phone: formPhone.trim(),
                idCode: formIdCode.trim(),
                role: formStatus === 'Deactivated' ? 'Deactivated' : formRole,
                department: formDepartment,
                status: formStatus,
                twoFactorEnabled: formTwoFactor,
                mustChangePassword: formMustChangePassword,
                notes: formNotes.trim(),
                initials: calculatedInitials,
                lastActive: 'Updated Just Now',
              }
            : u,
        ),
      )
      setFeedbackBanner({
        type: 'success',
        message: `Successfully updated profile & credentials for ${formName.trim()} (${formIdCode}).`,
      })
    } else {
      // Create new official
      const newUser: OfficialUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        idCode: formIdCode.trim(),
        role: formStatus === 'Deactivated' ? 'Deactivated' : formRole,
        department: formDepartment,
        status: formStatus,
        twoFactorEnabled: formTwoFactor,
        mustChangePassword: formMustChangePassword,
        notes: formNotes.trim(),
        initials: calculatedInitials,
        lastActive: 'Enrolled Today',
      }
      setUsers((prev) => [newUser, ...prev])
      setFeedbackBanner({
        type: 'success',
        message: `Official identity ${newUser.name} enrolled with badge ${newUser.idCode}.`,
      })
    }

    handleResetForm()
  }

  const handleDeactivate = () => {
    if (!selectedUser || selectedUser.isSelf) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, role: 'Deactivated' as const, status: 'Deactivated' as const, idCode: 'ID-REVOKED' }
          : u,
      ),
    )
    setFeedbackBanner({
      type: 'success',
      message: `Account for ${selectedUser.name} has been deactivated and access tokens revoked.`,
    })
    handleResetForm()
  }

  const handleReactivate = () => {
    if (!selectedUser) return
    const restoredCode = generateBadgeId(formRole)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, role: formRole, status: 'Active' as const, idCode: restoredCode }
          : u,
      ),
    )
    setFeedbackBanner({
      type: 'success',
      message: `Account for ${selectedUser.name} reactivated with fresh badge ID ${restoredCode}.`,
    })
    handleResetForm()
  }

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'admin' && u.role !== 'Admin') return false
    if (filterRole === 'official' && u.role !== 'Official') return false
    if (filterRole === 'deactivated' && u.role !== 'Deactivated') return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.idCode.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    )
  })

  const passwordStrength = calculatePasswordStrength(formPassword)
  const isPasswordsMatching = formPassword && formConfirmPassword && formPassword === formConfirmPassword
  const isPasswordsMismatch = formConfirmPassword && formPassword !== formConfirmPassword

  const activeAdminsCount = users.filter((u) => u.role === 'Admin' && u.status === 'Active').length
  const activeOfficialsCount = users.filter((u) => u.role === 'Official' && u.status === 'Active').length
  const deactivatedCount = users.filter((u) => u.role === 'Deactivated' || u.status === 'Deactivated').length
  const twoFactorPercent = Math.round((users.filter((u) => u.twoFactorEnabled).length / users.length) * 100)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* ── Page Header & Metrics Summary Bar ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Security Infrastructure
              </Typography>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                Access &amp; Identity Management
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
                color: '#0b1c30',
                letterSpacing: '-0.025em',
              }}
            >
              Access &amp; Identity Management
            </Typography>
          </Box>

          {/* Quick Status Badges */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 0.85,
                borderRadius: '8px',
                backgroundColor: '#eff4ff',
                border: '1px solid #dce9ff',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '9999px',
                  backgroundColor: '#16a34a',
                  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                RBAC Mode: Enforced
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.85,
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <SecurityRoundedIcon sx={{ fontSize: 15, color: '#16a34a' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>
                2FA Coverage: {twoFactorPercent}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Telemetry Strip */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              p: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active Administrators
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1 }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {activeAdminsCount}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '9999px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                <ShieldRoundedIcon sx={{ fontSize: 13 }} />
                <span>Tier 1 Authority</span>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              p: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Field Officials
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1 }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {activeOfficialsCount}
              </Typography>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '9999px',
                  backgroundColor: '#eff4ff',
                  color: '#1e40af',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                Intake &amp; Manifest Auth
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              p: 2,
              border: '1px solid #fee2e2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
              Deactivated Accounts
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1 }}>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>
                {deactivatedCount}
              </Typography>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '9999px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                Tokens Revoked
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Global Feedback Banner */}
      {feedbackBanner && (
        <Box
          sx={{
            p: 1.75,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedbackBanner.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: '1px solid',
            borderColor: feedbackBanner.type === 'success' ? '#86efac' : '#fca5a5',
            color: feedbackBanner.type === 'success' ? '#14532d' : '#991b1b',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {feedbackBanner.type === 'success' ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
            ) : (
              <ErrorOutlineRoundedIcon sx={{ fontSize: 20, color: '#dc2626' }} />
            )}
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              {feedbackBanner.message}
            </Typography>
          </Box>
          <ButtonBase
            onClick={() => setFeedbackBanner(null)}
            sx={{ p: 0.5, borderRadius: '4px', '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </ButtonBase>
        </Box>
      )}

      {/* ── Primary Workspace: Two-Panel Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 6fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* LEFT PANEL: Official Directory */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldRoundedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
                Access Directory
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748b' }}>
              {users.length} IDENTITIES REGISTERED
            </Typography>
          </Box>

          {/* Search Input */}
          <Box sx={{ position: 'relative', width: '100%' }}>
            <SearchRoundedIcon
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: 18,
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, badge ID, or facility..."
              style={{
                width: '100%',
                height: 38,
                paddingLeft: 34,
                paddingRight: 12,
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.8125rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </Box>

          {/* Filter Quick Toggles (All, Admin, Official, Deactivated) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.5 }}>
            {[
              { id: 'all', label: `All (${users.length})` },
              { id: 'admin', label: `Admin (${users.filter((u) => u.role === 'Admin').length})` },
              { id: 'official', label: `Official (${users.filter((u) => u.role === 'Official').length})` },
              { id: 'deactivated', label: `Deactivated (${users.filter((u) => u.role === 'Deactivated').length})` },
            ].map((tab) => {
              const active = filterRole === tab.id
              return (
                <ButtonBase
                  key={tab.id}
                  onClick={() => setFilterRole(tab.id as typeof filterRole)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: active ? '#eff4ff' : '#ffffff',
                    color: active ? '#0f172a' : '#64748b',
                    border: '1px solid',
                    borderColor: active ? '#93c5fd' : '#e2e8f0',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </ButtonBase>
              )
            })}
          </Box>

          {/* Official List Table */}
          <Box
            sx={{
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #e2e8f0', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  <th style={{ padding: '10px 14px' }}>User &amp; Credential</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Role &amp; Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                      No officials match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isDeactivated = user.role === 'Deactivated' || user.status === 'Deactivated'
                    const isSelected = selectedUser?.id === user.id

                    const roleColor =
                      user.role === 'Admin'
                        ? '#16a34a'
                        : isDeactivated
                          ? '#dc2626'
                          : '#006a61'

                    return (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        style={{
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isSelected ? '#eff4ff' : 'transparent',
                          borderLeft: `4px solid ${roleColor}`,
                          opacity: isDeactivated ? 0.75 : 1,
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                background: user.role === 'Admin'
                                  ? 'linear-gradient(135deg, rgb(21, 128, 61), rgb(34, 197, 94))'
                                  : isDeactivated
                                    ? '#fee2e2'
                                    : '#006a61',
                                color: isDeactivated ? '#dc2626' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                flexShrink: 0,
                              }}
                            >
                              {user.initials}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    textDecoration: isDeactivated ? 'line-through' : 'none',
                                  }}
                                >
                                  {user.name}
                                </span>
                                {user.isSelf && (
                                  <span
                                    style={{
                                      fontSize: '0.5625rem',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      padding: '2px 6px',
                                      borderRadius: 4,
                                      backgroundColor: '#dcfce7',
                                      color: '#15803d',
                                    }}
                                  >
                                    You
                                  </span>
                                )}
                                {user.twoFactorEnabled && (
                                  <span
                                    style={{
                                      fontSize: '0.5625rem',
                                      fontWeight: 700,
                                      padding: '2px 5px',
                                      borderRadius: 4,
                                      backgroundColor: '#eff4ff',
                                      color: '#1d4ed8',
                                    }}
                                    title="Two-Factor Authentication Protected"
                                  >
                                    2FA
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                                {user.email} • <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{user.idCode}</span>
                              </div>
                              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>{user.phone}</span>
                                <span>•</span>
                                <span style={{ color: '#475569' }}>{user.department}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right', verticalAlign: 'top' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              backgroundColor: roleColor,
                              color: '#ffffff',
                            }}
                          >
                            {user.role}
                          </span>
                          <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 4 }}>
                            {user.lastActive}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </Box>

          {/* Compliance Mini Footer inside Left Directory */}
          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#64748b',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PolicyOutlinedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
              <span>ISO 27001 Access Ledger Enforced</span>
            </Box>
            <ButtonBase
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2))
                const downloadAnchor = document.createElement('a')
                downloadAnchor.setAttribute('href', dataStr)
                downloadAnchor.setAttribute('download', `ecobyte_official_directory_${new Date().toISOString().slice(0, 10)}.json`)
                document.body.appendChild(downloadAnchor)
                downloadAnchor.click()
                downloadAnchor.remove()
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 700,
                color: '#0f172a',
                textDecoration: 'underline',
              }}
            >
              <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
              <span>Export SEC Log</span>
            </ButtonBase>
          </Box>
        </Box>

        {/* RIGHT PANEL: Scrollable Form with Locked Action Bar */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: 'none', lg: 'calc(100vh - 140px)' },
            position: { xs: 'static', lg: 'sticky' },
            top: { xs: 'auto', lg: 24 },
            overflow: 'hidden',
          }}
        >
          {/* Header - Fixed Top */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  {selectedUser ? 'Identity Modification' : 'Credential Enrollment'}
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedUser ? `Edit ${selectedUser.name}` : 'Enroll New Official'}
                </Typography>
              </Box>
              <ButtonBase
                onClick={handleResetForm}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#e2e8f0' },
                }}
                title="Reset Form / Clear Selection"
              >
                <PersonAddRoundedIcon sx={{ fontSize: 16 }} />
                <span>New Official</span>
              </ButtonBase>
            </Box>

            {/* Self demotion warning */}
            {selectedUser?.isSelf && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 18, color: '#dc2626', mt: 0.25 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.3 }}>
                  <strong>Protected Session Constraint:</strong> You are currently logged in with this account. You cannot demote or deactivate your own account.
                </Typography>
              </Box>
            )}
          </Box>

          {/* SCROLLABLE INNER BODY */}
          <Box
            sx={{
              p: 3,
              pt: 2.5,
              pb: 2.5,
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              /* Subtle custom scrollbar */
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { backgroundColor: '#f8fafc' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 3 },
              '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#94a3b8' },
            }}
          >
            {/* SECTION 1: Personal & Contact Information */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Personal &amp; Contact Information
              </Typography>

              {/* Official Full Name */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    Full Name <span style={{ color: '#dc2626' }}>*</span>
                  </Typography>
                  {validationErrors.name && (
                    <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                      {validationErrors.name}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <PersonOutlineRoundedIcon
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: 18,
                    }}
                  />
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    placeholder="e.g. Kenneth Adams"
                    style={{
                      width: '100%',
                      height: 40,
                      paddingLeft: 38,
                      paddingRight: 12,
                      borderRadius: 8,
                      border: `1px solid ${validationErrors.name ? '#ef4444' : '#cbd5e1'}`,
                      backgroundColor: '#f8fafc',
                      fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                      fontSize: '0.8125rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </Box>
              </Box>

              {/* Email Address & Phone Number Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                {/* Official Email */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    Official Email <span style={{ color: '#dc2626' }}>*</span>
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <MailOutlineRoundedIcon
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: 18,
                      }}
                    />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => {
                        setFormEmail(e.target.value)
                        if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: '' }))
                      }}
                      placeholder="official@ecobyte.gov"
                      style={{
                        width: '100%',
                        height: 40,
                        paddingLeft: 38,
                        paddingRight: 12,
                        borderRadius: 8,
                        border: `1px solid ${validationErrors.email ? '#ef4444' : '#cbd5e1'}`,
                        backgroundColor: '#f8fafc',
                        fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </Box>
                  {validationErrors.email && (
                    <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                      {validationErrors.email}
                    </Typography>
                  )}
                </Box>

                {/* Mobile / Contact Number */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    Mobile / Contact <span style={{ color: '#dc2626' }}>*</span>
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <PhoneRoundedIcon
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: 18,
                      }}
                    />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => {
                        setFormPhone(e.target.value)
                        if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: '' }))
                      }}
                      placeholder="+63 9XX XXX XXXX"
                      style={{
                        width: '100%',
                        height: 40,
                        paddingLeft: 38,
                        paddingRight: 12,
                        borderRadius: 8,
                        border: `1px solid ${validationErrors.phone ? '#ef4444' : '#cbd5e1'}`,
                        backgroundColor: '#f8fafc',
                        fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </Box>
                  {validationErrors.phone && (
                    <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                      {validationErrors.phone}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Official Badge ID Code */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    Badge / Employee ID <span style={{ color: '#dc2626' }}>*</span>
                  </Typography>
                  <ButtonBase
                    onClick={handleRegenerateBadge}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#16a34a',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    <RefreshRoundedIcon sx={{ fontSize: 13 }} />
                    <span>Generate New ID</span>
                  </ButtonBase>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <BadgeOutlinedIcon
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: 18,
                    }}
                  />
                  <input
                    type="text"
                    value={formIdCode}
                    onChange={(e) => setFormIdCode(e.target.value)}
                    placeholder="ID-0000-OFC"
                    style={{
                      width: '100%',
                      height: 40,
                      paddingLeft: 38,
                      paddingRight: 12,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* SECTION 2: Role, Assignment & Facility */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                2. Role &amp; Facility Assignment
              </Typography>

              {/* Role Selection Tabs (Official & Admin ONLY) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    Assigned Authority Role
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 700 }}>
                    {formRole === 'Admin' ? 'Super Admin Privileges' : 'Triage, Inspect & Log E-Waste'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, p: 0.5, borderRadius: '8px', backgroundColor: '#f1f5f9' }}>
                  <ButtonBase
                    onClick={() => handleRoleChange('Official')}
                    disabled={selectedUser?.isSelf}
                    sx={{
                      flex: 1,
                      py: 1.1,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: formRole === 'Official' ? '#006a61' : 'transparent',
                      color: formRole === 'Official' ? '#ffffff' : '#475569',
                      boxShadow: formRole === 'Official' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Official</span>
                  </ButtonBase>

                  <ButtonBase
                    onClick={() => handleRoleChange('Admin')}
                    sx={{
                      flex: 1,
                      py: 1.1,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: formRole === 'Admin' ? '#16a34a' : 'transparent',
                      color: formRole === 'Admin' ? '#ffffff' : '#475569',
                      boxShadow: formRole === 'Admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ShieldRoundedIcon sx={{ fontSize: 16 }} />
                    <span>Admin</span>
                  </ButtonBase>
                </Box>
              </Box>

              {/* Assigned Facility Dropdown */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  Assigned Barangay Facility / Sector
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <BusinessRoundedIcon
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: 18,
                      pointerEvents: 'none',
                    }}
                  />
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      height: 40,
                      paddingLeft: 38,
                      paddingRight: 12,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                      fontSize: '0.8125rem',
                      color: '#0f172a',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {COMMONWEALTH_FACILITIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </Box>
              </Box>

              {/* Account Status Selection */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  Account Operational Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['Active', 'Suspended', 'Deactivated'] as UserStatus[]).map((st) => {
                    const isCurrent = formStatus === st
                    return (
                      <ButtonBase
                        key={st}
                        onClick={() => setFormStatus(st)}
                        disabled={selectedUser?.isSelf && st !== 'Active'}
                        sx={{
                          flex: 1,
                          py: 0.75,
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: isCurrent
                            ? st === 'Active'
                              ? '#dcfce7'
                              : st === 'Suspended'
                                ? '#fef3c7'
                                : '#fee2e2'
                            : '#f8fafc',
                          color: isCurrent
                            ? st === 'Active'
                              ? '#15803d'
                              : st === 'Suspended'
                                ? '#b45309'
                                : '#dc2626'
                            : '#64748b',
                          border: '1px solid',
                          borderColor: isCurrent
                            ? st === 'Active'
                              ? '#86efac'
                              : st === 'Suspended'
                                ? '#fcd34d'
                                : '#fca5a5'
                            : '#e2e8f0',
                        }}
                      >
                        {st}
                      </ButtonBase>
                    )
                  })}
                </Box>
              </Box>
            </Box>

            {/* SECTION 3: Security Credentials & Passwords */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  3. Security &amp; Passwords
                </Typography>
                <ButtonBase
                  onClick={handleGeneratePassword}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: '6px',
                    backgroundColor: '#eff4ff',
                    color: '#1d4ed8',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    border: '1px solid #bfdbfe',
                    '&:hover': { backgroundColor: '#dbeafe' },
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
                  <span>Auto-Generate Password</span>
                </ButtonBase>
              </Box>

              {/* Password Input Field */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedUser ? 'New Password (leave blank to retain current)' : 'Account Password *'}
                  </Typography>
                  {formPassword && (
                    <Typography
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        color: passwordStrength.color,
                      }}
                    >
                      Strength: {passwordStrength.label}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <KeyRoundedIcon
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: 18,
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => {
                      setFormPassword(e.target.value)
                      if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: '' }))
                    }}
                    placeholder={selectedUser ? '••••••••  (Leave blank if unchanged)' : 'Enter strong password (min 8 chars)'}
                    style={{
                      width: '100%',
                      height: 40,
                      paddingLeft: 38,
                      paddingRight: 40,
                      borderRadius: 8,
                      border: `1px solid ${validationErrors.password ? '#ef4444' : '#cbd5e1'}`,
                      backgroundColor: '#f8fafc',
                      fontFamily: showPassword ? "'Rethink Sans', 'Inter', sans-serif" : 'monospace',
                      fontSize: '0.8125rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                  <ButtonBase
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      p: 0.5,
                      borderRadius: '4px',
                      color: '#64748b',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </ButtonBase>
                </Box>
                {validationErrors.password && (
                  <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                    {validationErrors.password}
                  </Typography>
                )}

                {/* Password Strength Meter Bar */}
                {formPassword && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {[1, 2, 3, 4].map((step) => (
                      <Box
                        key={step}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: step <= passwordStrength.score ? passwordStrength.color : '#e2e8f0',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Confirm Password Input Field */}
              {(formPassword || !selectedUser) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                      Confirm Password
                    </Typography>
                    {isPasswordsMatching && (
                      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <CheckRoundedIcon sx={{ fontSize: 13 }} />
                        <span>Passwords match</span>
                      </Typography>
                    )}
                    {isPasswordsMismatch && (
                      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626' }}>
                        Passwords do not match
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <LockOutlinedIcon
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: 18,
                      }}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formConfirmPassword}
                      onChange={(e) => {
                        setFormConfirmPassword(e.target.value)
                        if (validationErrors.confirmPassword) setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }))
                      }}
                      placeholder="Repeat password to verify"
                      style={{
                        width: '100%',
                        height: 40,
                        paddingLeft: 38,
                        paddingRight: 40,
                        borderRadius: 8,
                        border: `1px solid ${validationErrors.confirmPassword || isPasswordsMismatch ? '#ef4444' : '#cbd5e1'}`,
                        backgroundColor: '#f8fafc',
                        fontFamily: showConfirmPassword ? "'Rethink Sans', 'Inter', sans-serif" : 'monospace',
                        fontSize: '0.8125rem',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                    <ButtonBase
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        p: 0.5,
                        borderRadius: '4px',
                        color: '#64748b',
                      }}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                      )}
                    </ButtonBase>
                  </Box>
                  {validationErrors.confirmPassword && (
                    <Typography sx={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                      {validationErrors.confirmPassword}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Checkbox Options: Force Password Change & 2FA Enforcement */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={formMustChangePassword}
                    onChange={(e) => setFormMustChangePassword(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    Require password reset upon first official sign-in
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={formTwoFactor}
                    onChange={(e) => setFormTwoFactor(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    Enforce Two-Factor Authentication (SMS OTP / Authenticator App)
                  </span>
                </label>
              </Box>
            </Box>

            {/* SECTION 4: Administrative Notes (Optional) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Administrative Notes &amp; Scope Justification
              </Typography>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Assigned to morning intake triage at Commonwealth MRF; clearance issued by Brgy Captain."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </Box>

            {/* Scope Overview Box */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: '#eff4ff',
                border: '1px solid #dce9ff',
              }}
            >
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Assigned Permissions Scope
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#0f172a', mt: 0.5, lineHeight: 1.4 }}>
                {formRole === 'Admin'
                  ? 'Full administrative governance, RBAC management, downstream manifest signing, credential provisioning, and compliance auditing.'
                  : 'Authorized to inspect incoming e-waste, record battery diagnostics, assign condition grades, and mark units ready for Reuse Hub.'}
              </Typography>
            </Box>
          </Box>

          {/* LOCKED FOOTER & ACTION BUTTONS - FIXED AT BOTTOM */}
          <Box
            sx={{
              p: 2.5,
              pt: 2,
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <ButtonBase
              onClick={handleSave}
              sx={{
                width: '100%',
                height: 44,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgb(22, 163, 74) 0%, rgb(34, 197, 94) 100%)',
                color: '#ffffff',
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                transition: 'opacity 0.15s ease',
                '&:hover': { opacity: 0.95 },
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
              <span>{selectedUser ? 'Save & Update Identity' : 'Enroll Official & Issue Credentials'}</span>
            </ButtonBase>

            {selectedUser && !selectedUser.isSelf && selectedUser.role !== 'Deactivated' && (
              <ButtonBase
                onClick={handleDeactivate}
                sx={{
                  width: '100%',
                  height: 38,
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  '&:hover': { backgroundColor: '#fecaca' },
                }}
              >
                <PersonOffOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Deactivate Identity &amp; Revoke Credentials</span>
              </ButtonBase>
            )}

            {selectedUser && selectedUser.role === 'Deactivated' && (
              <ButtonBase
                onClick={handleReactivate}
                sx={{
                  width: '100%',
                  height: 38,
                  borderRadius: '8px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  '&:hover': { backgroundColor: '#bbf7d0' },
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                <span>Reactivate Official &amp; Issue Fresh Badge</span>
              </ButtonBase>
            )}

            {/* Compliance Note */}
            <Box
              sx={{
                pt: 1,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.6875rem',
                color: '#64748b',
              }}
            >
              <span style={{ fontStyle: 'italic' }}>Complies with QC E-Governance Security Mandate</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}>SEC-V4.4</span>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default AdminAccessPage

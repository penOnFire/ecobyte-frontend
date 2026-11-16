import { useEffect, useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { adminApi } from '@/lib/api'
import {
  COMMONWEALTH_FACILITIES,
  INITIAL_USERS,
  generateBadgeId,
  mergeBackendUsersWithInitial,
  parseNameParts,
  toBackendRole,
} from '@/components/admin/adminAccessData'
import type { OfficialUser, UserStatus } from '@/components/admin/adminAccessData'
import {
  AdminAccessDirectoryPanel,
  type AccessRoleFilter,
} from '@/components/admin/AdminAccessDirectoryPanel'
import { AdminAccessEditorPanel } from '@/components/admin/AdminAccessEditorPanel'

export const AdminAccessPage: FC = () => {
  const [users, setUsers] = useState<OfficialUser[]>(INITIAL_USERS)
  const [selectedUser, setSelectedUser] = useState<OfficialUser | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<AccessRoleFilter>('all')
  const [isSaving, setIsSaving] = useState(false)

  // Form Fields State
  const [formFirstName, setFormFirstName] = useState('')
  const [formMiddleName, setFormMiddleName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formSuffix, setFormSuffix] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formIdCode, setFormIdCode] = useState(() => generateBadgeId('Official'))
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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .getUsers()
      .then((records) => {
        if (!active || !Array.isArray(records) || records.length === 0) return
        setUsers(mergeBackendUsersWithInitial(records))
      })
      .catch((err) => {
        console.warn('Could not load live admin directory, using fallback entries:', err)
      })
    return () => {
      active = false
    }
  }, [])

  const resetFormFields = (clearBanner = true) => {
    setSelectedUser(null)
    setFormFirstName('')
    setFormMiddleName('')
    setFormLastName('')
    setFormSuffix('')
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
    if (clearBanner) {
      setFeedbackBanner(null)
    }
  }

  const handleSelectUser = (user: OfficialUser) => {
    setSelectedUser(user)
    const { first, middle, last, suffix } = parseNameParts(user)
    setFormFirstName(first)
    setFormMiddleName(middle)
    setFormLastName(last)
    setFormSuffix(suffix)
    setFormEmail(user.email)
    setFormPhone(user.phone)
    setFormIdCode(user.idCode)
    setFormRole(user.role === 'Admin' ? 'Admin' : 'Official')
    setFormDepartment(user.department || COMMONWEALTH_FACILITIES[0])
    setFormStatus(user.status || (user.role === 'Deactivated' ? 'Deactivated' : 'Active'))
    setFormTwoFactor(user.twoFactorEnabled)
    setFormMustChangePassword(user.mustChangePassword ?? false)
    setFormNotes(user.notes || '')
    setFormPassword('')
    setFormConfirmPassword('')
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
    setValidationErrors((prev) => {
      if (!prev.password && !prev.confirmPassword) return prev
      const next = { ...prev }
      delete next.password
      delete next.confirmPassword
      return next
    })
  }

  const handleRoleChange = (newRole: 'Admin' | 'Official') => {
    if (selectedUser?.isSelf) return
    setFormRole(newRole)
    if (!selectedUser) {
      setFormIdCode(generateBadgeId(newRole))
    }
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formFirstName.trim()) errors.firstName = 'First name is required.'
    if (!formLastName.trim()) errors.lastName = 'Last name is required.'
    if (!formEmail.trim()) {
      errors.email = 'Official email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Please enter a valid official email address.'
    }
    if (!formPhone.trim()) errors.phone = 'Contact number is required.'
    if (!formIdCode.trim()) errors.idCode = 'Badge / ID Code is required.'

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

  const syncRoleIfBackendUser = async (
    user: OfficialUser,
    backendRole: 'RESIDENT' | 'OFFICIAL' | 'ADMIN',
  ): Promise<boolean> => {
    if (!user.isBackendUser) return false
    try {
      await adminApi.updateUserRole(user.id, backendRole)
      return true
    } catch (err) {
      console.warn('Role update failed against backend API:', err)
      return false
    }
  }

  const handleSave = async () => {
    if (!validate()) {
      setFeedbackBanner({
        type: 'error',
        message: 'Please review and resolve the highlighted errors before submitting.',
      })
      return
    }

    const constructedFullName = [
      formFirstName.trim(),
      formMiddleName.trim(),
      formLastName.trim(),
      formSuffix.trim(),
    ]
      .filter(Boolean)
      .join(' ')

    const calculatedInitials =
      ((formFirstName.trim()[0] || '') + (formLastName.trim()[0] || '')).toUpperCase() || 'OF'

    setIsSaving(true)
    try {
      if (selectedUser) {
        const targetBackendRole =
          formStatus === 'Deactivated' ? 'RESIDENT' : toBackendRole(formRole)
        const synced = await syncRoleIfBackendUser(selectedUser, targetBackendRole)

        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  name: constructedFullName,
                  firstName: formFirstName.trim(),
                  middleName: formMiddleName.trim(),
                  lastName: formLastName.trim(),
                  suffix: formSuffix.trim(),
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
                  lastActive: synced ? 'Synced just now' : 'Updated locally',
                }
              : u,
          ),
        )
        setFeedbackBanner({
          type: 'success',
          message: synced
            ? `Saved role & profile for ${constructedFullName} (${formIdCode}) to the server.`
            : `Updated profile & credentials for ${constructedFullName} (${formIdCode}) in this session.`,
        })
      } else {
        const newUser: OfficialUser = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          name: constructedFullName,
          firstName: formFirstName.trim(),
          middleName: formMiddleName.trim(),
          lastName: formLastName.trim(),
          suffix: formSuffix.trim(),
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
          lastActive: 'Enrolled locally',
        }
        setUsers((prev) => [newUser, ...prev])
        setFeedbackBanner({
          type: 'success',
          message: `Official identity ${newUser.name} enrolled locally with badge ${newUser.idCode}.`,
        })
      }

      resetFormFields(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedUser || selectedUser.isSelf) return
    setIsSaving(true)
    try {
      const synced = await syncRoleIfBackendUser(selectedUser, 'RESIDENT')
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                role: 'Deactivated' as const,
                status: 'Deactivated' as const,
                idCode: 'ID-REVOKED',
                lastActive: synced ? 'Revoked on server' : u.lastActive,
              }
            : u,
        ),
      )
      setFeedbackBanner({
        type: 'success',
        message: `Account for ${selectedUser.name} has been deactivated and official access revoked.`,
      })
      resetFormFields(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReactivate = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    try {
      const restoredCode = generateBadgeId(formRole)
      const synced = await syncRoleIfBackendUser(selectedUser, toBackendRole(formRole))
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                role: formRole,
                status: 'Active' as const,
                idCode: restoredCode,
                lastActive: synced ? 'Synced just now' : 'Reactivated locally',
              }
            : u,
        ),
      )
      setFeedbackBanner({
        type: 'success',
        message: `Account for ${selectedUser.name} reactivated with fresh badge ID ${restoredCode}.`,
      })
      resetFormFields(false)
    } finally {
      setIsSaving(false)
    }
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

  const activeAdminsCount = users.filter((u) => u.role === 'Admin' && u.status === 'Active').length
  const activeOfficialsCount = users.filter(
    (u) => u.role === 'Official' && u.status === 'Active',
  ).length
  const deactivatedCount = users.filter(
    (u) => u.role === 'Deactivated' || u.status === 'Deactivated',
  ).length
  const twoFactorPercent =
    users.length > 0
      ? Math.round((users.filter((u) => u.twoFactorEnabled).length / users.length) * 100)
      : 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* Page Header & Metrics Summary Bar */}
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
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                Security Infrastructure
              </Typography>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#16a34a',
                  textTransform: 'uppercase',
                }}
              >
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
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569',
                  fontFamily: 'monospace',
                }}
              >
                2FA Coverage: {twoFactorPercent}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Telemetry Strip */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              p: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Active Administrators
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                mt: 1,
              }}
            >
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
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Field Officials
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                mt: 1,
              }}
            >
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
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#dc2626',
                textTransform: 'uppercase',
              }}
            >
              Deactivated Accounts
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                mt: 1,
              }}
            >
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

      {/* Primary Workspace: Two-Panel Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 6fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <AdminAccessDirectoryPanel
          users={users}
          filteredUsers={filteredUsers}
          selectedUserId={selectedUser?.id ?? null}
          search={search}
          filterRole={filterRole}
          onSearchChange={setSearch}
          onFilterRoleChange={setFilterRole}
          onSelectUser={handleSelectUser}
        />

        <AdminAccessEditorPanel
          selectedUser={selectedUser}
          isSaving={isSaving}
          formFirstName={formFirstName}
          formMiddleName={formMiddleName}
          formLastName={formLastName}
          formSuffix={formSuffix}
          formEmail={formEmail}
          formPhone={formPhone}
          formIdCode={formIdCode}
          formRole={formRole}
          formDepartment={formDepartment}
          formStatus={formStatus}
          formTwoFactor={formTwoFactor}
          formMustChangePassword={formMustChangePassword}
          formPassword={formPassword}
          formConfirmPassword={formConfirmPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          formNotes={formNotes}
          validationErrors={validationErrors}
          onResetForm={() => resetFormFields(true)}
          onFirstNameChange={(val) => {
            setFormFirstName(val)
            if (validationErrors.firstName) {
              setValidationErrors((prev) => ({ ...prev, firstName: '' }))
            }
          }}
          onMiddleNameChange={setFormMiddleName}
          onLastNameChange={(val) => {
            setFormLastName(val)
            if (validationErrors.lastName) {
              setValidationErrors((prev) => ({ ...prev, lastName: '' }))
            }
          }}
          onSuffixChange={setFormSuffix}
          onEmailChange={(val) => {
            setFormEmail(val)
            if (validationErrors.email) {
              setValidationErrors((prev) => ({ ...prev, email: '' }))
            }
          }}
          onPhoneChange={(val) => {
            setFormPhone(val)
            if (validationErrors.phone) {
              setValidationErrors((prev) => ({ ...prev, phone: '' }))
            }
          }}
          onIdCodeChange={setFormIdCode}
          onRegenerateBadge={() => setFormIdCode(generateBadgeId(formRole))}
          onRoleChange={handleRoleChange}
          onDepartmentChange={setFormDepartment}
          onStatusChange={setFormStatus}
          onGeneratePassword={handleGeneratePassword}
          onPasswordChange={(val) => {
            setFormPassword(val)
            if (validationErrors.password) {
              setValidationErrors((prev) => ({ ...prev, password: '' }))
            }
          }}
          onConfirmPasswordChange={(val) => {
            setFormConfirmPassword(val)
            if (validationErrors.confirmPassword) {
              setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }
          }}
          onToggleShowPassword={() => setShowPassword((p) => !p)}
          onToggleShowConfirmPassword={() => setShowConfirmPassword((p) => !p)}
          onMustChangePasswordChange={setFormMustChangePassword}
          onTwoFactorChange={setFormTwoFactor}
          onNotesChange={setFormNotes}
          onSave={handleSave}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
        />
      </Box>
    </Box>
  )
}

export default AdminAccessPage

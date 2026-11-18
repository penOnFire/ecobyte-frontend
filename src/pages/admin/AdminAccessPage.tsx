import { useEffect, useState, type FC } from 'react'
import { Box, ButtonBase, Drawer, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import { adminApi } from '@/lib/api'
import {
  COMMONWEALTH_FACILITIES,
  INITIAL_USERS,
  generateBadgeId,
  mapBackendUserToOfficial,
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
  const [filterBarangay, setFilterBarangay] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEnrollmentDrawerOpen, setIsEnrollmentDrawerOpen] = useState(false)

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
    setIsEnrollmentDrawerOpen(true)
  }

  const handleOpenAddUser = () => {
    resetFormFields(true)
    setIsEnrollmentDrawerOpen(true)
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
        if (selectedUser.isBackendUser) {
          const updatedRecord = await adminApi.updateUser(selectedUser.id, {
            fullName: constructedFullName,
            firstName: formFirstName.trim(),
            middleName: formMiddleName.trim() || undefined,
            lastName: formLastName.trim(),
            suffix: formSuffix.trim() || undefined,
            email: formEmail.trim(),
            phone: formPhone.trim(),
            idCode: formIdCode.trim(),
            role: toBackendRole(formRole),
            department: formDepartment,
            status: formStatus,
            twoFactorEnabled: formTwoFactor,
            mustChangePassword: formMustChangePassword,
            notes: formNotes.trim() || undefined,
            password: formPassword || undefined,
          })
          const mapped = mapBackendUserToOfficial(updatedRecord)
          setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? mapped : u)))
          setFeedbackBanner({
            type: 'success',
            message: `Saved profile & credentials for ${mapped.name} (${mapped.idCode}) to PostgreSQL.`,
          })
        } else {
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
                    lastActive: 'Updated locally',
                  }
                : u,
            ),
          )
          setFeedbackBanner({
            type: 'success',
            message: `Updated demo profile for ${constructedFullName} (${formIdCode}) in this session.`,
          })
        }
      } else {
        const createdRecord = await adminApi.createUser({
          fullName: constructedFullName,
          firstName: formFirstName.trim(),
          middleName: formMiddleName.trim() || undefined,
          lastName: formLastName.trim(),
          suffix: formSuffix.trim() || undefined,
          email: formEmail.trim(),
          phone: formPhone.trim(),
          idCode: formIdCode.trim(),
          role: toBackendRole(formRole),
          department: formDepartment,
          status: formStatus,
          twoFactorEnabled: formTwoFactor,
          mustChangePassword: formMustChangePassword,
          notes: formNotes.trim() || undefined,
          password: formPassword,
        })
        const mapped = mapBackendUserToOfficial(createdRecord)
        setUsers((prev) => [mapped, ...prev])
        setFeedbackBanner({
          type: 'success',
          message: `Official identity ${mapped.name} enrolled in PostgreSQL with badge ${mapped.idCode}.`,
        })
      }

      resetFormFields(false)
    } catch (err: any) {
      setFeedbackBanner({
        type: 'error',
        message: err?.message || 'Failed to save official credentials to the server.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedUser || selectedUser.isSelf) return
    setIsSaving(true)
    try {
      if (selectedUser.isBackendUser) {
        const updatedRecord = await adminApi.updateUserStatus(selectedUser.id, 'inactive')
        const mapped = mapBackendUserToOfficial(updatedRecord)
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? mapped : u)))
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  role: 'Deactivated' as const,
                  status: 'Deactivated' as const,
                  idCode: 'ID-REVOKED',
                }
              : u,
          ),
        )
      }
      setFeedbackBanner({
        type: 'success',
        message: `Account for ${selectedUser.name} has been deactivated and access tokens revoked.`,
      })
      resetFormFields(false)
    } catch (err: any) {
      setFeedbackBanner({
        type: 'error',
        message: err?.message || 'Failed to deactivate account on the server.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReactivate = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    try {
      const restoredCode = generateBadgeId(formRole)
      if (selectedUser.isBackendUser) {
        const updatedRecord = await adminApi.updateUser(selectedUser.id, {
          status: 'Active',
          role: toBackendRole(formRole),
          idCode: restoredCode,
        })
        const mapped = mapBackendUserToOfficial(updatedRecord)
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? mapped : u)))
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  role: formRole,
                  status: 'Active' as const,
                  idCode: restoredCode,
                  lastActive: 'Reactivated locally',
                }
              : u,
          ),
        )
      }
      setFeedbackBanner({
        type: 'success',
        message: `Account for ${selectedUser.name} reactivated with fresh badge ID ${restoredCode}.`,
      })
      resetFormFields(false)
    } catch (err: any) {
      setFeedbackBanner({
        type: 'error',
        message: err?.message || 'Failed to reactivate account on the server.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'admin' && u.role !== 'Admin') return false
    if (filterRole === 'official' && u.role !== 'Official') return false
    if (filterRole === 'resident' && u.role !== 'Resident') return false
    if (filterRole === 'deactivated' && u.role !== 'Deactivated') return false
    if (filterBarangay && u.barangay?.toLowerCase() !== filterBarangay.toLowerCase()) return false
    if (filterStatus) {
      const isDeactivated = u.role === 'Deactivated' || u.status === 'Deactivated'
      if (filterStatus === 'Active' && isDeactivated) return false
      if (filterStatus === 'Deactivated' && !isDeactivated) return false
    }
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

  const superAdminsCount = users.filter((u) => u.role === 'Admin').length
  const officialsCount = users.filter((u) => u.role === 'Official').length
  const activeOfficialsCount = users.filter((u) => u.role === 'Official' && u.status === 'Active').length
  const residentsCount = users.filter((u) => u.role === 'Resident').length
  const activeResidentsCount = users.filter((u) => u.role === 'Resident' && u.status === 'Active').length
  const deactivatedCount = users.filter((u) => u.role === 'Deactivated' || u.status === 'Deactivated').length

  const handleToggleUserStatus = async (user: OfficialUser) => {
    if (user.isSelf) return
    const isDeactivated = user.role === 'Deactivated' || user.status === 'Deactivated'
    setIsSaving(true)
    try {
      if (isDeactivated) {
        const restoredRole = user.department?.toLowerCase().includes('resident') ? 'Resident' : 'Official'
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  role: restoredRole,
                  status: 'Active',
                  idCode: user.idCode && user.idCode !== 'ID-REVOKED' ? user.idCode : generateBadgeId('Official'),
                  lastActive: 'Reactivated just now',
                }
              : u
          )
        )
        setFeedbackBanner({
          type: 'success',
          message: `Account for ${user.name} has been reactivated.`,
        })
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, role: 'Deactivated', status: 'Deactivated', idCode: 'ID-REVOKED' } : u
          )
        )
        setFeedbackBanner({
          type: 'success',
          message: `Account for ${user.name} deactivated and access revoked.`,
        })
      }
    } catch {
      setFeedbackBanner({
        type: 'error',
        message: 'Failed to update account status.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* 4 KPI Summary Cards matching Prototype */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {/* KPI 1: Super Admins */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #dbe3d6',
            borderRadius: '1.25rem',
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '1rem',
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AdminPanelSettingsRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Super Admins
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {superAdminsCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              All scopes
            </Typography>
          </Box>
        </Box>

        {/* KPI 2: Barangay Officials */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #dbe3d6',
            borderRadius: '1.25rem',
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '1rem',
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BadgeOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Barangay Officials
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {officialsCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              {activeOfficialsCount} active
            </Typography>
          </Box>
        </Box>

        {/* KPI 3: Residents */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #dbe3d6',
            borderRadius: '1.25rem',
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '1rem',
              backgroundColor: '#f1f4f0',
              color: '#2e6022',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PeopleOutlineRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Residents
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {residentsCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              {activeResidentsCount} active
            </Typography>
          </Box>
        </Box>

        {/* KPI 4: Deactivated */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #dbe3d6',
            borderRadius: '1.25rem',
            p: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '1rem',
              backgroundColor: '#fff1f2',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PersonOffOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Deactivated
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {deactivatedCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              Cannot sign in
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Global Feedback Banner */}
      {feedbackBanner && (
        <Box
          sx={{
            p: 1.75,
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedbackBanner.type === 'success' ? '#f1f4f0' : '#fee2e2',
            border: '1px solid',
            borderColor: feedbackBanner.type === 'success' ? '#c5dcba' : '#fca5a5',
            color: feedbackBanner.type === 'success' ? '#2e6022' : '#991b1b',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {feedbackBanner.type === 'success' ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#2e6022' }} />
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

      {/* Primary Workspace: Full Width Access Directory */}
      <Box sx={{ width: '100%' }}>
        <AdminAccessDirectoryPanel
          users={users}
          filteredUsers={filteredUsers}
          selectedUserId={selectedUser?.id ?? null}
          search={search}
          filterRole={filterRole}
          filterBarangay={filterBarangay}
          filterStatus={filterStatus}
          onSearchChange={setSearch}
          onFilterRoleChange={setFilterRole}
          onFilterBarangayChange={setFilterBarangay}
          onFilterStatusChange={setFilterStatus}
          onSelectUser={handleSelectUser}
          onToggleUserStatus={handleToggleUserStatus}
          onAddUser={handleOpenAddUser}
        />
      </Box>

      {/* Credential Enrollment / Identity Modification Drawer (Slides from Right) */}
      <Drawer
        anchor="right"
        open={isEnrollmentDrawerOpen}
        onClose={() => {
          setIsEnrollmentDrawerOpen(false)
          setSelectedUser(null)
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 540, md: 620 },
              maxWidth: '100vw',
              p: { xs: 1.5, sm: 2.5 },
              backgroundColor: '#f8fafc',
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
              borderLeft: '1px solid #e2e8f0',
            },
          },
        }}
      >
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
          onClose={() => {
            setIsEnrollmentDrawerOpen(false)
            setSelectedUser(null)
          }}
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
          onSave={async () => {
            await handleSave()
            setIsEnrollmentDrawerOpen(false)
          }}
          onDeactivate={async () => {
            await handleDeactivate()
            setIsEnrollmentDrawerOpen(false)
          }}
          onReactivate={async () => {
            await handleReactivate()
            setIsEnrollmentDrawerOpen(false)
          }}
        />
      </Drawer>
    </Box>
  )
}

export default AdminAccessPage

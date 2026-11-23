import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import { adminApi } from '@/lib/api'
import {
  COMMONWEALTH_BASES,
  generateBadgeId,
  getCommonwealthBaseName,
  mapBackendUserToOfficial,
  mergeBackendUsersWithInitial,
} from '@/components/admin/adminAccessData'
import type { OfficialUser } from '@/components/admin/adminAccessData'
import {
  AdminAccessDirectoryPanel,
  type AccessRoleFilter,
} from '@/components/admin/AdminAccessDirectoryPanel'

const SUFFIX_OPTIONS = ['None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V']

const getInitialRegisteredUsers = (): OfficialUser[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_registered_users')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

export const AdminAccessPage: FC = () => {
  const [users, setUsers] = useState<OfficialUser[]>(getInitialRegisteredUsers)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<AccessRoleFilter>('all')
  const [filterBarangay, setFilterBarangay] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // ── Pop-Up Modal 1: Account Registration (Proper structured official/admin registration) ──
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [cuFirstName, setCuFirstName] = useState('')
  const [cuMiddleName, setCuMiddleName] = useState('')
  const [cuLastName, setCuLastName] = useState('')
  const [cuSuffix, setCuSuffix] = useState('None')
  const [cuEmail, setCuEmail] = useState('')
  const [cuPhone, setCuPhone] = useState('+63 9')
  const [cuBadgeId, setCuBadgeId] = useState(() => generateBadgeId('Official'))
  const [cuRole, setCuRole] = useState<'Official' | 'Admin'>('Official')
  const [cuBaseId, setCuBaseId] = useState<number>(1)
  const [cuDepartment, setCuDepartment] = useState(
    `${COMMONWEALTH_BASES[0].name} • Intake & Drop-Off Station`
  )
  const generateTempPassword = (): string => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
    const bytes = new Uint8Array(12)
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes)
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256)
      }
    }
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  }

  const [cuPassword, setCuPassword] = useState(() => generateTempPassword())
  const [cuMustChangePassword, setCuMustChangePassword] = useState(true)
  const [cuTwoFactorEnabled, setCuTwoFactorEnabled] = useState(false)
  const [cuNotes, setCuNotes] = useState('')
  const [cuError, setCuError] = useState<string | null>(null)
  const [confirmCreateModalOpen, setConfirmCreateModalOpen] = useState(false)

  // ── Pop-Up Modal 2: Change User Role (Prototype change-role modal) ──
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<OfficialUser | null>(null)
  const [crRole, setCrRole] = useState<'Resident' | 'Official' | 'Admin'>('Official')
  const [crBaseId, setCrBaseId] = useState<number>(1)

  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .getUsers()
      .then((records) => {
        if (!active || !Array.isArray(records)) return
        const mapped = mergeBackendUsersWithInitial(records)
        setUsers((prev) => {
          const liveIds = new Set(mapped.map((m) => m.id))
          const combined = [...mapped, ...prev.filter((p) => !liveIds.has(p.id))]
          try {
            localStorage.setItem('ecobyte_registered_users', JSON.stringify(combined))
          } catch {}
          return combined
        })
      })
      .catch((err) => {
        console.warn('Live admin directory unavailable:', err)
      })
    return () => {
      active = false
    }
  }, [])

  // ── Handlers for Create User Modal ──
  const handleOpenCreateModal = () => {
    setCuFirstName('')
    setCuMiddleName('')
    setCuLastName('')
    setCuSuffix('None')
    setCuEmail('')
    setCuPhone('+63 9')
    setCuBadgeId(generateBadgeId('Official'))
    setCuRole('Official')
    setCuBaseId(1)
    setCuDepartment(`${COMMONWEALTH_BASES[0].name} • Intake & Drop-Off Station`)
    setCuPassword(generateTempPassword())
    setCuMustChangePassword(true)
    setCuTwoFactorEnabled(false)
    setCuNotes('')
    setCuError(null)
    setConfirmCreateModalOpen(false)
    setCreateModalOpen(true)
  }

  const handleRoleChange = (newRole: 'Official' | 'Admin') => {
    setCuRole(newRole)
    setCuBadgeId(generateBadgeId(newRole))
    if (newRole === 'Admin') {
      setCuTwoFactorEnabled(true)
      setCuDepartment('Central Administration Office (All 9 Bases)')
    } else {
      setCuTwoFactorEnabled(false)
      const selectedBase = COMMONWEALTH_BASES.find((b) => b.id === cuBaseId) || COMMONWEALTH_BASES[0]
      setCuDepartment(`${selectedBase.name} • Intake & Drop-Off Station`)
    }
  }

  const handleBaseChange = (nextBaseId: number) => {
    setCuBaseId(nextBaseId)
    if (cuRole !== 'Admin') {
      const selectedBase = COMMONWEALTH_BASES.find((b) => b.id === nextBaseId) || COMMONWEALTH_BASES[0]
      setCuDepartment(`${selectedBase.name} • Intake & Drop-Off Station`)
    }
  }

  const validateNewUserForm = () => {
    const fn = cuFirstName.trim()
    const mn = cuMiddleName.trim()
    const ln = cuLastName.trim()
    const sfx = cuSuffix.trim() === 'None' ? '' : cuSuffix.trim()
    const emailTrimmed = cuEmail.trim().toLowerCase()
    const phoneTrimmed = cuPhone.trim()
    const badgeTrimmed = cuBadgeId.trim()

    if (!fn) {
      setCuError('Please enter the first name.')
      return null
    }
    if (!ln) {
      setCuError('Please enter the last name.')
      return null
    }
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setCuError('Please enter a valid official email address.')
      return null
    }
    if (users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
      setCuError('An account with this email address already exists.')
      return null
    }
    if (!phoneTrimmed || phoneTrimmed === '+63' || phoneTrimmed.length < 10) {
      setCuError('Please enter a valid contact phone number (e.g. +63 917 123 4567).')
      return null
    }
    if (!badgeTrimmed) {
      setCuError('Please specify an Employee / Badge ID.')
      return null
    }
    const passwordTrimmed = cuPassword.trim()
    if (passwordTrimmed.length < 8) {
      setCuError('Temporary password must be at least 8 characters long.')
      return null
    }

    setCuError(null)
    return { fn, mn, ln, sfx, emailTrimmed, phoneTrimmed, badgeTrimmed, passwordTrimmed }
  }

  const handleRequestConfirmCreate = () => {
    const validated = validateNewUserForm()
    if (!validated) return
    setConfirmCreateModalOpen(true)
  }

  const handleSaveNewUser = async () => {
    const validated = validateNewUserForm()
    if (!validated) {
      setConfirmCreateModalOpen(false)
      return
    }
    const { fn, mn, ln, sfx, emailTrimmed, phoneTrimmed, badgeTrimmed, passwordTrimmed } = validated

    setIsSaving(true)

    const nameParts = [fn, mn, ln, sfx].filter(Boolean)
    const fullName = nameParts.join(' ')
    const selectedBase = COMMONWEALTH_BASES.find((b) => b.id === cuBaseId) || COMMONWEALTH_BASES[0]
    const assignedBaseId = cuRole === 'Admin' ? 1 : selectedBase.id
    const assignedBrgy = cuRole === 'Admin' ? 'All 9 Bases' : selectedBase.name
    const assignedDept =
      cuDepartment.trim() ||
      (cuRole === 'Admin' ? 'Central Administration Office' : `${selectedBase.name} (${selectedBase.facility})`)

    try {
      const backendRecord = await adminApi.createUser({
        firstName: fn,
        middleName: mn || undefined,
        lastName: ln,
        suffix: sfx || undefined,
        fullName,
        email: emailTrimmed,
        phone: phoneTrimmed,
        idCode: badgeTrimmed,
        role: cuRole === 'Admin' ? 'ADMIN' : 'OFFICIAL',
        department: assignedDept,
        unitAreaId: assignedBaseId,
        barangayId: String(assignedBaseId),
        password: passwordTrimmed,
        mustChangePassword: cuMustChangePassword,
        twoFactorEnabled: cuTwoFactorEnabled,
        notes: cuNotes.trim() || undefined,
        status: 'Active',
      })

      const mapped = mapBackendUserToOfficial(backendRecord)
      setUsers((prev) => [mapped, ...prev])
      setFeedbackBanner({
        type: 'success',
        message: `Account registered successfully for ${mapped.name} (${mapped.idCode}) • Assigned: ${assignedBrgy} (temp password: "${passwordTrimmed}").`,
      })
      setConfirmCreateModalOpen(false)
      setCreateModalOpen(false)
    } catch (err: any) {
      setConfirmCreateModalOpen(false)
      setCuError(
        err?.message || 'Unable to register account. Please ensure the backend server is reachable.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  // ── Handlers for Change Role Modal ──
  const handleOpenChangeRole = (user: OfficialUser) => {
    setTargetUser(user)
    const currentR: 'Resident' | 'Official' | 'Admin' =
      user.role === 'Admin' ? 'Admin' : user.role === 'Resident' ? 'Resident' : 'Official'
    setCrRole(currentR)
    setCrBaseId(user.unitAreaId || 1)
    setChangeRoleModalOpen(true)
  }

  const handleSaveRole = async () => {
    if (!targetUser) return
    setIsSaving(true)

    const assignedBaseId = crRole === 'Admin' ? 1 : crBaseId
    const assignedBrgy = crRole === 'Admin' ? 'All 9 Bases' : getCommonwealthBaseName(assignedBaseId)

    try {
      if (targetUser.isBackendUser) {
        await adminApi.updateUser(targetUser.id, {
          role: crRole === 'Admin' ? 'ADMIN' : crRole === 'Official' ? 'OFFICIAL' : ('RESIDENT' as any),
          unitAreaId: assignedBaseId,
          barangayId: String(assignedBaseId),
        })
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                role: crRole,
                unitAreaId: crRole === 'Admin' ? undefined : assignedBaseId,
                barangay: assignedBrgy,
                status: 'Active',
                lastActive: 'Role & Base updated just now',
              }
            : u
        )
      )

      setFeedbackBanner({
        type: 'success',
        message: `${targetUser.name} is now ${crRole === 'Admin' ? 'Super Admin' : crRole === 'Official' ? 'Barangay Official' : 'Resident'} (${assignedBrgy}).`,
      })
      setChangeRoleModalOpen(false)
    } catch {
      setFeedbackBanner({
        type: 'error',
        message: 'Could not update user role.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ── Toggle User Status (Deactivate / Reactivate) ──
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
          message: `Account for ${user.name} deactivated and access tokens revoked.`,
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

  // ── Filter logic ──
  const filteredUsers = users.filter((u) => {
    if (filterRole === 'admin' && u.role !== 'Admin') return false
    if (filterRole === 'official' && u.role !== 'Official') return false
    if (filterRole === 'resident' && u.role !== 'Resident') return false
    if (filterRole === 'deactivated' && u.role !== 'Deactivated') return false
    if (filterBarangay) {
      const matchesBaseId = u.unitAreaId != null && String(u.unitAreaId) === filterBarangay
      const matchesBaseLabel = (u.barangay || '').toLowerCase().includes(`base ${filterBarangay}`)
      if (!matchesBaseId && !matchesBaseLabel) return false
    }
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── 4 KPI Summary Cards matching Prototype ── */}
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
          selectedUserId={targetUser?.id ?? null}
          search={search}
          filterRole={filterRole}
          filterBarangay={filterBarangay}
          filterStatus={filterStatus}
          onSearchChange={setSearch}
          onFilterRoleChange={setFilterRole}
          onFilterBarangayChange={setFilterBarangay}
          onFilterStatusChange={setFilterStatus}
          onSelectUser={handleOpenChangeRole}
          onToggleUserStatus={handleToggleUserStatus}
          onAddUser={handleOpenCreateModal}
        />
      </Box>

      {/* ── POP-UP MODAL 1: Account Registration (Proper structured official/admin registration) ── */}
      <Dialog
        open={createModalOpen}
        onClose={() => !isSaving && setCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.22)',
              fontFamily: "'Quicksand', sans-serif",
              maxHeight: '92vh',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            pt: 3,
            pb: 2,
            borderBottom: '1px solid #eef2ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '0.75rem',
                backgroundColor: '#f1f4f0',
                color: '#2e6022',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PersonAddRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', lineHeight: 1.2 }}>
                Account Registration
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', mt: 0.25 }}>
                Register and provision verified credentials for Barangay Staff or Super Admin
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setCreateModalOpen(false)} disabled={isSaving}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* ── Section 1: Personal Information ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <BadgeOutlinedIcon sx={{ fontSize: 18, color: '#2e6022' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#334155' }}>
                  1. Personal Details
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 2fr 1fr' }, gap: 1.75 }}>
                {/* First Name */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    First Name <span style={{ color: '#e11d48' }}>*</span>
                  </Typography>
                  <input
                    type="text"
                    placeholder="e.g. Juan"
                    value={cuFirstName}
                    onChange={(e) => setCuFirstName(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>

                {/* Middle Name */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Middle Name <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Optional)</span>
                  </Typography>
                  <input
                    type="text"
                    placeholder="e.g. Silang"
                    value={cuMiddleName}
                    onChange={(e) => setCuMiddleName(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>

                {/* Last Name */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Last Name <span style={{ color: '#e11d48' }}>*</span>
                  </Typography>
                  <input
                    type="text"
                    placeholder="e.g. Dela Cruz"
                    value={cuLastName}
                    onChange={(e) => setCuLastName(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>

                {/* Suffix */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Suffix
                  </Typography>
                  <select
                    value={cuSuffix}
                    onChange={(e) => setCuSuffix(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 10px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  >
                    {SUFFIX_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Box>
              </Box>
            </Box>

            {/* ── Section 2: Contact & Identification ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EmailRoundedIcon sx={{ fontSize: 18, color: '#2e6022' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#334155' }}>
                  2. Contact & Identification
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 1.5fr' }, gap: 1.75 }}>
                {/* Official Email */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Official Email <span style={{ color: '#e11d48' }}>*</span>
                  </Typography>
                  <input
                    type="email"
                    placeholder="jdelacruz@barangay.gov.ph"
                    value={cuEmail}
                    onChange={(e) => setCuEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>

                {/* Contact Number */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Contact Number <span style={{ color: '#e11d48' }}>*</span>
                  </Typography>
                  <input
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={cuPhone}
                    onChange={(e) => setCuPhone(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>

                {/* Employee / Badge ID with Regenerate Button */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      Badge ID <span style={{ color: '#e11d48' }}>*</span>
                    </Typography>
                    <ButtonBase
                      onClick={() => setCuBadgeId(generateBadgeId(cuRole))}
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#2e6022',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.35,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <AutorenewRoundedIcon sx={{ fontSize: 13 }} />
                      <span>Regen</span>
                    </ButtonBase>
                  </Box>
                  <input
                    type="text"
                    value={cuBadgeId}
                    onChange={(e) => setCuBadgeId(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Section 3: Role & Organizational Assignment ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 18, color: '#2e6022' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#334155' }}>
                  3. Role & Organizational Assignment
                </Typography>
              </Box>

              {/* Role Radio Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
                {/* Official Role Card */}
                <Box
                  onClick={() => handleRoleChange('Official')}
                  sx={{
                    p: 2,
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'background-color 180ms ease, border-color 180ms ease',
                    border: '2px solid',
                    borderColor: cuRole === 'Official' ? '#70b822' : '#dbe3d6',
                    backgroundColor: cuRole === 'Official' ? '#f4f9ec' : '#ffffff',
                    boxShadow: cuRole === 'Official' ? '0 0 0 3px rgba(132, 204, 22, 0.15)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: cuRole === 'Official' ? '#4f8a24' : '#94a3b8',
                      backgroundColor: cuRole === 'Official' ? '#4f8a24' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  >
                    {cuRole === 'Official' && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                      Barangay Official
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                      Drop-off intake verification, resident inspection triage & facility records.
                    </Typography>
                  </Box>
                </Box>

                {/* Super Admin Role Card */}
                <Box
                  onClick={() => handleRoleChange('Admin')}
                  sx={{
                    p: 2,
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'background-color 180ms ease, border-color 180ms ease',
                    border: '2px solid',
                    borderColor: cuRole === 'Admin' ? '#7c3aed' : '#dbe3d6',
                    backgroundColor: cuRole === 'Admin' ? '#f5f3ff' : '#ffffff',
                    boxShadow: cuRole === 'Admin' ? '0 0 0 3px rgba(124, 58, 237, 0.15)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: cuRole === 'Admin' ? '#7c3aed' : '#94a3b8',
                      backgroundColor: cuRole === 'Admin' ? '#7c3aed' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  >
                    {cuRole === 'Admin' && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                      Super Admin
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                      All-barangay governance, reports & analytics, user directory & system audit.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Assignment Selectors */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1.5fr 1.5fr' }, gap: 1.75 }}>
                {/* Assigned Commonwealth Base (1..9) */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Assigned Commonwealth Base
                  </Typography>
                  <select
                    value={cuRole === 'Admin' ? 'ALL' : String(cuBaseId)}
                    onChange={(e) => handleBaseChange(Number(e.target.value))}
                    disabled={cuRole === 'Admin'}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: cuRole === 'Admin' ? '#f8fafc' : '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: cuRole === 'Admin' ? '#94a3b8' : '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  >
                    {cuRole === 'Admin' ? (
                      <option value="ALL">All 9 Bases (Super Admin)</option>
                    ) : (
                      COMMONWEALTH_BASES.map((base) => (
                        <option key={base.id} value={String(base.id)}>
                          {base.name}
                        </option>
                      ))
                    )}
                  </select>
                </Box>

                {/* Assigned Drop-Off Facility (Auto-linked to Base) */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Drop-Off Facility / Station
                  </Typography>
                  <input
                    type="text"
                    readOnly
                    value={
                      cuRole === 'Admin'
                        ? 'Central Governance Depot (All Bases)'
                        : (COMMONWEALTH_BASES.find((b) => b.id === cuBaseId) || COMMONWEALTH_BASES[0]).facility
                    }
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#475569',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>

                {/* Desk / Division Assignment */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Division / Operations Desk
                  </Typography>
                  <input
                    type="text"
                    placeholder="e.g. Intake & Inspection Desk"
                    value={cuDepartment}
                    onChange={(e) => setCuDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Section 4: Security Credentials & Policy ── */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <KeyRoundedIcon sx={{ fontSize: 18, color: '#2e6022' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#334155' }}>
                  4. Security Credentials & Access Policy
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {/* Temporary Password Card */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '1rem',
                    backgroundColor: '#f1f4f0',
                    border: '1px solid #c5dcba',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2e6022' }}>
                      Initial Temporary Password
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600, mt: 0.25 }}>
                      Issued to the official for initial setup.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }}>
                    <input
                      type="text"
                      value={cuPassword}
                      onChange={(e) => setCuPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: 36,
                        padding: '0 12px',
                        borderRadius: '0.5rem',
                        border: '1px solid #c5dcba',
                        backgroundColor: '#ffffff',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: '#1e2e1a',
                        outline: 'none',
                      }}
                    />
                    <ButtonBase
                      onClick={() => setCuPassword(generateTempPassword())}
                      sx={{
                        px: 1.5,
                        height: 36,
                        borderRadius: '0.5rem',
                        backgroundColor: '#2e6022',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        '&:hover': { backgroundColor: '#244d1a' },
                      }}
                    >
                      Generate
                    </ButtonBase>
                  </Box>
                </Box>

                {/* Checkboxes Policy Card */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '1rem',
                    border: '1px solid #dbe3d6',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={cuMustChangePassword}
                      onChange={(e) => setCuMustChangePassword(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#70b822' }}
                    />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
                      Require password reset upon first sign-in
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={cuTwoFactorEnabled}
                      onChange={(e) => setCuTwoFactorEnabled(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#70b822' }}
                    />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
                      Enforce Two-Factor Authentication (2FA)
                    </span>
                  </label>
                </Box>

                {/* Administrative Notes */}
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Administrative Remarks <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Optional)</span>
                  </Typography>
                  <textarea
                    rows={2}
                    placeholder="e.g. Onboarded for Barangay Commonwealth MRF intake desk shift rotation."
                    value={cuNotes}
                    onChange={(e) => setCuNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '0.75rem',
                      border: '1px solid #dbe3d6',
                      backgroundColor: '#ffffff',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: "'Quicksand', sans-serif",
                      resize: 'none',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Validation Error Banner */}
            {cuError && (
              <Alert severity="error" sx={{ borderRadius: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                {cuError}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 3.5 }, pb: 3, pt: 1.5, borderTop: '1px solid #eef2ed', gap: 1 }}>
          <ButtonBase
            onClick={() => setCreateModalOpen(false)}
            disabled={isSaving}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            Cancel
          </ButtonBase>

          <ButtonBase
            onClick={handleRequestConfirmCreate}
            disabled={isSaving}
            sx={{
              px: 3,
              py: 1.1,
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              boxShadow: '0 2px 8px rgba(112, 184, 34, 0.35)',
              '&:hover': { opacity: 0.95 },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {isSaving ? (
              <CircularProgress size={16} sx={{ color: '#fff' }} />
            ) : (
              <>
                <PersonAddRoundedIcon sx={{ fontSize: 18 }} />
                <span>Register Account</span>
              </>
            )}
          </ButtonBase>
        </DialogActions>
      </Dialog>

      {/* ── POP-UP MODAL 2: Change User Role (Matches Prototype change-role modal) ── */}
      <Dialog
        open={changeRoleModalOpen}
        onClose={() => !isSaving && setChangeRoleModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ManageAccountsRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              Change User Role
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setChangeRoleModalOpen(false)} disabled={isSaving}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {targetUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* User Identity Preview Box */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '0.75rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                  {targetUser.name}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                  {targetUser.email} · currently {targetUser.role === 'Admin' ? 'Super Admin' : targetUser.role === 'Official' ? 'Barangay Official' : 'Resident'}
                </Typography>
              </Box>

              {/* New Role Selector */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  New role
                </Typography>
                <select
                  value={crRole}
                  onChange={(e) => setCrRole(e.target.value as 'Resident' | 'Official' | 'Admin')}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 12px',
                    borderRadius: '0.75rem',
                    border: '1px solid #dbe3d6',
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  <option value="Resident">Resident</option>
                  <option value="Official">Barangay Official</option>
                  <option value="Admin">Super Admin</option>
                </select>
              </Box>

              {/* Assigned Base Selector */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Assigned Commonwealth Base
                </Typography>
                <select
                  value={crRole === 'Admin' ? 'ALL' : String(crBaseId)}
                  onChange={(e) => setCrBaseId(Number(e.target.value))}
                  disabled={crRole === 'Admin'}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 12px',
                    borderRadius: '0.75rem',
                    border: '1px solid #dbe3d6',
                    backgroundColor: crRole === 'Admin' ? '#f8fafc' : '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: crRole === 'Admin' ? '#94a3b8' : '#0f172a',
                    outline: 'none',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  {crRole === 'Admin' ? (
                    <option value="ALL">All 9 Bases (Super Admin)</option>
                  ) : (
                    COMMONWEALTH_BASES.map((base) => (
                      <option key={base.id} value={String(base.id)}>
                        {base.name}
                      </option>
                    ))
                  )}
                </select>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <ButtonBase
            onClick={() => setChangeRoleModalOpen(false)}
            disabled={isSaving}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            Cancel
          </ButtonBase>

          <ButtonBase
            onClick={handleSaveRole}
            disabled={isSaving}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              '&:hover': { opacity: 0.95 },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {isSaving ? (
              <CircularProgress size={16} sx={{ color: '#fff' }} />
            ) : (
              <>
                <CheckRoundedIcon sx={{ fontSize: 16 }} />
                <span>Save Role</span>
              </>
            )}
          </ButtonBase>
        </DialogActions>
      </Dialog>

      {/* ── POP-UP MODAL 3: Confirm Account Registration ── */}
      <Dialog
        open={confirmCreateModalOpen}
        onClose={() => !isSaving && setConfirmCreateModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.12)',
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                backgroundColor: '#f1f4f0',
                color: '#2e6022',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 21 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a', lineHeight: 1.2 }}>
                Confirm Account Registration
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Review details before issuing staff credentials
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setConfirmCreateModalOpen(false)} disabled={isSaving}>
            <CloseRoundedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '0.875rem',
              backgroundColor: '#f8faf6',
              border: '1px solid #dbe3d6',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Full Name</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#0f172a', fontWeight: 800, textAlign: 'right' }}>
                {[cuFirstName.trim(), cuMiddleName.trim(), cuLastName.trim(), cuSuffix === 'None' ? '' : cuSuffix.trim()]
                  .filter(Boolean)
                  .join(' ')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Email</Typography>
              <Typography sx={{ fontSize: '0.78125rem', color: '#0f172a', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>
                {cuEmail.trim().toLowerCase()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Role</Typography>
              <Typography sx={{ fontSize: '0.78125rem', color: cuRole === 'Admin' ? '#6d28d9' : '#2e6022', fontWeight: 800 }}>
                {cuRole === 'Admin' ? 'Super Admin' : 'Barangay Official'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Assigned Base</Typography>
              <Typography sx={{ fontSize: '0.78125rem', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                {cuRole === 'Admin' ? 'All 9 Bases' : getCommonwealthBaseName(cuBaseId)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Badge ID</Typography>
              <Typography sx={{ fontSize: '0.78125rem', color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>
                {cuBadgeId.trim()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Temp Password</Typography>
              <Typography sx={{ fontSize: '0.78125rem', color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>
                {cuPassword.trim()}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1 }}>
          <ButtonBase
            onClick={() => setConfirmCreateModalOpen(false)}
            disabled={isSaving}
            sx={{
              px: 2.25,
              py: 1,
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            Back &amp; Edit
          </ButtonBase>

          <ButtonBase
            onClick={handleSaveNewUser}
            disabled={isSaving}
            sx={{
              px: 2.75,
              py: 1,
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              boxShadow: '0 2px 8px rgba(112, 184, 34, 0.35)',
              '&:hover': { opacity: 0.95 },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {isSaving ? (
              <CircularProgress size={16} sx={{ color: '#fff' }} />
            ) : (
              <>
                <CheckRoundedIcon sx={{ fontSize: 16 }} />
                <span>Confirm &amp; Register</span>
              </>
            )}
          </ButtonBase>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminAccessPage

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
import { adminApi } from '@/lib/api'
import {
  INITIAL_USERS,
  generateBadgeId,
  mapBackendUserToOfficial,
  mergeBackendUsersWithInitial,
} from '@/components/admin/adminAccessData'
import type { OfficialUser } from '@/components/admin/adminAccessData'
import {
  AdminAccessDirectoryPanel,
  type AccessRoleFilter,
} from '@/components/admin/AdminAccessDirectoryPanel'

const OFFICIAL_SITES = [
  { id: 'S01', name: 'Commonwealth Central MRF (Base 1)', barangay: 'Commonwealth' },
  { id: 'S02', name: 'Ecoville Covered Court', barangay: 'Commonwealth' },
  { id: 'S03', name: 'Litex Market Drop Point', barangay: 'Commonwealth' },
  { id: 'S04', name: 'Batasan Hills MRF Annex', barangay: 'Batasan Hills' },
  { id: 'S05', name: 'Payatas Solid Waste Hub', barangay: 'Payatas' },
  { id: 'S06', name: 'Holy Spirit Drop Point', barangay: 'Holy Spirit' },
  { id: 'S07', name: 'Bagong Silangan MRF Desk', barangay: 'Bagong Silangan' },
]

const BARANGAYS = [
  'Commonwealth',
  'Batasan Hills',
  'Payatas',
  'Holy Spirit',
  'Bagong Silangan',
]

export const AdminAccessPage: FC = () => {
  const [users, setUsers] = useState<OfficialUser[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<AccessRoleFilter>('all')
  const [filterBarangay, setFilterBarangay] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // ── Pop-Up Modal 1: Create Official Account (Prototype create-user modal) ──
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [cuName, setCuName] = useState('')
  const [cuEmail, setCuEmail] = useState('')
  const [cuRole, setCuRole] = useState<'Official' | 'Admin'>('Official')
  const [cuSiteId, setCuSiteId] = useState(OFFICIAL_SITES[0].id)
  const [cuError, setCuError] = useState<string | null>(null)

  // ── Pop-Up Modal 2: Change User Role (Prototype change-role modal) ──
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<OfficialUser | null>(null)
  const [crRole, setCrRole] = useState<'Resident' | 'Official' | 'Admin'>('Official')
  const [crBarangay, setCrBarangay] = useState(BARANGAYS[0])

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

  // ── Handlers for Create User Modal ──
  const handleOpenCreateModal = () => {
    setCuName('')
    setCuEmail('')
    setCuRole('Official')
    setCuSiteId(OFFICIAL_SITES[0].id)
    setCuError(null)
    setCreateModalOpen(true)
  }

  const handleSaveNewUser = async () => {
    const nameTrimmed = cuName.trim()
    const emailTrimmed = cuEmail.trim().toLowerCase()

    if (!nameTrimmed) {
      setCuError('Please enter the full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setCuError('Please enter a valid email address.')
      return
    }
    if (users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
      setCuError('An account with this email address already exists.')
      return
    }

    setCuError(null)
    setIsSaving(true)

    const selectedSite = OFFICIAL_SITES.find((s) => s.id === cuSiteId) || OFFICIAL_SITES[0]
    const assignedBrgy = cuRole === 'Admin' ? 'All' : selectedSite.barangay
    const initials =
      nameTrimmed
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'EB'

    try {
      const backendRecord = await adminApi.createUser({
        fullName: nameTrimmed,
        email: emailTrimmed,
        role: cuRole === 'Admin' ? 'ADMIN' : 'OFFICIAL',
        department: selectedSite.name,
        password: 'official123',
        status: 'Active',
      })

      const mapped = mapBackendUserToOfficial(backendRecord)
      setUsers((prev) => [mapped, ...prev])
      setFeedbackBanner({
        type: 'success',
        message: `Account created for ${mapped.name} with temporary password "official123".`,
      })
      setCreateModalOpen(false)
    } catch {
      // Local fallback
      const newLocalUser: OfficialUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: nameTrimmed,
        email: emailTrimmed,
        phone: '+63 917 000 0000',
        idCode: generateBadgeId(cuRole),
        role: cuRole,
        department: selectedSite.name,
        barangay: assignedBrgy,
        status: 'Active',
        twoFactorEnabled: cuRole === 'Admin',
        mustChangePassword: true,
        lastActive: 'Just now',
        initials,
        notes: `Created via Admin Access directory · Assigned to ${selectedSite.name}`,
      }

      setUsers((prev) => [newLocalUser, ...prev])
      setFeedbackBanner({
        type: 'success',
        message: `Account created for ${newLocalUser.name} with temporary password "official123".`,
      })
      setCreateModalOpen(false)
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
    setCrBarangay(user.barangay && user.barangay !== 'All' ? user.barangay : BARANGAYS[0])
    setChangeRoleModalOpen(true)
  }

  const handleSaveRole = async () => {
    if (!targetUser) return
    setIsSaving(true)

    const assignedBrgy = crRole === 'Admin' ? 'All' : crBarangay

    try {
      if (targetUser.isBackendUser) {
        await adminApi.updateUser(targetUser.id, {
          role: crRole === 'Admin' ? 'ADMIN' : crRole === 'Official' ? 'OFFICIAL' : ('RESIDENT' as any),
        })
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                role: crRole,
                barangay: assignedBrgy,
                status: 'Active',
                lastActive: 'Role updated just now',
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

      {/* ── POP-UP MODAL 1: Create Official Account (Matches Prototype create-user modal) ── */}
      <Dialog
        open={createModalOpen}
        onClose={() => !isSaving && setCreateModalOpen(false)}
        maxWidth="sm"
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
                backgroundColor: '#f1f4f0',
                color: '#2e6022',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAddRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              Create Official Account
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setCreateModalOpen(false)} disabled={isSaving}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            {/* Full Name */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Full name
              </Typography>
              <input
                type="text"
                placeholder="Kgd. Juan Dela Cruz"
                value={cuName}
                onChange={(e) => setCuName(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
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

            {/* Official Email */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Official email
              </Typography>
              <input
                type="email"
                placeholder="name@barangay.gov.ph"
                value={cuEmail}
                onChange={(e) => setCuEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px',
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

            {/* Role */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Role
              </Typography>
              <select
                value={cuRole}
                onChange={(e) => setCuRole(e.target.value as 'Official' | 'Admin')}
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
                <option value="Official">Barangay Official</option>
                <option value="Admin">Super Admin</option>
              </select>
            </Box>

            {/* Assigned Base / Drop-Off Site */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Assigned Base / Drop-Off Site
              </Typography>
              <select
                value={cuSiteId}
                onChange={(e) => setCuSiteId(e.target.value)}
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
                {OFFICIAL_SITES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.barangay})
                  </option>
                ))}
              </select>
            </Box>

            {/* Temporary Password Information Banner matching Prototype */}
            <Box
              sx={{
                gridColumn: { xs: '1', sm: '1 / -1' },
                p: 2,
                borderRadius: '1rem',
                backgroundColor: '#f1f4f0',
                border: '1px solid #c5dcba',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e6022', fontWeight: 700, fontSize: '0.875rem' }}>
                <KeyRoundedIcon sx={{ fontSize: 18 }} />
                <span>Temporary password</span>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, mt: 0.5 }}>
                A temporary password <strong style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>official123</strong> will be issued.
              </Typography>
            </Box>

            {/* Validation Error Banner */}
            {cuError && (
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Alert severity="error" sx={{ borderRadius: '0.75rem', fontSize: '0.8125rem' }}>
                  {cuError}
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <ButtonBase
            onClick={() => setCreateModalOpen(false)}
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
            onClick={handleSaveNewUser}
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
                <span>Create Account</span>
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

              {/* Barangay Selector */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Barangay
                </Typography>
                <select
                  value={crBarangay}
                  onChange={(e) => setCrBarangay(e.target.value)}
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
                  {BARANGAYS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
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
    </Box>
  )
}

export default AdminAccessPage

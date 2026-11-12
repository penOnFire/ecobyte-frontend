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

interface OfficialUser {
  id: string
  name: string
  email: string
  idCode: string
  role: 'Admin' | 'Official' | 'Deactivated'
  isSelf?: boolean
  initials: string
}

const INITIAL_USERS: OfficialUser[] = [
  {
    id: 'USR-101',
    name: 'Elena Vance',
    email: 'elena.vance@ecobyte.gov',
    idCode: 'ID-0021-ADM',
    role: 'Admin',
    isSelf: true,
    initials: 'EV',
  },
  {
    id: 'USR-102',
    name: 'Sarah Jenkins',
    email: 's.jenkins@ecobyte.org',
    idCode: 'ID-0144-OFC',
    role: 'Official',
    initials: 'SJ',
  },
  {
    id: 'USR-103',
    name: 'Marcus Thorne',
    email: 'marcus.thorne@ecobyte.org',
    idCode: 'ID-0182-OFC',
    role: 'Official',
    initials: 'MT',
  },
  {
    id: 'USR-105',
    name: 'Tariq Sterling',
    email: 'tariq.s@ecobyte.gov',
    idCode: 'ID-0019-ADM',
    role: 'Admin',
    initials: 'TS',
  },
  {
    id: 'USR-106',
    name: 'Julian Karras',
    email: 'j.karras@former-contractor.org',
    idCode: 'ID-REVOKED',
    role: 'Deactivated',
    initials: 'JK',
  },
]

export const AdminAccessPage: FC = () => {
  const [users, setUsers] = useState<OfficialUser[]>(INITIAL_USERS)
  const [selectedUser, setSelectedUser] = useState<OfficialUser | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'official' | 'deactivated'>('all')

  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState<'Official' | 'Admin'>('Official')

  const handleSelectUser = (user: OfficialUser) => {
    setSelectedUser(user)
    setFormEmail(user.email)
    setFormName(user.name)
    setFormRole(user.role === 'Admin' ? 'Admin' : 'Official')
  }

  const handleResetForm = () => {
    setSelectedUser(null)
    setFormEmail('')
    setFormName('')
    setFormRole('Official')
  }

  const handleSave = () => {
    if (!formEmail.trim() || !formName.trim()) return

    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: formName, email: formEmail, role: formRole }
            : u,
        ),
      )
    } else {
      const newUser: OfficialUser = {
        id: `USR-${Date.now().toString().slice(-3)}`,
        name: formName,
        email: formEmail,
        idCode: `ID-${Math.floor(1000 + Math.random() * 9000)}-${formRole === 'Admin' ? 'ADM' : 'OFC'}`,
        role: formRole,
        initials: formName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      }
      setUsers((prev) => [...prev, newUser])
    }
    handleResetForm()
  }

  const handleDeactivate = () => {
    if (!selectedUser || selectedUser.isSelf) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, role: 'Deactivated' as const } : u,
      ),
    )
    handleResetForm()
  }

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'admin' && u.role !== 'Admin') return false
    if (filterRole === 'official' && u.role !== 'Official') return false
    if (filterRole === 'deactivated' && u.role !== 'Deactivated') return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

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
                Access Control
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

          {/* Quick Status Indicators */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                backgroundColor: '#eff4ff',
                border: '1px solid #dce9ff',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>
                Ledger #409-SEC
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Telemetry Strip */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
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
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>2</Typography>
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
                <span>Tier 1</span>
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
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>2</Typography>
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
                Inspections Auth
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
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>1</Typography>
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
                Revoked Key
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Primary Workspace: Two-Panel Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
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
              {users.length} IDENTITIES LOADED
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
              placeholder="Search officials by name, email, or role..."
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

          {/* Filter Quick Toggles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto' }}>
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
                    px: 1.75,
                    py: 0.5,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: active ? '#eff4ff' : '#ffffff',
                    color: active ? '#0f172a' : '#64748b',
                    border: '1px solid',
                    borderColor: active ? '#cbd5e1' : '#e2e8f0',
                    transition: 'all 0.15s ease',
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
                  <th style={{ padding: '10px 16px' }}>User &amp; Identity</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Role</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                {filteredUsers.map((user) => {
                  const isDeactivated = user.role === 'Deactivated'
                  const isSelected = selectedUser?.id === user.id

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#eff4ff' : 'transparent',
                        borderLeft: user.role === 'Admin' ? '4px solid #16a34a' : isDeactivated ? '4px solid #dc2626' : '4px solid #006a61',
                        opacity: isDeactivated ? 0.75 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                              {user.email} • <span style={{ fontFamily: 'monospace' }}>{user.idCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 4,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            backgroundColor: user.role === 'Admin' ? '#16a34a' : isDeactivated ? '#dc2626' : '#006a61',
                            color: '#ffffff',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  )
                })}
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
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PolicyOutlinedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
              <span>ISO 27001 Access Ledger Synchronized</span>
            </Box>
            <ButtonBase
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

        {/* RIGHT PANEL: Add Official / Manage Official Form */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 520,
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1.5,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                  {selectedUser ? 'Identity Modification' : 'Credential Enrollment'}
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedUser ? 'Edit official' : 'Add official'}
                </Typography>
              </Box>
              <ButtonBase
                onClick={handleResetForm}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  '&:hover': { backgroundColor: '#e2e8f0' },
                }}
                title="Reset Form / New Official"
              >
                <PersonAddRoundedIcon sx={{ fontSize: 18 }} />
              </ButtonBase>
            </Box>

            {/* Self demotion warning */}
            {selectedUser?.isSelf && (
              <Box
                sx={{
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
                  <strong>Protected Session Constraint:</strong> You are currently logged in as this administrator. You cannot demote or deactivate your own account.
                </Typography>
              </Box>
            )}

            {/* Email Field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  Email
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Corporate SSO or Gov Domain
                </Typography>
              </Box>
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
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="official@ecobyte.org"
                  style={{
                    width: '100%',
                    height: 42,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </Box>
            </Box>

            {/* Full Name Field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                Official Full Name
              </Typography>
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
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Kenneth Adams"
                  style={{
                    width: '100%',
                    height: 42,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </Box>
            </Box>

            {/* Role Toggle Pills */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  Role
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 700 }}>
                  {formRole === 'Admin' ? 'Super Admin Privileges' : 'Triage, Inspect & Log E-Waste'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, p: 0.5, borderRadius: '8px', backgroundColor: '#f1f5f9' }}>
                <ButtonBase
                  onClick={() => setFormRole('Official')}
                  disabled={selectedUser?.isSelf}
                  sx={{
                    flex: 1,
                    py: 1,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    backgroundColor: formRole === 'Official' ? '#006a61' : 'transparent',
                    color: formRole === 'Official' ? '#ffffff' : '#475569',
                    boxShadow: formRole === 'Official' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>Official</span>
                </ButtonBase>

                <ButtonBase
                  onClick={() => setFormRole('Admin')}
                  sx={{
                    flex: 1,
                    py: 1,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    backgroundColor: formRole === 'Admin' ? '#16a34a' : 'transparent',
                    color: formRole === 'Admin' ? '#ffffff' : '#475569',
                    boxShadow: formRole === 'Admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <ShieldRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Admin</span>
                </ButtonBase>
              </Box>
            </Box>

            {/* Scope Box */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: '#eff4ff',
                border: '1px solid #dce9ff',
              }}
            >
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Granted Scope
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#0f172a', mt: 0.5, lineHeight: 1.4 }}>
                {formRole === 'Admin'
                  ? 'Full administrative governance, RBAC management, downstream manifest signing, and compliance auditing.'
                  : 'Authorized to triage incoming hardware, assign condition grading, and mark units ready for Reuse Hub or Hazmat disposal.'}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
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
                  '&:hover': { opacity: 0.95 },
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                <span>Save Official</span>
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
                  <span>Deactivate Identity &amp; Revoke Keys</span>
                </ButtonBase>
              )}
            </Box>
          </Box>

          {/* Panel Footer Note */}
          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <span style={{ fontStyle: 'italic' }}>Set once; not part of daily work</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}>SEC-V4.2</span>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default AdminAccessPage


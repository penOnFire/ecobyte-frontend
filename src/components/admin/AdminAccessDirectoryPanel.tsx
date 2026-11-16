import type { FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import type { OfficialUser } from '@/components/admin/adminAccessData'

export type AccessRoleFilter = 'all' | 'admin' | 'official' | 'deactivated'

interface AdminAccessDirectoryPanelProps {
  users: OfficialUser[]
  filteredUsers: OfficialUser[]
  selectedUserId: string | null
  search: string
  filterRole: AccessRoleFilter
  onSearchChange: (value: string) => void
  onFilterRoleChange: (filter: AccessRoleFilter) => void
  onSelectUser: (user: OfficialUser) => void
}

export const AdminAccessDirectoryPanel: FC<AdminAccessDirectoryPanelProps> = ({
  users,
  filteredUsers,
  selectedUserId,
  search,
  filterRole,
  onSearchChange,
  onFilterRoleChange,
  onSelectUser,
}) => {
  const handleExportDirectory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `ecobyte_official_directory_${new Date().toISOString().slice(0, 10)}.json`,
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
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
          onChange={(e) => onSearchChange(e.target.value)}
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
          {
            id: 'official',
            label: `Official (${users.filter((u) => u.role === 'Official').length})`,
          },
          {
            id: 'deactivated',
            label: `Deactivated (${users.filter((u) => u.role === 'Deactivated').length})`,
          },
        ].map((tab) => {
          const active = filterRole === tab.id
          return (
            <ButtonBase
              key={tab.id}
              onClick={() => onFilterRoleChange(tab.id as AccessRoleFilter)}
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
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
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
            <tr
              style={{
                backgroundColor: '#eff4ff',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#475569',
              }}
            >
              <th style={{ padding: '10px 14px' }}>User &amp; Credential</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Role &amp; Status</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}
                >
                  No officials match your search query.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isDeactivated =
                  user.role === 'Deactivated' || user.status === 'Deactivated'
                const isSelected = selectedUserId === user.id

                const roleColor =
                  user.role === 'Admin'
                    ? '#16a34a'
                    : isDeactivated
                      ? '#dc2626'
                      : '#006a61'

                return (
                  <tr
                    key={user.id}
                    onClick={() => onSelectUser(user)}
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
                            background:
                              user.role === 'Admin'
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
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}
                          >
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
                            {user.email} •{' '}
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {user.idCode}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              color: '#94a3b8',
                              marginTop: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
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
          onClick={handleExportDirectory}
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
  )
}

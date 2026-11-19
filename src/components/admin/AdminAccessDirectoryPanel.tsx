import type { FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import type { OfficialUser } from '@/components/admin/adminAccessData'

export type AccessRoleFilter = 'all' | 'admin' | 'official' | 'resident' | 'deactivated'

interface AdminAccessDirectoryPanelProps {
  users: OfficialUser[]
  filteredUsers: OfficialUser[]
  selectedUserId: string | null
  search: string
  filterRole: AccessRoleFilter
  filterBarangay: string
  filterStatus: string
  onSearchChange: (value: string) => void
  onFilterRoleChange: (filter: AccessRoleFilter) => void
  onFilterBarangayChange: (val: string) => void
  onFilterStatusChange: (val: string) => void
  onSelectUser: (user: OfficialUser) => void
  onToggleUserStatus: (user: OfficialUser) => void
  onAddUser?: () => void
}

const BARANGAYS = [
  { id: '', name: 'All barangays' },
  { id: 'commonwealth', name: 'Commonwealth' },
  { id: 'batasan', name: 'Batasan Hills' },
  { id: 'payatas', name: 'Payatas' },
  { id: 'holyspirit', name: 'Holy Spirit' },
  { id: 'bagongsilangan', name: 'Bagong Silangan' },
]

export const AdminAccessDirectoryPanel: FC<AdminAccessDirectoryPanelProps> = ({
  users,
  filteredUsers,
  selectedUserId,
  search,
  filterRole,
  filterBarangay,
  filterStatus,
  onSearchChange,
  onFilterRoleChange,
  onFilterBarangayChange,
  onFilterStatusChange,
  onSelectUser,
  onToggleUserStatus,
  onAddUser,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        p: { xs: 2.5, sm: 3 },
        border: '1px solid #dbe3d6',
        boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      {/* ── Filters & Add User Row matching Prototype ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', xl: 'row' },
          alignItems: { xs: 'stretch', xl: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
            width: { xs: '100%', xl: 760 },
          }}
        >
          {/* Search name or email */}
          <Box sx={{ position: 'relative' }}>
            <SearchRoundedIcon
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: 18,
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name or email…"
              style={{
                width: '100%',
                height: 40,
                paddingLeft: 34,
                paddingRight: 12,
                borderRadius: '0.75rem',
                border: '1px solid #dbe3d6',
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </Box>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => onFilterRoleChange(e.target.value as AccessRoleFilter)}
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: '0.75rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            <option value="all">All roles</option>
            <option value="admin">Super Admin</option>
            <option value="official">Barangay Official</option>
            <option value="resident">Resident</option>
            <option value="deactivated">Deactivated</option>
          </select>

          {/* Barangay Filter */}
          <select
            value={filterBarangay}
            onChange={(e) => onFilterBarangayChange(e.target.value)}
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: '0.75rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {BARANGAYS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: '0.75rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </Box>

        {/* Add User Button */}
        {onAddUser && (
          <ButtonBase
            onClick={onAddUser}
            sx={{
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: '0.75rem',
              px: 2.5,
              py: 1.1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 2px 6px rgba(46, 96, 34, 0.25)',
              '&:hover': {
                opacity: 0.95,
              },
            }}
          >
            <PersonAddRoundedIcon sx={{ fontSize: 18 }} />
            <span>Create Official Account</span>
          </ButtonBase>
        )}
      </Box>

      {/* Directory Count */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
          Showing {filteredUsers.length} of {users.length} accounts
        </Typography>
      </Box>

      {/* User Directory Table matching Prototype */}
      <Box
        sx={{
          borderRadius: '1rem',
          border: '1px solid #dbe3d6',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8faf6',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
              }}
            >
              <th style={{ padding: '12px 16px' }}>User</th>
              <th style={{ padding: '12px 16px' }}>Role</th>
              <th style={{ padding: '12px 16px' }}>Barangay</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Last Login</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    No users match your filters.
                  </Typography>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isDeactivated =
                  user.role === 'Deactivated' || user.status === 'Deactivated'
                const isSelected = selectedUserId === user.id

                const isSuperAdmin = user.role === 'Admin'
                const isOfficial = user.role === 'Official'
                const isResident = user.role === 'Resident'

                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#f1f4f0' : 'transparent',
                      opacity: isDeactivated ? 0.7 : 1,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* User */}
                    <td style={{ padding: '12px 16px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}
                        >
                          {user.initials}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.8125rem',
                                color: '#0f172a',
                                lineHeight: 1.2,
                              }}
                            >
                              {user.name}
                            </Typography>
                            {user.isSelf && (
                              <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 700 }}>
                                (you)
                              </Typography>
                            )}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '0.6875rem',
                              color: '#64748b',
                              fontWeight: 500,
                              mt: 0.25,
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.25,
                          py: 0.35,
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: isSuperAdmin
                            ? '#f5f3ff'
                            : isOfficial
                              ? '#f0f9ff'
                              : isResident
                                ? '#f1f4f0'
                                : '#f1f5f9',
                          color: isSuperAdmin
                            ? '#6d28d9'
                            : isOfficial
                              ? '#0369a1'
                              : isResident
                                ? '#2e6022'
                                : '#64748b',
                          border: `1px solid ${
                            isSuperAdmin
                              ? '#ddd6fe'
                              : isOfficial
                                ? '#bae6fd'
                                : isResident
                                  ? '#c5dcba'
                                  : '#e2e8f0'
                          }`,
                        }}
                      >
                        {isSuperAdmin
                          ? 'Super Admin'
                          : isOfficial
                            ? 'Barangay Official'
                            : isResident
                              ? 'Resident'
                              : 'Deactivated'}
                      </Box>
                    </td>

                    {/* Barangay */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                      {user.barangay ? user.barangay : isSuperAdmin ? <span style={{ color: '#94a3b8' }}>All</span> : 'Commonwealth'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.25,
                          py: 0.35,
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: !isDeactivated ? '#f1f4f0' : '#fee2e2',
                          color: !isDeactivated ? '#2e6022' : '#991b1b',
                          border: `1px solid ${!isDeactivated ? '#c5dcba' : '#fca5a5'}`,
                        }}
                      >
                        {!isDeactivated ? 'Active' : 'Deactivated'}
                      </Box>
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {user.lastActive || 'Never'}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <ButtonBase
                          onClick={() => onSelectUser(user)}
                          disabled={user.isSelf}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '0.5rem',
                            border: '1px solid #dbe3d6',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            '&:hover': { backgroundColor: '#f8faf6' },
                            '&:disabled': { opacity: 0.4 },
                          }}
                        >
                          Change role
                        </ButtonBase>

                        <ButtonBase
                          onClick={() => onToggleUserStatus(user)}
                          disabled={user.isSelf}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: !isDeactivated ? '#fee2e2' : '#f1f4f0',
                            color: !isDeactivated ? '#991b1b' : '#2e6022',
                            border: `1px solid ${!isDeactivated ? '#fca5a5' : '#c5dcba'}`,
                            '&:hover': { opacity: 0.9 },
                            '&:disabled': { opacity: 0.4 },
                          }}
                        >
                          {!isDeactivated ? 'Deactivate' : 'Reactivate'}
                        </ButtonBase>
                      </Box>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  )
}

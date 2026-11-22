import { useEffect, useId, useRef, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import { COMMONWEALTH_BASES, type OfficialUser } from '@/components/admin/adminAccessData'
import '@/components/admin/AdminAccessDirectoryPanel.css'

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

const BASE_FILTER_OPTIONS = [
  { id: '', name: 'All 9 bases' },
  ...COMMONWEALTH_BASES.map((b) => ({ id: String(b.id), name: b.name })),
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
  const tableCaptionId = useId()
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', 'scroll()')) {
      return
    }

    const labels = Array.from(wrapper.querySelectorAll<HTMLElement>('.truncate-cell'))
    const syncTruncated = () => {
      for (const el of labels) {
        el.classList.toggle('truncated', el.scrollWidth > el.clientWidth)
      }
    }

    syncTruncated()
    const observer = new ResizeObserver(syncTruncated)
    for (const el of labels) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [filteredUsers])

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '1.25rem',
        p: { xs: 2, sm: 2.5, md: 3 },
        border: '1px solid #dbe3d6',
        boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontFamily: "'Quicksand', sans-serif",
        minWidth: 0,
      }}
    >
      {/* ── Filters & Add User Row matching Prototype ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', xl: 'row' },
          alignItems: { xs: 'stretch', xl: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'minmax(180px, 1.35fr) repeat(3, minmax(0, 1fr))',
            },
            gap: 1.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Search name or email */}
          <Box sx={{ position: 'relative', minWidth: 0 }}>
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
                minWidth: 0,
                boxSizing: 'border-box',
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
            aria-label="Filter by role"
            value={filterRole}
            onChange={(e) => onFilterRoleChange(e.target.value as AccessRoleFilter)}
            style={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              height: 40,
              padding: '0 10px',
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
            aria-label="Filter by assigned base"
            value={filterBarangay}
            onChange={(e) => onFilterBarangayChange(e.target.value)}
            style={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              height: 40,
              padding: '0 10px',
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
            {BASE_FILTER_OPTIONS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter by account status"
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            style={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              height: 40,
              padding: '0 10px',
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
              px: 2.25,
              py: 1.05,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexShrink: 0,
              whiteSpace: 'nowrap',
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

      {/* Responsive User Directory Table */}
      <div
        ref={wrapperRef}
        tabIndex={0}
        role="region"
        aria-labelledby={tableCaptionId}
        className="admin-users-table-wrapper"
      >
        <table className="admin-users-table">
          <caption id={tableCaptionId} className="admin-users-sr-only">
            User accounts directory showing {filteredUsers.length} of {users.length} accounts
          </caption>
          <colgroup>
            <col className="col-user" />
            <col className="col-role" />
            <col className="col-base" />
            <col className="col-status" />
            <col className="col-login" />
            <col className="col-action" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Role</th>
              <th scope="col">Assigned Base</th>
              <th scope="col">Status</th>
              <th scope="col">Last Login</th>
              <th scope="col" className="action-col-header">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr className="empty-state-row">
                <td colSpan={6} className="empty-state-cell">
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
                const assignedBase = isSuperAdmin
                  ? 'All 9 Bases'
                  : user.barangay || 'Base 1 - Brgy. Hall Complex'
                const lastLoginLabel = user.lastActive || 'Never'

                const rowClassName = [
                  isSelected ? 'is-selected' : '',
                  isDeactivated ? 'is-deactivated' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <tr key={user.id} className={rowClassName || undefined}>
                    {/* User (Sticky Row Header) */}
                    <th scope="row" className="user-cell">
                      <Box
                        className="cell-content-dim"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            flexShrink: 0,
                          }}
                        >
                          {user.initials}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                            <Typography
                              component="span"
                              className="truncate-cell"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.8125rem',
                                color: '#0f172a',
                                lineHeight: 1.25,
                              }}
                            >
                              <span>{user.name}</span>
                            </Typography>
                            {user.isSelf && (
                              <Typography
                                component="span"
                                sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}
                              >
                                (you)
                              </Typography>
                            )}
                          </Box>
                          <Typography
                            component="span"
                            className="truncate-cell"
                            sx={{
                              fontSize: '0.6875rem',
                              color: '#64748b',
                              fontWeight: 500,
                              mt: 0.2,
                            }}
                          >
                            <span>{user.email}</span>
                          </Typography>
                        </Box>
                      </Box>
                    </th>

                    {/* Role */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Box
                        className="cell-content-dim"
                        sx={{
                          display: 'inline-block',
                          px: 1.15,
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

                    {/* Assigned Base */}
                    <td className="base-cell">
                      <span
                        className="truncate-cell cell-content-dim"
                        style={isSuperAdmin ? { color: '#6d28d9' } : undefined}
                      >
                        <span>{assignedBase}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Box
                        className="cell-content-dim"
                        sx={{
                          display: 'inline-block',
                          px: 1.15,
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
                    <td className="login-cell">
                      <span className="truncate-cell cell-content-dim">
                        <span>{lastLoginLabel}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="action-cell">
                      <Box className="action-buttons cell-content-dim">
                        <ButtonBase
                          onClick={() => onSelectUser(user)}
                          disabled={user.isSelf}
                          sx={{
                            px: 1.15,
                            py: 0.5,
                            borderRadius: '0.5rem',
                            border: '1px solid #dbe3d6',
                            backgroundColor: '#ffffff',
                            color: '#334155',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
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
                            px: 1.15,
                            py: 0.5,
                            borderRadius: '0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
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
      </div>
    </Box>
  )
}

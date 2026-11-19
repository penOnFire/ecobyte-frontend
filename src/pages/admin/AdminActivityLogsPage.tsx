import { useEffect, useState, useMemo, type FC } from 'react'
import {
  Box,
  ButtonBase,
  CircularProgress,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import { adminApi, type AdminActivityLogItem } from '@/lib/api'

interface LogEntry {
  id: string
  ts: string
  userId: string
  userName: string
  role: 'superadmin' | 'official' | 'resident' | 'system'
  action: string
  target: string
  details: string
  barangay: string | null
}

const getInitialActivityLogs = (): LogEntry[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_activity_logs')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  official: 'Barangay Official',
  resident: 'Resident',
  system: 'System',
}

const ROLE_BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  superadmin: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  official: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  resident: { bg: '#f1f4f0', color: '#2e6022', border: '#c5dcba' },
  system: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
}

export const AdminActivityLogsPage: FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(getInitialActivityLogs)
  const [isLoading, setIsLoading] = useState(false)

  // 5 Prototype Filters
  const [filterRole, setFilterRole] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    adminApi
      .getActivityLogs({
        userId: filterUser || undefined,
        action: filterAction || undefined,
        search: search || undefined,
      })
      .then((records: AdminActivityLogItem[]) => {
        if (!active || !records || records.length === 0) return
        const mappedLive: LogEntry[] = records.map((r) => {
          const roleUpper = (r.operator?.role || '').toLowerCase()
          const matchedRole: 'superadmin' | 'official' | 'resident' | 'system' =
            roleUpper.includes('admin')
              ? 'superadmin'
              : roleUpper.includes('official')
                ? 'official'
                : roleUpper.includes('resident')
                  ? 'resident'
                  : 'system'

          return {
            id: r.id,
            ts: r.timestamp?.replace('T', ' ').slice(0, 16) || 'Recent',
            userId: r.operator?.id || 'SYS',
            userName: r.operator?.name || 'System Operator',
            role: matchedRole,
            action: r.action || `${r.entityType}: ${r.newStatus}`,
            target: r.entityId || '—',
            details: r.notes || `${r.entityType} status transitioned to ${r.newStatus}`,
            barangay: 'Commonwealth',
          }
        })

        setLogs((prev) => {
          const liveIds = new Set(mappedLive.map((m) => m.id))
          return [...mappedLive, ...prev.filter((p) => !liveIds.has(p.id))]
        })
      })
      .catch((err) => {
        console.warn('Using prototype activity logs:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [filterUser, filterAction, search])

  // Extract distinct staff users and actions for filter options
  const staffUsers = useMemo(() => {
    const map = new Map<string, string>()
    logs.forEach((l) => {
      if (l.role !== 'resident' && l.role !== 'system') {
        map.set(l.userId, l.userName)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [logs])

  const distinctActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort()
  }, [logs])

  // Filter logic
  const filteredLogs = useMemo(() => {
    let rows = logs.slice()

    if (filterRole) {
      rows = rows.filter((l) => l.role === filterRole)
    }
    if (filterUser) {
      rows = rows.filter((l) => l.userId === filterUser)
    }
    if (filterAction) {
      rows = rows.filter((l) => l.action === filterAction)
    }
    if (filterFrom) {
      rows = rows.filter((l) => l.ts.slice(0, 10) >= filterFrom)
    }
    if (filterTo) {
      rows = rows.filter((l) => l.ts.slice(0, 10) <= filterTo)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.target.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      )
    }

    return rows.sort((a, b) => b.ts.localeCompare(a.ts))
  }, [logs, filterRole, filterUser, filterAction, filterFrom, filterTo, search])

  const hasActiveFilters = Boolean(
    filterRole || filterUser || filterAction || filterFrom || filterTo || search
  )

  const handleClearFilters = () => {
    setFilterRole('')
    setFilterUser('')
    setFilterAction('')
    setFilterFrom('')
    setFilterTo('')
    setSearch('')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Main Activity Logs Card matching Prototype ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #dbe3d6',
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          overflow: 'hidden',
          p: { xs: 2.5, sm: 3 },
        }}
      >
        {/* ── 5 Prototype Filter Controls ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              xl: 'repeat(5, 1fr)',
            },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          {/* 1. Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
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
            <option value="">All roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="official">Barangay Official</option>
            <option value="resident">Resident</option>
            <option value="system">System</option>
          </select>

          {/* 2. Staff Operator Dropdown */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
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
            <option value="">All staff users</option>
            {staffUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* 3. Action Dropdown */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
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
            <option value="">All actions</option>
            {distinctActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* 4. Date From */}
          <input
            type="date"
            title="From"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
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
          />

          {/* 5. Date To */}
          <input
            type="date"
            title="To"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
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
          />
        </Box>

        {/* ── Search Bar & Filter Summary Bar ── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>
              {filteredLogs.length} audit entries
            </Typography>
            {hasActiveFilters && (
              <ButtonBase
                onClick={handleClearFilters}
                sx={{
                  color: '#2e6022',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                Clear filters
              </ButtonBase>
            )}
          </Box>

          <Box sx={{ position: 'relative', width: { xs: '100%', sm: 300 } }}>
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
              placeholder="Search keyword, user, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                paddingLeft: 34,
                paddingRight: 12,
                borderRadius: '0.75rem',
                border: '1px solid #dbe3d6',
                backgroundColor: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1e293b',
                outline: 'none',
                fontFamily: "'Quicksand', sans-serif",
              }}
            />
          </Box>
        </Box>

        {/* ── Audit Logs Table matching Prototype ── */}
        <Box sx={{ overflowX: 'auto', mx: -3, px: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} sx={{ color: '#70b822' }} />
            </Box>
          ) : filteredLogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
              <HistoryRoundedIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#475569' }}>
                No activity matches your filters.
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
                Try adjusting the role, user, or date range filters above.
              </Typography>
            </Box>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Date &amp; Time
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    User
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Action
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Target
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Details
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Barangay
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l) => {
                  const roleStyle = ROLE_BADGE_STYLES[l.role] || ROLE_BADGE_STYLES.system
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Date & Time */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
                        {l.ts}
                      </td>

                      {/* User & Role Badge */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                          {l.userName}
                        </Typography>
                        <Box
                          sx={{
                            display: 'inline-block',
                            mt: 0.5,
                            px: 1,
                            py: 0.2,
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                          }}
                        >
                          {ROLE_LABELS[l.role] || l.role}
                        </Box>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.8125rem', color: '#1e293b' }}>
                        {l.action}
                      </td>

                      {/* Target */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <Box
                          component="span"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#475569',
                            backgroundColor: '#f1f5f9',
                            px: 1,
                            py: 0.25,
                            borderRadius: '6px',
                          }}
                        >
                          {l.target}
                        </Box>
                      </td>

                      {/* Details */}
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500, fontSize: '0.8125rem', minWidth: 220 }}>
                        {l.details}
                      </td>

                      {/* Barangay */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.8125rem', color: '#334155' }}>
                        {l.barangay || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default AdminActivityLogsPage

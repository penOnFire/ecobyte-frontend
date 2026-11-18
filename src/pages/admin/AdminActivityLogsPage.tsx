import { useEffect, useState, type FC } from 'react'
import {
  Box,
  ButtonBase,
  CircularProgress,
  Typography,
} from '@mui/material'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import { adminApi, type AdminActivityLogItem } from '@/lib/api'

export const AdminActivityLogsPage: FC = () => {
  const [logs, setLogs] = useState<AdminActivityLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    let active = true
    adminApi
      .getActivityLogs({
        action: filterAction !== 'all' ? filterAction : undefined,
        search,
      })
      .then((records) => {
        if (active) {
          setLogs(records)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.warn('Could not load activity logs from backend:', err)
          setIsLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [filterAction, search])

  const actionCategories = [
    { id: 'all', label: 'All Activities' },
    { id: 'USER', label: 'User Changes' },
    { id: 'INSPECTION', label: 'Inspections' },
    { id: 'REQUEST', label: 'Drop-Offs' },
    { id: 'REUSE_CLAIM', label: 'Pick-Up Verification' },
  ]

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* ── Top Header ── */}
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
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '9999px',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Module 7 • Super Admin Audit Trail
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
            Activity Logs
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2,
            py: 0.85,
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <HistoryRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
            Audit Entries:
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
            {logs.length}
          </Typography>
        </Box>
      </Box>

      {/* ── Filters & Search ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', width: { xs: '100%', md: 360 } }}>
          <SearchRoundedIcon
            sx={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: 20,
            }}
          />
          <input
            type="text"
            placeholder="Filter by user, action, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              paddingLeft: 42,
              paddingRight: 16,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FilterListRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
          {actionCategories.map((cat) => {
            const active = filterAction === cat.id
            return (
              <ButtonBase
                key={cat.id}
                onClick={() => setFilterAction(cat.id)}
                sx={{
                  px: 1.75,
                  py: 0.85,
                  borderRadius: '9999px',
                  backgroundColor: active ? '#16a34a' : '#f1f5f9',
                  color: active ? '#ffffff' : '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: active ? '#15803d' : '#e2e8f0',
                  },
                }}
              >
                {cat.label}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* ── Activity Logs Table ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} color="success" />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
            <HistoryRoundedIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>No activity records found</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              System actions, user role modifications, and inspection decisions will be recorded here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Timestamp
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Operator
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Action Category
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Status Transition
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Details &amp; Audit Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isUserAction = log.entityType === 'USER'
                  const isInspection = log.entityType === 'INSPECTION'
                  const isClaim = log.entityType === 'REUSE_CLAIM'

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#475569', whiteSpace: 'nowrap' }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                          {log.operator?.name || 'System / Official'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {log.operator?.email || 'Automated Workflow'}
                        </Typography>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.35,
                            borderRadius: '6px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: isUserAction
                              ? '#eff4ff'
                              : isInspection
                                ? '#f0fdf4'
                                : isClaim
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                            color: isUserAction
                              ? '#1d4ed8'
                              : isInspection
                                ? '#15803d'
                                : isClaim
                                  ? '#b45309'
                                  : '#475569',
                          }}
                        >
                          {log.entityType}
                        </Box>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                          {log.newStatus}
                        </Typography>
                        {log.oldStatus && (
                          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                            from {log.oldStatus}
                          </Typography>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#334155' }}>
                          {log.notes || '—'}
                        </Typography>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AdminActivityLogsPage

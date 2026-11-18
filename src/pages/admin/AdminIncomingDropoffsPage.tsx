import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import {
  adminApi,
  type AdminCollectionRequest,
} from '@/lib/api'

export const AdminIncomingDropoffsPage: FC = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<AdminCollectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'received' | 'missed'>('scheduled')
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let active = true
    adminApi
      .getRequests()
      .then((data) => {
        if (active) {
          setRequests(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.warn('Could not load incoming requests:', err)
          setIsLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [refreshTrigger])

  const handleMarkReceived = async (req: AdminCollectionRequest) => {
    setBusyRequestId(req.id)
    try {
      const res = await adminApi.markDropoffReceived(req.id)
      if (res?.success) {
        setToast({
          message: `Device marked Received! Moved to Inspection Queue (${req.requestCode}).`,
          severity: 'success',
        })
        setRefreshTrigger((prev) => prev + 1)
      } else {
        setToast({
          message: (res as any)?.error || res?.message || 'Could not update status to Under Inspection.',
          severity: 'error',
        })
      }
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to mark device as received.',
        severity: 'error',
      })
    } finally {
      setBusyRequestId(null)
    }
  }

  const handleMarkMissed = async (req: AdminCollectionRequest) => {
    setBusyRequestId(req.id)
    try {
      const res = await adminApi.markDropoffMissed(req.id)
      if (res?.success) {
        setToast({
          message: `Marked as Missed. Time slot released for ${req.requestCode}.`,
          severity: 'success',
        })
        setRefreshTrigger((prev) => prev + 1)
      } else {
        setToast({
          message: (res as any)?.error || res?.message || 'Could not update status to Missed.',
          severity: 'error',
        })
      }
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to mark drop-off as missed.',
        severity: 'error',
      })
    } finally {
      setBusyRequestId(null)
    }
  }

  const scheduledCount = requests.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return s === 'scheduled' || s === 'pending_review'
  }).length

  const receivedCount = requests.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return s === 'under_inspection' || s === 'collected'
  }).length

  const missedCount = requests.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return s === 'missed'
  }).length

  const filtered = requests.filter((req) => {
    const s = (req.status || '').toLowerCase()
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'scheduled'
        ? s === 'scheduled' || s === 'pending_review'
        : filterStatus === 'received'
        ? s === 'under_inspection' || s === 'collected'
        : filterStatus === 'missed'
        ? s === 'missed'
        : true

    if (!matchesFilter) return false

    if (!search.trim()) return true
    const term = search.toLowerCase()
    return (
      (req.requestCode || '').toLowerCase().includes(term) ||
      (req.residentName || '').toLowerCase().includes(term) ||
      (req.preferredMethod || '').toLowerCase().includes(term) ||
      (req.siteName || '').toLowerCase().includes(term)
    )
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* ── Top Header Strip ── */}
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
              Module 6A • Station Reception
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
            Incoming Drop-Offs
          </Typography>
        </Box>

        {/* Telemetry pill */}
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
          <MoveToInboxRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
            Station Status:
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
            Commonwealth Central MRF
          </Typography>
        </Box>
      </Box>

      {/* ── 4-Metric Summary Strip ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Scheduled (Arriving)
            </Typography>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {scheduledCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
              Awaiting resident drop-off
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HourglassTopRoundedIcon />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Received Devices
            </Typography>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
              {receivedCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              Moved to Inspection Queue
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleRoundedIcon />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Missed Drop-Offs
            </Typography>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 800, color: '#be123c', mt: 0.5 }}>
              {missedCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 600 }}>
              Slots released
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#ffe4e6',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CancelOutlinedIcon />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Total Station Volume
            </Typography>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {requests.length}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Recorded drop-off bookings
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#eff4ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EventAvailableRoundedIcon />
          </Box>
        </Box>
      </Box>

      {/* ── Filters & Search Toolbar ── */}
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
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {/* Search */}
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
            placeholder="Search by request code, resident, or item..."
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
              boxSizing: 'border-box',
            }}
          />
        </Box>

        {/* Filter Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FilterListRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
          {[
            { id: 'scheduled', label: `Scheduled (${scheduledCount})` },
            { id: 'received', label: `Received (${receivedCount})` },
            { id: 'missed', label: `Missed (${missedCount})` },
            { id: 'all', label: `All (${requests.length})` },
          ].map((tab) => {
            const active = filterStatus === tab.id
            return (
              <ButtonBase
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
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
                {tab.label}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* ── Requests Ledger Table ── */}
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
            <CircularProgress size={32} sx={{ color: '#16a34a' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
            <MoveToInboxRoundedIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>No drop-offs found</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Scheduled resident drop-offs will appear here when appointments are booked.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Request / Code
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Resident Details
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Station &amp; Slot
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                    Official Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const statusLower = (req.status || '').toLowerCase()
                  const isScheduled = statusLower === 'scheduled' || statusLower === 'pending_review'
                  const isReceived = statusLower === 'under_inspection' || statusLower === 'collected'
                  const isMissed = statusLower === 'missed'
                  const isBusy = busyRequestId === req.id

                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                          {req.requestCode}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {req.preferredMethod || 'Station Drop-Off'}
                        </Typography>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                          {req.residentName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {req.residentEmail || req.contactNumber || 'No phone'}
                        </Typography>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                          {req.siteName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {req.scheduledSlot || req.requestedDate}
                        </Typography>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.25,
                            py: 0.35,
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: isReceived
                              ? '#dcfce7'
                              : isScheduled
                              ? '#fef3c7'
                              : isMissed
                              ? '#ffe4e6'
                              : '#f1f5f9',
                            color: isReceived
                              ? '#15803d'
                              : isScheduled
                              ? '#b45309'
                              : isMissed
                              ? '#be123c'
                              : '#475569',
                          }}
                        >
                          {req.displayStatus}
                        </Box>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          {isScheduled && (
                            <>
                              <ButtonBase
                                disabled={isBusy}
                                onClick={() => void handleMarkReceived(req)}
                                sx={{
                                  height: 32,
                                  px: 1.5,
                                  borderRadius: '8px',
                                  backgroundColor: '#dcfce7',
                                  border: '1px solid #86efac',
                                  color: '#15803d',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  transition: 'all 0.15s ease',
                                  '&:hover': { backgroundColor: '#bbf7d0' },
                                }}
                              >
                                {isBusy ? <CircularProgress size={14} sx={{ color: '#15803d' }} /> : 'Received'}
                              </ButtonBase>
                              <ButtonBase
                                disabled={isBusy}
                                onClick={() => void handleMarkMissed(req)}
                                sx={{
                                  height: 32,
                                  px: 1.25,
                                  borderRadius: '8px',
                                  backgroundColor: '#fff1f2',
                                  border: '1px solid #fecdd3',
                                  color: '#be123c',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease',
                                  '&:hover': { backgroundColor: '#ffe4e6' },
                                }}
                              >
                                Mark Missed
                              </ButtonBase>
                            </>
                          )}
                          {isReceived && (
                            <ButtonBase
                              onClick={() => navigate('/admin/to-inspect')}
                              sx={{
                                height: 32,
                                px: 1.5,
                                borderRadius: '8px',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#16a34a',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                '&:hover': { backgroundColor: '#dcfce7' },
                              }}
                            >
                              <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
                              <span>Go to Inspection</span>
                              <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                            </ButtonBase>
                          )}
                          {isMissed && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              Slot Released
                            </Typography>
                          )}
                        </Box>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {/* ── Snackbar Feedback ── */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: '12px' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}
export default AdminIncomingDropoffsPage

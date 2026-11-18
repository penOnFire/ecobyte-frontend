import { useEffect, useState, type MouseEvent } from 'react'
import type { FC } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from '@mui/material'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded'
import { useNavigate, useLocation } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { dropoffsApi } from '@/lib/api'
import type { EwasteRequestItem, UserReservationItem } from '@/types'

export const MyRequestsPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const initialTab = new URLSearchParams(location.search).get('tab') === 'completed' ? 'completed' : 'ongoing'
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>(initialTab)
  const [ongoing, setOngoing] = useState<EwasteRequestItem[]>([])
  const [completed, setCompleted] = useState<EwasteRequestItem[]>([])
  const [reservations, setReservations] = useState<UserReservationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'review'>('all')
  const [selectedRequest, setSelectedRequest] = useState<EwasteRequestItem | null>(null)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [actionToast, setActionToast] = useState<string | null>(null)
  const [nowMs] = useState(() => Date.now())

  const handleCancelRequest = async () => {
    if (!selectedRequest) return
    setIsCancelling(true)
    try {
      await dropoffsApi.cancelIntake(selectedRequest.requestId)
      // Update ongoing list by removing the cancelled request
      setOngoing((prev) => prev.filter((r) => r.requestId !== selectedRequest.requestId))
      setCancelConfirmOpen(false)
      setSelectedRequest(null)
      setActionToast(`Drop-off request #${selectedRequest.requestId} has been cancelled and your slot released.`)
    } catch (err: any) {
      console.error('Failed to cancel request:', err)
      setActionToast(err?.message || 'Unable to cancel drop-off request. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const getLocalReservations = (): UserReservationItem[] => {
      try {
        const stored = localStorage.getItem('ecobyte_user_reservations')
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }

    const getLocalClaimed = (): EwasteRequestItem[] => {
      try {
        const stored = localStorage.getItem('ecobyte_claimed_requests')
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }

    dropoffsApi
      .getMyRequests()
      .then((data) => {
        if (!isMounted) return
        const localRes = getLocalReservations()
        const localClaimed = getLocalClaimed()
        const apiReservations = data.reservations || []
        const apiCompleted = data.completed || []
        const seenCodes = new Set(apiReservations.map((r) => r.pickupCode))
        const seenCompletedIds = new Set(apiCompleted.map((r) => r.requestId))
        const dedupedLocalRes = localRes.filter((r) => !seenCodes.has(r.pickupCode))
        const dedupedLocalClaimed = localClaimed.filter((r) => !seenCompletedIds.has(r.requestId))
        setOngoing(data.ongoing || [])
        setCompleted([...apiCompleted, ...dedupedLocalClaimed])
        setReservations([...apiReservations, ...dedupedLocalRes])
        setLoadError(null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load user requests from backend:', err)
        if (isMounted) {
          const localRes = getLocalReservations()
          const localClaimed = getLocalClaimed()
          setOngoing([])
          setCompleted(localClaimed)
          setReservations(localRes)
          setLoadError(null)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredOngoing = ongoing.filter((r) => {
    if (statusFilter === 'scheduled') return r.status === 'Scheduled'
    if (statusFilter === 'review') return r.status === 'Under review' || (r.status as string) === 'pending_review'
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5, pb: 4 }}>
      {/* Top Bar Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate('/dashboard')}
            aria-label="Back"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
              }}
            >
              My Requests
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.6875rem',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              Track pickups &amp; active reservations
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          aria-label="Filter"
          onClick={(e: MouseEvent<HTMLElement>) => setFilterAnchor(e.currentTarget)}
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: statusFilter !== 'all' ? '#f1f5f9' : '#ffffff',
            border: '1px solid',
            borderColor: statusFilter !== 'all' ? '#0f172a' : '#e2e8f0',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                fontFamily: "'Quicksand', sans-serif",
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setStatusFilter('all')
              setFilterAnchor(null)
            }}
            selected={statusFilter === 'all'}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              {statusFilter === 'all' ? <CheckRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} /> : <Box sx={{ width: 18 }} />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: statusFilter === 'all' ? 700 : 500, fontSize: '0.8125rem', color: '#0f172a' }}>
                  All Requests
                </Typography>
              }
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter('scheduled')
              setFilterAnchor(null)
            }}
            selected={statusFilter === 'scheduled'}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              {statusFilter === 'scheduled' ? <CheckRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} /> : <Box sx={{ width: 18 }} />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: statusFilter === 'scheduled' ? 700 : 500, fontSize: '0.8125rem', color: '#0f172a' }}>
                  Scheduled Only
                </Typography>
              }
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter('review')
              setFilterAnchor(null)
            }}
            selected={statusFilter === 'review'}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              {statusFilter === 'review' ? <CheckRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} /> : <Box sx={{ width: 18 }} />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: statusFilter === 'review' ? 700 : 500, fontSize: '0.8125rem', color: '#0f172a' }}>
                  Under Review
                </Typography>
              }
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Segmented Pill Tabs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          p: 0.5,
          backgroundColor: '#f1f5f9',
          borderRadius: 9999,
          border: '1px solid #e2e8f0',
        }}
      >
        <Box
          onClick={() => setActiveTab('ongoing')}
          sx={{
            py: 0.85,
            textAlign: 'center',
            borderRadius: 9999,
            backgroundColor: activeTab === 'ongoing' ? '#0f172a' : 'transparent',
            color: activeTab === 'ongoing' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'ongoing' ? '0 1px 3px rgba(15,23,42,0.15)' : 'none',
          }}
        >
          Ongoing ({ongoing.length})
        </Box>
        <Box
          onClick={() => setActiveTab('completed')}
          sx={{
            py: 0.85,
            textAlign: 'center',
            borderRadius: 9999,
            backgroundColor: activeTab === 'completed' ? '#0f172a' : 'transparent',
            color: activeTab === 'completed' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'completed' ? '0 1px 3px rgba(15,23,42,0.15)' : 'none',
          }}
        >
          Completed ({completed.length})
        </Box>
      </Box>

      {activeTab === 'ongoing' ? (
        <>
          {/* Active Reservations Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              >
                Reservations
              </Typography>
              <StatusBadge
                label={reservations.length > 0 ? `${reservations.length} Active` : '0 Active'}
                variant={reservations.length > 0 ? 'electric' : 'muted'}
                size="sm"
              />
            </Box>

            {loadError && (
              <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#b91c1c' }}>
                  {loadError}
                </Typography>
              </Card>
            )}

            {isLoading ? null : reservations.length === 0 ? (
              <Card sx={{ p: 2.5, textAlign: 'center', borderRadius: 2, border: '1px dashed #cbd5e1', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  No active reservations
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/reuse')}
                  sx={{ mt: 1, color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Browse Reuse Hub
                </Button>
              </Card>
            ) : (
              reservations.map((res) => {
                const isResExpired = res.expiresAt ? new Date(res.expiresAt).getTime() < nowMs : false
                return (
                <Card
                  key={res.reservationId}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: isResExpired ? '#fff1f2' : '#ffffff',
                    border: isResExpired ? '1.5px solid #fecaca' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: '#0f172a',
                        }}
                      >
                        {res.itemTitle}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.75rem',
                          color: isResExpired ? '#dc2626' : '#64748b',
                          fontWeight: isResExpired ? 700 : 500,
                          mt: 0.5,
                          lineHeight: 1.45,
                        }}
                      >
                        {isResExpired
                          ? 'Hold expired • Unclaimed item returned to Reuse Hub'
                          : res.expiresAt
                            ? `Hold expires ${new Date(res.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : 'Held for 48 hours'}
                        <br />
                        ({res.siteName})
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: isResExpired ? '#ef4444' : '#0f172a',
                        px: 1,
                        py: 0.3,
                        borderRadius: 9999,
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          color: isResExpired ? '#ffffff' : '#abf06b',
                        }}
                      >
                        {isResExpired ? 'EXPIRED' : `Code: ${res.pickupCode}`}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: isResExpired ? '1fr' : '1fr 1fr', gap: 1, mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    {isResExpired ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/reuse')}
                        sx={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 9999,
                          py: 0.8,
                          '&:hover': { backgroundColor: '#1e293b' },
                        }}
                      >
                        Browse Available Refurbished Equipment
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<QrCode2RoundedIcon sx={{ fontSize: 18 }} />}
                          onClick={() =>
                            navigate(
                              `/reservation-code?code=${encodeURIComponent(res.pickupCode)}&title=${encodeURIComponent(res.itemTitle)}`
                            )
                          }
                          sx={{
                            borderColor: '#e2e8f0',
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 9999,
                            py: 0.8,
                            '&:hover': {
                              backgroundColor: '#f8fafc',
                              borderColor: '#cbd5e1',
                            },
                          }}
                        >
                          View Code
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 18, color: '#abf06b' }} />}
                          onClick={() => {
                            const params = new URLSearchParams({
                              reservationId: res.reservationId,
                              code: res.pickupCode,
                              title: res.itemTitle,
                              site: res.siteName,
                            })
                            navigate(`/proof-of-claim?${params.toString()}`)
                          }}
                          sx={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 9999,
                            py: 0.8,
                            boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
                            '&:hover': { backgroundColor: '#1e293b' },
                          }}
                        >
                          Upload Proof
                        </Button>
                      </>
                    )}
                  </Box>
                </Card>
                )
              })
            )}
          </Box>

          {/* Ongoing Requests List Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                color: '#0f172a',
              }}
            >
              Ongoing Drop-offs (Commonwealth)
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} sx={{ color: '#0f172a' }} />
              </Box>
            ) : filteredOngoing.length === 0 ? (
              <Card sx={{ p: 2.5, textAlign: 'center', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  No ongoing drop-offs
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/drop-offs')}
                  sx={{ mt: 1, color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Find a drop-off hub
                </Button>
              </Card>
            ) : (
              filteredOngoing.map((req) => {
                const canReschedule = req.status === 'Scheduled' || req.status === 'Under review'
                return (
                <Card
                  key={req.requestId}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#0f172a' },
                  }}
                  onClick={() => setSelectedRequest(req)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.9375rem',
                          color: '#0f172a',
                        }}
                      >
                        Request #{req.requestId}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontWeight: 500,
                          mt: 0.25,
                        }}
                      >
                        {req.deviceTitle} · {req.siteName}
                      </Typography>
                    </Box>
                    <StatusBadge
                      label={req.status}
                      variant={req.status === 'Scheduled' ? 'electric' : 'hazard'}
                      size="sm"
                    />
                  </Box>

                  <Box sx={{ my: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.75rem',
                          color: req.status === 'Scheduled' ? '#0f172a' : '#b45309',
                          fontWeight: 700,
                        }}
                      >
                        {req.statusStage}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        Step {req.progressStep}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={req.progressPercent}
                      sx={{
                        height: 6,
                        borderRadius: 9999,
                        backgroundColor: req.status === 'Scheduled' ? '#e2e8f0' : '#fef3c7',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: req.status === 'Scheduled' ? '#0f172a' : '#f59e0b',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#64748b', flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.6875rem',
                          color: '#64748b',
                          fontWeight: 500,
                        }}
                      >
                        {req.scheduledSlot}
                      </Typography>
                    </Box>
                    {canReschedule && (
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.6875rem',
                          color: '#15803d',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        Manage request &gt;
                      </Typography>
                    )}
                  </Box>
                </Card>
                )
              })
            )}
          </Box>
        </>
      ) : (
        /* Completed State */
        <Box sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
          {completed.length === 0 ? (
            <>
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 48, color: '#0f172a', mb: 1.5 }} />
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              >
                No completed requests yet
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  mt: 0.5,
                  maxWidth: 260,
                  mx: 'auto',
                }}
              >
                Items you safely drop off and recycle or reuse in Commonwealth will appear here.
              </Typography>
            </>
          ) : (
            completed.map((comp) => (
              <Card
                key={comp.requestId}
                sx={{
                  p: 2,
                  mb: 1.5,
                  textAlign: 'left',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                      {comp.deviceTitle}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                      Ref #{comp.requestId} • {comp.siteName}
                    </Typography>
                  </Box>
                  <StatusBadge label="Completed" variant="electric" size="sm" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1.25, borderTop: '1px solid #f1f5f9' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                    ✓ Turnover Certified (+150 pts)
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                    {comp.scheduledSlot || 'Verified claim'}
                  </Typography>
                </Box>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* ── Request Details Modal (Module 4) ── */}
      <Dialog
        open={Boolean(selectedRequest && !cancelConfirmOpen)}
        onClose={() => setSelectedRequest(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2.5,
              p: 1,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>
                  Request #{selectedRequest.requestId}
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                  {selectedRequest.deviceTitle}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedRequest(null)} aria-label="Close details">
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                  Current Status
                </Typography>
                <StatusBadge
                  label={selectedRequest.status}
                  variant={selectedRequest.status === 'Scheduled' ? 'electric' : 'hazard'}
                  size="sm"
                />
              </Box>

              <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>
                  Drop-Off Location &amp; Window
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedRequest.siteName}
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#475569', mt: 0.25 }}>
                  {selectedRequest.scheduledSlot}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 700 }}>
                    {selectedRequest.statusStage}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                    Step {selectedRequest.progressStep}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={selectedRequest.progressPercent}
                  sx={{
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: selectedRequest.status === 'Scheduled' ? '#e2e8f0' : '#fef3c7',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: selectedRequest.status === 'Scheduled' ? '#0f172a' : '#f59e0b',
                    },
                  }}
                />
              </Box>

              {selectedRequest.status === 'Scheduled' || selectedRequest.status === 'Under review' ? (
                <Box sx={{ p: 1.25, backgroundColor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                    {selectedRequest.status === 'Scheduled'
                      ? 'Your drop-off slot is active and confirmed. You may update the drop-off hub/date or cancel to release your slot.'
                      : 'Your intake request is pending station confirmation. You may update your preferred drop-off hub/date or cancel it.'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    This intake request is currently being processed by station personnel and cannot be modified.
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedRequest.status === 'Scheduled' || selectedRequest.status === 'Under review' ? (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EditCalendarRoundedIcon />}
                    onClick={() => {
                      const id = selectedRequest.requestId
                      setSelectedRequest(null)
                      navigate(`/dropoff-schedule?requestId=${encodeURIComponent(id)}`)
                    }}
                    sx={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      py: 1.1,
                      '&:hover': { backgroundColor: '#1e293b' },
                    }}
                  >
                    Reschedule Drop-Off
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<EventBusyRoundedIcon />}
                    onClick={() => setCancelConfirmOpen(true)}
                    sx={{
                      borderColor: '#fca5a5',
                      color: '#dc2626',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      py: 1,
                      '&:hover': { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
                    }}
                  >
                    Cancel Booking (Release Slot)
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSelectedRequest(null)}
                  sx={{ color: '#0f172a', borderColor: '#cbd5e1', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Close
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Cancel Confirmation Modal ── */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={() => !isCancelling && setCancelConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2.5,
              p: 1,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <WarningAmberRoundedIcon sx={{ color: '#dc2626', fontSize: 24 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>
            Cancel Drop-Off Request?
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
            Are you sure you want to cancel Drop-off Request <strong>#{selectedRequest?.requestId}</strong>?
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, mt: 1 }}>
            Your intake reservation at {selectedRequest?.siteName} will be released immediately and removed from incoming queue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button
            onClick={() => setCancelConfirmOpen(false)}
            disabled={isCancelling}
            sx={{ flex: 1, color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Keep Booking
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelRequest}
            disabled={isCancelling}
            sx={{
              flex: 1.2,
              backgroundColor: '#dc2626',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 1.5,
              '&:hover': { backgroundColor: '#b91c1c' },
            }}
          >
            {isCancelling ? <CircularProgress size={20} color="inherit" /> : 'Yes, Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Action Snackbar ── */}
      <Snackbar
        open={Boolean(actionToast)}
        autoHideDuration={4000}
        onClose={() => setActionToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
          {actionToast}
        </Alert>
      </Snackbar>
    </Box>
  )
}

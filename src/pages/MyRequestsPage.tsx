import { useEffect, useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
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

  useEffect(() => {
    let isMounted = true
    localStorage.removeItem('ecobyte_ongoing_requests')
    localStorage.removeItem('ecobyte_claimed_requests')

    dropoffsApi
      .getMyRequests()
      .then((data) => {
        if (!isMounted) return
        setOngoing(data.ongoing || [])
        setCompleted(data.completed || [])
        setReservations(data.reservations || [])
        setLoadError(null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load user requests from backend:', err)
        if (isMounted) {
          setOngoing([])
          setCompleted([])
          setReservations([])
          setLoadError('Unable to load requests from the server right now.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

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
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
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
              reservations.map((res) => (
                <Card
                  key={res.reservationId}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
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
                          color: '#64748b',
                          fontWeight: 500,
                          mt: 0.5,
                          lineHeight: 1.45,
                        }}
                      >
                        {res.expiresAt
                          ? `Hold expires ${new Date(res.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : 'Held for 48 hours'}
                        <br />
                        ({res.siteName})
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: '#0f172a',
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
                          color: '#abf06b',
                        }}
                      >
                        Code: {res.pickupCode}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<QrCode2RoundedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate('/reservation-code')}
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
                      onClick={() => navigate('/proof-of-claim')}
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
                  </Box>
                </Card>
              ))
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
            ) : ongoing.length === 0 ? (
              <Card sx={{ p: 2.5, textAlign: 'center', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  No ongoing drop-offs
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/dropoffs')}
                  sx={{ mt: 1, color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Find a drop-off hub
                </Button>
              </Card>
            ) : (
              ongoing.map((req) => {
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
                    cursor: canReschedule ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    '&:hover': canReschedule ? { borderColor: '#0f172a' } : {},
                  }}
                  onClick={() => {
                    if (canReschedule) {
                      navigate(`/schedule-dropoff?requestId=${encodeURIComponent(req.requestId)}`)
                    }
                  }}
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
                        Change date &gt;
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
    </Box>
  )
}

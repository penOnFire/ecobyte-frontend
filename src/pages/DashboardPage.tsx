import { useEffect, useState, type FC } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import { useNavigate } from 'react-router-dom'
import { StepperTracker } from '@/components/ui/StepperTracker'
import { CommonwealthHeaderMap } from '@/components/map/CommonwealthHeaderMap'
import {
  authApi,
  dropoffsApi,
  extractFirstName,
  getCachedUser,
  reuseApi,
  type DashboardSummary,
} from '@/lib/api'
import type { ReuseItem, User } from '@/types'
import ipadImg from '@/assets/ui/ipad.jpeg'
import keychronImg from '@/assets/ui/keychron.jpeg'
import thinkpadImg from '@/assets/ui/thinkpad.jpeg'
import galaxyImg from '@/assets/ui/galaxy_s10.jpeg'
import chargerImg from '@/assets/ui/charger.jpeg'

const TRACKER_STEPS = [
  { id: 1, label: 'Submitted' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Scheduled' },
  { id: 4, label: 'Collected' },
  { id: 5, label: 'Turned over' },
]

function resolveStepperStep(status?: string): number {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'turned over') return 5
  if (normalized === 'collected') return 4
  if (normalized === 'scheduled') return 3
  if (normalized === 'under review') return 2
  return 1
}

function resolveReuseThumbnail(item: ReuseItem): string {
  const lower = `${item.title} ${item.category}`.toLowerCase()
  if (lower.includes('ipad') || lower.includes('tablet')) return ipadImg
  if (lower.includes('keychron') || lower.includes('keyboard')) return keychronImg
  if (lower.includes('thinkpad') || lower.includes('laptop')) return thinkpadImg
  if (lower.includes('galaxy') || lower.includes('phone')) return galaxyImg
  if (lower.includes('charger') || lower.includes('usb')) return chargerImg
  return item.imageUrl || ipadImg
}

function resolveUserBase(user: User | null): number {
  if (!user) return 1
  if (user.barangay?.id) {
    const idNum = parseInt(user.barangay.id, 10)
    if (!isNaN(idNum) && idNum >= 1 && idNum <= 9) return idNum
    const match = /(?:base|area)[\s_-]*(\d+)/i.exec(user.barangay.id)
    if (match) return parseInt(match[1], 10)
  }
  if (user.barangay?.name) {
    const match = /(?:base|area)[\s_-]*(\d+)/i.exec(user.barangay.name)
    if (match) return parseInt(match[1], 10)
  }
  return 1
}

export const DashboardPage: FC = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCachedUser())
  const [summary, setSummary] = useState<DashboardSummary>({
    activeRequestsCount: 0,
    assessedCount: 0,
    reservedCount: 0,
    ecoPoints: 0,
    ecoTier: 'Starter Tier',
    divertedKg: 0,
    activeRequest: null,
  })
  const [reuseItems, setReuseItems] = useState<ReuseItem[]>([])

  useEffect(() => {
    let active = true
    authApi
      .getProfile()
      .then((profile) => {
        if (active && profile) {
          setCurrentUser(profile)
        }
      })
      .catch(() => {
        // Keep cached user if token is missing or offline
      })

    dropoffsApi
      .getDashboardSummary()
      .then((data) => {
        if (active && data) {
          setSummary(data)
        }
      })
      .catch(() => {
        // Keep zeroed defaults when unauthenticated or offline
      })

    reuseApi
      .getItems()
      .then((res) => {
        if (active && Array.isArray(res?.items)) {
          setReuseItems(res.items.slice(0, 2))
        }
      })
      .catch(() => {
        // Keep empty list if unavailable
      })

    return () => {
      active = false
    }
  }, [])

  const firstName = extractFirstName(currentUser)
  const userBaseNum = resolveUserBase(currentUser)
  const activeReq = summary.activeRequest

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Curved Hero Header with Integrated Commonwealth Base Map ── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          overflow: 'hidden',
          pt: 8,
          pb: 2,
          px: 2.5,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
        }}
      >
        {/* Barangay Commonwealth Map Background */}
        <CommonwealthHeaderMap userBaseNumber={userBaseNum} userName={firstName} />

        {/* Foreground Content inside Hero: flex column with mt: 'auto' pins greeting, Hub Live, and stats to the bottom */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          {/* Bottom Section: Greeting row directly above the Stats Container */}
          <Box sx={{ mt: 'auto' }}>
            {/* Greeting Row + "Hub Live" red pill */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                mb: 1.25,
                gap: 1.5,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600,
                    fontSize: { xs: '1.875rem', sm: '2.125rem' },
                    color: '#ffffff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  Hello, {firstName}
                </Typography>

                {/* Subtitle directly below greeting */}
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    mt: 0.25,
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  Circular lifecycle diagnostics &amp; recovery
                </Typography>
              </Box>

              {/* "Hub Live" red pill placed to the right of the greeting */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.7,
                  backgroundColor: '#FF0004',
                  color: '#ffffff',
                  px: 1.35,
                  py: 0.45,
                  borderRadius: 9999,
                  boxShadow: '0 2px 8px rgba(255, 0, 4, 0.4)',
                  flexShrink: 0,
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    lineHeight: 1,
                    letterSpacing: '0.01em',
                  }}
                >
                  Hub Live
                </Typography>
              </Box>
            </Box>

            {/* ── 3-Column Stats Card (Requests, Assessed, and Reserved container) ── */}
            <Card
              sx={{
                borderRadius: '16px',
                backgroundColor: 'rgba(18, 38, 18, 0.88)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(171, 240, 107, 0.25)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                p: 2,
              }}
            >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', textAlign: 'center' }}>
              {/* Requests */}
              <Box
                onClick={() => navigate('/requests?tab=ongoing')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  py: 0.5,
                  transition: 'background-color 0.15s ease',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#ABF06B', fontWeight: 700 }}>
                  Requests
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#ffffff', my: 0.25, lineHeight: 1 }}>
                  {summary.activeRequestsCount}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: '#ABF06B',
                    color: '#1B3314',
                    borderRadius: 9999,
                    px: 1.25,
                    py: 0.25,
                    fontSize: '0.625rem',
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {summary.activeRequestsCount > 0 ? `${summary.activeRequestsCount} Active` : 'Active'}
                </Box>
              </Box>

              {/* Assessed */}
              <Box
                onClick={() => navigate('/requests?tab=assessed')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderLeft: '1px solid rgba(220, 207, 192, 0.2)',
                  borderRight: '1px solid rgba(220, 207, 192, 0.2)',
                  px: 0.5,
                  py: 0.5,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#ABF06B', fontWeight: 700 }}>
                  Assessed
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#ffffff', my: 0.25, lineHeight: 1 }}>
                  {summary.assessedCount}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: '#ABF06B',
                    color: '#1B3314',
                    borderRadius: 9999,
                    px: 1.25,
                    py: 0.25,
                    fontSize: '0.625rem',
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  Total Items
                </Box>
              </Box>

              {/* Reserved */}
              <Box
                onClick={() => navigate('/requests?tab=ongoing')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  py: 0.5,
                  transition: 'background-color 0.15s ease',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#ABF06B', fontWeight: 700 }}>
                  Reserved
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#ffffff', my: 0.25, lineHeight: 1 }}>
                  {summary.reservedCount}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: '#ABF06B',
                    color: '#1B3314',
                    borderRadius: 9999,
                    px: 1.25,
                    py: 0.25,
                    fontSize: '0.625rem',
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  Pending
                </Box>
              </Box>
            </Box>
          </Card>
          </Box>
        </Box>
      </Box>

      {/* ── Content Below Hero: Not Crowded, Generous Padding ── */}
      <Box sx={{ px: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2.5, pb: 4 }}>
        {/* ── Active Request Tracker Card ── */}
        {activeReq ? (
          <Card
            sx={{
              p: 2.25,
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(220, 207, 192, 0.6)',
              boxShadow: '0 2px 8px rgba(79, 95, 75, 0.06)',
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {/* Top Row: Icon, Title, Badge, Details link */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#1F2937' }}>
                        Active Request
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: '#E8F0E6',
                          color: '#4F5F4B',
                          borderRadius: 9999,
                          px: 1,
                          py: 0.25,
                          fontSize: '0.6875rem',
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        {activeReq.status || 'In Transit'}
                      </Box>
                    </Box>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#596556', fontWeight: 500, mt: 0.2 }}>
                      Req #{activeReq.requestId} • {activeReq.deviceTitle}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  onClick={() => navigate('/requests')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4F5F4B',
                    cursor: 'pointer',
                    '&:hover': { color: '#264E11' },
                  }}
                >
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                    Details
                  </Typography>
                  <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>

              {/* Faint divider line */}
              <Box sx={{ borderBottom: '1px solid rgba(220, 207, 192, 0.4)', my: 1.75 }} />

              {/* Stepper */}
              <Box sx={{ mb: 1.75 }}>
                <StepperTracker steps={TRACKER_STEPS} currentStep={resolveStepperStep(activeReq.status)} />
              </Box>

              {/* Scheduled Slot Banner */}
              <Box
                sx={{
                  backgroundColor: '#FBF9F6',
                  border: '1px solid rgba(220, 207, 192, 0.5)',
                  borderRadius: '12px',
                  px: 1.5,
                  py: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#4F5F4B' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#1F2937', fontWeight: 600 }}>
                    {activeReq.scheduledSlot}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#1F2937', fontWeight: 700 }}>
                  {activeReq.statusStage || 'Driver assigned'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card
            sx={{
              p: 2.25,
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(220, 207, 192, 0.6)',
              boxShadow: '0 2px 8px rgba(79, 95, 75, 0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    backgroundColor: '#FBF9F6',
                    color: '#4F5F4B',
                    border: '1px solid rgba(220, 207, 192, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#1F2937' }}>
                    No Active Requests
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#596556', mt: 0.2 }}>
                    Scan an e-waste device or schedule a drop-off to start tracking.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/scan')}
                startIcon={<CameraAltRoundedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: 9999,
                  px: 2,
                  py: 0.75,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'linear-gradient(180deg, #5b8e28 0%, #366014 100%)',
                  color: '#ffffff',
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(38, 78, 17, 0.25)',
                  flexShrink: 0,
                  '&:hover': {
                    filter: 'brightness(1.05)',
                  },
                }}
              >
                Scan
              </Button>
            </Box>
          </Card>
        )}

        {/* ── Latest in Reuse Hub ── */}
        <Box>
          {/* Header Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  color: '#1F2937',
                  textTransform: 'uppercase',
                }}
              >
                LATEST IN REUSE HUB
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#CEEBC4',
                  color: '#266317',
                  borderRadius: 9999,
                  px: 1.25,
                  py: 0.25,
                  fontSize: '0.625rem',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                }}
              >
                Refurb
              </Box>
            </Box>
            <Typography
              onClick={() => navigate('/reuse')}
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4F5F4B',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline', color: '#264E11' },
              }}
            >
              Explore all
            </Typography>
          </Box>

          {/* Product Cards List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {reuseItems.length > 0 ? (
              reuseItems.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(220, 207, 192, 0.6)',
                    boxShadow: '0 2px 8px rgba(79, 95, 75, 0.06)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 88,
                        height: 88,
                        borderRadius: '12px',
                        backgroundColor: '#FBF9F6',
                        border: '1px solid rgba(220, 207, 192, 0.4)',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={resolveReuseThumbnail(item)}
                        alt={item.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(220, 207, 192, 0.4)',
                          borderRadius: '4px',
                          px: 0.6,
                          py: 0.2,
                        }}
                      >
                        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#4F5F4B' }}>
                          {item.category}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#1F2937' }}>
                            {item.title}
                          </Typography>
                          <Box
                            sx={{
                              backgroundColor: '#CEEBC4',
                              color: '#266317',
                              borderRadius: 9999,
                              px: 1,
                              py: 0.25,
                              fontSize: '0.625rem',
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {item.status}
                          </Box>
                        </Box>
                        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#596556', mt: 0.25 }}>
                          {item.condition} • {item.subcondition}
                        </Typography>
                        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#596556' }}>
                          📍 {item.location} • {item.distance}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#266317' }}>
                          {item.price === 'Free' ? 'Free Claim' : item.price}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={item.status !== 'Available'}
                          onClick={() => navigate(`/reuse/${item.id}`)}
                          sx={{
                            borderRadius: '8px',
                            py: 0.45,
                            px: 2,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            background:
                              item.status === 'Available'
                                ? 'linear-gradient(180deg, #5b8e28 0%, #366014 100%)'
                                : '#e2e8f0',
                            color: item.status === 'Available' ? '#ffffff' : '#94a3b8',
                            boxShadow:
                              item.status === 'Available'
                                ? '0 2px 6px rgba(38, 78, 17, 0.25)'
                                : 'none',
                            '&:hover': {
                              filter: 'brightness(1.05)',
                            },
                          }}
                        >
                          {item.status === 'Available' ? 'Reserve' : item.status}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))
            ) : (
              <Card
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(220, 207, 192, 0.6)',
                  boxShadow: '0 2px 8px rgba(79, 95, 75, 0.06)',
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#596556', textAlign: 'center' }}>
                  No refurbished items available in the Reuse Hub right now.
                </Typography>
              </Card>
            )}
          </Box>
        </Box>

        {/* ── Lithium-ion Protocol Warning Callout ── */}
        <Card
          sx={{
            p: 2,
            borderRadius: '16px',
            backgroundColor: '#FFE3E0',
            border: '1px solid rgba(255, 120, 120, 0.25)',
            boxShadow: '0 2px 8px rgba(169, 17, 17, 0.04)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 22, color: '#EF4444', mt: 0.15 }} />
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#DC2626' }}>
                Lithium-ion Protocol
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#7a1a1a', mt: 0.25, lineHeight: 1.45 }}>
                Never puncture or crush swollen batteries. Pack separated items in anti-static or non-conductive bags prior to drop-off.
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}

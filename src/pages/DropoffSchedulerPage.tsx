import { useEffect, useState } from 'react'
import type { FC } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { dropoffsApi } from '@/lib/api'
import type { DropOffSite, EwasteRequestItem } from '@/types'
import { CommonwealthLeafletMap } from '@/components/map/CommonwealthLeafletMap'
import { COMMONWEALTH_FALLBACK_SITES } from '@/components/map/commonwealthData'

const TIME_WINDOWS = [
  {
    id: 'morning',
    title: 'Morning Window',
    hours: '09:00 AM - 11:30 AM',
    desc: 'Staffed hazmat desk open',
    icon: <WbSunnyOutlinedIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'afternoon',
    title: 'Afternoon Window',
    hours: '01:00 PM - 03:30 PM',
    desc: 'Optimal battery intake slot',
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
  },
  {
    id: 'evening',
    title: 'Late Afternoon / Evening',
    hours: '04:00 PM - 06:00 PM',
    desc: 'Pre-closing turnover cycle',
    icon: <NightsStayOutlinedIcon sx={{ fontSize: 18 }} />,
  },
]

export const DropoffSchedulerPage: FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(25)
  const [selectedWindow, setSelectedWindow] = useState('afternoon')
  const [selectedHub, setSelectedHub] = useState<string>('commonwealth-mrf-area1')
  const [sites, setSites] = useState<DropOffSite[]>(COMMONWEALTH_FALLBACK_SITES)
  const [isLoadingSites, setIsLoadingSites] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    dropoffsApi
      .getSites()
      .then((data) => {
        if (!isMounted) return
        if (data && data.length > 0) {
          // Enrich with coordinates from Commonwealth fallback if missing
          const enriched = data.map((d, i) => {
            const fallback = COMMONWEALTH_FALLBACK_SITES[i % COMMONWEALTH_FALLBACK_SITES.length]
            return {
              ...d,
              coordinates: d.coordinates || fallback.coordinates,
              hazmatAccredited: d.hazmatAccredited ?? fallback.hazmatAccredited,
            }
          })
          setSites(enriched)
          if (!selectedHub && enriched.length > 0) {
            setSelectedHub(enriched[0].id)
          }
        }
      })
      .catch((err) => {
        console.warn('Backend dropoffs API unavailable, using Commonwealth 9-Base cluster:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoadingSites(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedHub])

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setToastMessage('Geolocation is not supported by your browser')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setToastMessage('GPS Synced. Centered on your current location.')
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setIsLocating(false)
        setUserLocation({ lat: 14.7044, lng: 121.0965 })
        setToastMessage('Centered on Barangay Commonwealth Hall Complex')
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const handleGetDirections = (site: DropOffSite) => {
    if (site.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${site.coordinates.lat},${site.coordinates.lng}`
      window.open(url, '_blank')
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${site.name}, Commonwealth, Quezon City`
      )}`
      window.open(url, '_blank')
    }
  }

  const currentSite = sites.find((s) => s.id === selectedHub) || sites[0] || COMMONWEALTH_FALLBACK_SITES[0]
  const currentWindow = TIME_WINDOWS.find((w) => w.id === selectedWindow) || TIME_WINDOWS[1]

  const handleConfirmSchedule = async () => {
    setIsSubmitting(true)
    const siteToBook = currentSite
    const newRequestId = `${Math.floor(2000 + Math.random() * 8000)}`
    const scheduledSlotFormatted = `Oct ${selectedDate}, 2026 • ${currentWindow.hours} • ${siteToBook.name}`

    // Construct local ongoing request ticket
    const newRequest: EwasteRequestItem = {
      requestId: newRequestId,
      deviceTitle: 'iPhone 11 Pro (Swollen Battery)',
      siteName: siteToBook.name,
      status: 'Scheduled',
      statusStage: 'Drop-off confirmed',
      progressStep: 'Step 2/3',
      progressPercent: 66,
      scheduledSlot: scheduledSlotFormatted,
    }

    try {
      await dropoffsApi.scheduleIntake({
        siteId: siteToBook.id,
        scheduledDate: `2026-10-${selectedDate}`,
        timeSlot: selectedWindow,
        courierOrSelf: 'SELF_DROPOFF',
      })
    } catch (err) {
      console.warn('Booking API scheduled with local fallback context:', err)
    }

    // Persist to local ongoing requests storage for MyRequestsPage
    try {
      const existing = localStorage.getItem('ecobyte_ongoing_requests')
      const parsed: EwasteRequestItem[] = existing ? JSON.parse(existing) : []
      const updated = [newRequest, ...parsed.filter((r) => r.requestId !== newRequestId)]
      localStorage.setItem('ecobyte_ongoing_requests', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to persist ongoing request to localStorage:', e)
    }

    setIsSubmitting(false)
    navigate('/requests?tab=ongoing')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5, pb: 4 }}>
      {/* ── Top Bar Navigation ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            aria-label="Back"
            sx={{
              width: 38,
              height: 38,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.2 }}>
              Schedule Hazardous Drop-off
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
              Barangay Commonwealth • 9 Accredited Bases
            </Typography>
          </Box>
        </Box>

        <Box onClick={handleLocateUser} sx={{ cursor: 'pointer' }}>
          <StatusBadge
            label={userLocation ? 'GPS Synced' : isLocating ? 'Locating...' : 'Sync GPS'}
            variant={userLocation ? 'electric' : 'muted'}
            size="sm"
          />
        </Box>
      </Box>

      {/* ── Hazardous Alert & Mandatory Precaution Card ── */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1.5px solid #fecaca',
          backgroundColor: '#fffaf0',
          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                px: 1,
                py: 0.25,
                borderRadius: 9999,
                width: 'fit-content',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem' }}>
                Hazardous E-Waste Intake Required
              </Typography>
            </Box>

            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              iPhone 11 Pro
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#dc2626' }}>
              ⚡ Degraded Swollen Battery • Internal Degassing Stress
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SmartphoneRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Box>

        <Divider sx={{ my: 1.25, borderColor: '#fed7aa' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#b45309' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
            Dedicated fire-safe lithium containment bin allocated upon arrival.
          </Typography>
        </Box>
      </Card>

      {/* ── STEP 1: Select Drop-off Base with the 9-Base Map ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              1. Select Drop-off Base on Map
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            9 Bases in Commonwealth
          </Typography>
        </Box>

        {/* Selected Hub Highlight Banner */}
        <Card
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.25,
                backgroundColor: '#abf06b',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9375rem',
                flexShrink: 0,
              }}
            >
              {currentSite.id.includes('area')
                ? currentSite.id.replace(/\D/g, '') || '1'
                : '1'}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentSite.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.6875rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                📍 {currentSite.address} • {currentSite.hours}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>
            <Chip
              size="small"
              label="Selected Base"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                fontWeight: 800,
                backgroundColor: '#abf06b',
                color: '#0f172a',
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleGetDirections(currentSite)}
              sx={{
                color: '#ffffff',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
              title="Open Directions"
            >
              <NavigationRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Card>

        {/* ── Official Commonwealth Interactive Map (9 Bases & Boundary) ── */}
        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CommonwealthLeafletMap
            sites={sites}
            selectedSiteId={selectedHub}
            onSelectSite={(id) => setSelectedHub(id)}
            onGetDirections={handleGetDirections}
            userLocation={userLocation}
            onLocateUser={handleLocateUser}
            height={340}
          />
        </Box>

        {/* ── 9 Drop-off Stations Quick Selection Cards ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#475569' }}>
            Choose specific intake base:
          </Typography>

          {isLoadingSites ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: '#0f172a' }} />
            </Box>
          ) : (
            sites.map((hub, idx) => {
              const isSelected = selectedHub === hub.id
              return (
                <Card
                  key={hub.id}
                  onClick={() => setSelectedHub(hub.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.75,
                    border: isSelected ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    boxShadow: isSelected ? '0 2px 8px rgba(15,23,42,0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#0f172a' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                          {hub.name}
                        </Typography>
                        {hub.hazmatAccredited && (
                          <Chip
                            size="small"
                            label="Hazmat Ready"
                            sx={{
                              height: 18,
                              fontSize: '0.5625rem',
                              fontWeight: 800,
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                        📍 {hub.address} • {hub.hours}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", color: '#0f172a', fontWeight: 800, fontSize: '0.75rem' }}>
                      {hub.distance || `${hub.distanceKm || 0.8} km`}
                    </Typography>
                    {isSelected ? (
                      <RadioButtonCheckedRoundedIcon sx={{ color: '#0f172a', fontSize: 20 }} />
                    ) : (
                      <RadioButtonUncheckedRoundedIcon sx={{ color: '#cbd5e1', fontSize: 20 }} />
                    )}
                  </Box>
                </Card>
              )
            })
          )}
        </Box>
      </Box>

      {/* ── STEP 2: Pick Date and Time ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              2. Pick Date &amp; Intake Time Window
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            October 2026
          </Typography>
        </Box>

        <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Calendar header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              October 2026
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" aria-label="Previous month" sx={{ color: '#64748b' }}>
                <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" aria-label="Next month" sx={{ color: '#64748b' }}>
                <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Weekday headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <Typography key={d} sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#94a3b8' }}>
                {d}
              </Typography>
            ))}
          </Box>

          {/* Dates grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#cbd5e1' }}>28</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#cbd5e1' }}>29</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#cbd5e1' }}>30</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>1</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>2</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>3</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>4</Typography>

            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>19</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>20</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>21</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>22</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>23</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#94a3b8' }}>24</Typography>

            {/* Dates: 25 to 31 */}
            {[25, 26, 27, 28, 29, 30, 31].map((day) => {
              const isSelected = selectedDate === day
              return (
                <Box
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    border: isSelected ? 'none' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    mx: 'auto',
                    boxShadow: isSelected ? '0 2px 6px rgba(15,23,42,0.2)' : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#0f172a',
                    },
                  }}
                >
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', lineHeight: 1 }}>
                    {day}
                  </Typography>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#abf06b' : '#16a34a',
                      mt: 0.2,
                    }}
                  />
                </Box>
              )
            })}
          </Box>

          <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0f172a' }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                  Selected
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                  Open Slots
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
              Date: October {selectedDate}, 2026
            </Typography>
          </Box>
        </Card>

        {/* ── Pick Time Window ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                Intake Time Slot
              </Typography>
            </Box>
            <StatusBadge label="Certified Intake Guarded" variant="electric" size="sm" />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {TIME_WINDOWS.map((item) => {
              const isSelected = selectedWindow === item.id
              return (
                <Card
                  key={item.id}
                  onClick={() => setSelectedWindow(item.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: isSelected ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    boxShadow: isSelected ? '0 2px 6px rgba(15,23,42,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ color: isSelected ? '#0f172a' : '#64748b' }}>{item.icon}</Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                        {item.hours} • {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                  <StatusBadge
                    label={isSelected ? 'Selected' : 'Available'}
                    variant={isSelected ? 'electric' : 'muted'}
                    size="sm"
                  />
                </Card>
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* ── Intake Booking Summary Preview ── */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          mt: 0.5,
        }}
      >
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.8125rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Drop-off Manifest Summary
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#64748b' }}>Intake Base:</span>
            <strong style={{ color: '#0f172a' }}>{currentSite.name}</strong>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#64748b' }}>Scheduled Slot:</span>
            <strong style={{ color: '#0f172a' }}>Oct {selectedDate}, 2026 ({currentWindow.hours})</strong>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#64748b' }}>Hazmat Category:</span>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>Class III (Lithium Degassing)</span>
          </Box>
        </Box>
      </Card>

      {/* ── Confirm Schedule CTA Button ── */}
      <Box sx={{ mt: 0.5 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          onClick={handleConfirmSchedule}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9375rem',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
            '&:hover': { backgroundColor: '#1e293b' },
          }}
        >
          {isSubmitting ? 'Confirming Drop-off with Commonwealth Hub...' : 'Confirm Drop-off Schedule'}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1.25 }}>
          <VerifiedUserOutlinedIcon sx={{ fontSize: 14, color: '#16a34a' }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            Official QC E-Waste intake certificate and QR handover token issued upon confirmation
          </Typography>
        </Box>
      </Box>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setToastMessage(null)} sx={{ width: '100%', borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default DropoffSchedulerPage

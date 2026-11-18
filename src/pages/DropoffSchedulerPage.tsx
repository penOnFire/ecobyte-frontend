import { useEffect, useMemo, useState } from 'react'
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
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { dropoffsApi, getCachedUser } from '@/lib/api'
import type { DropOffSite, User } from '@/types'
import { CommonwealthLeafletMap } from '@/components/map/CommonwealthLeafletMap'
import {
  COMMONWEALTH_FALLBACK_SITES,
  COMMONWEALTH_PARTITIONS,
  findPartitionForSite,
  resolveSiteBaseNumber,
} from '@/components/map/commonwealthData'

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

function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

function formatIsoDate(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function getTodayIso(): { iso: string; year: number; month: number } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  return { iso: formatIsoDate(year, month, day), year, month }
}

function formatReadableDate(isoDate: string, style: 'long' | 'short' = 'long'): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  const utc = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('en-US', {
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc)
}

function formatMonthYear(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, 1)))
}

interface CalendarCell {
  key: string
  day: number
  isoDate: string
  inCurrentMonth: boolean
  isPast: boolean
}

function buildMonthGrid(year: number, monthIndex: number, todayIso: string): CalendarCell[] {
  const firstDayOfWeek = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay()
  // Monday-first offset (Mo=0 .. Su=6)
  const leadingEmpty = (firstDayOfWeek + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const prevMonthYear = monthIndex === 0 ? year - 1 : year
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1
  const daysInPrevMonth = new Date(Date.UTC(prevMonthYear, prevMonthIndex + 1, 0)).getUTCDate()

  const cells: CalendarCell[] = []

  for (let i = leadingEmpty - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const isoDate = formatIsoDate(prevMonthYear, prevMonthIndex, day)
    cells.push({
      key: `prev-${isoDate}`,
      day,
      isoDate,
      inCurrentMonth: false,
      isPast: true,
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = formatIsoDate(year, monthIndex, day)
    cells.push({
      key: `curr-${isoDate}`,
      day,
      isoDate,
      inCurrentMonth: true,
      isPast: isoDate < todayIso,
    })
  }

  const nextMonthYear = monthIndex === 11 ? year + 1 : year
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1
  const trailingCount = (7 - (cells.length % 7)) % 7
  for (let day = 1; day <= trailingCount; day++) {
    const isoDate = formatIsoDate(nextMonthYear, nextMonthIndex, day)
    cells.push({
      key: `next-${isoDate}`,
      day,
      isoDate,
      inCurrentMonth: false,
      isPast: isoDate < todayIso,
    })
  }

  return cells
}

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
  const [searchParams] = useSearchParams()
  const requestedSiteParam = searchParams.get('siteId') || ''
  const requestIdParam = searchParams.get('requestId') || ''
  const isRescheduling = Boolean(requestIdParam)
  const isUnidentified = searchParams.get('unidentified') === 'true'
  const categoryParam = searchParams.get('category') || ''
  const displayDeviceTitle = isUnidentified
    ? `Unidentified Device (${categoryParam || 'General E-Waste'})`
    : 'Samsung Galaxy S10 (Intake Inspection)'

  const [todayInfo] = useState(() => getTodayIso())
  const [currentUser] = useState<User | null>(() => getCachedUser())
  const userBaseNum = resolveUserBase(currentUser)
  const userBasePartition =
    COMMONWEALTH_PARTITIONS.find((p) => p.num === userBaseNum) ||
    COMMONWEALTH_PARTITIONS[0]

  const initialBaseSite =
    COMMONWEALTH_FALLBACK_SITES.find(
      (s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum
    ) || COMMONWEALTH_FALLBACK_SITES[0]

  const [viewedMonth, setViewedMonth] = useState(() => ({
    year: todayInfo.year,
    month: todayInfo.month,
  }))
  const [selectedDateStr, setSelectedDateStr] = useState(() => todayInfo.iso)
  const [selectedWindow, setSelectedWindow] = useState('afternoon')
  const [selectedHub, setSelectedHub] = useState<string>(
    () => requestedSiteParam || initialBaseSite.id
  )
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
          const enriched = data.map((d, i) => {
            const partition = findPartitionForSite(d.id, d.name, i)
            const fallback =
              COMMONWEALTH_FALLBACK_SITES[(partition?.num ?? i + 1) - 1] ||
              COMMONWEALTH_FALLBACK_SITES[i % COMMONWEALTH_FALLBACK_SITES.length]
            return {
              ...d,
              coordinates: partition
                ? { lat: partition.center[0], lng: partition.center[1] }
                : d.coordinates || fallback.coordinates,
              hazmatAccredited: d.hazmatAccredited ?? fallback.hazmatAccredited,
            }
          })
          setSites(enriched)
          setSelectedHub((prev) => {
            if (requestedSiteParam && enriched.some((s) => s.id === requestedSiteParam)) {
              return requestedSiteParam
            }
            if (prev && prev !== initialBaseSite.id && enriched.some((s) => s.id === prev)) {
              return prev
            }
            const match = enriched.find((s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum)
            return match?.id || enriched[0]?.id || prev
          })
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
  }, [requestedSiteParam, initialBaseSite.id, userBaseNum])

  const referencePoint = userLocation || {
    lat: userBasePartition.center[0],
    lng: userBasePartition.center[1],
  }

  const suggestedSite = useMemo(() => {
    if (sites.length === 0) return initialBaseSite
    if (userLocation) {
      let closest = sites[0]
      let minD = Infinity
      for (const s of sites) {
        if (s.coordinates) {
          const d = calculateHaversineDistanceKm(
            userLocation.lat,
            userLocation.lng,
            s.coordinates.lat,
            s.coordinates.lng
          )
          if (d < minD) {
            minD = d
            closest = s
          }
        }
      }
      return closest
    }
    const match = sites.find((s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum)
    return match || sites[0] || initialBaseSite
  }, [sites, userLocation, userBaseNum, initialBaseSite])

  const isAtCurrentMonth =
    viewedMonth.year === todayInfo.year && viewedMonth.month === todayInfo.month

  const handlePrevMonth = () => {
    if (isAtCurrentMonth) return
    setViewedMonth((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 }
    )
  }

  const handleNextMonth = () => {
    setViewedMonth((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 }
    )
  }

  const calendarCells = buildMonthGrid(viewedMonth.year, viewedMonth.month, todayInfo.iso)
  const viewedMonthLabel = formatMonthYear(viewedMonth.year, viewedMonth.month)

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

    try {
      let createdReqId = requestIdParam || `REQ-${Math.floor(1000 + Math.random() * 9000)}`
      if (requestIdParam) {
        const res = await dropoffsApi.rescheduleIntake(requestIdParam, {
          siteId: siteToBook.id,
          scheduledDate: selectedDateStr,
          timeSlot: selectedWindow,
          courierOrSelf: 'SELF_DROPOFF',
        })
        if (res?.requestId) createdReqId = res.requestId
      } else {
        const storedAssessmentId =
          searchParams.get('assessmentId') ||
          sessionStorage.getItem('ecobyte_last_assessment_id') ||
          undefined
        const res = await dropoffsApi.scheduleIntake({
          assessmentId: storedAssessmentId,
          siteId: siteToBook.id,
          scheduledDate: selectedDateStr,
          timeSlot: selectedWindow,
          courierOrSelf: 'SELF_DROPOFF',
        })
        if (res?.requestId) createdReqId = res.requestId
        sessionStorage.removeItem('ecobyte_last_assessment_id')
        sessionStorage.removeItem('ecobyte_scan_angles')
      }

      // Synchronize with local drop-off requests list for immediate visibility in official portal
      try {
        const currentUser = getCachedUser()
        const stored = localStorage.getItem('ecobyte_dropoff_requests')
        const existing: any[] = stored ? JSON.parse(stored) : []
        const dateCode = selectedDateStr.replace(/-/g, '')
        const shortNum = Math.floor(100 + Math.random() * 900)
        const requestCode = `DO-${dateCode}-${shortNum}`

        const newDropoffRecord = {
          id: createdReqId,
          requestCode,
          itemName: 'E-Waste Item Scheduled for Drop-off',
          type: 'Electronics',
          residentId: currentUser?.id || 'res-user',
          residentName: currentUser?.fullName || 'Resident User',
          residentEmail: currentUser?.email || 'resident@ecobyte.ph',
          siteId: siteToBook.id,
          siteName: siteToBook.name,
          date: selectedDateStr,
          slot: currentWindow.hours,
          status: 'Scheduled',
          assessment: {
            detectedType: 'Electronic Device',
            confidence: 94,
            hazard: 'Low',
            recommendation: 'Repair & Reuse',
            impact: { kg: 1.5, materials: 'Recoverable metals & components' },
            checklist: {
              powersOn: 'Yes',
              screen: 'Good',
              battery: 'Standard',
              missingParts: 'None',
              waterDamage: 'No',
            },
          },
          history: [
            {
              status: 'Scheduled',
              note: 'Resident booked drop-off via Portal',
              ts: new Date().toLocaleString(),
              by: currentUser?.fullName || 'Resident User',
            },
          ],
        }

        const filtered = existing.filter((r) => r.id !== createdReqId)
        localStorage.setItem(
          'ecobyte_dropoff_requests',
          JSON.stringify([newDropoffRecord, ...filtered])
        )

        // Also append to local activity logs
        const logEntry = {
          id: `log-${Date.now()}`,
          ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
          userId: currentUser?.id || 'res-user',
          userName: currentUser?.fullName || 'Resident User',
          role: 'resident',
          action: 'Scheduled drop-off',
          target: createdReqId,
          details: `Drop-off booked at ${siteToBook.name}`,
          barangay: currentUser?.barangay?.name || 'Commonwealth',
        }
        const existingLogs = JSON.parse(localStorage.getItem('ecobyte_activity_logs') || '[]')
        localStorage.setItem(
          'ecobyte_activity_logs',
          JSON.stringify([logEntry, ...existingLogs.slice(0, 50)])
        )
      } catch (syncErr) {
        console.warn('Failed to sync drop-off locally:', syncErr)
      }

      localStorage.removeItem('ecobyte_ongoing_requests')
      navigate('/requests?tab=ongoing')
    } catch (err: any) {
      console.error('Failed to schedule drop-off:', err)
      setToastMessage(
        err?.message || 'Unable to confirm drop-off schedule. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
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
              {isRescheduling ? `Reschedule Request #${requestIdParam}` : 'Schedule Hazardous Drop-off'}
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
              {isRescheduling
                ? 'Update your drop-off base, date, and time window'
                : 'Barangay Commonwealth • 9 Accredited Bases'}
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
                backgroundColor: isUnidentified ? '#fef3c7' : '#fee2e2',
                color: isUnidentified ? '#b45309' : '#dc2626',
                px: 1,
                py: 0.25,
                borderRadius: 9999,
                width: 'fit-content',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem' }}>
                {isUnidentified ? 'Unidentified E-Waste Intake' : 'Hazardous E-Waste Intake Required'}
              </Typography>
            </Box>

            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              {displayDeviceTitle}
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: isUnidentified ? '#b45309' : '#dc2626' }}>
              {isUnidentified
                ? '🔍 Physical Inspection Required at Station (Module 2 Low-Confidence Route)'
                : '⚡ Degraded Swollen Battery • Internal Degassing Stress'}
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

        {/* ── Nearest Base Suggestion Callout Banner ── */}
        <Card
          sx={{
            p: 1.75,
            borderRadius: 2,
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #86efac',
            boxShadow: '0 2px 8px rgba(34,197,94,0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.25,
              boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#14532d' }}>
                Suggested Station: {suggestedSite.name}
              </Typography>
              <Chip
                size="small"
                label={`Nearest to Base Area ${userBaseNum}`}
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#bbf7d0',
                  color: '#14532d',
                  border: '1px solid #86efac',
                }}
              />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#166534', mt: 0.5, lineHeight: 1.45 }}>
              {userLocation
                ? 'GPS synced: Pre-selected as the closest station to your current live location.'
                : `Pre-selected as the closest drop-off station to your registered residence (${currentUser?.barangay?.name || `Base Area ${userBaseNum}`}).`}
              {' '}You have full freedom to choose any of the 9 accredited stations below.
            </Typography>
            {selectedHub !== suggestedSite.id && (
              <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setSelectedHub(suggestedSite.id)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    py: 0.35,
                    px: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    boxShadow: '0 1px 3px rgba(21,128,61,0.2)',
                    '&:hover': { backgroundColor: '#14532d' },
                  }}
                >
                  Reset to Suggested Station ({suggestedSite.name.split('(')[0].trim()})
                </Button>
              </Box>
            )}
          </Box>
        </Card>

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
                backgroundColor: currentSite.id === suggestedSite.id ? '#22c55e' : '#abf06b',
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
            {currentSite.id === suggestedSite.id ? (
              <Chip
                size="small"
                label="🌟 Nearest to Your Base"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                }}
              />
            ) : (
              <Chip
                size="small"
                label="Selected Base (Custom Choice)"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#abf06b',
                  color: '#0f172a',
                }}
              />
            )}
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
              const isSuggested = hub.id === suggestedSite.id
              const distKm = hub.coordinates
                ? calculateHaversineDistanceKm(
                    referencePoint.lat,
                    referencePoint.lng,
                    hub.coordinates.lat,
                    hub.coordinates.lng
                  )
                : hub.distanceKm || 0.8
              return (
                <Card
                  key={hub.id}
                  onClick={() => setSelectedHub(hub.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.75,
                    border: isSelected
                      ? isSuggested
                        ? '2px solid #16a34a'
                        : '2px solid #0f172a'
                      : isSuggested
                      ? '1.5px dashed #86efac'
                      : '1px solid #e2e8f0',
                    backgroundColor: isSelected
                      ? isSuggested
                        ? '#f0fdf4'
                        : '#f8fafc'
                      : isSuggested
                      ? '#fcfdfc'
                      : '#ffffff',
                    boxShadow: isSelected ? '0 2px 8px rgba(15,23,42,0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: isSuggested ? '#16a34a' : '#0f172a' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isSelected
                          ? isSuggested
                            ? '#16a34a'
                            : '#0f172a'
                          : isSuggested
                          ? '#dcfce7'
                          : '#f1f5f9',
                        color: isSelected
                          ? '#ffffff'
                          : isSuggested
                          ? '#15803d'
                          : '#475569',
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
                        {isSuggested && (
                          <Chip
                            size="small"
                            label={`🌟 Nearest to Base Area ${userBaseNum}`}
                            sx={{
                              height: 18,
                              fontSize: '0.5625rem',
                              fontWeight: 800,
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                            }}
                          />
                        )}
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
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", color: isSuggested ? '#16a34a' : '#0f172a', fontWeight: 800, fontSize: '0.75rem' }}>
                      ~{distKm} km
                    </Typography>
                    {isSelected ? (
                      <RadioButtonCheckedRoundedIcon sx={{ color: isSuggested ? '#16a34a' : '#0f172a', fontSize: 20 }} />
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
            {viewedMonthLabel}
          </Typography>
        </Box>

        <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Calendar header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              {viewedMonthLabel}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={handlePrevMonth}
                disabled={isAtCurrentMonth}
                aria-label="Previous month"
                sx={{ color: isAtCurrentMonth ? '#cbd5e1' : '#0f172a' }}
              >
                <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNextMonth}
                aria-label="Next month"
                sx={{ color: '#0f172a' }}
              >
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
            {calendarCells.map((cell) => {
              const isSelectable = cell.inCurrentMonth && !cell.isPast
              const isSelected = cell.isoDate === selectedDateStr

              if (!isSelectable) {
                return (
                  <Box
                    key={cell.key}
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.75rem',
                        color: cell.inCurrentMonth ? '#94a3b8' : '#cbd5e1',
                        fontWeight: 500,
                      }}
                    >
                      {cell.day}
                    </Typography>
                  </Box>
                )
              }

              return (
                <Box
                  key={cell.key}
                  onClick={() => setSelectedDateStr(cell.isoDate)}
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
                    {cell.day}
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
              Date: {formatReadableDate(selectedDateStr, 'long')}
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
            <strong style={{ color: '#0f172a' }}>{formatReadableDate(selectedDateStr, 'short')} ({currentWindow.hours})</strong>
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
          {isSubmitting
            ? isRescheduling
              ? 'Updating Drop-off Schedule...'
              : 'Confirming Drop-off with Commonwealth Hub...'
            : isRescheduling
              ? 'Save New Drop-off Schedule'
              : 'Confirm Drop-off Schedule'}
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

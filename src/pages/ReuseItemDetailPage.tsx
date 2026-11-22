import { useEffect, useMemo, useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded'
import { useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { resolveMediaUrl, reuseApi } from '@/lib/api'
import type { ReuseItem } from '@/types'
import thinkpadDetailImg from '@/assets/ui/thinkpad_detail.jpeg'
import galaxyImg from '@/assets/ui/galaxy_s10.jpeg'
import chargerImg from '@/assets/ui/charger.jpeg'
import ipadImg from '@/assets/ui/ipad.jpeg'
import keychronImg from '@/assets/ui/keychron.jpeg'

function resolveDetailImage(item: ReuseItem | null): string {
  if (!item) return thinkpadDetailImg
  if (item.imageUrl && !item.imageUrl.includes('placeholder') && !item.imageUrl.includes('unsplash')) {
    return resolveMediaUrl(item.imageUrl)
  }
  const lower = `${item.title} ${item.category}`.toLowerCase()
  if (lower.includes('galaxy') || lower.includes('phone') || lower.includes('s10')) return galaxyImg
  if (lower.includes('charger') || lower.includes('cable') || lower.includes('usb')) return chargerImg
  if (lower.includes('ipad') || lower.includes('tablet')) return ipadImg
  if (lower.includes('keyboard') || lower.includes('keychron')) return keychronImg
  return thinkpadDetailImg
}

function formatIsoDate(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function getDateDefaults(): {
  todayIso: string
  tomorrowIso: string
  todayYear: number
  todayMonth: number
  year: number
  month: number
} {
  const now = new Date()
  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth()
  const todayIso = formatIsoDate(todayYear, todayMonth, now.getDate())
  const tmrw = new Date(todayYear, todayMonth, now.getDate() + 1)
  const tomorrowIso = formatIsoDate(tmrw.getFullYear(), tmrw.getMonth(), tmrw.getDate())
  return {
    todayIso,
    tomorrowIso,
    todayYear,
    todayMonth,
    year: tmrw.getFullYear(),
    month: tmrw.getMonth(),
  }
}

function formatPickupLabel(isoDate: string, todayIso: string, tomorrowIso: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  const utc = new Date(Date.UTC(y, m - 1, d))
  if (isoDate === tomorrowIso) {
    const shortPart = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(utc)
    return `Tomorrow, ${shortPart}`
  }
  if (isoDate === todayIso) {
    const shortPart = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(utc)
    return `Today, ${shortPart}`
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
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
      isPast: true,
    })
  }
  return cells
}

export const ReuseItemDetailPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const [dateDefaults] = useState(() => getDateDefaults())
  const [selectedDateIso, setSelectedDateIso] = useState(() => dateDefaults.tomorrowIso)
  const [viewedMonth, setViewedMonth] = useState(() => ({
    year: dateDefaults.year,
    month: dateDefaults.month,
  }))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const selectedDate = formatPickupLabel(
    selectedDateIso,
    dateDefaults.todayIso,
    dateDefaults.tomorrowIso
  )
  const isAtCurrentMonth =
    viewedMonth.year === dateDefaults.todayYear &&
    viewedMonth.month === dateDefaults.todayMonth
  const calendarCells = buildMonthGrid(
    viewedMonth.year,
    viewedMonth.month,
    dateDefaults.todayIso
  )
  const viewedMonthLabel = formatMonthYear(viewedMonth.year, viewedMonth.month)

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

  const [selectedWindow, setSelectedWindow] = useState('01:00 PM')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [liveItem, setLiveItem] = useState<ReuseItem | null>(null)
  const [nowMs] = useState(() => Date.now())

  useEffect(() => {
    if (!id) return
    let active = true
    reuseApi
      .getItemById(id)
      .then((item) => {
        if (active && item) setLiveItem(item)
      })
      .catch(() => {
        // Keep default display if backend item lookup is offline
      })
    return () => {
      active = false
    }
  }, [id])

  const displayTitle = liveItem?.title || 'Lenovo ThinkPad T480 - Core i5 8th Gen'
  const displayCode = liveItem?.itemCode || 'CIR-84920'
  const displayCondition = liveItem?.condition || 'Grade A Re-use'
  const displayHubName = liveItem?.pickupHub?.name || 'Commonwealth Area 1 Eco-Hub - Barangay Commonwealth'
  const displayHubAddress = liveItem?.pickupHub?.address || '1.2 km away • Closes 6:00 PM'
  const displayDescription = liveItem?.specs?.description || 'Intel i5-8350U • 16GB RAM / 256GB SSD'
  const displayWeight = liveItem?.specs?.weightKg ? `${liveItem.specs.weightKg} kg` : '1.65 kg'
  const displayImage = resolveDetailImage(liveItem)

  const isReserved = useMemo(() => {
    if (liveItem?.status && liveItem.status.toLowerCase() !== 'available') return true
    try {
      const stored = localStorage.getItem('ecobyte_user_reservations')
      if (stored) {
        const list = JSON.parse(stored)
        if (Array.isArray(list)) {
          return list.some((r: any) => {
            if (String(r.itemId) !== String(id)) return false
            if (r.status !== 'RESERVED') return false
            if (r.expiresAt && new Date(r.expiresAt).getTime() <= nowMs) return false
            return true
          })
        }
      }
    } catch {
      // ignore
    }
    return false
  }, [liveItem, id, nowMs])

  const handleShare = async () => {
    const shareData = {
      title: 'Lenovo ThinkPad T480 - EcoByte Reuse Hub',
      text: 'Check out this verified refurbished ThinkPad available for pickup at Commonwealth Hub on EcoByte!',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setToastMsg('Item shared successfully!')
      } catch {
        // User closed share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setToastMsg('Share link copied to clipboard!')
      } catch {
        setToastMsg('Link: ' + window.location.href)
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
          Item Details
        </Typography>

        <IconButton
          size="small"
          aria-label="Share item"
          onClick={handleShare}
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
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Hero Item Image ── */}
      <Card
        sx={{
          height: { xs: 220, sm: 320, md: 360 },
          borderRadius: 2,
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1.5,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          component="img"
          src={displayImage}
          alt={displayTitle}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Top left badge */}
        <Box sx={{ zIndex: 1, position: 'relative' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              px: 1.25,
              py: 0.4,
              borderRadius: 9999,
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 14, color: '#abf06b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem' }}>
              AI Inspected &amp; Certified
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Bottom right badge */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', zIndex: 1, position: 'relative' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(4px)',
              color: '#0f172a',
              px: 1.25,
              py: 0.4,
              borderRadius: 9999,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#abf06b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem' }}>
              {displayCondition}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Item Headline & Location ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <StatusBadge label="Available - First come, first served" variant="electric" size="sm" />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            ID: {displayCode}
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
          {displayTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
            {displayHubName}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', ml: 2.75 }}>
          {displayHubAddress}
        </Typography>
      </Box>

      {/* ── Device Specifications Card ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              Device Specifications
            </Typography>
          </Box>
          <StatusBadge label="Refurbished" variant="electric" size="sm" />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0', gridColumn: liveItem ? 'span 2' : 'auto' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              {liveItem ? 'Condition & Specs' : 'Processor'}
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              {liveItem ? displayDescription : 'Intel i5-8350U'}
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              {liveItem ? 'Category' : 'Memory & Storage'}
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              {liveItem?.category || '16GB RAM / 256GB SSD'}
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              {liveItem ? 'Est. Unit Weight' : 'Screen Resolution'}
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              {liveItem ? displayWeight : '14″ FHD (1920x1080)'}
            </Typography>
          </Box>

          {liveItem ? (
            <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                Locker Assignment
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
                {liveItem.pickupHub?.lockerBay || 'Area 1 Bay, Eco-Hub Locker'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                OS Installed
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
                Ubuntu LTS / Win11 Ready
              </Typography>
            </Box>
          )}
        </Box>
      </Card>

      {/* ── EcoByte 30-Day Guarantee ── */}
      <Card sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SecurityRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              EcoByte 30-Day Guarantee
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.35, lineHeight: 1.5 }}>
              Free functional replacement or return guarantee at any official EcoByte Hub if hardware issues arise.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Reserve this device ── */}
      <Box sx={{ mb: 2 }}>
        {isReserved && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5, fontFamily: "'Quicksand', sans-serif", fontWeight: 600 }}>
            This device has already been scheduled for pick-up by a resident. If they fail to claim it on time, it will automatically return to the Reuse Hub as available.
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              Reserve this device
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
              {isReserved ? 'Currently Reserved' : 'ⓘ Held for 2 days (48h) upon reservation'}
            </Typography>
          </Box>
          <StatusBadge label={isReserved ? 'Reserved' : 'Free of charge'} variant={isReserved ? 'warning' : 'electric'} size="sm" />
        </Box>

        {/* Selected date row */}
        <Card sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                  Selected Pick-up Date
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                  {selectedDate}
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              onClick={() => setCalendarOpen((prev) => !prev)}
              sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
            >
              {calendarOpen ? 'Done' : 'Change'}
            </Button>
          </Box>
        </Card>

        {/* Interactive Calendar Picker */}
        {calendarOpen && (
          <Card
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
            }}
          >
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

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <Typography key={d} sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#94a3b8' }}>
                  {d}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
              {calendarCells.map((cell) => {
                const isSelectable = cell.inCurrentMonth && !cell.isPast
                const isSelected = cell.isoDate === selectedDateIso

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
                    onClick={() => {
                      setSelectedDateIso(cell.isoDate)
                      setCalendarOpen(false)
                    }}
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

            <Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />

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
                    Available
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
                {selectedDate}
              </Typography>
            </Box>
          </Card>
        )}

        {/* Pick-up Windows */}
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b', mb: 0.75 }}>
          Available Pick-up Windows
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
          {['09:00 AM', '01:00 PM', '03:00 PM'].map((time) => {
            const isSelected = selectedWindow === time
            return (
              <Button
                key={time}
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => setSelectedWindow(time)}
                size="small"
                sx={{
                  py: 1,
                  borderRadius: 1.25,
                  fontSize: '0.8125rem',
                  backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#0f172a',
                  borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                  boxShadow: isSelected ? '0 1px 3px rgba(15,23,42,0.2)' : 'none',
                  '&:hover': {
                    backgroundColor: isSelected ? '#1e293b' : '#f8fafc',
                    borderColor: isSelected ? '#1e293b' : '#cbd5e1',
                  },
                }}
              >
                {time}
              </Button>
            )
          })}
        </Box>

        {/* Pickup Location Reminder notice */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#0f172a', mt: 0.2 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
            Please show your digital reservation QR pass at Commonwealth Area 1 Eco-Hub locker reception. Bring a valid ID for pickup verification.
          </Typography>
        </Box>

        {/* Reserve Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={isReserved}
          onClick={() => {
            const targetItemId = id || 'reuse-302'
            navigate(
              `/confirm-reservation?itemId=${encodeURIComponent(targetItemId)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedWindow)}`
            )
          }}
          startIcon={<BookmarkAddRoundedIcon sx={{ fontSize: 20 }} />}
          sx={{
            py: 1.6,
            backgroundColor: isReserved ? '#94a3b8' : '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
            '&:hover': { backgroundColor: isReserved ? '#94a3b8' : '#1e293b' },
          }}
        >
          {isReserved ? 'Currently Reserved' : 'Reserve Item'}
        </Button>
      </Box>

      {/* Toast Feedback */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMsg(null)}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            backgroundColor: '#0f172a',
            color: '#abf06b',
          }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

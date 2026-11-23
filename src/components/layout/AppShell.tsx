import { useEffect, useRef, useState, type FC, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Popover,
  useMediaQuery,
  useTheme,
  Button,
  ButtonBase,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined'
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  authApi,
  dropoffsApi,
  extractFirstName,
  getCachedUser,
  resolveAuthRole,
  setCachedUser,
  type DashboardSummary,
} from '@/lib/api'
import { ForcePasswordResetModal } from '@/components/auth/ForcePasswordResetModal'
import {
  installAudioUnlockListener,
  isNotificationSoundMuted,
  playNotificationSound,
  setNotificationSoundMuted,
  type NotificationSoundVariant,
} from '@/lib/notificationSound'
import type { User } from '@/types'

interface AppShellProps {
  children: ReactNode
}

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  read: boolean
  type: 'points' | 'alert' | 'community'
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'community-drive',
    title: 'Community Clean-Up Drive',
    desc: 'Barangay Commonwealth annual electronic collection drive this Saturday at 8:00 AM.',
    time: 'Today',
    read: true,
    type: 'community',
  },
]

const ALERTED_NOTIF_STORAGE_KEY = 'ecobyte_alerted_notif_ids'

function getAlertedNotifIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(ALERTED_NOTIF_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    return new Set()
  }
}

function markNotifIdsAlerted(ids: string[]): void {
  if (typeof window === 'undefined' || ids.length === 0) return
  try {
    const existing = getAlertedNotifIds()
    for (const id of ids) existing.add(id)
    sessionStorage.setItem(ALERTED_NOTIF_STORAGE_KEY, JSON.stringify([...existing].slice(-100)))
  } catch {
    // Ignore storage errors
  }
}

function mapNotificationTitle(type: string): string {
  switch (type) {
    case 'INSPECTION_RESULT':
      return 'Inspection Outcome Update'
    case 'DROPOFF_RECEIVED':
      return 'Drop-off Received'
    case 'DROPOFF_MISSED':
      return 'Drop-off Slot Update'
    case 'PICKUP_CONFIRMED':
      return 'Claim Verified'
    case 'RESERVATION_EXPIRING_SOON':
      return 'Reservation Reminder (< 24h Left)'
    case 'RESERVATION_EXPIRING_URGENT':
      return 'Urgent: Reservation Expiring Soon'
    case 'RESERVATION_EXPIRED':
      return 'Reservation Expired'
    default:
      return 'EcoByte Notification'
  }
}

function getSoundVariantForType(type: string): NotificationSoundVariant {
  if (type === 'RESERVATION_EXPIRED') return 'expired'
  if (type === 'RESERVATION_EXPIRING_URGENT' || type === 'RESERVATION_EXPIRING_SOON') {
    return 'warning'
  }
  return 'default'
}

export const AppShell: FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const navigateWithScanCleanup = (target: string) => {
    if (target !== '/assess' && target !== '/diagnostic') {
      try {
        sessionStorage.removeItem('ecobyte_scan_angles')
      } catch {}
    }
    navigate(target)
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const [profileOpen, setProfileOpen] = useState(false)
  const [desktopNotifAnchor, setDesktopNotifAnchor] = useState<HTMLElement | null>(null)
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [soundMuted, setSoundMuted] = useState<boolean>(() => isNotificationSoundMuted())
  const [liveAlertBanner, setLiveAlertBanner] = useState<{ title: string; desc: string } | null>(
    null
  )
  const alertedIdsRef = useRef<Set<string>>(getAlertedNotifIds())
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCachedUser())
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editPhone, setEditPhone] = useState(() => getCachedUser()?.phone || '')
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [settingsSavedToast, setSettingsSavedToast] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary>({
    activeRequestsCount: 0,
    assessedCount: 0,
    reservedCount: 0,
    ecoPoints: 0,
    ecoTier: 'Starter Tier',
    divertedKg: 0,
    activeRequest: null,
  })

  useEffect(() => {
    installAudioUnlockListener()
  }, [])

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
        // Keep cached user when offline or unauthenticated
      })

    const refreshSummaryAndNotifications = () => {
      Promise.all([
        dropoffsApi.getDashboardSummary(),
        dropoffsApi.getNotifications().catch(() => []),
      ])
        .then(([data, apiNotifications]) => {
          if (!active || !data) return
          setSummary(data)
          const dynamicNotifications: NotificationItem[] = []
          const newlyArrivedUnread: Array<{ id: string; title: string; desc: string; rawType: string }> = []

          if (Array.isArray(apiNotifications)) {
            for (const n of apiNotifications) {
              const title = mapNotificationTitle(n.type)
              const createdDate = new Date(n.createdAt)
              const timeLabel = Number.isNaN(createdDate.getTime())
                ? 'Recent'
                : createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const itemId = `db-${n.id}`
              if (!n.isRead && !alertedIdsRef.current.has(itemId)) {
                newlyArrivedUnread.push({
                  id: itemId,
                  title,
                  desc: n.message,
                  rawType: n.type,
                })
              }
              dynamicNotifications.push({
                id: itemId,
                title,
                desc: n.message,
                time: timeLabel,
                read: n.isRead,
                type:
                  n.type === 'PICKUP_CONFIRMED'
                    ? 'points'
                    : n.type === 'INSPECTION_RESULT' ||
                        n.type === 'DROPOFF_RECEIVED' ||
                        n.type === 'DROPOFF_MISSED' ||
                        n.type === 'RESERVATION_EXPIRING_SOON' ||
                        n.type === 'RESERVATION_EXPIRING_URGENT' ||
                        n.type === 'RESERVATION_EXPIRED'
                      ? 'alert'
                      : 'community',
              })
            }
          }

          if (newlyArrivedUnread.length > 0) {
            const newIds = newlyArrivedUnread.map((n) => n.id)
            for (const id of newIds) alertedIdsRef.current.add(id)
            markNotifIdsAlerted(newIds)

            let variant: NotificationSoundVariant = 'default'
            for (const entry of newlyArrivedUnread) {
              const entryVariant = getSoundVariantForType(entry.rawType)
              if (entryVariant === 'expired') {
                variant = 'expired'
                break
              }
              if (entryVariant === 'warning') {
                variant = 'warning'
              }
            }
            playNotificationSound(variant)
            setLiveAlertBanner({
              title: newlyArrivedUnread[0].title,
              desc: newlyArrivedUnread[0].desc,
            })
          }

          if (data.activeRequest) {
            dynamicNotifications.push({
              id: `req-${data.activeRequest.requestId}`,
              title: `Active Request #${data.activeRequest.requestId}`,
              desc: `${data.activeRequest.deviceTitle} • ${data.activeRequest.statusStage}`,
              time: 'Active',
              read: false,
              type: 'alert',
            })
          }
          dynamicNotifications.push(...INITIAL_NOTIFICATIONS)
          setNotifications(dynamicNotifications)
        })
        .catch(() => {
          // Keep default summary when offline or unauthenticated
        })
    }

    refreshSummaryAndNotifications()
    const pollHandle = window.setInterval(refreshSummaryAndNotifications, 30_000)

    return () => {
      active = false
      window.clearInterval(pollHandle)
    }
  }, [path])

  const toggleSound = () => {
    const next = !soundMuted
    setNotificationSoundMuted(next)
    setSoundMuted(next)
  }

  const firstName = extractFirstName(currentUser)
  const fullName = currentUser?.fullName?.trim() || firstName
  const userEmail = currentUser?.email || 'resident@ecobyte.ph'
  const avatarInitial = firstName.charAt(0).toUpperCase() || 'R'
  const areaLabel = currentUser?.barangay?.name || 'Barangay Commonwealth, QC'
  const isStaff =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'BARANGAY_OFFICIAL'

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    dropoffsApi.markAllNotificationsRead().catch(() => {})
  }

  const handleClearNotifications = () => {
    setNotifications([])
    dropoffsApi.markAllNotificationsRead().catch(() => {})
  }

  const isActive = (p: string) => (p === '/' ? path === '/' : path.startsWith(p))
  const isDashboard = path === '/' || path === '/dashboard'

  return (
    <Box sx={{ minHeight: '100dvh', backgroundColor: '#FAF8F5', display: 'flex' }}>
      {/* ── Left Desktop Sidebar (Image 2) ── */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 256,
          backgroundColor: '#0F2417',
          color: '#ffffff',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2.25,
          zIndex: 100,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Sidebar Top: Logo + Brand + Area Selector + Nav Links */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5, px: 0.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '9px',
                backgroundColor: '#1E3E27',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ABF06B',
                boxShadow: '0 2px 8px rgba(171, 240, 107, 0.25)',
              }}
            >
              <EnergySavingsLeafOutlinedIcon sx={{ fontSize: 22, color: '#ABF06B' }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                EcoByte
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  color: '#7E9A82',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                RESIDENT PORTAL
              </Typography>
            </Box>
          </Box>

          {/* Area Selector Pill */}
          <ButtonBase
            onClick={() => navigate('/drop-offs')}
            sx={{
              width: '100%',
              backgroundColor: '#183321',
              border: '1px solid rgba(171, 240, 107, 0.25)',
              borderRadius: '12px',
              px: 1.5,
              py: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              mb: 2.5,
              transition: 'all 0.15s ease',
              '&:hover': { backgroundColor: '#1E3E27' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#ABF06B' }} />
              <Typography
                title={areaLabel}
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {areaLabel}
              </Typography>
            </Box>
            <ArrowDropDownRoundedIcon sx={{ fontSize: 18, color: '#ABF06B' }} />
          </ButtonBase>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <SidebarNavItem
              label="Dashboard"
              icon={<GridViewRoundedIcon sx={{ fontSize: 19 }} />}
              active={path === '/' || path === '/dashboard'}
              onClick={() => navigateWithScanCleanup('/dashboard')}
            />
            <SidebarNavItem
              label="My Requests"
              icon={<ReceiptLongRoundedIcon sx={{ fontSize: 19 }} />}
              active={isActive('/requests')}
              badge={summary.activeRequestsCount > 0 ? summary.activeRequestsCount : undefined}
              onClick={() => navigateWithScanCleanup('/requests')}
            />
            <SidebarNavItem
              label="Reuse Hub"
              icon={<RecyclingRoundedIcon sx={{ fontSize: 19 }} />}
              active={
                isActive('/reuse') ||
                isActive('/confirm-reservation') ||
                isActive('/reservation-code') ||
                isActive('/proof-of-claim')
              }
              onClick={() => navigateWithScanCleanup('/reuse')}
            />
            <SidebarNavItem
              label="Drop-off Hubs Map"
              icon={<MapRoundedIcon sx={{ fontSize: 19 }} />}
              active={isActive('/drop-offs')}
              onClick={() => navigateWithScanCleanup('/drop-offs')}
            />
          </Box>
        </Box>

        {/* Sidebar Bottom: User Profile / Logout */}
        <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              onClick={() => setProfileOpen(true)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', flex: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#1E3E27',
                  border: '1.5px solid #ABF06B',
                  color: '#ABF06B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PersonOutlineRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  title={fullName}
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fullName}
                </Typography>
                <Typography
                  onClick={(e) => {
                    e.stopPropagation()
                    setLogoutOpen(true)
                  }}
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    '&:hover': { color: '#ff8a80' },
                  }}
                >
                  Logout
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setLogoutOpen(true)}
              title="Sign out"
              sx={{ color: 'rgba(255, 255, 255, 0.6)', '&:hover': { color: '#ffffff' } }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── Main Layout Column (Pl 256px on Desktop) ── */}
      <Box
        sx={{
          flex: 1,
          minHeight: '100dvh',
          pl: { xs: 0, lg: '256px' },
          width: '100%',
          backgroundColor: isDashboard ? { xs: '#F0ECE6', lg: '#FAF8F5' } : '#FAF8F5',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* ── Desktop Top Header (Image 2) ── */}
        <Box
          component="header"
          sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 3.5,
            pb: 2.5,
            px: 4,
            backgroundColor: '#FAF8F5',
            width: '100%',
            maxWidth: '1440px',
            mx: 'auto',
          }}
        >
          {/* Left: Greeting & Subtitle */}
          <Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: '1.75rem',
                color: '#0F2417',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Hello, {firstName}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#596556',
                mt: 0.35,
              }}
            >
              Circular lifecycle diagnostics &amp; recovery
            </Typography>
          </Box>

          {/* Right: Controls (Hub Live, Notifications, Sound On, + Scan Device) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Hub Live pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                backgroundColor: '#CEEBC4',
                color: '#266317',
                borderRadius: 9999,
                px: 1.5,
                py: 0.6,
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#266317' }} />
              Hub Live
            </Box>

            {/* Notification Bell */}
            <IconButton
              id="desktop-notif-bell-btn"
              onClick={(e) => setDesktopNotifAnchor(desktopNotifAnchor ? null : e.currentTarget)}
              aria-label="notifications"
              sx={{
                width: 38,
                height: 38,
                backgroundColor: desktopNotifAnchor ? '#F0ECE6' : '#ffffff',
                border: '1px solid rgba(220, 207, 192, 0.7)',
                borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease',
                '&:hover': { backgroundColor: '#F8F6F2' },
              }}
            >
              <Badge
                badgeContent={unreadCount > 0 ? unreadCount : undefined}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#D9534F',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    minWidth: 16,
                    height: 16,
                    top: -2,
                    right: -2,
                  },
                }}
              >
                <NotificationsNoneRoundedIcon sx={{ color: '#0F2417', fontSize: 19 }} />
              </Badge>
            </IconButton>

            {/* Sound Toggle */}
            <ButtonBase
              onClick={toggleSound}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(220, 207, 192, 0.7)',
                borderRadius: 9999,
                px: 1.5,
                py: 0.7,
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#0F2417',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                '&:hover': { backgroundColor: '#F8F6F2' },
              }}
            >
              {soundMuted ? (
                <>
                  <VolumeOffRoundedIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <span>Sound Off</span>
                </>
              ) : (
                <>
                  <VolumeUpRoundedIcon sx={{ fontSize: 16, color: '#0F2417' }} />
                  <span>Sound On</span>
                </>
              )}
            </ButtonBase>

            {/* + Scan Device Button */}
            <Button
              variant="contained"
              onClick={() => navigateWithScanCleanup('/scan')}
              startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                backgroundColor: '#0F2417',
                color: '#ffffff',
                borderRadius: 9999,
                px: 2,
                py: 0.8,
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(15, 36, 23, 0.25)',
                '&:hover': { backgroundColor: '#1A3D27' },
              }}
            >
              Scan Device
            </Button>
          </Box>
        </Box>

        {/* ── Mobile & Tablet Top Header (Hidden on Desktop) ── */}
        <Box
          component="header"
          sx={{
            display: { xs: 'flex', lg: 'none' },
            position: isDashboard ? 'absolute' : 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: isDashboard ? 'transparent' : 'rgba(240, 236, 230, 0.95)',
            backdropFilter: isDashboard ? 'none' : 'blur(8px)',
            px: { xs: 2.5, sm: 4 },
            pt: 1.5,
            pb: 1.25,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDashboard ? 'none' : '1px solid rgba(220, 207, 192, 0.6)',
          }}
        >
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
          >
            <LocationOnRoundedIcon sx={{ color: isDashboard ? '#ABF06B' : '#4F5F4B', fontSize: 20 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  color: isDashboard ? '#ABF06B' : '#1F2937',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                EcoByte
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: isDashboard ? 'rgba(255, 255, 255, 0.9)' : '#596556',
                  lineHeight: 1,
                }}
              >
                {areaLabel}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isDashboard && (
              <IconButton
                size="small"
                aria-label="Drop-off Locations Map"
                onClick={() => navigate('/drop-offs')}
                title="View 9 Drop-off Locations"
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(220, 207, 192, 0.6)',
                  borderRadius: '50%',
                  transition: 'transform 0.15s ease, background-color 0.15s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: '#F8F6F2',
                  },
                }}
              >
                <MapRoundedIcon sx={{ color: '#266317', fontSize: 18 }} />
              </IconButton>
            )}

            <IconButton
              size="small"
              aria-label="notifications"
              onClick={() => setMobileNotifOpen(true)}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#ffffff',
                border: isDashboard ? 'none' : '1px solid rgba(220, 207, 192, 0.6)',
                boxShadow: isDashboard ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                borderRadius: '50%',
              }}
            >
              <Badge
                variant={unreadCount > 0 ? 'dot' : undefined}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#D9534F',
                    minWidth: 7,
                    height: 7,
                    right: 1,
                    top: 1,
                  },
                }}
              >
                <NotificationsNoneRoundedIcon sx={{ color: '#1F2937', fontSize: 18 }} />
              </Badge>
            </IconButton>

            <Avatar
              onClick={() => setProfileOpen(true)}
              sx={{
                width: 34,
                height: 34,
                backgroundColor: '#000000',
                color: '#ABF06B',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: '2px solid #ABF06B',
                transition: 'transform 0.15s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              {avatarInitial}
            </Avatar>
          </Box>
        </Box>

        {/* ── Page Content Container (Uniform Desktop Width across 1080p, 1440p, 4K) ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: '1440px',
            mx: 'auto',
            px: isDashboard ? { xs: 0, lg: 4 } : { xs: 2, sm: 3.5, lg: 4 },
            pb: { xs: 12, lg: 4 },
            overflowX: 'hidden',
          }}
        >
          {children}
        </Box>

        {/* ── Mobile & Tablet Bottom Navigation with Elevated Center Camera Button (Image 1) ── */}
        <Box
          component="nav"
          sx={{
            display: { xs: 'block', lg: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(220, 207, 192, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              px: { xs: 1, sm: 4, md: 8 },
              pt: 0.5,
              pb: 'calc(env(safe-area-inset-bottom, 8px) + 4px)',
              pointerEvents: 'auto',
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Home */}
            <NavItem
              icon={<HomeRoundedIcon sx={{ fontSize: 24, color: isActive('/dashboard') ? '#1B3B18' : '#596556' }} />}
              label="Home"
              active={isActive('/dashboard')}
              onClick={() => navigateWithScanCleanup('/dashboard')}
            />

            {/* Reuse */}
            <NavItem
              icon={<RecyclingRoundedIcon sx={{ fontSize: 23, color: isActive('/reuse') ? '#1B3B18' : '#596556' }} />}
              label="Reuse"
              active={isActive('/reuse')}
              onClick={() => navigateWithScanCleanup('/reuse')}
            />

            {/* Scan – Center black circle elevated over the top edge of navigation bar (Image 1) */}
            <Box
              onClick={() => navigateWithScanCleanup('/scan')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                top: -16,
                mb: -1.75,
                zIndex: 10,
                px: 1,
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                  border: '3.5px solid #ffffff',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.92)' },
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 25, color: '#ffffff' }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  color: isActive('/scan') ? '#1B3B18' : '#596556',
                  mt: 0.35,
                }}
              >
                Scan
              </Typography>
            </Box>

            {/* Requests */}
            <NavItem
              icon={<BookmarkBorderRoundedIcon sx={{ fontSize: 23, color: isActive('/requests') ? '#1B3B18' : '#596556' }} />}
              label="Requests"
              active={isActive('/requests')}
              onClick={() => navigateWithScanCleanup('/requests')}
            />

            {/* Account */}
            <NavItem
              icon={<PersonOutlineRoundedIcon sx={{ fontSize: 23, color: profileOpen ? '#1B3B18' : '#596556' }} />}
              label="Account"
              active={profileOpen}
              onClick={() => setProfileOpen(true)}
            />
          </Box>
        </Box>

        {/* ── Resident Profile Drawer ── */}
        <Drawer
          anchor="bottom"
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          slotProps={{
            root: {
              sx: {
                zIndex: 1400,
              },
            },
            paper: {
              sx: {
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                maxWidth: { xs: '100%', sm: 640, md: 720 },
                width: '100%',
                mx: 'auto',
                maxHeight: '90vh',
                overflowY: 'auto',
                p: { xs: 2.5, sm: 3.5 },
                pb: 'calc(env(safe-area-inset-bottom, 16px) + 24px)',
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              Resident Account
            </Typography>
            <IconButton size="small" onClick={() => setProfileOpen(false)}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Profile Card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              mb: 2,
            }}
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                backgroundColor: '#0f172a',
                color: '#abf06b',
                fontWeight: 800,
                fontSize: '1.25rem',
                border: '2px solid #abf06b',
              }}
            >
              {avatarInitial}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                {fullName}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                {userEmail} • {areaLabel}
              </Typography>
            </Box>
          </Box>

          {/* Stats Banner */}
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase' }}>
                E-Waste Diverted
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#7e22ce', mt: 0.25 }}>
                {summary.divertedKg} kg
              </Typography>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              onClick={() => {
                setProfileOpen(false)
                setEditPhone(currentUser?.phone || '')
                setEditProfileOpen(true)
              }}
              variant="outlined"
              startIcon={<ManageAccountsOutlinedIcon />}
              sx={{
                justifyContent: 'flex-start',
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                color: '#334155',
                borderColor: '#cbd5e1',
                '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' },
              }}
            >
              Account Preferences &amp; Contact
            </Button>

            {isStaff && (
              <Button
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/admin')
                }}
                variant="outlined"
                startIcon={<AdminPanelSettingsOutlinedIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  color: '#334155',
                  borderColor: '#cbd5e1',
                  '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' },
                }}
              >
                Switch to Administrator View (Desktop)
              </Button>
            )}

            <Button
              onClick={() => {
                setProfileOpen(false)
                setLogoutOpen(true)
              }}
              variant="contained"
              color="error"
              startIcon={<LogoutRoundedIcon />}
              sx={{
                justifyContent: 'flex-start',
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: '#dc2626',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#b91c1c' },
              }}
            >
              Log Out
            </Button>
          </Box>
        </Drawer>

        {/* ── Desktop Facebook-style Notification Dropdown Popover ── */}
        <Popover
          open={Boolean(desktopNotifAnchor) && !isMobile}
          anchorEl={desktopNotifAnchor}
          onClose={() => setDesktopNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                width: 410,
                maxWidth: 'calc(100vw - 32px)',
                maxHeight: 520,
                borderRadius: '16px',
                mt: 1.5,
                border: '1px solid #e2e8f0',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
              },
            },
          }}
        >
          {/* Facebook-style Top Header */}
          <Box
            sx={{
              p: 2,
              pb: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '9999px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                  }}
                >
                  {unreadCount} new
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                aria-label={soundMuted ? 'Enable notification sound' : 'Mute notification sound'}
                title={soundMuted ? 'Sound Muted (Click to Enable)' : 'Sound Alerts On (Click to Mute)'}
                onClick={() => {
                  const next = !soundMuted
                  setSoundMuted(next)
                  setNotificationSoundMuted(next)
                  if (!next) playNotificationSound('default')
                }}
                sx={{ color: soundMuted ? '#94a3b8' : '#16a34a' }}
              >
                {soundMuted ? (
                  <VolumeOffRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VolumeUpRoundedIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
              <IconButton size="small" onClick={() => setDesktopNotifAnchor(null)}>
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Actions Bar */}
          <Box
            sx={{
              px: 2,
              py: 0.75,
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              onClick={handleMarkAllRead}
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#16a34a',
                p: 0,
                '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Mark all as read
            </Button>
            <Button
              onClick={handleClearNotifications}
              size="small"
              startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                p: 0,
                '&:hover': { backgroundColor: 'transparent', color: '#dc2626' },
              }}
            >
              Clear
            </Button>
          </Box>

          {/* Scrollable Notification List */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <Box
                  key={n.id}
                  onClick={() => {
                    if (!n.read) {
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                      )
                      if (n.id.startsWith('db-')) {
                        dropoffsApi.markNotificationRead(n.id.slice(3)).catch(() => {})
                      }
                    }
                  }}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                    border: '1px solid',
                    borderColor: n.read ? '#f1f5f9' : '#bbf7d0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    cursor: !n.read ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: n.read ? '#f8fafc' : '#eafbf0',
                      borderColor: n.read ? '#cbd5e1' : '#86efac',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: n.type === 'points' ? '#dcfce7' : n.type === 'alert' ? '#fef3c7' : '#e0f2fe',
                      color: n.type === 'points' ? '#15803d' : n.type === 'alert' ? '#d97706' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {n.type === 'points' ? (
                      <StarRoundedIcon sx={{ fontSize: 17 }} />
                    ) : (
                      <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                        {n.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', flexShrink: 0 }}>
                        {n.time}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.25, lineHeight: 1.4 }}>
                      {n.desc}
                    </Typography>
                  </Box>
                  {!n.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#16a34a',
                        position: 'absolute',
                        right: 12,
                        bottom: 12,
                      }}
                    />
                  )}
                </Box>
              ))
            ) : (
              <Box sx={{ py: 5, textAlign: 'center', color: '#64748b' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>No notifications right now</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
                  Drop-off confirmations and pickup vouchers will appear here.
                </Typography>
              </Box>
            )}
          </Box>
        </Popover>

        {/* ── Mobile Fullscreen Notifications Page ── */}
        <Dialog
          fullScreen
          open={mobileNotifOpen}
          onClose={() => setMobileNotifOpen(false)}
          sx={{ zIndex: 1450 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100dvh',
              backgroundColor: '#faf8f5',
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {/* Mobile Fullscreen App Bar */}
            <Box
              component="header"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                backgroundColor: '#0f2417',
                color: '#ffffff',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setMobileNotifOpen(false)}
                  aria-label="Back"
                  sx={{ color: '#ffffff', p: 0.5 }}
                >
                  <ArrowBackRoundedIcon sx={{ fontSize: 22 }} />
                </IconButton>
                <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: '#ffffff' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: '9999px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount} new
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  size="small"
                  aria-label={soundMuted ? 'Enable sound' : 'Mute sound'}
                  onClick={() => {
                    const next = !soundMuted
                    setSoundMuted(next)
                    setNotificationSoundMuted(next)
                    if (!next) playNotificationSound('default')
                  }}
                  sx={{ color: soundMuted ? 'rgba(255,255,255,0.5)' : '#abf06b' }}
                >
                  {soundMuted ? (
                    <VolumeOffRoundedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VolumeUpRoundedIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setMobileNotifOpen(false)}
                  aria-label="Close"
                  sx={{ color: '#ffffff' }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Mobile Quick Action Strip */}
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <Button
                onClick={handleMarkAllRead}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#16a34a',
                  p: 0,
                }}
              >
                Mark all as read
              </Button>
              <Button
                onClick={handleClearNotifications}
                size="small"
                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#64748b',
                  p: 0,
                  '&:hover': { color: '#dc2626' },
                }}
              >
                Clear all
              </Button>
            </Box>

            {/* Mobile Scrollable Notifications List */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                pb: 'calc(env(safe-area-inset-bottom, 16px) + 24px)',
              }}
            >
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <Box
                    key={n.id}
                    onClick={() => {
                      if (!n.read) {
                        setNotifications((prev) =>
                          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                        )
                        if (n.id.startsWith('db-')) {
                          dropoffsApi.markNotificationRead(n.id.slice(3)).catch(() => {})
                        }
                      }
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                      border: '1.5px solid',
                      borderColor: n.read ? '#e2e8f0' : '#86efac',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      position: 'relative',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor:
                          n.type === 'points' ? '#dcfce7' : n.type === 'alert' ? '#fef3c7' : '#e0f2fe',
                        color: n.type === 'points' ? '#15803d' : n.type === 'alert' ? '#d97706' : '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {n.type === 'points' ? (
                        <StarRoundedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                          {n.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', flexShrink: 0 }}>
                          {n.time}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#475569', mt: 0.35, lineHeight: 1.45 }}>
                        {n.desc}
                      </Typography>
                    </Box>
                    {!n.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#16a34a',
                          position: 'absolute',
                          right: 14,
                          bottom: 14,
                        }}
                      />
                    )}
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 8, textAlign: 'center', color: '#64748b' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800 }}>
                    No notifications right now
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.5 }}>
                    Drop-off confirmations and pickup vouchers will appear here.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Dialog>

        {/* ── Resident Logout Confirmation Dialog ── */}
        <Dialog
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '16px',
                p: 1,
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)',
                fontFamily: "'Quicksand', sans-serif",
              },
            },
          }}
        >
          <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              Confirm Logout
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to log out of your resident account? You will need to sign in again to access your drop-off passes and requests.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setLogoutOpen(false)}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#cbd5e1',
                color: '#475569',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                authApi.logout()
                setCurrentUser(null)
                setLogoutOpen(false)
                navigate('/signin')
              }}
              variant="contained"
              color="error"
              size="small"
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                backgroundColor: '#dc2626',
                '&:hover': { backgroundColor: '#b91c1c' },
              }}
            >
              Confirm Logout
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Resident Preferences & Contact Modal ── */}
        <Dialog
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '16px',
                p: 1.5,
                fontFamily: "'Quicksand', sans-serif",
              },
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>
                Account Preferences
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Resident contact &amp; SMS alerts
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setEditProfileOpen(false)}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.5 }}>
                Full Name
              </Typography>
              <OutlinedInput
                fullWidth
                size="small"
                value={fullName}
                disabled
                sx={{ backgroundColor: '#f8fafc', borderRadius: 1.5, fontSize: '0.875rem' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.5 }}>
                Verified Email
              </Typography>
              <OutlinedInput
                fullWidth
                size="small"
                value={userEmail}
                disabled
                startAdornment={<EmailOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} />}
                sx={{ backgroundColor: '#f8fafc', borderRadius: 1.5, fontSize: '0.875rem' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.5 }}>
                Mobile Contact (for Drop-off SMS)
              </Typography>
              <OutlinedInput
                fullWidth
                size="small"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                startAdornment={<PhoneOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} />}
                placeholder="+63 9XX XXX XXXX"
                sx={{ borderRadius: 1.5, fontSize: '0.875rem' }}
              />
            </Box>

            <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                      SMS &amp; Booking Updates
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                      Receive drop-off verification codes and voucher notifications
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setEditProfileOpen(false)}
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (currentUser) {
                  const updated: User = { ...currentUser, phone: editPhone }
                  setCurrentUser(updated)
                  setCachedUser(updated)
                }
                setEditProfileOpen(false)
                setSettingsSavedToast(true)
              }}
              sx={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 1.5,
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              Save Preferences
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Preferences Saved Toast ── */}
        <Snackbar
          open={settingsSavedToast}
          autoHideDuration={3000}
          onClose={() => setSettingsSavedToast(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={() => setSettingsSavedToast(false)}>
            Preferences updated successfully!
          </Alert>
        </Snackbar>

        {/* ── Live Audible Notification Alert Banner ── */}
        <Snackbar
          open={Boolean(liveAlertBanner)}
          autoHideDuration={6000}
          onClose={() => setLiveAlertBanner(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="warning"
            variant="filled"
            onClose={() => setLiveAlertBanner(null)}
            onClick={() => {
              setLiveAlertBanner(null)
              if (isMobile) {
                setMobileNotifOpen(true)
              } else {
                const btn = document.getElementById('desktop-notif-bell-btn')
                setDesktopNotifAnchor(btn)
              }
            }}
            sx={{
              cursor: 'pointer',
              maxWidth: 400,
              fontFamily: "'Quicksand', sans-serif",
              backgroundColor: '#0f172a',
              color: '#ffffff',
              '& .MuiAlert-icon': { color: '#abf06b' },
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '0.8125rem' }}>
              {liveAlertBanner?.title}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', opacity: 0.92 }}>
              {liveAlertBanner?.desc}
            </Typography>
          </Alert>
        </Snackbar>
      </Box>

      <ForcePasswordResetModal
        open={Boolean(currentUser?.mustChangePassword)}
        userEmail={currentUser?.email}
        onSuccess={(updatedUser) => {
          const normalized = {
            ...updatedUser,
            role: resolveAuthRole(updatedUser.role, updatedUser.email).toLowerCase(),
            mustChangePassword: false,
          }
          setCachedUser(normalized)
          setCurrentUser(normalized)
        }}
        onSignOut={() => {
          authApi.logout()
          navigate('/signin', { replace: true })
        }}
      />
    </Box>
  )
}

interface SidebarNavItemProps {
  label: string
  icon: ReactNode
  active: boolean
  badge?: number
  onClick: () => void
}

const SidebarNavItem: FC<SidebarNavItemProps> = ({ label, icon, active, badge, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1.75,
      py: 1.15,
      borderRadius: '12px',
      transition: 'all 0.15s ease',
      backgroundColor: active ? '#ABF06B' : 'transparent',
      color: active ? '#0F2417' : 'rgba(255, 255, 255, 0.78)',
      fontWeight: active ? 800 : 600,
      fontSize: '0.8125rem',
      fontFamily: "'Quicksand', sans-serif",
      '&:hover': {
        backgroundColor: active ? '#B4F76E' : 'rgba(255, 255, 255, 0.08)',
        color: active ? '#0F2417' : '#ffffff',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {icon}
      <span>{label}</span>
    </Box>
    {Boolean(badge && badge > 0) && (
      <Box
        sx={{
          minWidth: 20,
          height: 20,
          px: 0.6,
          borderRadius: 9999,
          backgroundColor: active ? '#0F2417' : '#ABF06B',
          color: active ? '#ABF06B' : '#0F2417',
          fontWeight: 800,
          fontSize: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {badge}
      </Box>
    )}
  </ButtonBase>
)

interface NavItemProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

const NavItem: FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      px: 1.5,
      py: 0.75,
      color: active ? '#1B3B18' : '#596556',
      minWidth: 52,
      position: 'relative',
      '&::after': active
        ? {
            content: '""',
            position: 'absolute',
            bottom: 2,
            width: 16,
            height: 2.5,
            backgroundColor: '#1B3B18',
            borderRadius: 9999,
          }
        : {},
    }}
  >
    {icon}
    <Typography
      sx={{
        fontFamily: "'Quicksand', sans-serif",
        fontWeight: active ? 700 : 600,
        fontSize: '0.6875rem',
        mt: 0.3,
        color: 'inherit',
      }}
    >
      {label}
    </Typography>
  </Box>
)

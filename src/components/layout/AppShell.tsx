import { useEffect, useRef, useState, type FC, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Container,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Button,
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
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
import { useLocation, useNavigate } from 'react-router-dom'
import {
  authApi,
  dropoffsApi,
  extractFirstName,
  getCachedUser,
  setCachedUser,
  type DashboardSummary,
} from '@/lib/api'
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

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
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

          if (data.ecoPoints > 0) {
            dynamicNotifications.push({
              id: 'eco-points-earned',
              title: `Eco-Points Earned • ${data.ecoPoints} pts`,
              desc: `You have diverted ${data.divertedKg} kg of e-waste and reached ${data.ecoTier}.`,
              time: 'Updated',
              read: false,
              type: 'points',
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
    <Box sx={{ minHeight: '100dvh', backgroundColor: '#F0ECE6', display: 'flex', justifyContent: 'center' }}>
      <Container
        maxWidth="xs"
        disableGutters
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#F0ECE6',
        }}
      >
        {/* ── Top Header ── */}
        <Box
          component="header"
          sx={{
            position: isDashboard ? 'absolute' : 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: isDashboard ? 'transparent' : 'rgba(240, 236, 230, 0.95)',
            backdropFilter: isDashboard ? 'none' : 'blur(8px)',
            px: 2.5,
            pt: 1.5,
            pb: 1.25,
            display: 'flex',
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
              onClick={() => setNotificationsOpen(true)}
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

        {/* ── Page Content ── */}
        <Box component="main" sx={{ flex: 1, px: isDashboard ? 0 : 2.5, pb: 11, overflowX: 'hidden' }}>
          {children}
        </Box>

        {/* ── Bottom Navigation ── */}
        <Box
          component="nav"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 444,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(220, 207, 192, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              px: 1,
              pt: 0.75,
              pb: 'env(safe-area-inset-bottom, 8px)',
              pointerEvents: 'auto',
            }}
          >
            {/* Home */}
            <NavItem
              icon={<HomeRoundedIcon sx={{ fontSize: 24 }} />}
              label="Home"
              active={isActive('/dashboard')}
              onClick={() => navigate('/dashboard')}
            />

            {/* Reuse */}
            <NavItem
              icon={<RecyclingRoundedIcon sx={{ fontSize: 22 }} />}
              label="Reuse"
              active={isActive('/reuse')}
              onClick={() => navigate('/reuse')}
            />

            {/* Scan – center elevated black circle */}
            <Box
              onClick={() => navigate('/scan')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  color: '#1F2937',
                  mt: 0.4,
                }}
              >
                Scan
              </Typography>
            </Box>

            {/* Requests */}
            <NavItem
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />}
              label="Requests"
              active={isActive('/requests')}
              onClick={() => navigate('/requests')}
            />

            {/* Account */}
            <NavItem
              icon={<PersonOutlineRoundedIcon sx={{ fontSize: 22 }} />}
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
                maxWidth: 444,
                mx: 'auto',
                maxHeight: '90vh',
                overflowY: 'auto',
                p: 2.5,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  {fullName}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '9999px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                  }}
                >
                  {summary.ecoTier}
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                {userEmail} • {areaLabel}
              </Typography>
            </Box>
          </Box>

          {/* Points & Stats Banner */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                Eco-Points
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', mt: 0.25 }}>
                {summary.ecoPoints} pts
              </Typography>
            </Box>
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

        {/* ── Resident Notifications Drawer ── */}
        <Drawer
          anchor="bottom"
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
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
                maxWidth: 444,
                mx: 'auto',
                maxHeight: '85vh',
                overflowY: 'auto',
                p: 2.5,
                pb: 'calc(env(safe-area-inset-bottom, 16px) + 24px)',
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.15,
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
                  <VolumeOffRoundedIcon sx={{ fontSize: 19 }} />
                ) : (
                  <VolumeUpRoundedIcon sx={{ fontSize: 19 }} />
                )}
              </IconButton>
              <IconButton size="small" onClick={() => setNotificationsOpen(false)}>
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Button
              onClick={handleMarkAllRead}
              size="small"
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}
            >
              Mark all as read
            </Button>
            <Button
              onClick={handleClearNotifications}
              size="small"
              startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}
            >
              Clear
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
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
                    borderRadius: '12px',
                    backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                    border: '1px solid',
                    borderColor: n.read ? '#e2e8f0' : '#bbf7d0',
                    display: 'flex',
                    gap: 1.5,
                    cursor: !n.read ? 'pointer' : 'default',
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: n.type === 'points' ? '#dcfce7' : n.type === 'alert' ? '#fef3c7' : '#e0f2fe',
                      color: n.type === 'points' ? '#15803d' : n.type === 'alert' ? '#d97706' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {n.type === 'points' ? (
                      <StarRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                        {n.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{n.time}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.25, lineHeight: 1.4 }}>
                      {n.desc}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ py: 4, textAlign: 'center', color: '#64748b' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>No notifications right now</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
                  Drop-off confirmations and pickup vouchers will appear here.
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* ── Resident Logout Confirmation Dialog ── */}
        <Dialog
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          maxWidth="xs"
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
              Are you sure you want to log out of your resident account? You will need to sign in again to access your passes and eco-points.
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
          maxWidth="xs"
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
              setNotificationsOpen(true)
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
      </Container>
    </Box>
  )
}

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
      color: active ? '#4F5F4B' : '#596556',
      minWidth: 52,
      position: 'relative',
      '&::after': active ? {
        content: '""',
        position: 'absolute',
        bottom: 2,
        width: 16,
        height: 2.5,
        backgroundColor: '#ABF06B',
        borderRadius: 9999,
      } : {},
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

import { useEffect, useState, type FC, type ReactNode } from 'react'
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
} from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
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
import { useLocation, useNavigate } from 'react-router-dom'
import {
  authApi,
  dropoffsApi,
  extractFirstName,
  getCachedUser,
  type DashboardSummary,
} from '@/lib/api'
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

export const AppShell: FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
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

    dropoffsApi
      .getDashboardSummary()
      .then((data) => {
        if (!active || !data) return
        setSummary(data)
        const dynamicNotifications: NotificationItem[] = []
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

    return () => {
      active = false
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
  }

  const handleClearNotifications = () => {
    setNotifications([])
  }

  const isActive = (p: string) => (p === '/' ? path === '/' : path.startsWith(p))

  return (
    <Box sx={{ minHeight: '100dvh', backgroundColor: '#faf8f5', display: 'flex', justifyContent: 'center' }}>
      <Container
        maxWidth="xs"
        disableGutters
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#faf8f5',
        }}
      >
        {/* ── Top Header ── */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'rgba(250, 248, 245, 0.95)',
            backdropFilter: 'blur(8px)',
            px: 2.5,
            pt: 1.5,
            pb: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
          >
            <LocationOnRoundedIcon sx={{ color: '#4f5f4b', fontSize: 20 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                EcoByte
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: '#64748b',
                    lineHeight: 1,
                  }}
                >
                  {areaLabel}
                </Typography>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 15, color: '#64748b' }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              aria-label="notifications"
              onClick={() => setNotificationsOpen(true)}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
              }}
            >
              <Badge
                variant={unreadCount > 0 ? 'dot' : undefined}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#dc2626',
                    minWidth: 7,
                    height: 7,
                    right: 1,
                    top: 1,
                  },
                }}
              >
                <NotificationsNoneRoundedIcon sx={{ color: '#0f172a', fontSize: 18 }} />
              </Badge>
            </IconButton>

            <Avatar
              onClick={() => setProfileOpen(true)}
              sx={{
                width: 34,
                height: 34,
                backgroundColor: '#0f172a',
                color: '#abf06b',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: '2px solid #abf06b',
                transition: 'transform 0.15s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              {avatarInitial}
            </Avatar>
          </Box>
        </Box>

        {/* ── Page Content ── */}
        <Box component="main" sx={{ flex: 1, px: 2.5, pb: 11, overflowX: 'hidden' }}>
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
            zIndex: 200,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid #e2e8f0',
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

            {/* Scan – center elevated */}
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
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  border: '2px solid #abf06b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.35)',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  color: isActive('/scan') ? '#0f172a' : '#64748b',
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
              icon={<PersonOutlineRoundedIcon sx={{ fontSize: 24 }} />}
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
            paper: {
              sx: {
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                maxWidth: 444,
                mx: 'auto',
                p: 2.5,
                pb: 4,
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
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
            paper: {
              sx: {
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                maxWidth: 444,
                mx: 'auto',
                p: 2.5,
                pb: 4,
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
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
            <IconButton size="small" onClick={() => setNotificationsOpen(false)}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
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
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                    border: '1px solid',
                    borderColor: n.read ? '#e2e8f0' : '#bbf7d0',
                    display: 'flex',
                    gap: 1.5,
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
      color: active ? '#0f172a' : '#64748b',
      minWidth: 52,
      position: 'relative',
      '&::after': active ? {
        content: '""',
        position: 'absolute',
        bottom: 2,
        width: 16,
        height: 2.5,
        backgroundColor: '#abf06b',
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

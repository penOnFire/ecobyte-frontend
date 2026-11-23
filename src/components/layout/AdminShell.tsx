import { useEffect, useState, type FC, type ReactNode } from 'react'
import {
  Box,
  ButtonBase,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Drawer,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminApi, authApi, getCachedUser, resolveAuthRole, setCachedUser } from '@/lib/api'
import { ForcePasswordResetModal } from '@/components/auth/ForcePasswordResetModal'
import type { User } from '@/types'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'

interface AdminShellProps {
  children: ReactNode
}

interface NavItem {
  label: string
  path: string
  icon: typeof GridViewRoundedIcon
  badge?: number
}

export const AdminShell: FC<AdminShellProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [toInspectBadge, setToInspectBadge] = useState<number>(0)
  const [incomingBadge, setIncomingBadge] = useState<number>(0)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCachedUser())

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
        // Keep cached user if offline
      })

    const refreshBadges = () => {
      adminApi
        .getRequests()
        .catch(() => [])
        .then((requests) => {
          if (!active) return
          const scheduledCount = requests.filter((r) => {
            const s = (r.status || '').toLowerCase()
            return s === 'pending_review' || s === 'scheduled'
          }).length
          const receivedForInspectionCount = requests.filter((r) => {
            const s = (r.status || '').toLowerCase()
            return s === 'under_inspection' || s === 'collected'
          }).length
          setIncomingBadge(scheduledCount)
          setToInspectBadge(receivedForInspectionCount)
        })
    }

    refreshBadges()
    window.addEventListener('ecobyte:admin-badges-refresh', refreshBadges)

    return () => {
      active = false
      window.removeEventListener('ecobyte:admin-badges-refresh', refreshBadges)
    }
  }, [path])

  const staffRoleUpper = (
    currentUser?.role ||
    (typeof window !== 'undefined' ? localStorage.getItem('ecobyte_user_role') : '') ||
    ''
  ).toUpperCase()
  const isSuperAdmin = staffRoleUpper === 'ADMIN'
  const staffRoleLabel = isSuperAdmin ? 'Super Admin' : 'Barangay Official'
  const staffFullName =
    currentUser?.fullName?.trim() || (isSuperAdmin ? 'System Administrator' : 'Barangay Official')
  const staffEmail =
    currentUser?.email || (isSuperAdmin ? 'admin@ecobyte.gov' : 'official@barangay.gov.ph')
  const staffArea = currentUser?.barangay?.name || 'Commonwealth Central MRF (Base 1)'

  const staffInitials =
    (staffFullName || '')
      .replace(/^(Kgd\.|Engr\.|Hon\.|Director)\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'EB'

  const officialNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: GridViewRoundedIcon },
    { label: 'Incoming Drop-Offs', path: '/admin/incoming', icon: MoveToInboxRoundedIcon },
    { label: 'Inspection Queue', path: '/admin/to-inspect', icon: FactCheckOutlinedIcon },
    { label: 'Transactions', path: '/admin/transactions', icon: ReceiptLongRoundedIcon },
  ]

  const adminNavItems: NavItem[] = [
    { label: 'All-Barangay Overview', path: '/admin', icon: GridViewRoundedIcon },
    { label: 'Reports & Data', path: '/admin/reports', icon: BarChartRoundedIcon },
    { label: 'Overall Transactions', path: '/admin/transactions', icon: ReceiptLongRoundedIcon },
    { label: 'Manage Users', path: '/admin/access', icon: AdminPanelSettingsOutlinedIcon },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: HistoryRoundedIcon },
  ]

  const baseItems = isSuperAdmin ? adminNavItems : officialNavItems

  const navItems: NavItem[] = baseItems.map((item) => {
    if (item.path === '/admin/incoming' && incomingBadge > 0) {
      return { ...item, badge: incomingBadge }
    }
    if (item.path === '/admin/to-inspect' && toInspectBadge > 0) {
      return { ...item, badge: toInspectBadge }
    }
    return item
  })

  const isCurrentActive = (itemPath: string) => {
    if (itemPath === '/admin') {
      return path === '/admin' || path === '/admin/dashboard'
    }
    return path.startsWith(itemPath)
  }

  const getHeaderMeta = () => {
    if (path.startsWith('/admin/reports')) {
      return { title: 'Reports & Data', subtitle: 'Totals, e-waste types, slot usage, and Reuse Hub metrics' }
    }
    if (path.startsWith('/admin/transactions')) {
      return {
        title: isSuperAdmin ? 'Overall Transactions' : 'Transactions',
        subtitle: isSuperAdmin
          ? 'Reuse Hub reservations across all barangays'
          : 'Reuse Hub pick-ups, listings, and disposal records',
      }
    }
    if (path.startsWith('/admin/access')) {
      return {
        title: 'Manage Users',
        subtitle: 'Create official accounts, change roles, deactivate or reactivate',
      }
    }
    if (path.startsWith('/admin/activity-logs')) {
      return {
        title: 'Activity Logs',
        subtitle: 'Filter by user, action, and barangay',
      }
    }
    if (path.startsWith('/admin/incoming')) {
      return { title: 'Incoming Drop-Offs', subtitle: 'Mark scheduled drop-offs as Received or Missed' }
    }
    if (path.startsWith('/admin/to-inspect') || path.startsWith('/admin/inspect')) {
      return { title: 'Inspection Queue', subtitle: 'Physically inspect devices — oldest first' }
    }
    return {
      title: isSuperAdmin ? 'All-Barangay Overview' : 'Dashboard',
      subtitle: isSuperAdmin
        ? 'System-wide monitoring · view-only'
        : 'Own barangay metrics · read-only',
    }
  }

  const headerMeta = getHeaderMeta()
  const [todayFormatted] = useState(() =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date())
  )

  const renderSidebarContent = (isMobile = false) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Brand Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            px: 2.5,
            height: 64,
            flexShrink: 0,
          }}
        >
          <Box
            onClick={() => {
              navigate('/admin')
              if (isMobile) setMobileNavOpen(false)
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                boxShadow: '0 2px 8px rgba(112, 184, 34, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <RecyclingRoundedIcon sx={{ fontSize: 21 }} />
            </Box>
            <Box sx={{ lineHeight: 1.15 }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                ECOBYTE
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: '#a3e635',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}
              >
                Staff Portal
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton
              size="small"
              onClick={() => setMobileNavOpen(false)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '0.75rem',
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>

        {/* Scope Banner (Exact match to prototype) */}
        <Box
          sx={{
            mx: 2,
            mb: 2,
            p: 1.5,
            borderRadius: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255, 255, 255, 0.50)',
            }}
          >
            {isSuperAdmin ? 'Scope' : 'Assigned Base / Site'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            {isSuperAdmin ? (
              <PublicRoundedIcon sx={{ fontSize: 17, color: '#a3e635', flexShrink: 0 }} />
            ) : (
              <LocationOnRoundedIcon sx={{ fontSize: 17, color: '#a3e635', flexShrink: 0 }} />
            )}
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isSuperAdmin ? 'All sites & barangays' : staffArea}
            </Typography>
          </Box>
        </Box>

        {/* Navigation Links */}
        <Box
          component="nav"
          sx={{
            px: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const active = isCurrentActive(item.path)
            const Icon = item.icon

            return (
              <ButtonBase
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setMobileNavOpen(false)
                }}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1.2,
                  borderRadius: '0.75rem',
                  transition: 'all 0.15s ease',
                  backgroundColor: active ? 'rgba(132, 204, 22, 0.14)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.70)',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: active ? 'rgba(132, 204, 22, 0.20)' : 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icon
                    sx={{
                      fontSize: 20,
                      color: active ? '#a3e635' : 'rgba(255, 255, 255, 0.60)',
                    }}
                  />
                  <span style={{ fontFamily: "'Quicksand', sans-serif" }}>
                    {item.label}
                  </span>
                </Box>
                {item.badge && !active && (
                  <Box
                    sx={{
                      minWidth: 22,
                      height: 22,
                      px: 0.75,
                      borderRadius: '9999px',
                      backgroundColor: '#84cc16',
                      color: '#121c10',
                      fontWeight: 800,
                      fontSize: '0.6875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* Bottom User Info & Logout (Matching Prototype) */}
      <Box
        sx={{
          p: 1.5,
          pb: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box
          onClick={() => setProfileOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            borderRadius: '0.75rem',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
            },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(132, 204, 22, 0.20)',
              border: '1px solid rgba(132, 204, 22, 0.40)',
              color: '#a3e635',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {staffInitials}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {staffFullName}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.50)',
              }}
            >
              {staffRoleLabel}
            </Typography>
          </Box>
        </Box>

        {/* Log Out Button */}
        <ButtonBase
          onClick={() => {
            setLogoutOpen(true)
            if (isMobile) setMobileNavOpen(false)
          }}
          sx={{
            width: '100%',
            height: 36,
            borderRadius: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <LogoutRoundedIcon sx={{ fontSize: 16 }} />
          <span>Logout</span>
        </ButtonBase>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f6f8f4',
        fontFamily: "'Quicksand', sans-serif",
        color: '#0b1c30',
      }}
    >
      {/* ── Desktop Permanent Sidebar (w-64 / 256px, visible lg and up) ── */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 256,
          background: 'linear-gradient(180deg, #1e2e1a 0%, #121c10 100%)',
          color: '#ffffff',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 50,
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {renderSidebarContent(false)}
      </Box>

      {/* ── Mobile & Tablet Drawer (temporary overlay) ── */}
      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 288,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e2e1a 0%, #121c10 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.35)',
          },
        }}
      >
        {renderSidebarContent(true)}
      </Drawer>

      {/* ── Fixed Top Header (h-16 / 64px, adaptive left offset, matching prototype) ── */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, lg: 256 },
          right: 0,
          height: 64,
          backgroundColor: 'rgba(246, 248, 244, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #dbe3d6',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.02)',
          transition: 'left 0.2s ease',
        }}
      >
        {/* Left: Mobile Menu + Page Title & Subtitle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          <IconButton
            onClick={() => setMobileNavOpen(true)}
            sx={{
              display: { xs: 'inline-flex', lg: 'none' },
              p: 0.75,
              borderRadius: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              color: '#0f172a',
            }}
            aria-label="Open navigation menu"
          >
            <MenuRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: '#0f172a',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {headerMeta.title}
            </Typography>
            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mt: 0.25,
              }}
            >
              {headerMeta.subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Right: Date badge & Role badge (Logout sits in the sidebar footer) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          {/* Current Date Badge (hidden on mobile) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              height: 36,
              borderRadius: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <span>{todayFormatted}</span>
          </Box>

          {/* Role badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: isSuperAdmin ? '#ddd6fe' : '#bae6fd',
              backgroundColor: isSuperAdmin ? '#f5f3ff' : '#f0f9ff',
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              color: isSuperAdmin ? '#6d28d9' : '#0369a1',
              fontWeight: 800,
            }}
          >
            {staffRoleLabel}
          </Box>
        </Box>
      </Box>

      {/* ── Main Content Area (Adaptive left padding) ── */}
      <Box
        component="main"
        sx={{
          pl: { xs: 0, lg: '256px' },
          pt: '64px',
          minHeight: '100vh',
          backgroundColor: '#f8f9ff',
          transition: 'padding-left 0.2s ease',
        }}
      >
        <Box
          sx={{
            maxWidth: 1600,
            mx: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* ── Admin Profile Dialog ── */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
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
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SecurityOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Administrator Profile
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setProfileOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2.5 }}>
          {/* Avatar and Identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgb(22, 163, 74) 0%, rgb(34, 197, 94) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              }}
            >
              <PersonRoundedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  {staffFullName}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.15,
                    borderRadius: '9999px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Active
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                {isSuperAdmin ? 'Super Administrator' : 'Barangay Official'} • {staffRoleLabel} Access
              </Typography>
            </Box>
          </Box>

          {/* Details Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <EmailOutlinedIcon sx={{ fontSize: 15, color: '#64748b' }} />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>Email Address</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {staffEmail}
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <BadgeOutlinedIcon sx={{ fontSize: 15, color: '#64748b' }} />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>Assigned Facility Node</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {staffArea}
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>Clearance Scope</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                Full Telemetry, Intake Triage, Reuse Hub & Hazardous Disposal
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              setProfileOpen(false)
              setLogoutOpen(true)
            }}
            variant="text"
            color="error"
            size="small"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Log Out
          </Button>
          <Button
            onClick={() => setProfileOpen(false)}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#16a34a',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#15803d' },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Admin Logout Confirmation Dialog ── */}
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
            Confirm Administrator Logout
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            Are you sure you want to end your administrator session? Uncommitted disposition manifests or triage forms may need to be reloaded.
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
              '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              authApi.logout()
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

      <ForcePasswordResetModal
        open={Boolean(currentUser?.mustChangePassword)}
        userEmail={currentUser?.email}
        onSuccess={(updatedUser) => {
          const normalized = {
            ...updatedUser,
            role: resolveAuthRole(updatedUser.role, updatedUser.email),
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


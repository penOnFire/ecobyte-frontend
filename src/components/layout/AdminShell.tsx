import type { FC, ReactNode } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'

interface AdminShellProps {
  children: ReactNode
}

interface NavItem {
  label: string
  path: string
  icon: typeof GridViewRoundedIcon
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: GridViewRoundedIcon },
  { label: 'To inspect', path: '/admin/to-inspect', icon: FactCheckOutlinedIcon, badge: 6 },
  { label: 'Reuse Hub', path: '/admin/reuse-hub', icon: Inventory2OutlinedIcon },
  { label: 'Disposal', path: '/admin/disposal', icon: DeleteSweepOutlinedIcon },
  { label: 'Access', path: '/admin/access', icon: AdminPanelSettingsOutlinedIcon },
]

export const AdminShell: FC<AdminShellProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const isCurrentActive = (itemPath: string) => {
    if (itemPath === '/admin') {
      return path === '/admin' || path === '/admin/dashboard'
    }
    return path.startsWith(itemPath)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9ff',
        fontFamily: "'Rethink Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#0b1c30',
      }}
    >
      {/* ── Fixed Left Sidebar (w-64 / 256px) ── */}
      <Box
        component="aside"
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 256,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          py: 3,
          px: 2,
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Brand Header */}
          <Box
            onClick={() => navigate('/admin')}
            sx={{
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
              }}
            >
              <RecyclingRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  color: '#0b1c30',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                EcoByte Admin
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#16a34a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Enterprise Console
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {NAV_ITEMS.map((item) => {
              const active = isCurrentActive(item.path)
              const Icon = item.icon

              return (
                <ButtonBase
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.75,
                    py: 1.15,
                    borderRadius: '9999px',
                    transition: 'all 0.15s ease',
                    backgroundColor: active ? '#16a34a' : 'transparent',
                    color: active ? '#ffffff' : '#3f4944',
                    fontWeight: active ? 700 : 600,
                    fontSize: '0.875rem',
                    boxShadow: active ? '0 2px 8px rgba(22, 163, 74, 0.28)' : 'none',
                    '&:hover': {
                      backgroundColor: active ? '#15803d' : '#eff4ff',
                      color: active ? '#ffffff' : '#0b1c30',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon
                      sx={{
                        fontSize: 19,
                        color: active ? '#ffffff' : '#475569',
                      }}
                    />
                    <span style={{ fontFamily: "'Rethink Sans', 'Inter', sans-serif" }}>
                      {item.label}
                    </span>
                  </Box>
                  {item.badge && !active && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.15,
                        borderRadius: '9999px',
                        backgroundColor: '#eff4ff',
                        color: '#16a34a',
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        border: '1px solid #dce9ff',
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

        {/* Bottom Utility Links */}
        <Box sx={{ pt: 2, borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Switch to Resident Portal */}
          <ButtonBase
            onClick={() => navigate('/')}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.75,
              py: 1,
              borderRadius: '9999px',
              color: '#3f4944',
              fontSize: '0.8125rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#eff4ff',
                color: '#0b1c30',
              },
            }}
          >
            <SmartphoneRoundedIcon sx={{ fontSize: 18, color: '#475569' }} />
            <span style={{ fontFamily: "'Rethink Sans', 'Inter', sans-serif" }}>Resident View (Mobile)</span>
          </ButtonBase>

          {/* Log Out */}
          <ButtonBase
            onClick={() => navigate('/signin')}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.75,
              py: 1,
              borderRadius: '9999px',
              color: '#dc2626',
              fontSize: '0.8125rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
              },
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            <span style={{ fontFamily: "'Rethink Sans', 'Inter', sans-serif" }}>Log out</span>
          </ButtonBase>
        </Box>
      </Box>

      {/* ── Fixed Top Header (h-16 / 64px) ── */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 256,
          right: 0,
          height: 64,
          backgroundColor: 'rgba(248, 249, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 4 },
          boxShadow: '0 1px 6px rgba(0,0,0,0.02)',
        }}
      >
        {/* Left Telemetry Pill */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1.75,
              py: 0.5,
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '9999px',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              Node: <strong style={{ color: '#0f172a' }}>Central-Depot-01</strong> • Status: Online
            </Typography>
          </Box>
        </Box>

        {/* Right Admin Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.35,
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              fontSize: '0.6875rem',
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            Admin
          </Box>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgb(22, 163, 74) 0%, rgb(34, 197, 94) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
              cursor: 'pointer',
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
      </Box>

      {/* ── Main Content Area ── */}
      <Box
        component="main"
        sx={{
          pl: '256px',
          pt: '64px',
          minHeight: '100vh',
          backgroundColor: '#f8f9ff',
        }}
      >
        <Box
          sx={{
            maxWidth: 1600,
            mx: 'auto',
            p: { xs: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}


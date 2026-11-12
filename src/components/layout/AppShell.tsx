import type { FC, ReactNode } from 'react'
import { Avatar, Badge, Box, Container, IconButton, Typography } from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { useLocation, useNavigate } from 'react-router-dom'

interface AppShellProps {
  children: ReactNode
}

export const AppShell: FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

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
                  Barangay Commonwealth, QC
                </Typography>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 15, color: '#64748b' }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              aria-label="notifications"
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
              }}
            >
              <Badge
                variant="dot"
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
              onClick={() => navigate('/signin')}
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
              }}
            >
              A
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
              active={isActive('/signin')}
              onClick={() => navigate('/signin')}
            />
          </Box>
        </Box>
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

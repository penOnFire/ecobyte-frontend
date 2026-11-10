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
            backgroundColor: '#faf8f5',
            px: 2.5,
            pt: 1.75,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
          >
            <LocationOnRoundedIcon sx={{ color: '#4f5f4b', fontSize: 20 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: '#292524',
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
                    color: '#78716c',
                    lineHeight: 1,
                  }}
                >
                  Barangay San Antonio
                </Typography>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 15, color: '#78716c' }} />
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
                border: '1px solid #ede8e1',
                borderRadius: '50%',
              }}
            >
              <Badge
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#d9534f',
                    minWidth: 7,
                    height: 7,
                    right: 1,
                    top: 1,
                  },
                }}
              >
                <NotificationsNoneRoundedIcon sx={{ color: '#292524', fontSize: 18 }} />
              </Badge>
            </IconButton>

            <Avatar
              onClick={() => navigate('/signin')}
              sx={{
                width: 34,
                height: 34,
                backgroundColor: '#4f5f4b',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: '2px solid #e8f0e6',
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
              backgroundColor: '#ffffff',
              borderTop: '1px solid #ede8e1',
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
              active={isActive('/')}
              onClick={() => navigate('/')}
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
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(79, 95, 75, 0.4)',
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
                  color: isActive('/scan') ? '#4f5f4b' : '#78716c',
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
      color: active ? '#4f5f4b' : '#78716c',
      minWidth: 52,
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

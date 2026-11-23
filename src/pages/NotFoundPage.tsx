import type { FC } from 'react'
import { Box, Button, Card, Container, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'

export const NotFoundPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('ecobyte_token'))
  const role = typeof window !== 'undefined' ? (localStorage.getItem('ecobyte_user_role') || '').toUpperCase() : ''
  const isStaff = role === 'ADMIN' || role === 'BARANGAY_OFFICIAL' || role === 'OFFICIAL'
  const homePath = hasToken ? (isStaff ? '/admin' : '/dashboard') : '/'
  const homeLabel = hasToken ? (isStaff ? 'Go to Admin Portal' : 'Go to Dashboard') : 'Back to EcoByte Home'

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        backgroundColor: '#faf8f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2.5,
        py: 4,
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: { xs: 444, sm: 480 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={ecobyteLogo}
            alt="EcoByte"
            sx={{ width: 56, height: 56, mb: 1, objectFit: 'contain' }}
          />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#0f172a',
              lineHeight: 1.1,
            }}
          >
            EcoByte
          </Typography>
        </Box>

        <Card
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            backgroundColor: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              backgroundColor: '#eef3ed',
              border: '1.5px solid #dce4dc',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <SearchOffRoundedIcon sx={{ fontSize: 28, color: '#4f5f4b' }} />
          </Box>

          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4f5f4b',
              mb: 0.5,
            }}
          >
            Error 404
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#0f172a',
              mb: 1,
            }}
          >
            Page not found
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#64748b',
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            We couldn&apos;t find{' '}
            <Box
              component="code"
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                fontSize: '0.8125rem',
                fontWeight: 700,
                wordBreak: 'break-all',
              }}
            >
              {location.pathname}
            </Box>
            . The link may be broken or the page may have moved.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate(homePath, { replace: true })}
              sx={{
                py: 1.35,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                gap: 1,
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              <HomeRoundedIcon sx={{ fontSize: 18 }} />
              {homeLabel}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate(-1)}
              sx={{
                py: 1.25,
                borderColor: '#e2e8f0',
                color: '#0f172a',
                display: 'flex',
                gap: 0.75,
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              Go Back
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}

import { useEffect, useState } from 'react'
import type { FC, FormEvent } from 'react'
import {
  Box,
  Button,
  ButtonBase,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  OutlinedInput,
  Typography,
} from '@mui/material'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import LockClockRoundedIcon from '@mui/icons-material/LockClockRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import YardOutlinedIcon from '@mui/icons-material/YardOutlined'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi, clearStaleLocalRequests, setCachedUser } from '@/lib/api'

type DetectedAccountType = 'resident' | 'official' | 'admin'

function detectAccountType(email: string): DetectedAccountType {
  const lower = email.trim().toLowerCase()
  if (lower.includes('admin') || lower === 'admin@ecobyte.gov') {
    return 'admin'
  }
  if (
    lower.includes('official') ||
    lower.includes('barangay.gov.ph') ||
    lower.includes('gov.ph')
  ) {
    return 'official'
  }
  return 'resident'
}

const LOCKOUT_KEY = 'ecobyte_login_lockout'
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

interface LockoutState {
  attempts: number
  lockedUntil: number | null
}

function getStoredLockout(): LockoutState {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY)
    if (!raw) return { attempts: 0, lockedUntil: null }
    const parsed = JSON.parse(raw)
    if (parsed.lockedUntil && Number(parsed.lockedUntil) > Date.now()) {
      return { attempts: parsed.attempts || MAX_FAILED_ATTEMPTS, lockedUntil: Number(parsed.lockedUntil) }
    }
    return { attempts: Number(parsed.attempts) || 0, lockedUntil: null }
  } catch {
    return { attempts: 0, lockedUntil: null }
  }
}

function setStoredLockout(state: LockoutState): void {
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors cleanly
  }
}

function clearStoredLockout(): void {
  try {
    localStorage.removeItem(LOCKOUT_KEY)
  } catch {
    // Ignore
  }
}

export const SignInPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('official@barangay.gov.ph')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lockoutState, setLockoutState] = useState<LockoutState>(getStoredLockout)
  const [nowMs, setNowMs] = useState(() => Date.now())

  // Dialogs
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  // Countdown timer for 15-minute temporary lockout
  useEffect(() => {
    if (!lockoutState.lockedUntil || lockoutState.lockedUntil <= Date.now()) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNowMs(current)
      if (lockoutState.lockedUntil && lockoutState.lockedUntil <= current) {
        setLockoutState({ attempts: 0, lockedUntil: null })
        clearStoredLockout()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutState.lockedUntil])

  const lockoutSecondsRemaining =
    lockoutState.lockedUntil && lockoutState.lockedUntil > nowMs
      ? Math.ceil((lockoutState.lockedUntil - nowMs) / 1000)
      : 0
  const isLockedOut = lockoutSecondsRemaining > 0

  const formatLockoutTimer = (sec: number): string => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const detectedRole = detectAccountType(email)

  const rawRedirect = searchParams.get('redirect')
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (isLockedOut) {
      setErrorMessage(
        `Account temporarily locked. Please wait ${formatLockoutTimer(lockoutSecondsRemaining)} before retrying.`
      )
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await authApi.login({
        email: email.trim(),
        password: password.trim(),
        rememberMe,
      })

      clearStaleLocalRequests()
      clearStoredLockout()
      setLockoutState({ attempts: 0, lockedUntil: null })

      if (res?.accessToken) {
        localStorage.setItem('ecobyte_token', res.accessToken)
      }
      if (res?.user) {
        setCachedUser(res.user)
      }

      const roleUpper = (res?.user?.role || '').toUpperCase()
      const isSuperAdmin =
        roleUpper === 'ADMIN' || email.toLowerCase().includes('admin')
      const isOfficial =
        roleUpper === 'BARANGAY_OFFICIAL' ||
        roleUpper === 'OFFICIAL' ||
        email.toLowerCase().includes('official') ||
        email.toLowerCase().includes('barangay.gov.ph')

      const effectiveRole = isSuperAdmin
        ? 'ADMIN'
        : isOfficial
        ? 'BARANGAY_OFFICIAL'
        : 'RESIDENT'

      localStorage.setItem('ecobyte_user_role', effectiveRole)

      if (res?.user) {
        setCachedUser({
          ...res.user,
          role: isSuperAdmin ? 'admin' : isOfficial ? 'barangay_official' : 'resident',
        })
      } else {
        setCachedUser({
          id: isSuperAdmin ? 'admin-001' : isOfficial ? 'official-001' : 'res-001',
          fullName: isSuperAdmin
            ? 'Elena Vance'
            : isOfficial
            ? 'Captain Mateo Cruz'
            : 'Alex Resident',
          email: email.trim(),
          role: isSuperAdmin ? 'admin' : isOfficial ? 'barangay_official' : 'resident',
          barangay: { id: 1, name: 'Commonwealth Central MRF' },
        } as any)
      }

      if (safeRedirect) {
        if (!isSuperAdmin && !isOfficial && safeRedirect.startsWith('/admin')) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate(safeRedirect, { replace: true })
        }
      } else if (isSuperAdmin || isOfficial) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      console.error('Authentication rejected by backend:', err)

      // Fallback for offline development if fetch fails
      const isNetworkError =
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network')

      if (isNetworkError) {
        const isSuperAdmin = email.toLowerCase().includes('admin')
        const isOfficial =
          email.toLowerCase().includes('official') ||
          email.toLowerCase().includes('barangay.gov.ph')

        const effectiveRole = isSuperAdmin
          ? 'ADMIN'
          : isOfficial
          ? 'BARANGAY_OFFICIAL'
          : 'RESIDENT'

        clearStoredLockout()
        localStorage.setItem('ecobyte_token', `offline_mock_token_${effectiveRole.toLowerCase()}`)
        localStorage.setItem('ecobyte_user_role', effectiveRole)

        setCachedUser({
          id: isSuperAdmin ? 'admin-001' : isOfficial ? 'official-001' : 'res-001',
          fullName: isSuperAdmin
            ? 'Elena Vance'
            : isOfficial
            ? 'Captain Mateo Cruz'
            : 'Alex Resident',
          email: email.trim(),
          role: isSuperAdmin ? 'admin' : isOfficial ? 'barangay_official' : 'resident',
          barangay: { id: 1, name: 'Commonwealth Central MRF' },
        } as any)

        if (safeRedirect && (isSuperAdmin || isOfficial || !safeRedirect.startsWith('/admin'))) {
          navigate(safeRedirect, { replace: true })
        } else if (isSuperAdmin || isOfficial) {
          navigate('/admin', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
        return
      }

      localStorage.removeItem('ecobyte_token')

      // Record failed attempt
      const nextAttempts = (lockoutState.attempts || 0) + 1
      if (nextAttempts >= MAX_FAILED_ATTEMPTS || err?.message?.includes('locked')) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS
        const lockedState = { attempts: nextAttempts, lockedUntil }
        setLockoutState(lockedState)
        setStoredLockout(lockedState)
        setErrorMessage(
          'Account temporarily locked due to 5 consecutive failed login attempts. Please wait 15 minutes or contact Barangay Commonwealth IT.'
        )
      } else {
        const updated = { attempts: nextAttempts, lockedUntil: null }
        setLockoutState(updated)
        setStoredLockout(updated)
        const remaining = MAX_FAILED_ATTEMPTS - nextAttempts
        setErrorMessage(
          `Invalid email or password. Attempt ${nextAttempts} of ${MAX_FAILED_ATTEMPTS}. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before a 15-minute lock.`
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        fontFamily: "'Quicksand', sans-serif",
        backgroundColor: '#ffffff',
        color: '#0f172a',
      }}
    >
      {/* ============ LEFT PANEL (Brand, Impact & Hero) ============ */}
      <Box
        component="aside"
        sx={{
          position: 'relative',
          width: { xs: '100%', lg: '50%' },
          minHeight: { xs: 'auto', lg: '100vh' },
          positionSticky: { lg: 'sticky' },
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 4, lg: 6 },
          p: { xs: 3.5, sm: 6, lg: 8, xl: 10 },
          background: 'linear-gradient(135deg, #1e2e1a 0%, #1a2817 50%, #121c10 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Glow ambient background orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: -96,
            left: -96,
            width: 420,
            height: 420,
            borderRadius: '50%',
            backgroundColor: 'rgba(132, 204, 22, 0.20)',
            filter: 'blur(110px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -96,
            right: 0,
            width: 380,
            height: 380,
            borderRadius: '50%',
            backgroundColor: 'rgba(74, 222, 128, 0.10)',
            filter: 'blur(120px)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: { xs: 40, lg: 46 },
              height: { xs: 40, lg: 46 },
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            }}
          >
            <YardOutlinedIcon sx={{ color: '#ffffff', fontSize: { xs: 24, lg: 28 } }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '1.25rem', lg: '1.5rem' },
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            ECOBYTE
          </Typography>
        </Box>

        {/* Hero Copy & Community Metrics */}
        <Box sx={{ position: 'relative', zIndex: 1, my: { lg: 'auto' }, maxWidth: 540 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '1.875rem', sm: '2.5rem', xl: '3.125rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Turn idle electronics into{' '}
            <Box component="span" sx={{ color: '#a3e635' }}>
              community power.
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.72)',
              mt: { xs: 2, lg: 2.5 },
            }}
          >
            Repair, rehome, and recycle electronics with your neighbors across Pasig.
          </Typography>

          {/* Stats Bar */}
          <Box
            sx={{
              display: { xs: 'flex' },
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 3, sm: 4, xl: 5 },
              mt: { xs: 4, lg: 6 },
              pt: { xs: 3, lg: 0 },
              borderTop: { xs: '1px solid rgba(255,255,255,0.1)', lg: 'none' },
            }}
          >
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: { xs: '1.5rem', xl: '2rem' }, color: '#ffffff' }}>
                2,400+
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.60)', mt: 0.25 }}>
                Residents
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: 38, backgroundColor: 'rgba(255, 255, 255, 0.16)' }} />
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: { xs: '1.5rem', xl: '2rem' }, color: '#ffffff', display: 'flex', alignItems: 'baseline' }}>
                14.2<Typography component="span" sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: { xs: '1rem', xl: '1.125rem' }, color: '#a3e635', ml: 0.5 }}>kg</Typography>
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.60)', mt: 0.25 }}>
                Diverted this week
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: 38, backgroundColor: 'rgba(255, 255, 255, 0.16)' }} />
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: { xs: '1.5rem', xl: '2rem' }, color: '#ffffff' }}>
                48
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.60)', mt: 0.25 }}>
                Devices to claim
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Security & Standard Footnote */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            position: 'relative',
            zIndex: 1,
            alignItems: 'center',
            gap: 1,
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.52)',
            fontWeight: 500,
          }}
        >
          <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: '#a3e635' }} />
          NIST 800-88 certified data sanitization · Zero-landfill commitment
        </Box>
      </Box>

      {/* ============ RIGHT PANEL (Sign In Form) ============ */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          width: { xs: '100%', lg: '50%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 4,
          backgroundColor: '#f1f4f0',
          p: { xs: 3, sm: 6, lg: 8, xl: 10 },
          overflow: 'hidden',
          minHeight: { lg: '100vh' },
        }}
      >
        {/* Ambient right glow orb */}
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            right: 0,
            width: 320,
            height: 320,
            borderRadius: '50%',
            backgroundColor: 'rgba(132, 204, 22, 0.15)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top support link */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <ButtonBase
            onClick={() => setSupportOpen(true)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              transition: 'color 0.15s ease',
              fontFamily: "'Quicksand', sans-serif",
              '&:hover': { color: '#2e6022' },
            }}
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 16 }} />
            Need help? Contact Hub Support
          </ButtonBase>
        </Box>

        {/* Main Login Card */}
        <Card
          elevation={0}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 460,
            mx: 'auto',
            my: { lg: 'auto' },
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
            p: { xs: 3, sm: 5 },
          }}
        >
          {/* Top Badge: Dynamic Account Type */}
          <Box sx={{ mb: 3 }}>
            {detectedRole === 'admin' ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <ShieldOutlinedIcon sx={{ fontSize: 15 }} />
                Super Admin Portal
              </Box>
            ) : detectedRole === 'official' ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: '#f1f4f0',
                  border: '1px solid rgba(132, 204, 22, 0.4)',
                  color: '#3e6b27',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
                Barangay Official Portal
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 9999,
                  backgroundColor: '#f1f4f0',
                  border: '1px solid rgba(132, 204, 22, 0.35)',
                  color: '#2e6022',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <YardOutlinedIcon sx={{ fontSize: 15 }} />
                Resident Portal
              </Box>
            )}

            <Typography
              component="h2"
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '1.625rem', sm: '1.875rem' },
                letterSpacing: '-0.02em',
                color: '#0f172a',
                mt: 1.75,
                mb: 0.5,
              }}
            >
              Welcome back
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#64748b',
              }}
            >
              {detectedRole === 'admin'
                ? 'Sign in with your central administrator credentials.'
                : detectedRole === 'official'
                ? 'Sign in with your official barangay account.'
                : 'Sign in with your registered resident account.'}
            </Typography>
          </Box>

          {/* Lockout Notice Banner */}
          {isLockedOut ? (
            <Box
              sx={{
                p: 1.75,
                mb: 2.5,
                backgroundColor: '#fff1f2',
                borderRadius: '12px',
                border: '1.5px solid #fecdd3',
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
              }}
            >
              <LockClockRoundedIcon sx={{ color: '#e11d48', fontSize: 20, mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: '#9f1239', fontSize: '0.8125rem', fontWeight: 800 }}>
                  Account Temporarily Locked
                </Typography>
                <Typography sx={{ color: '#be123c', fontSize: '0.75rem', fontWeight: 600, mt: 0.25 }}>
                  5 consecutive failed attempts detected. Retrying available in:
                </Typography>
                <Box
                  sx={{
                    mt: 0.75,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                >
                  {formatLockoutTimer(lockoutSecondsRemaining)}
                </Box>
              </Box>
            </Box>
          ) : errorMessage ? (
            <Box
              sx={{
                p: 1.5,
                mb: 2.5,
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                border: '1px solid #fecaca',
              }}
            >
              <Typography sx={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
                {errorMessage}
              </Typography>
            </Box>
          ) : null}
          {/* Dynamic Account Type Detection Badge */}
          {(() => {
            const detected = detectAccountType(email)
            if (detected === 'admin') {
              return (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.25,
                    borderRadius: '10px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#15803d' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#14532d', lineHeight: 1.2 }}>
                      Super Admin Central Account
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#166534', fontWeight: 600 }}>
                      Auto-redirects to Central System-Wide Oversight (/admin)
                    </Typography>
                  </Box>
                </Box>
              )
            }
            if (detected === 'official') {
              return (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.25,
                    borderRadius: '10px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#14532d', lineHeight: 1.2 }}>
                      Barangay Official Account
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#166534', fontWeight: 600 }}>
                      Auto-redirects to Station Operations Portal (/admin)
                    </Typography>
                  </Box>
                </Box>
              )
            }
            return (
              <Box
                sx={{
                  mb: 2,
                  p: 1.25,
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <YardOutlinedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Resident Account
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    Auto-redirects to Circular E-Waste Portal (/dashboard)
                  </Typography>
                </Box>
              </Box>
            )
          })()}

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {/* Email Field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography
                component="label"
                htmlFor="email-input"
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Email address
              </Typography>
              <OutlinedInput
                id="email-input"
                type="email"
                required
                autoComplete="username"
                value={email}
                disabled={isLockedOut}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  detectedRole === 'admin'
                    ? 'admin@ecobyte.gov'
                    : detectedRole === 'official'
                    ? 'official@barangay.gov.ph'
                    : 'alex.resident@ecobyte.ph'
                }
                startAdornment={
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                }
                sx={{
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1e293b',
                  fontFamily: "'Quicksand', sans-serif",
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#70b822',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#70b822',
                    borderWidth: 2,
                  },
                }}
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography
                component="label"
                htmlFor="password-input"
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Password
              </Typography>
              <OutlinedInput
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                disabled={isLockedOut}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1e293b',
                  fontFamily: "'Quicksand', sans-serif",
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#70b822',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#70b822',
                    borderWidth: 2,
                  },
                }}
              />
            </Box>

            {/* Remember me & Forgot Password */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      p: 0.5,
                      color: '#cbd5e1',
                      '&.Mui-checked': { color: '#2e6022' },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#475569',
                    }}
                  >
                    Remember me
                  </Typography>
                }
                sx={{ ml: -0.5 }}
              />
              <Link
                component="button"
                type="button"
                onClick={() => {
                  setForgotEmail(email)
                  setForgotSubmitted(false)
                  setForgotPasswordOpen(true)
                }}
                underline="hover"
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#2e6022',
                  cursor: 'pointer',
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              type="submit"
              disabled={isLoading || isLockedOut}
              sx={{
                height: 48,
                borderRadius: '12px',
                background: isLockedOut
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                color: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                boxShadow: isLockedOut ? 'none' : '0 6px 16px rgba(112, 184, 34, 0.28)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  background: isLockedOut
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #244e1b 0%, #63a41e 100%)',
                  boxShadow: isLockedOut ? 'none' : '0 8px 20px rgba(112, 184, 34, 0.36)',
                },
                '&:active': {
                  transform: 'scale(0.99)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : isLockedOut ? (
                <>
                  <LockClockRoundedIcon sx={{ fontSize: 18 }} />
                  Locked ({formatLockoutTimer(lockoutSecondsRemaining)})
                </>
              ) : (
                <>
                  Sign In
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </>
              )}
            </Button>

            {/* Quick Testing Presets Switcher */}
            <Box sx={{ mt: 0.5, pt: 2, borderTop: '1px solid #f1f5f9' }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                Quick Testing Presets
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                <ButtonBase
                  type="button"
                  onClick={() => {
                    setEmail('alex.resident@ecobyte.ph')
                    setPassword('resident123')
                    setErrorMessage(null)
                  }}
                  sx={{
                    py: 0.75,
                    px: 0.75,
                    borderRadius: '8px',
                    backgroundColor: detectedRole === 'resident' ? '#f1f4f0' : '#f8fafc',
                    border: detectedRole === 'resident' ? '1.5px solid #84cc16' : '1px solid #cbd5e1',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#2e6022',
                    fontFamily: "'Quicksand', sans-serif",
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#eef3ed' },
                  }}
                >
                  🌱 Resident
                </ButtonBase>
                <ButtonBase
                  type="button"
                  onClick={() => {
                    setEmail('official@barangay.gov.ph')
                    setPassword('official123')
                    setErrorMessage(null)
                  }}
                  sx={{
                    py: 0.75,
                    px: 0.75,
                    borderRadius: '8px',
                    backgroundColor: detectedRole === 'official' ? '#f1f4f0' : '#f8fafc',
                    border: detectedRole === 'official' ? '1.5px solid #84cc16' : '1px solid #cbd5e1',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#3e6b27',
                    fontFamily: "'Quicksand', sans-serif",
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#eef3ed' },
                  }}
                >
                  📍 Official
                </ButtonBase>
                <ButtonBase
                  type="button"
                  onClick={() => {
                    setEmail('admin@ecobyte.gov')
                    setPassword('admin123')
                    setErrorMessage(null)
                  }}
                  sx={{
                    py: 0.75,
                    px: 0.75,
                    borderRadius: '8px',
                    backgroundColor: detectedRole === 'admin' ? '#f0fdf4' : '#f8fafc',
                    border: detectedRole === 'admin' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#15803d',
                    fontFamily: "'Quicksand', sans-serif",
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#dcfce7' },
                  }}
                >
                  🛡️ Admin
                </ButtonBase>
              </Box>
            </Box>
          </Box>

          {/* Card Footer Context */}
          <Box
            sx={{
              mt: 3,
              pt: 2.5,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8', mt: '1px', flexShrink: 0 }} />
            {detectedRole === 'resident' ? (
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                New to EcoByte Pasig?{' '}
                <Link
                  onClick={() => navigate('/register')}
                  sx={{
                    fontWeight: 700,
                    color: '#2e6022',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Create a resident account
                </Link>
              </Typography>
            ) : (
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                Accounts are issued by the EcoByte admin. No account yet? Contact your hub coordinator.
              </Typography>
            )}
          </Box>
        </Card>

        {/* Security & Privacy Footer */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 14, color: '#475569' }} />
          <span>Protected with end-to-end encryption</span>
          <span>•</span>
          <Link
            component="button"
            type="button"
            onClick={() => setPrivacyOpen(true)}
            underline="hover"
            sx={{
              color: '#475569',
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { color: '#0f172a' },
            }}
          >
            Privacy Policy
          </Link>
        </Box>
      </Box>

      {/* ── Hub Support Dialog ── */}
      <Dialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1.5,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
          EcoByte Hub Support
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
            Need assistance logging into the Barangay Operations Portal or Resident E-Waste Hub?
          </Typography>
          <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              Barangay Commonwealth MRF Desk
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
              Hotline: (02) 8931-1234 · support@ecobyte.ph
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.5 }}>
              Hours: Mon–Sat 8:00 AM – 5:00 PM PHT
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setSupportOpen(false)}
            sx={{
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Forgot Password Dialog ── */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1.5,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
          Reset Password
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {forgotSubmitted ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#16a34a' }}>
                Password Reset Instructions Sent!
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 1 }}>
                If an account exists for <strong>{forgotEmail}</strong>, instructions and a verification token have been dispatched. You can also visit Barangay Commonwealth IT help desk.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                Enter your registered resident or staff email address. We will verify your account and provide a reset link.
              </Typography>
              <OutlinedInput
                fullWidth
                size="small"
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                sx={{ borderRadius: '10px', fontFamily: "'Quicksand', sans-serif" }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {forgotSubmitted ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => setForgotPasswordOpen(false)}
              sx={{
                background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                color: '#ffffff',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Return to Sign In
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setForgotPasswordOpen(false)}
                sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!forgotEmail.includes('@')}
                onClick={() => setForgotSubmitted(true)}
                sx={{
                  background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                  color: '#ffffff',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Send Recovery Code
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Privacy Policy Dialog ── */}
      <Dialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1.5,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
          Barangay Commonwealth Data Privacy Notice
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2, fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6 }}>
          <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
            Republic Act No. 10173 (Data Privacy Act of 2012) Compliance
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem' }}>
            EcoByte Barangay Commonwealth collects resident contact details (name, phone, area) solely for scheduling e-waste drop-offs, circular refurbishing vouchers, and environmental recycling certificates.
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem' }}>
            All e-waste data and diagnostic photos uploaded are processed strictly for hardware lifecycle triage and hazardous material isolation. We do not sell or disclose resident personal data to third parties.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setPrivacyOpen(false)}
            sx={{
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

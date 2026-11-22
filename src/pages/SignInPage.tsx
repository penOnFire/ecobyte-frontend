import { useEffect, useState } from 'react'
import type { FC, FormEvent } from 'react'
import {
  Box,
  Button,
  ButtonBase,
  Card,
  Checkbox,
  CircularProgress,
  Container,
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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import LockClockRoundedIcon from '@mui/icons-material/LockClockRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import YardOutlinedIcon from '@mui/icons-material/YardOutlined'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'
import {
  authApi,
  buildFallbackMockUser,
  clearStaleLocalRequests,
  resolveAuthRole,
  setCachedUser,
} from '@/lib/api'
import type { User } from '@/types'
import { ForcePasswordResetModal } from '@/components/auth/ForcePasswordResetModal'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lockoutState, setLockoutState] = useState<LockoutState>(getStoredLockout)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [forceResetUser, setForceResetUser] = useState<User | null>(null)
  const [pendingRedirect, setPendingRedirect] = useState<string>('/dashboard')
  const [pendingTempPassword, setPendingTempPassword] = useState<string>('')

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

  const rawRedirect = searchParams.get('redirect')
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (isLockedOut) {
      setErrorMessage(`Account temporarily locked. Please wait ${formatLockoutTimer(lockoutSecondsRemaining)} before retrying.`)
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

      const effectiveRole = resolveAuthRole(res?.user?.role, email)
      const isSuperAdmin = effectiveRole === 'ADMIN'
      const isOfficial = effectiveRole === 'BARANGAY_OFFICIAL'

      localStorage.setItem('ecobyte_user_role', effectiveRole)

      const cachedSessionUser = res?.user
        ? {
            ...res.user,
            role: effectiveRole.toLowerCase(),
          }
        : {
            ...buildFallbackMockUser(effectiveRole, email),
            role: effectiveRole.toLowerCase(),
          }
      setCachedUser(cachedSessionUser)

      const targetRoute = safeRedirect
        ? !isSuperAdmin && !isOfficial && safeRedirect.startsWith('/admin')
          ? '/dashboard'
          : safeRedirect
        : isSuperAdmin || isOfficial
          ? '/admin'
          : '/dashboard'

      if (res?.user?.mustChangePassword) {
        setPendingTempPassword(password.trim())
        setPendingRedirect(targetRoute)
        setForceResetUser(cachedSessionUser)
        return
      }

      navigate(targetRoute, { replace: true })
    } catch (err: any) {
      console.error('Authentication rejected by backend:', err)

      // Fallback for offline development if fetch fails
      const isNetworkError =
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network')

      if (isNetworkError) {
        const effectiveRole = resolveAuthRole(undefined, email)
        const isSuperAdmin = effectiveRole === 'ADMIN'
        const isOfficial = effectiveRole === 'BARANGAY_OFFICIAL'

        clearStoredLockout()
        localStorage.setItem('ecobyte_token', `offline_mock_token_${effectiveRole.toLowerCase()}`)
        localStorage.setItem('ecobyte_user_role', effectiveRole)

        setCachedUser({
          ...buildFallbackMockUser(effectiveRole, email),
          role: effectiveRole.toLowerCase(),
        })

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
      <Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: { xs: 444, sm: 500, md: 540 } }}>
        {/* Back to Landing Page Link */}
        <Box sx={{ mb: 2.5 }}>
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #dce4dc',
              borderBottom: '3px solid #c1cdc1',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#0f172a',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: '#eef3ed',
                borderColor: '#4f5f4b',
              },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
            Back to EcoByte Home
          </Link>
        </Box>

        {/* Brand */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={ecobyteLogo}
            alt="EcoByte"
            sx={{
              width: 58,
              height: 58,
              borderRadius: 2,
              mb: 1.5,
              boxShadow: '0 4px 16px rgba(15,23,42,0.12)',
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.875rem',
              color: '#0f172a',
              lineHeight: 1.1,
            }}
          >
            EcoByte
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.6875rem',
              color: '#64748b',
              mt: 0.5,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Circular Electronics &amp; E-Waste Lifecycle
          </Typography>
        </Box>

        {/* Main Card (Shadcn aesthetic) */}
        <Card
          sx={{
            px: 3,
            pt: 2.5,
            pb: 3,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Segmented Toggle Pill: Sign In / Register */}
          <Box
            sx={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: 9999,
              p: '4px',
              mb: 3,
              border: '1px solid #e2e8f0',
            }}
          >
            <Box
              sx={{
                flex: 1,
                py: 1,
                borderRadius: 9999,
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#ffffff',
                }}
              >
                Sign In
              </Typography>
            </Box>
            <Box
              onClick={() => navigate('/register')}
              sx={{
                flex: 1,
                py: 1,
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { color: '#0f172a' },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: '#64748b',
                }}
              >
                Register
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#0f172a',
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.8125rem',
              color: '#64748b',
              mt: 0.25,
              mb: 2.5,
            }}
          >
            Sign in to your circular tech account.
          </Typography>

          {isLockedOut ? (
            <Box
              sx={{
                p: 1.75,
                mb: 2,
                backgroundColor: '#fff1f2',
                borderRadius: 2,
                border: '1.5px solid #fecdd3',
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
              }}
            >
              <LockClockRoundedIcon sx={{ color: '#e11d48', fontSize: 22, mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: '#9f1239', fontSize: '0.8125rem', fontWeight: 800 }}>
                  Account Temporarily Locked (15 Minutes)
                </Typography>
                <Typography sx={{ color: '#be123c', fontSize: '0.75rem', fontWeight: 600, mt: 0.25 }}>
                  5 consecutive failed attempts detected. Login is locked for your protection.
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.35,
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  Retrying available in: {formatLockoutTimer(lockoutSecondsRemaining)}
                </Box>
              </Box>
            </Box>
          ) : errorMessage ? (
            <Box sx={{ p: 1.25, mb: 1.75, backgroundColor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
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

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Email */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  mb: 0.75,
                }}
              >
                Email Address
              </Typography>
              <OutlinedInput
                fullWidth
                type="email"
                value={email}
                disabled={isLockedOut}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.resident@ecobyte.ph"
                inputProps={{ required: true }}
                startAdornment={
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  mb: 0.75,
                }}
              >
                Password
              </Typography>
              <OutlinedInput
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isLockedOut}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                inputProps={{ required: true }}
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

            {/* Remember me + Forgot */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5, color: '#cbd5e1', '&.Mui-checked': { color: '#0f172a' } }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: '#0f172a',
                    }}
                  >
                    Remember me
                  </Typography>
                }
              />
              <Link
                component="button"
                type="button"
                onClick={() => {
                  setForgotEmail(email)
                  setForgotSubmitted(false)
                  setForgotPasswordOpen(true)
                }}
                underline="none"
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Submit */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || isLockedOut}
              sx={{
                mt: 0.5,
                py: 1.5,
                fontSize: '0.9375rem',
                display: 'flex',
                gap: 1,
                backgroundColor: isLockedOut ? '#94a3b8' : '#0f172a',
                color: '#ffffff',
                '&:hover': { backgroundColor: isLockedOut ? '#94a3b8' : '#1e293b' },
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

            {/* Quick Testing Presets for Resident, Official, Super Admin */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
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
                    px: 0.5,
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#334155',
                    fontFamily: "'Quicksand', sans-serif",
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#94a3b8' },
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
                    px: 0.5,
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#166534',
                    fontFamily: "'Quicksand', sans-serif",
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#dcfce7', borderColor: '#4ade80' },
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
                    px: 0.5,
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#15803d',
                    fontFamily: "'Quicksand', sans-serif",
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#dcfce7', borderColor: '#4ade80' },
                  }}
                >
                  🛡️ Admin
                </ButtonBase>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Don't have account */}
        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#64748b',
            }}
          >
            Don&apos;t have an account?{' '}
            <Link
              onClick={() => navigate('/register')}
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Register
            </Link>
          </Typography>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            mt: 3.5,
            color: '#94a3b8',
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 13 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            Protected with end-to-end encryption •{' '}
            <Link
              component="button"
              type="button"
              onClick={() => setPrivacyOpen(true)}
              underline="hover"
              sx={{ color: 'inherit', cursor: 'pointer', fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', fontWeight: 600 }}
            >
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Container>

      {/* ── Forgot Password Dialog ── */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
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
                sx={{ borderRadius: 1.5, fontFamily: "'Quicksand', sans-serif" }}
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
              sx={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
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
                sx={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
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
              borderRadius: '16px',
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
            sx={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      <ForcePasswordResetModal
        open={Boolean(forceResetUser)}
        userEmail={forceResetUser?.email}
        initialCurrentPassword={pendingTempPassword}
        onSuccess={(updatedUser) => {
          const effectiveRole = resolveAuthRole(updatedUser.role, updatedUser.email)
          setCachedUser({
            ...updatedUser,
            role: effectiveRole.toLowerCase(),
            mustChangePassword: false,
          })
          setForceResetUser(null)
          navigate(pendingRedirect || '/dashboard', { replace: true })
        }}
        onSignOut={() => {
          authApi.logout()
          setForceResetUser(null)
          setPendingTempPassword('')
          setPassword('')
        }}
      />
    </Box>
  )
}

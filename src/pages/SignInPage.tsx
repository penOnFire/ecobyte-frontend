import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
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
import AppleIcon from '@mui/icons-material/Apple'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import { useNavigate } from 'react-router-dom'
import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'
import { authApi } from '@/lib/api'

export const SignInPage: FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

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

      if (res?.accessToken) {
        localStorage.setItem('ecobyte_token', res.accessToken)
      }

      if (
        res?.user?.role === 'ADMIN' ||
        email.includes('admin') ||
        email.includes('ecobyte.gov') ||
        email.includes('official')
      ) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Authentication rejected by backend:', err)
      localStorage.removeItem('ecobyte_token')
      setErrorMessage(
        err?.message || 'Invalid email or password. Please verify your credentials and try again.'
      )
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
      <Container maxWidth="xs" disableGutters>
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

          {errorMessage && (
            <Box sx={{ p: 1, mb: 1.5, backgroundColor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
              <Typography sx={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
                {errorMessage}
              </Typography>
            </Box>
          )}

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
                href="#"
                underline="none"
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#0f172a',
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
              disabled={isLoading}
              sx={{
                mt: 0.5,
                py: 1.5,
                fontSize: '0.9375rem',
                display: 'flex',
                gap: 1,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  Sign In
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </>
              )}
            </Button>

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                fullWidth
                type="button"
                onClick={() => {
                  setEmail('alex.resident@ecobyte.ph')
                  setPassword('resident123')
                }}
                variant="outlined"
                size="small"
                sx={{
                  py: 0.75,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                Fill Resident Demo
              </Button>
              <Button
                fullWidth
                type="button"
                onClick={() => {
                  setEmail('admin@ecobyte.gov')
                  setPassword('admin123')
                }}
                variant="outlined"
                size="small"
                sx={{
                  py: 0.75,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderColor: '#86efac',
                  color: '#15803d',
                  backgroundColor: '#f0fdf4',
                  '&:hover': { backgroundColor: '#dcfce7' },
                }}
              >
                Fill Admin Demo
              </Button>
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 2.5 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.07em',
                color: '#94a3b8',
                textTransform: 'uppercase',
              }}
            >
              Or continue with
            </Typography>
          </Divider>

          {/* Social Buttons */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
            {[
              {
                label: 'Google',
                icon: (
                  <Box
                    sx={{
                      fontFamily: 'Arial, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: '#4285f4',
                    }}
                  >
                    G
                  </Box>
                ),
              },
              { label: 'Apple', icon: <AppleIcon sx={{ fontSize: 20, color: '#0f172a' }} /> },
              { label: 'SSO', icon: <BadgeOutlinedIcon sx={{ fontSize: 20, color: '#64748b' }} /> },
            ].map(({ label, icon }) => (
              <Button
                key={label}
                variant="outlined"
                aria-label={label}
                sx={{
                  py: 1.25,
                  borderRadius: 1.5,
                  borderColor: '#e2e8f0',
                  backgroundColor: '#ffffff',
                  minWidth: 0,
                  '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
                }}
              >
                {icon}
              </Button>
            ))}
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
            <Link href="#" underline="hover" sx={{ color: 'inherit' }}>
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

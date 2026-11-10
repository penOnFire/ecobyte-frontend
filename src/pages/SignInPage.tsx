import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
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

export const SignInPage: FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('alex@example.com')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        backgroundColor: '#fff8f0',
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box
            component="img"
            src={ecobyteLogo}
            alt="EcoByte"
            sx={{
              width: 58,
              height: 58,
              borderRadius: 3.5,
              mb: 1.5,
              boxShadow: '0 6px 20px rgba(79,95,75,0.25)',
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.75rem',
              color: '#292524',
              lineHeight: 1,
            }}
          >
            EcoByte
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#78716c',
              mt: 0.5,
            }}
          >
            Circular Electronics &amp; E-Waste Lifecycle
          </Typography>
        </Box>

        {/* Main card */}
        <Card sx={{ px: 3, pt: 2.5, pb: 3, borderRadius: 5, border: '1px solid #ede8e1' }}>
          {/* Toggle pill: Sign In / Register */}
          <Box
            sx={{
              display: 'flex',
              backgroundColor: '#f4ede4',
              borderRadius: 9999,
              p: '4px',
              mb: 3,
            }}
          >
            <Box
              sx={{
                flex: 1,
                py: 1.1,
                borderRadius: 9999,
                backgroundColor: '#4f5f4b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
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
                py: 1.1,
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#57534e',
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
              color: '#292524',
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#78716c',
              mt: 0.3,
              mb: 2.5,
            }}
          >
            Sign in to your circular tech account.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Email */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.07em',
                  color: '#78716c',
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
                placeholder="alex@example.com"
                startAdornment={
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon sx={{ color: '#a8a29e', fontSize: 20 }} />
                  </InputAdornment>
                }
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.07em',
                  color: '#78716c',
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
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#a8a29e', fontSize: 20 }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                      edge="end"
                      sx={{ color: '#a8a29e' }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Box>

            {/* Remember me + Forgot */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#292524',
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
                  fontSize: '0.875rem',
                  color: '#292524',
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
              sx={{
                mt: 0.5,
                py: 1.6,
                fontSize: '1rem',
                display: 'flex',
                gap: 1,
                backgroundColor: '#4f5f4b',
              }}
            >
              Sign In
              <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 2.5 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.07em',
                color: '#a8a29e',
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
              { label: 'Apple', icon: <AppleIcon sx={{ fontSize: 22, color: '#1c252e' }} /> },
              { label: 'SSO', icon: <BadgeOutlinedIcon sx={{ fontSize: 20, color: '#57534e' }} /> },
            ].map(({ label, icon }) => (
              <Button
                key={label}
                variant="outlined"
                aria-label={label}
                sx={{
                  py: 1.4,
                  borderRadius: 3.5,
                  borderColor: '#ede8e1',
                  backgroundColor: '#ffffff',
                  minWidth: 0,
                  '&:hover': { borderColor: '#78957a', backgroundColor: '#f9f7f4' },
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
              color: '#78716c',
            }}
          >
            Don&apos;t have an account?{' '}
            <Link
              onClick={() => navigate('/register')}
              sx={{
                fontWeight: 700,
                color: '#292524',
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
            mt: 4,
            color: '#a8a29e',
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 13 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#a8a29e',
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

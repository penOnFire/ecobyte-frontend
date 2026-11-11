import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import { useNavigate } from 'react-router-dom'
import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'

export const RegisterPage: FC = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('Alex Mercer')
  const [email, setEmail] = useState('alex@example.com')
  const [baseNumber, setBaseNumber] = useState('san-antonio-base')
  const [phone, setPhone] = useState('+63 912 345 6789')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate('/')
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

        {/* Card */}
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
          {/* Segmented Toggle */}
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
              onClick={() => navigate('/signin')}
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
                Sign In
              </Typography>
            </Box>
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
            Create account
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
            Join your local circular e-waste community
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Full Name */}
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
                Full Name
              </Typography>
              <OutlinedInput
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                startAdornment={
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

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
                placeholder="alex@example.com"
                startAdornment={
                  <InputAdornment position="start">
                    <MailOutlineRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

            {/* Base Number / Barangay */}
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
                Base Number
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={baseNumber}
                  onChange={(e) => setBaseNumber(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="san-antonio-base">Barangay San Antonio (Pasig)</MenuItem>
                  <MenuItem value="ortigas-base">Ortigas Center Hub (Pasig)</MenuItem>
                  <MenuItem value="bel-air-base">Bel-Air Drop Site (Makati)</MenuItem>
                  <MenuItem value="bgc-base">BGC Eco Station (Taguig)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Contact Number */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Contact Number
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    color: '#94a3b8',
                  }}
                >
                  Optional
                </Typography>
              </Box>
              <OutlinedInput
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 912 345 6789"
                startAdornment={
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
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
                placeholder="At least 8 characters"
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
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

            {/* Confirm Password */}
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
                Confirm Password
              </Typography>
              <OutlinedInput
                fullWidth
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

            {/* Terms checkbox */}
            <Box sx={{ mt: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5, color: '#cbd5e1', '&.Mui-checked': { color: '#0f172a' } }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      color: '#0f172a',
                      lineHeight: 1.4,
                    }}
                  >
                    I agree to the EcoByte Terms &amp;{' '}
                    <strong style={{ color: '#0f172a' }}>E-waste guidelines</strong>
                  </Typography>
                }
              />
            </Box>

            {/* Submit */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '0.9375rem',
                display: 'flex',
                gap: 1,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              Create account
              <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Card>

        {/* Existing account link */}
        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#64748b',
            }}
          >
            Already have an account?{' '}
            <Link
              onClick={() => navigate('/signin')}
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign In
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

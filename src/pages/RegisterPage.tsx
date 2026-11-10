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
  const [barangay, setBarangay] = useState('san-antonio')
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={ecobyteLogo}
            alt="EcoByte"
            sx={{
              width: 56,
              height: 56,
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

        {/* Card */}
        <Card sx={{ px: 3, pt: 2.5, pb: 3, borderRadius: 5, border: '1px solid #ede8e1' }}>
          {/* Segmented control */}
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
              onClick={() => navigate('/signin')}
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
                Sign In
              </Typography>
            </Box>
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
            Create account
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
            Join your local circular e-waste community
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Full Name */}
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
                Full Name
              </Typography>
              <OutlinedInput
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                startAdornment={
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon sx={{ color: '#a8a29e', fontSize: 20 }} />
                  </InputAdornment>
                }
              />
            </Box>

            {/* Email Address */}
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

            {/* Barangay */}
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
                Barangay
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon sx={{ color: '#a8a29e', fontSize: 20 }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 3.5,
                    backgroundColor: '#ffffff',
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    '& fieldset': { borderColor: '#ddd8d0' },
                  }}
                >
                  <MenuItem value="san-antonio">Barangay San Antonio</MenuItem>
                  <MenuItem value="bel-air">Barangay Bel-Air</MenuItem>
                  <MenuItem value="poblacion">Barangay Poblacion</MenuItem>
                  <MenuItem value="palanan">Barangay Palanan</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Contact Number (Optional) */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.07em',
                    color: '#78716c',
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
                    color: '#a8a29e',
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
                    <PhoneOutlinedIcon sx={{ color: '#a8a29e', fontSize: 20 }} />
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
                placeholder="At least 8 characters"
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

            {/* Confirm Password */}
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
                    <LockOutlinedIcon sx={{ color: '#a8a29e', fontSize: 20 }} />
                  </InputAdornment>
                }
              />
            </Box>

            {/* Terms checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  size="small"
                  sx={{ p: 0.5 }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    color: '#78716c',
                  }}
                >
                  I agree to the EcoByte Terms &amp;{' '}
                  <Link href="#" underline="hover" sx={{ color: '#4f5f4b', fontWeight: 700 }}>
                    E-waste guidelines
                  </Link>
                </Typography>
              }
            />

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
              Create account
              <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>
        </Card>

        {/* Already have an account */}
        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#78716c',
            }}
          >
            Already have an account?{' '}
            <Link
              onClick={() => navigate('/signin')}
              sx={{
                fontWeight: 700,
                color: '#292524',
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

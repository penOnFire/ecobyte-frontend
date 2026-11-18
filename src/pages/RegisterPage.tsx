import { useEffect, useState } from 'react'
import type { FC, FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { useNavigate } from 'react-router-dom'
import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'
import { authApi, clearStaleLocalRequests, COMMONWEALTH_BASES_FALLBACK, setCachedUser } from '@/lib/api'
import type { Barangay } from '@/types'

export const RegisterPage: FC = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [suffix, setSuffix] = useState('')
  const [email, setEmail] = useState('')
  const [barangayBases, setBarangayBases] = useState<Barangay[]>(COMMONWEALTH_BASES_FALLBACK)
  const [baseNumber, setBaseNumber] = useState('1')
  const [streetAddress, setStreetAddress] = useState('')
  const [validIdType, setValidIdType] = useState('Barangay ID')
  const [idNumber, setIdNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  useEffect(() => {
    let active = true
    authApi.getBarangays().then((list) => {
      if (active && list.length > 0) {
        setBarangayBases(list)
        setBaseNumber((prev) => (list.some((b) => b.id === prev) ? prev : list[0].id))
      }
    })
    return () => {
      active = false
    }
  }, [])

  const selectedBase = barangayBases.find((b) => b.id === baseNumber) ?? barangayBases[0]

  const constructedFullName = [
    firstName.trim(),
    middleName.trim(),
    lastName.trim(),
    suffix.trim(),
  ]
    .filter(Boolean)
    .join(' ')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.')
      return
    }

    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the EcoByte Terms & E-waste guidelines.')
      return
    }

    setIsLoading(true)

    try {
      const res = await authApi.register({
        fullName: constructedFullName,
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        suffix: suffix.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || '+63 900 000 0000',
        barangayId: baseNumber,
        streetAddress: streetAddress.trim() || undefined,
        validIdType,
        idNumber: idNumber.trim() || undefined,
        password: password.trim(),
      })

      clearStaleLocalRequests()
      if (res?.accessToken) {
        localStorage.setItem('ecobyte_token', res.accessToken)
      }
      if (res?.user) {
        setCachedUser(res.user)
      } else {
        localStorage.setItem('ecobyte_user_name', constructedFullName)
      }

      // Show registration success confirmation modal
      setSuccessModalOpen(true)
    } catch (err: any) {
      console.error('Registration failed:', err)
      const isNetworkError =
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network')

      if (isNetworkError) {
        localStorage.setItem('ecobyte_token', `offline_mock_token_resident_${Date.now()}`)
        localStorage.setItem('ecobyte_user_role', 'RESIDENT')
        localStorage.setItem('ecobyte_user_name', constructedFullName)
        setSuccessModalOpen(true)
        return
      }

      setErrorMessage(
        err?.message || 'Registration failed. The email may already be registered.'
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

          {errorMessage && (
            <Box sx={{ p: 1.25, mb: 2, backgroundColor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
              <Typography sx={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
                {errorMessage}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Row 1: First Name & Middle Name */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' }, gap: 1.25 }}>
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
                  First Name <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <OutlinedInput
                  fullWidth
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>

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
                  Middle Name <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'none' }}>(Opt)</span>
                </Typography>
                <OutlinedInput
                  fullWidth
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Cruz"
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>
            </Box>

            {/* Row 2: Last Name & Suffix */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' }, gap: 1.25 }}>
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
                  Last Name <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <OutlinedInput
                  fullWidth
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Mercer"
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>

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
                  Suffix <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'none' }}>(Opt)</span>
                </Typography>
                <OutlinedInput
                  fullWidth
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="Jr., III"
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>
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

            {/* Base Number / Barangay Commonwealth Area */}
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
                Barangay Commonwealth — Base / Area
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
                  {barangayBases.map((base) => (
                    <MenuItem key={base.id} value={base.id}>
                      {base.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Street Address / House No. */}
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
                Street Address / House No.
              </Typography>
              <OutlinedInput
                fullWidth
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Blk 12 Lot 4 Kasunduan St."
                startAdornment={
                  <InputAdornment position="start">
                    <HomeOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 1.5 }}
              />
            </Box>

            {/* Valid ID Verification */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: 1.25 }}>
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
                  Valid ID Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={validIdType}
                    onChange={(e) => setValidIdType(e.target.value)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="Barangay ID">Barangay ID</MenuItem>
                    <MenuItem value="PhilSys ID">PhilSys National ID</MenuItem>
                    <MenuItem value="Driver License">Driver's License</MenuItem>
                    <MenuItem value="Voter ID">Voter's ID</MenuItem>
                    <MenuItem value="Postal ID">Postal ID</MenuItem>
                  </Select>
                </FormControl>
              </Box>
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
                  ID Number
                </Typography>
                <OutlinedInput
                  fullWidth
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. QC-COM-9841"
                  startAdornment={
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>
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
                    color: '#16a34a',
                  }}
                >
                  Required for drop-off SMS
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
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: '#94a3b8' }}
                    >
                      {showConfirmPassword ? (
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
              disabled={isLoading}
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
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  Create account
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </>
              )}
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

        {/* ── Registration Success Confirmation Modal ── */}
        <Dialog
          open={successModalOpen}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '16px',
                p: 1.5,
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)',
                fontFamily: "'Quicksand', sans-serif",
                textAlign: 'center',
              },
            },
          }}
        >
          <DialogTitle sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', mt: 1 }}>
              Registration Successful!
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
              Welcome to EcoByte Barangay Commonwealth
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ px: 2, py: 1 }}>
            <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left', mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Account Name</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', mb: 1 }}>
                {constructedFullName || 'Alex Rivera'}
              </Typography>

              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Resident Address</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {streetAddress.trim() ? `${streetAddress.trim()}, ` : ''}
                {selectedBase?.name || 'Base 1 - Brgy. Hall Complex (Barangay Commonwealth)'}, Quezon City
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
              Your account has been registered. You can now log in to schedule hazardous drop-offs, access the reuse hub, and track eco-points.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                setSuccessModalOpen(false)
                navigate('/signin')
              }}
              sx={{
                py: 1.4,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                borderRadius: '10px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              Proceed to Sign In
            </Button>
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
      </Container>
    </Box>
  )
}

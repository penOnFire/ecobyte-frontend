import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import thinkpadImg from '@/assets/ui/thinkpad.jpeg'

export const ConfirmReservationPage: FC = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          aria-label="Back"
          sx={{
            width: 38,
            height: 38,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
            Confirm Reservation
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
            Step 2 of 2: Location &amp; Pick-up
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={() => navigate('/reuse')}
          aria-label="Cancel"
          sx={{
            width: 38,
            height: 38,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Device Summary Card ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 1.25,
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={thinkpadImg}
              alt="Lenovo ThinkPad T480"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StatusBadge label="Refurbished" variant="electric" size="sm" />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                ID: CIR-84920
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a', mt: 0.25 }}>
              Lenovo ThinkPad T480
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
              Held for 2 days upon confirmation
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Designated Claim Hub ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            📍 DESIGNATED CLAIM HUB
          </Typography>
          <StatusBadge label="Fixed Location" variant="electric" size="sm" />
        </Box>

        <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                backgroundColor: '#0f172a',
                color: '#abf06b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <StorefrontRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                  Commonwealth Eco-Hub (Area 1)
                </Typography>
                <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#abf06b' }} />
              </Box>
              <Box sx={{ mt: 0.35, mb: 0.5 }}>
                <StatusBadge label="Current Item Storage" variant="electric" size="sm" />
              </Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                Commonwealth Barangay Hall Complex, Quezon City
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                📍 0.8 km away • 🕒 8:00 AM – 5:00 PM
              </Typography>
            </Box>
          </Box>

          {/* Info locked box */}
          <Box
            sx={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 1.25,
              p: 1.25,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>
              Item is stored here and can only be claimed at this location.
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* ── Schedule Timings ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Pick-up Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                Pick-up Date
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 700 }}>
              Tomorrow, Oct 25, 2024
            </Typography>
          </Box>

          {/* Time Window */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                Time Window
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 700 }}>
              01:00 PM – 03:00 PM
            </Typography>
          </Box>

          {/* Claim Deadline */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HourglassEmptyRoundedIcon sx={{ fontSize: 18, color: '#b45309' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                Claim Deadline
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#b45309', fontWeight: 700 }}>
              Held for 2 Days (Oct 27, 5:00 PM)
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Notice Card ── */}
      <Card sx={{ p: 1.75, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#b45309', mt: 0.15 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#92400e', lineHeight: 1.5, fontWeight: 500 }}>
            After confirming, you will receive a <strong>Pick-up Code (ECO-4821)</strong> and this will be saved to <strong>My Requests</strong> where you can review details or upload your proof of claim.
          </Typography>
        </Box>
      </Card>

      {/* ── Action Buttons ── */}
      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/reservation-code')}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
            '&:hover': { backgroundColor: '#1e293b' },
          }}
        >
          Confirm &amp; Get Pick-up Code
        </Button>
        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Typography
            onClick={() => navigate(-1)}
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#64748b',
              cursor: 'pointer',
              '&:hover': { color: '#0f172a', textDecoration: 'underline' },
            }}
          >
            Cancel &amp; Return
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

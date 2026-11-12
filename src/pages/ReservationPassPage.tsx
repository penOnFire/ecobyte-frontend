import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import keychronImg from '@/assets/ui/keychron.jpeg'

export const ReservationPassPage: FC = () => {
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
            Reservation Pass
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#64748b', letterSpacing: '0.06em' }}>
            • STEP 1 OF 2
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label="More options"
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
          <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Item Mini Card ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 1.25,
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={keychronImg}
              alt="Keychron K2 V2"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                Keychron K2 V2
              </Typography>
              <StatusBadge label="Reserved" variant="electric" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>
              Mechanical Keyboard • 75% Layout
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#0f172a', fontWeight: 600 }}>
                📍 Commonwealth Eco-Hub
              </Typography>
              <Box sx={{ px: 0.75, py: 0.15, backgroundColor: '#f1f5f9', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b', fontWeight: 700 }}>
                  #CIR-84920
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ── Official Pick-Up Code Ticket ── */}
      <Box
        sx={{
          borderRadius: 2,
          backgroundColor: '#0f172a',
          border: '1.5px solid #1e293b',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          p: 2.5,
          boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 700,
            fontSize: '0.6875rem',
            color: '#abf06b',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            mb: 1.75,
          }}
        >
          🎟️ OFFICIAL PICK-UP CODE
        </Typography>

        {/* Code Box */}
        <Box
          sx={{
            backgroundColor: '#020617',
            borderRadius: 1.25,
            p: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #334155',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Courier New', monospace",
              fontWeight: 800,
              fontSize: '1.625rem',
              letterSpacing: '0.15em',
              color: '#abf06b',
              pl: 1,
            }}
          >
            ECO - 4821
          </Typography>
          <IconButton size="small" aria-label="Copy code" sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
            <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Dashed cutline with semicircles */}
        <Box sx={{ position: 'relative', my: 2 }}>
          <Box sx={{ borderTop: '2px dashed #334155' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <QrCodeScannerRoundedIcon sx={{ fontSize: 18, color: '#abf06b' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
            Present this code to the barangay officer at desk
          </Typography>
        </Box>
      </Box>

      {/* ── Pick-up Schedule Details ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b' }}>
                Pick-up date
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 700 }}>
              Fri, Oct 23, 2024
            </Typography>
          </Box>

          {/* Collection Place */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b' }}>
                Collection Place
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#0f172a', fontWeight: 700 }}>
                Barangay Commonwealth, QC
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                E-Waste Hub Desk 2
              </Typography>
            </Box>
          </Box>

          {/* Held until */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#b45309' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b' }}>
                Held until
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#dc2626', fontWeight: 700 }}>
                Oct 23, 5:00 PM
              </Typography>
              <Box sx={{ mt: 0.25 }}>
                <StatusBadge label="2 days remaining" variant="electric" size="sm" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ── Instruction Subcard ── */}
      <Card sx={{ p: 1.75, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#0f172a', mt: 0.2 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#0f172a', lineHeight: 1.5, fontWeight: 500 }}>
            <strong>Next step:</strong> When receiving the item at the hub, take a quick proof photo to complete your claim.
          </Typography>
        </Box>
      </Card>

      {/* ── Action CTA Button ── */}
      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/proof-of-claim')}
          startIcon={<CameraAltRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />}
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
          Upload Proof Photo
        </Button>
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#64748b',
            textAlign: 'center',
            mt: 1,
          }}
        >
          🕒 Unclaimed items are released automatically after 48 hours.
        </Typography>
      </Box>
    </Box>
  )
}

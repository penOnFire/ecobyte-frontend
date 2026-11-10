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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            borderRadius: '50%',
            color: '#292524',
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#292524' }}>
            Reservation Pass
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#78716c', letterSpacing: '0.04em' }}>
            • STEP 1 OF 2
          </Typography>
        </Box>

        <IconButton
          size="small"
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            borderRadius: '50%',
            color: '#292524',
          }}
        >
          <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Item Mini Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#faf3ea',
              border: '1px solid #ede4d8',
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
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#292524' }}>
                Keychron K2 V2
              </Typography>
              <StatusBadge label="Reserved" variant="live" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.2 }}>
              Mechanical Keyboard • 75% Layout
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#4f5f4b', fontWeight: 600 }}>
                📍 San Antonio Hub
              </Typography>
              <Box sx={{ px: 0.75, py: 0.15, backgroundColor: '#faf8f5', borderRadius: 1, border: '1px solid #ede8e1' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#78716c', fontWeight: 700 }}>
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
          borderRadius: 4,
          backgroundColor: '#f5eee6',
          border: '1.5px solid #e5dace',
          position: 'relative',
          overflow: 'hidden',
          p: 2.25,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 700,
            fontSize: '0.6875rem',
            color: '#78716c',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            mb: 1.5,
          }}
        >
          🎟️ OFFICIAL PICK-UP CODE
        </Typography>

        {/* Code Box */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: 3.5,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #ede4d8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Courier New', monospace",
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '0.15em',
              color: '#384735',
              pl: 1,
            }}
          >
            ECO - 4821
          </Typography>
          <IconButton size="small" sx={{ color: '#78716c' }}>
            <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Dashed cutline with semicircles */}
        <Box sx={{ position: 'relative', my: 2 }}>
          <Box sx={{ borderTop: '2px dashed #dccfc0' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <QrCodeScannerRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#292524', fontWeight: 600 }}>
            Present this code to the barangay officer at desk
          </Typography>
        </Box>
      </Box>

      {/* ── Pick-up Schedule Details ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#78716c' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c' }}>
                Pick-up date
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#292524', fontWeight: 700 }}>
              Fri, Oct 23, 2024
            </Typography>
          </Box>

          {/* Collection Place */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#78716c' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c' }}>
                Collection Place
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#292524', fontWeight: 700 }}>
                Barangay San Antonio
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
                E-Waste Hub Desk 2
              </Typography>
            </Box>
          </Box>

          {/* Held until */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#b45309' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c' }}>
                Held until
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#dc2626', fontWeight: 700 }}>
                Oct 23, 5:00 PM
              </Typography>
              <Box sx={{ display: 'inline-block', backgroundColor: '#ebf2eb', px: 0.75, py: 0.15, borderRadius: 1, mt: 0.25 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#384735', fontWeight: 700 }}>
                  2 days remaining
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ── Instruction Subcard ── */}
      <Card sx={{ p: 1.75, borderRadius: 3.5, backgroundColor: '#faf3ea', border: '1px solid #ede4d8' }}>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#78350f', mt: 0.2 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78350f', lineHeight: 1.5, fontWeight: 500 }}>
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
          startIcon={<CameraAltRoundedIcon sx={{ fontSize: 20 }} />}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          Upload Proof Photo
        </Button>
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#78716c',
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


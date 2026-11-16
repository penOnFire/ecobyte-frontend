import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import thinkpadDetailImg from '@/assets/ui/thinkpad_detail.jpeg'

export const ReuseItemDetailPage: FC = () => {
  const navigate = useNavigate()
  const [selectedWindow, setSelectedWindow] = useState('01:00 PM')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleShare = async () => {
    const shareData = {
      title: 'Lenovo ThinkPad T480 - EcoByte Reuse Hub',
      text: 'Check out this verified refurbished ThinkPad available for pickup at Commonwealth Hub on EcoByte!',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setToastMsg('Item shared successfully!')
      } catch {
        // User closed share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setToastMsg('Share link copied to clipboard!')
      } catch {
        setToastMsg('Link: ' + window.location.href)
      }
    }
  }

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

        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
          Item Details
        </Typography>

        <IconButton
          size="small"
          aria-label="Share item"
          onClick={handleShare}
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
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Hero Item Image ── */}
      <Card
        sx={{
          height: 220,
          borderRadius: 2,
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1.5,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          component="img"
          src={thinkpadDetailImg}
          alt="Lenovo ThinkPad T480"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Top left badge */}
        <Box sx={{ zIndex: 1, position: 'relative' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              px: 1.25,
              py: 0.4,
              borderRadius: 9999,
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 14, color: '#abf06b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem' }}>
              AI Inspected &amp; Certified
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Bottom right badge */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', zIndex: 1, position: 'relative' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(4px)',
              color: '#0f172a',
              px: 1.25,
              py: 0.4,
              borderRadius: 9999,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#abf06b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem' }}>
              Grade A Re-use
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Item Headline & Location ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <StatusBadge label="Available - First come, first served" variant="electric" size="sm" />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            ID: CIR-84920
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
          Lenovo ThinkPad T480 - Core i5 8th Gen
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
            Pasig Green Hub - Barangay San Antonio
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', ml: 2.75 }}>
          1.2 km away • Closes 6:00 PM
        </Typography>
      </Box>

      {/* ── Device Specifications Card ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              Device Specifications
            </Typography>
          </Box>
          <StatusBadge label="Refurbished" variant="electric" size="sm" />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              Processor
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              Intel i5-8350U
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              Memory &amp; Storage
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              16GB RAM / 256GB SSD
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              Screen Resolution
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              14″ FHD (1920x1080)
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 1.25, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              OS Installed
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', mt: 0.25 }}>
              Ubuntu LTS / Win11 Ready
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── EcoByte 30-Day Guarantee ── */}
      <Card sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SecurityRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              EcoByte 30-Day Guarantee
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.35, lineHeight: 1.5 }}>
              Free functional replacement or return guarantee at any official EcoByte Hub if hardware issues arise.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Reserve this device ── */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              Reserve this device
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
              ⓘ Held for 24 hours upon reservation
            </Typography>
          </Box>
          <StatusBadge label="Free of charge" variant="electric" size="sm" />
        </Box>

        {/* Selected date row */}
        <Card sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                  Selected Pick-up Date
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                  Tomorrow, Oct 25, 2024
                </Typography>
              </Box>
            </Box>
            <Button size="small" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.75rem' }}>
              Change
            </Button>
          </Box>
        </Card>

        {/* Pick-up Windows */}
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b', mb: 0.75 }}>
          Available Pick-up Windows
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
          {['09:00 AM', '01:00 PM', '03:00 PM'].map((time) => {
            const isSelected = selectedWindow === time
            return (
              <Button
                key={time}
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => setSelectedWindow(time)}
                size="small"
                sx={{
                  py: 1,
                  borderRadius: 1.25,
                  fontSize: '0.8125rem',
                  backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#0f172a',
                  borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                  boxShadow: isSelected ? '0 1px 3px rgba(15,23,42,0.2)' : 'none',
                  '&:hover': {
                    backgroundColor: isSelected ? '#1e293b' : '#f8fafc',
                    borderColor: isSelected ? '#1e293b' : '#cbd5e1',
                  },
                }}
              >
                {time}
              </Button>
            )
          })}
        </Box>

        {/* Pickup Location Reminder notice */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#0f172a', mt: 0.2 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
            Please show your digital reservation QR pass at Pasig Green Hub locker reception. Bring a valid ID for pickup verification.
          </Typography>
        </Box>

        {/* Reserve Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/confirm-reservation')}
          startIcon={<BookmarkAddRoundedIcon sx={{ fontSize: 20 }} />}
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
          Reserve Item
        </Button>
      </Box>

      {/* Toast Feedback */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMsg(null)}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            backgroundColor: '#0f172a',
            color: '#abf06b',
          }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
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

        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#292524' }}>
          Item Details
        </Typography>

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
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Hero Item Image ── */}
      <Card
        sx={{
          height: 220,
          borderRadius: 4,
          backgroundColor: '#f4ede4',
          border: '1px solid #ede8e1',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1.5,
          overflow: 'hidden',
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
              backgroundColor: 'rgba(79,95,75,0.92)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              px: 1.25,
              py: 0.4,
              borderRadius: 9999,
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 14 }} />
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
              backgroundColor: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(4px)',
              color: '#292524',
              px: 1.25,
              py: 0.4,
              borderRadius: 9999,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#38a882' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem' }}>
              Grade A Re-use
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Item Headline & Location ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <StatusBadge label="Available - First come, first served" variant="live" size="sm" />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
            ID: CIR-84920
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#292524' }}>
          Lenovo ThinkPad T480 - Core i5 8th Gen
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#292524' }}>
            Pasig Green Hub - Barangay San Antonio
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', ml: 2.75 }}>
          1.2 km away • Closes 6:00 PM
        </Typography>
      </Box>

      {/* ── Device Specifications Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              Device Specifications
            </Typography>
          </Box>
          <StatusBadge label="Refurbished" variant="available" size="sm" />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Box sx={{ p: 1.25, backgroundColor: '#faf8f5', borderRadius: 2.5, border: '1px solid #ede8e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
              Processor
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524', mt: 0.25 }}>
              Intel i5-8350U
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#faf8f5', borderRadius: 2.5, border: '1px solid #ede8e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
              Memory &amp; Storage
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524', mt: 0.25 }}>
              16GB RAM / 256GB SSD
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#faf8f5', borderRadius: 2.5, border: '1px solid #ede8e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
              Screen Resolution
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524', mt: 0.25 }}>
              14″ FHD (1920x1080)
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#faf8f5', borderRadius: 2.5, border: '1px solid #ede8e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
              OS Installed
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524', mt: 0.25 }}>
              Ubuntu LTS / Win11 Ready
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── EcoByte 30-Day Guarantee ── */}
      <Card sx={{ p: 2, borderRadius: 4, backgroundColor: '#faf3ea', border: '1.5px solid #ede4d8' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              backgroundColor: '#ffffff',
              border: '1px solid #dccfc0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SecurityRoundedIcon sx={{ fontSize: 20, color: '#4f5f4b' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              EcoByte 30-Day Guarantee
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.35, lineHeight: 1.5 }}>
              Free functional replacement or return guarantee at any official EcoByte Hub if hardware issues arise.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Reserve this device ── */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
              Reserve this device
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
              ⓘ Held for 24 hours upon reservation
            </Typography>
          </Box>
          <StatusBadge label="Free of charge" variant="available" size="sm" />
        </Box>

        {/* Selected date row */}
        <Card sx={{ p: 1.5, borderRadius: 3.5, border: '1px solid #ede8e1', mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
                  Selected Pick-up Date
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524' }}>
                  Tomorrow, Oct 25, 2024
                </Typography>
              </Box>
            </Box>
            <Button size="small" sx={{ color: '#4f5f4b', fontWeight: 700, fontSize: '0.75rem' }}>
              Change
            </Button>
          </Box>
        </Card>

        {/* Pick-up Windows */}
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c', mb: 0.75 }}>
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
                  borderRadius: 3,
                  fontSize: '0.8125rem',
                  backgroundColor: isSelected ? '#4f5f4b' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#292524',
                  borderColor: '#ede8e1',
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
            borderRadius: 3,
            backgroundColor: '#faf8f5',
            border: '1px solid #ede8e1',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#4f5f4b', mt: 0.2 }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', lineHeight: 1.5 }}>
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
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          Reserve Item
        </Button>
      </Box>
    </Box>
  )
}


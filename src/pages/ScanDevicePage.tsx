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
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded'
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded'
import { useNavigate } from 'react-router-dom'
import angleFrontImg from '@/assets/ui/angle_front.jpeg'

interface AngleItem {
  id: string
  label: string
  status: 'completed' | 'active' | 'pending'
}

const ANGLES: AngleItem[] = [
  { id: 'front', label: 'Front', status: 'completed' },
  { id: 'back', label: 'Back', status: 'active' },
  { id: 'left', label: 'Left', status: 'pending' },
  { id: 'right', label: 'Right', status: 'pending' },
  { id: 'top', label: 'Top', status: 'pending' },
  { id: 'bottom', label: 'Bottom', status: 'pending' },
]

export const ScanDevicePage: FC = () => {
  const navigate = useNavigate()
  const [currentAngle, setCurrentAngle] = useState('back')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      {/* ── Header ── */}
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
            Scan Device
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c' }}>
            Multi-Angle AI Camera
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
          <FlashOnRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Camera Viewport Card ── */}
      <Box
        sx={{
          borderRadius: 5,
          backgroundColor: '#d8e4d6',
          border: '1.5px solid #c0d3bd',
          p: 2,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 290,
          overflow: 'hidden',
        }}
      >
        {/* Decorative corner brackets */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, width: 24, height: 24, borderTop: '2.5px solid #78957a', borderLeft: '2.5px solid #78957a', borderRadius: '4px 0 0 0' }} />
        <Box sx={{ position: 'absolute', top: 16, right: 16, width: 24, height: 24, borderTop: '2.5px solid #78957a', borderRight: '2.5px solid #78957a', borderRadius: '0 4px 0 0' }} />

        {/* Top HUD badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              backgroundColor: '#1e293b',
              color: '#ffffff',
              px: 1.5,
              py: 0.5,
              borderRadius: 9999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#38c194' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
              OPTICAL LOCK: 98.4%
            </Typography>
          </Box>
        </Box>

        {/* Center device representation & reticle */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            my: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Laser scanning beam */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: 2,
              backgroundColor: '#38c194',
              boxShadow: '0 0 10px #38c194, 0 0 4px #38c194',
              top: '45%',
              zIndex: 3,
            }}
          />

          {/* Smartphone outline */}
          <Box
            sx={{
              width: 120,
              height: 180,
              backgroundColor: '#1e293b',
              borderRadius: 4,
              border: '2px solid #334155',
              position: 'relative',
              p: 1.25,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Camera bump */}
            <Box
              sx={{
                width: 44,
                height: 48,
                borderRadius: 2.5,
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.5,
                p: 0.5,
              }}
            >
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#1e293b', border: '1.5px solid #475569' }} />
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#1e293b', border: '1.5px solid #475569' }} />
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#1e293b', border: '1.5px solid #475569' }} />
            </Box>

            {/* Target reticle */}
            <Box
              sx={{
                alignSelf: 'center',
                my: 'auto',
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: '1.5px dashed rgba(56, 193, 148, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38c194' }} />
            </Box>
          </Box>
        </Box>

        {/* Bottom HUD bar */}
        <Box
          sx={{
            backgroundColor: '#1e293b',
            borderRadius: 9999,
            px: 1.5,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <AspectRatioRoundedIcon sx={{ fontSize: 16, color: '#38c194' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#38c194' }}>
              4:3 Auto-Focus
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.6875rem', color: '#ffffff' }}>
            Angle 2 of 6: Back View
          </Typography>
        </Box>
      </Box>

      {/* ── Capture & Retake Controls ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 1.25 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CameraAltRoundedIcon sx={{ fontSize: 20 }} />}
          sx={{
            py: 1.4,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: '#384735' },
          }}
        >
          Capture angle
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.4,
            borderColor: '#ede8e1',
            color: '#292524',
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
          }}
        >
          Retake
        </Button>
      </Box>

      {/* ── Angles Progress ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
            Angles
          </Typography>
          <Box
            sx={{
              backgroundColor: '#ede8e1',
              px: 1.25,
              py: 0.35,
              borderRadius: 9999,
            }}
          >
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#78716c' }}>
              2/6 completed
            </Typography>
          </Box>
        </Box>

        {/* 3x2 Grid of angle chips */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {ANGLES.map((angle) => {
            const isCompleted = angle.status === 'completed'
            const isActive = angle.id === currentAngle

            return (
              <Box
                key={angle.id}
                onClick={() => setCurrentAngle(angle.id)}
                sx={{
                  py: 1,
                  px: 1.5,
                  borderRadius: 9999,
                  border: isCompleted
                    ? '1.5px solid #c4d9c0'
                    : isActive
                      ? '1.5px solid #4f5f4b'
                      : '1.5px solid #ede8e1',
                  backgroundColor: isCompleted
                    ? '#ebf2eb'
                    : isActive
                      ? '#4f5f4b'
                      : '#ffffff',
                  color: isActive ? '#ffffff' : '#292524',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: 'inherit',
                  }}
                >
                  {angle.label}
                </Typography>
                {isCompleted && <CheckRoundedIcon sx={{ fontSize: 16, color: '#384735' }} />}
                {isActive && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#38c194' }} />}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* ── AI Prompt / Guidance Box ── */}
      <Card
        sx={{
          p: 2,
          borderRadius: 4,
          backgroundColor: '#faf3ea',
          border: '1.5px solid #ede4d8',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #dccfc0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RefreshRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#292524',
              lineHeight: 1.45,
            }}
          >
            Prompt: Tilt device slightly to the left for lens inspection
          </Typography>
        </Box>

        {/* Segmented mini progress bar (6 segments) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5, mb: 1 }}>
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#78957a' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#4f5f4b' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2d7c9' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2d7c9' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2d7c9' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2d7c9' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
            Hardware Model ID: SM-G998B
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
            Lens Clarity: High
          </Typography>
        </Box>
      </Card>

      {/* ── Captured Angles Slots ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
            Captured angles
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#4f5f4b',
              cursor: 'pointer',
            }}
          >
            Reorder
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {/* Slot 1: Captured Front */}
          <Box
            sx={{
              height: 100,
              borderRadius: 3.5,
              backgroundColor: '#e8f0e6',
              border: '1.5px solid #c4d9c0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              p: 0.75,
            }}
          >
            <Box
              component="img"
              src={angleFrontImg}
              alt="Front angle capture"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 5,
                left: 5,
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#384735',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 11, color: '#ffffff' }} />
            </Box>
            <Box sx={{ flex: 1 }} />
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(56, 71, 53, 0.9)',
                borderRadius: 2,
                py: 0.25,
                textAlign: 'center',
                zIndex: 1,
                backdropFilter: 'blur(2px)',
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#ffffff' }}>
                Front
              </Typography>
            </Box>
          </Box>

          {/* Slot 2: Capturing Back */}
          <Box
            sx={{
              height: 100,
              borderRadius: 3.5,
              backgroundColor: '#ffffff',
              border: '2px dashed #4f5f4b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              p: 0.75,
            }}
          >
            <CropFreeRoundedIcon sx={{ fontSize: 24, color: '#4f5f4b' }} />
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.625rem',
                color: '#292524',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              Capturing Back
            </Typography>
          </Box>

          {/* Slot 3: Left slot */}
          <Box
            sx={{
              height: 100,
              borderRadius: 3.5,
              backgroundColor: '#ffffff',
              border: '1.5px dotted #dccfc0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 20, color: '#a8a29e' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.625rem', color: '#a8a29e' }}>
              Left slot
            </Typography>
          </Box>

          {/* Slot 4: Right slot */}
          <Box
            sx={{
              height: 100,
              borderRadius: 3.5,
              backgroundColor: '#ffffff',
              border: '1.5px dotted #dccfc0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 20, color: '#a8a29e' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.625rem', color: '#a8a29e' }}>
              Right slot
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Next CTA Button ── */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={() => navigate('/assess')}
        sx={{
          py: 1.6,
          backgroundColor: '#4f5f4b',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9375rem',
          display: 'flex',
          gap: 1,
          mb: 2,
        }}
      >
        Next: add details
        <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
      </Button>
    </Box>
  )
}

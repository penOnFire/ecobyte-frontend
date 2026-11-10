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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Header ── */}
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
            Scan Device
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
            Multi-Angle AI Camera
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label="Toggle flash"
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
          <FlashOnRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Camera Viewport Card ── */}
      <Box
        sx={{
          borderRadius: 4,
          backgroundColor: '#020617',
          border: '1.5px solid #1e293b',
          p: 2,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 300,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* Subtle grid background */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        {/* Decorative electric lime corner brackets */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, width: 22, height: 22, borderTop: '2.5px solid #abf06b', borderLeft: '2.5px solid #abf06b', borderRadius: '4px 0 0 0' }} />
        <Box sx={{ position: 'absolute', top: 16, right: 16, width: 22, height: 22, borderTop: '2.5px solid #abf06b', borderRight: '2.5px solid #abf06b', borderRadius: '0 4px 0 0' }} />
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, width: 22, height: 22, borderBottom: '2.5px solid #abf06b', borderLeft: '2.5px solid #abf06b', borderRadius: '0 0 0 4px' }} />
        <Box sx={{ position: 'absolute', bottom: 16, right: 16, width: 22, height: 22, borderBottom: '2.5px solid #abf06b', borderRight: '2.5px solid #abf06b', borderRadius: '0 0 4px 0' }} />

        {/* Top HUD badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', zIndex: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              px: 1.75,
              py: 0.6,
              borderRadius: 9999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#abf06b',
                boxShadow: '0 0 8px #abf06b',
              }}
            />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
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
            py: 2,
          }}
        >
          {/* Laser scanning beam */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: 2,
              backgroundColor: '#abf06b',
              boxShadow: '0 0 12px #abf06b, 0 0 4px #abf06b',
              top: '48%',
              zIndex: 3,
            }}
          />

          {/* Smartphone outline */}
          <Box
            sx={{
              width: 124,
              height: 184,
              backgroundColor: '#0f172a',
              borderRadius: 4,
              border: '2px solid #334155',
              position: 'relative',
              p: 1.25,
              boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Camera bump */}
            <Box
              sx={{
                width: 46,
                height: 50,
                borderRadius: 2.5,
                backgroundColor: '#020617',
                border: '1.5px solid #334155',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.5,
                p: 0.5,
              }}
            >
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#0f172a', border: '1.5px solid #475569' }} />
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#0f172a', border: '1.5px solid #475569' }} />
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#0f172a', border: '1.5px solid #475569' }} />
            </Box>

            {/* Target reticle */}
            <Box
              sx={{
                alignSelf: 'center',
                my: 'auto',
                width: 52,
                height: 52,
                borderRadius: '50%',
                border: '1.5px dashed rgba(171, 240, 107, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#abf06b' }} />
            </Box>
          </Box>
        </Box>

        {/* Bottom HUD bar */}
        <Box
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: 9999,
            px: 1.75,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <AspectRatioRoundedIcon sx={{ fontSize: 16, color: '#abf06b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#abf06b' }}>
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
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontSize: '0.875rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#1e293b' },
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
            borderColor: '#e2e8f0',
            color: '#0f172a',
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
          }}
        >
          Retake
        </Button>
      </Box>

      {/* ── Angles Progress ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
            Angles
          </Typography>
          <Box
            sx={{
              backgroundColor: '#0f172a',
              px: 1.25,
              py: 0.35,
              borderRadius: 9999,
            }}
          >
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#abf06b' }}>
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
                    ? '1.5px solid #e2e8f0'
                    : isActive
                      ? '1.5px solid #0f172a'
                      : '1.5px solid #e2e8f0',
                  backgroundColor: isCompleted
                    ? '#f8fafc'
                    : isActive
                      ? '#0f172a'
                      : '#ffffff',
                  color: isActive ? '#ffffff' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(15,23,42,0.15)' : 'none',
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
                {isCompleted && <CheckRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />}
                {isActive && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#abf06b' }} />}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* ── AI Prompt / Guidance Box ── */}
      <Card
        sx={{
          p: 2,
          borderRadius: 3.5,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RefreshRoundedIcon sx={{ fontSize: 18, color: '#abf06b' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#0f172a',
              lineHeight: 1.45,
            }}
          >
            Prompt: Tilt device slightly to the left for lens inspection
          </Typography>
        </Box>

        {/* Segmented mini progress bar (6 segments) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5, mb: 1.25 }}>
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#abf06b' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#0f172a' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2e8f0' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2e8f0' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2e8f0' }} />
          <Box sx={{ height: 4, borderRadius: 9999, backgroundColor: '#e2e8f0' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Hardware Model ID: SM-G998B
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#0f172a', fontWeight: 700 }}>
            Lens Clarity: High
          </Typography>
        </Box>
      </Card>

      {/* ── Captured Angles Slots ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
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
              borderRadius: 3,
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
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
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <CheckRoundedIcon sx={{ fontSize: 12, color: '#abf06b' }} />
            </Box>
            <Box sx={{ flex: 1 }} />
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: 1.5,
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
              borderRadius: 3,
              backgroundColor: 'rgba(171, 240, 107, 0.08)',
              border: '2px dashed #abf06b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              p: 0.75,
            }}
          >
            <CropFreeRoundedIcon sx={{ fontSize: 24, color: '#0f172a' }} />
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.625rem',
                color: '#0f172a',
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
              borderRadius: 3,
              backgroundColor: '#ffffff',
              border: '1.5px dotted #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.625rem', color: '#94a3b8' }}>
              Left slot
            </Typography>
          </Box>

          {/* Slot 4: Right slot */}
          <Box
            sx={{
              height: 100,
              borderRadius: 3,
              backgroundColor: '#ffffff',
              border: '1.5px dotted #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.625rem', color: '#94a3b8' }}>
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
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9375rem',
          display: 'flex',
          gap: 1,
          mb: 2,
          boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
          '&:hover': {
            backgroundColor: '#1e293b',
          },
        }}
      >
        Next: add details
        <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
      </Button>
    </Box>
  )
}

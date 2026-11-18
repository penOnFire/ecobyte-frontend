import { useEffect, useState, useRef, type FC, type ChangeEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded'
import FlashOffRoundedIcon from '@mui/icons-material/FlashOffRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded'
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useNavigate } from 'react-router-dom'

export const SCAN_ANGLES_STORAGE_KEY = 'ecobyte_scan_angles'

interface AngleConfig {
  id: 'front' | 'back' | 'left' | 'right'
  label: string
  prompt: string
  required: boolean
}

const DEFAULT_ANGLES: AngleConfig[] = [
  { id: 'front', label: 'Front', prompt: 'Align the front screen and bezel inside the frame', required: true },
  { id: 'back', label: 'Back', prompt: 'Show the back housing, model label, and camera module', required: true },
  { id: 'left', label: 'Left', prompt: 'Tilt slightly left to inspect side buttons and seams', required: false },
  { id: 'right', label: 'Right', prompt: 'Tilt slightly right to inspect ports and chassis edge', required: false },
]

export const ScanDevicePage: FC = () => {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [currentAngle, setCurrentAngle] = useState<AngleConfig['id']>('front')
  const [flashOn, setFlashOn] = useState(false)
  const [previewAngle, setPreviewAngle] = useState<AngleConfig['id'] | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>(() => {
    try {
      const saved = sessionStorage.getItem(SCAN_ANGLES_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as Record<string, string>) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(SCAN_ANGLES_STORAGE_KEY, JSON.stringify(capturedImages))
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [capturedImages])

  const completedCount = DEFAULT_ANGLES.filter((a) => Boolean(capturedImages[a.id])).length
  const activeConfig = DEFAULT_ANGLES.find((a) => a.id === currentAngle) ?? DEFAULT_ANGLES[0]

  const handleFileCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const angleToSave = currentAngle
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setCapturedImages((prev) => {
        const next = {
          ...prev,
          [angleToSave]: result,
        }
        const nextPending = DEFAULT_ANGLES.find((a) => a.id !== angleToSave && !next[a.id])
        if (nextPending) {
          setCurrentAngle(nextPending.id)
        }
        return next
      })
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be re-selected if retrying
    e.target.value = ''
  }

  const handleRetake = (angleId: AngleConfig['id'] = currentAngle) => {
    setCapturedImages((prev) => {
      const copy = { ...prev }
      delete copy[angleId]
      return copy
    })
    setCurrentAngle(angleId)
    if (previewAngle === angleId) {
      setPreviewAngle(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* Hidden file inputs for Live Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileCapture}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileCapture}
      />

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
          onClick={() => setFlashOn((v) => !v)}
          aria-label="Toggle flash"
          sx={{
            width: 38,
            height: 38,
            backgroundColor: flashOn ? '#0f172a' : '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: flashOn ? '#abf06b' : '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: flashOn ? '#1e293b' : '#f8fafc' },
          }}
        >
          {flashOn ? <FlashOnRoundedIcon sx={{ fontSize: 18 }} /> : <FlashOffRoundedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* ── Camera Viewport Card ── */}
      <Box
        sx={{
          borderRadius: 2,
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
        {/* If image captured for active angle, show preview */}
        {capturedImages[currentAngle] ? (
          <Box
            component="img"
            src={capturedImages[currentAngle]}
            alt={`Angle ${currentAngle}`}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        ) : (
          /* Subtle grid background */
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
        )}

        {/* Decorative electric lime corner brackets */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, width: 22, height: 22, borderTop: '2.5px solid #abf06b', borderLeft: '2.5px solid #abf06b', borderRadius: '3px 0 0 0', zIndex: 2 }} />
        <Box sx={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderTop: '2.5px solid #abf06b', borderRight: '2.5px solid #abf06b', borderRadius: '0 3px 0 0', zIndex: 2 }} />
        <Box sx={{ position: 'absolute', bottom: 12, left: 12, width: 22, height: 22, borderBottom: '2.5px solid #abf06b', borderLeft: '2.5px solid #abf06b', borderRadius: '0 0 0 3px', zIndex: 2 }} />
        <Box sx={{ position: 'absolute', bottom: 12, right: 12, width: 22, height: 22, borderBottom: '2.5px solid #abf06b', borderRight: '2.5px solid #abf06b', borderRadius: '0 0 3px 0', zIndex: 2 }} />

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
                backgroundColor: capturedImages[currentAngle] ? '#16a34a' : flashOn ? '#abf06b' : '#22c55e',
                boxShadow: '0 0 8px #abf06b',
              }}
            />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
              {capturedImages[currentAngle] ? `CAPTURED: ${currentAngle.toUpperCase()} VIEW` : 'OPTICAL SCANNER READY'}
            </Typography>
          </Box>
        </Box>

        {/* Center device representation & reticle (shown when no photo captured yet) */}
        {!capturedImages[currentAngle] && (
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
                borderRadius: 2,
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
                  borderRadius: 1.25,
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
        )}

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
            Angle: {currentAngle.toUpperCase()} view
          </Typography>
        </Box>
      </Box>

      {/* ── Capture & Retake Controls ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => cameraInputRef.current?.click()}
            startIcon={<CameraAltRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />}
            sx={{
              py: 1.4,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            Take photo
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => galleryInputRef.current?.click()}
            startIcon={<PhotoLibraryRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />}
            sx={{
              py: 1.4,
              borderColor: '#cbd5e1',
              color: '#0f172a',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Upload gallery
          </Button>
        </Box>

        {capturedImages[currentAngle] && (
          <Button
            variant="text"
            size="small"
            onClick={() => handleRetake(currentAngle)}
            startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: '#dc2626',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              alignSelf: 'center',
            }}
          >
            Retake / Clear {activeConfig.label} photo
          </Button>
        )}
      </Box>

      {/* ── Angles Selection (Single source for picking which angle to capture) ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
            Select angle to capture
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
              {completedCount}/{DEFAULT_ANGLES.length} completed
            </Typography>
          </Box>
        </Box>

        {/* 2x2 Grid of 4 angle selector buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {DEFAULT_ANGLES.map((angle) => {
            const isCompleted = Boolean(capturedImages[angle.id])
            const isActive = angle.id === currentAngle

            return (
              <Box
                key={angle.id}
                onClick={() => setCurrentAngle(angle.id)}
                sx={{
                  py: 1,
                  px: 1.5,
                  borderRadius: 9999,
                  border: isActive
                    ? '2px solid #0f172a'
                    : isCompleted
                      ? '1.5px solid #16a34a'
                      : '1.5px solid #cbd5e1',
                  backgroundColor: isActive
                    ? '#abf06b'
                    : isCompleted
                      ? '#dcfce7'
                      : '#ffffff',
                  color: isActive ? '#0f172a' : isCompleted ? '#14532d' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(15,23,42,0.16)' : 'none',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    color: 'inherit',
                  }}
                >
                  {angle.label} {angle.required ? '• Req' : '• Opt'}
                </Typography>
                {isCompleted && (
                  <CheckRoundedIcon sx={{ fontSize: 15, color: isActive ? '#0f172a' : '#15803d' }} />
                )}
                {isActive && !isCompleted && (
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#0f172a' }} />
                )}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* ── AI Prompt / Guidance Box ── */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
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
            Prompt ({activeConfig.label}): {activeConfig.prompt}
          </Typography>
        </Box>

        {/* Segmented mini progress bar (4 segments) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75, mb: 1.25 }}>
          {DEFAULT_ANGLES.map((angle) => {
            const done = Boolean(capturedImages[angle.id])
            const active = angle.id === currentAngle
            return (
              <Box
                key={angle.id}
                sx={{
                  height: 5,
                  borderRadius: 9999,
                  backgroundColor: done ? '#16a34a' : active ? '#0f172a' : '#e2e8f0',
                }}
              />
            )
          })}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            4-Angle Scan Session
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#0f172a', fontWeight: 700 }}>
            {completedCount} of {DEFAULT_ANGLES.length} Ready
          </Typography>
        </Box>
      </Card>

      {/* ── Captured Photos Gallery (Preview & Replace only, no duplicate selector) ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
            Captured photos
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            Tap photo to preview or retake
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {DEFAULT_ANGLES.map((angle) => {
            const img = capturedImages[angle.id]

            if (img) {
              return (
                <Box
                  key={angle.id}
                  onClick={() => setPreviewAngle(angle.id)}
                  sx={{
                    height: 100,
                    borderRadius: 1.5,
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #16a34a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 0.75,
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`${angle.label} capture`}
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
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <ZoomInRoundedIcon sx={{ fontSize: 13, color: '#abf06b' }} />
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Box
                    sx={{
                      width: '100%',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: 1,
                      py: 0.25,
                      textAlign: 'center',
                      zIndex: 1,
                    }}
                  >
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#ffffff' }}>
                      {angle.label}
                    </Typography>
                  </Box>
                </Box>
              )
            }

            return (
              <Box
                key={angle.id}
                sx={{
                  height: 100,
                  borderRadius: 1.5,
                  backgroundColor: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  p: 0.75,
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#64748b', textAlign: 'center' }}>
                  {angle.label}
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.5625rem', color: '#94a3b8', textAlign: 'center' }}>
                  No photo
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>

      {validationError && (
        <Alert
          severity="warning"
          onClose={() => setValidationError(null)}
          sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.8125rem' }}
        >
          {validationError}
        </Alert>
      )}

      {/* ── Next CTA Button ── */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={() => {
          const hasRequired = Boolean(capturedImages.front && capturedImages.back)
          if (!hasRequired) {
            setValidationError('Front and Back photos are required before proceeding to the condition checklist. Left and Right angles are optional.')
            return
          }
          setValidationError(null)
          navigate('/assess')
        }}
        sx={{
          py: 1.6,
          backgroundColor: capturedImages.front && capturedImages.back ? '#0f172a' : '#64748b',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9375rem',
          display: 'flex',
          gap: 1,
          mb: 2,
          boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
          '&:hover': {
            backgroundColor: capturedImages.front && capturedImages.back ? '#1e293b' : '#475569',
          },
        }}
      >
        {capturedImages.front && capturedImages.back ? 'Next: fill condition checklist' : 'Front & back photos required'}
        <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
      </Button>

      {/* Photo Preview & Retake/Replace Modal */}
      <Dialog
        open={Boolean(previewAngle && capturedImages[previewAngle])}
        onClose={() => setPreviewAngle(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem' }}>
            {previewAngle ? `${previewAngle.charAt(0).toUpperCase() + previewAngle.slice(1)} Angle Photo` : 'Photo Preview'}
          </Typography>
          <IconButton size="small" onClick={() => setPreviewAngle(null)} aria-label="Close preview">
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1.5 }}>
          {previewAngle && capturedImages[previewAngle] && (
            <Box
              component="img"
              src={capturedImages[previewAngle]}
              alt={`${previewAngle} preview`}
              sx={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 1.5, backgroundColor: '#0f172a' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => previewAngle && handleRetake(previewAngle)}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Remove
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                if (!previewAngle) return
                setCurrentAngle(previewAngle)
                setPreviewAngle(null)
                cameraInputRef.current?.click()
              }}
              sx={{ fontWeight: 700, textTransform: 'none', borderColor: '#0f172a', color: '#0f172a' }}
            >
              Retake
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => setPreviewAngle(null)}
              sx={{ fontWeight: 700, textTransform: 'none', backgroundColor: '#0f172a' }}
            >
              Done
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

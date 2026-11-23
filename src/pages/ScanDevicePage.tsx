import { useEffect, useState, useRef, useCallback, type FC, type ChangeEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CircularProgress,
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
import CameraswitchRoundedIcon from '@mui/icons-material/CameraswitchRounded'
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded'
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded'
import { useNavigate, useLocation } from 'react-router-dom'
import { ALLOWED_IMAGE_ACCEPT, validateResidentImageFile } from '@/lib/imageUploadValidation'

export const SCAN_ANGLES_STORAGE_KEY = 'ecobyte_scan_angles'

type CameraState =
  | 'idle'
  | 'starting'
  | 'active'
  | 'needs_gesture'
  | 'permission_denied'
  | 'unsupported'
  | 'error'

const getMediaStreamWithFallback = async (mode: 'environment' | 'user'): Promise<MediaStream> => {
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : {}
  const getUserMediaFn =
    navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices) ||
    nav.getUserMedia?.bind(nav) ||
    nav.webkitGetUserMedia?.bind(nav) ||
    nav.mozGetUserMedia?.bind(nav) ||
    nav.msGetUserMedia?.bind(nav)

  if (!getUserMediaFn) {
    throw new Error('getUserMedia not supported in this browser environment')
  }

  // Attempt 1: Ideal facingMode with 1280x720 standard resolution
  try {
    return await getUserMediaFn({
      video: {
        facingMode: { ideal: mode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
  } catch (err1) {
    console.warn('Constraint attempt 1 (ideal mode + resolution) failed:', err1)
  }

  // Attempt 2: Simple facingMode constraint
  try {
    return await getUserMediaFn({
      video: { facingMode: mode },
      audio: false,
    })
  } catch (err2) {
    console.warn('Constraint attempt 2 (facingMode) failed:', err2)
  }

  // Attempt 3: Any available video stream
  return await getUserMediaFn({
    video: true,
    audio: false,
  })
}

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
  const location = useLocation()
  const isFromAssess = Boolean((location.state as any)?.fromAssess)
  const isProceedingToAssessRef = useRef(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [currentAngle, setCurrentAngle] = useState<AngleConfig['id']>('front')
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [shutterFlash, setShutterFlash] = useState(false)
  const [previewAngle, setPreviewAngle] = useState<AngleConfig['id'] | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [unsupportedPreviewAngles, setUnsupportedPreviewAngles] = useState<Record<string, boolean>>({})

  // Initialize captured images:
  // If user entered Scan afresh (e.g. from Home, switching modules, or logging in),
  // clean sessionStorage and start with completely empty image slots.
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>(() => {
    if (!isFromAssess) {
      try {
        sessionStorage.removeItem(SCAN_ANGLES_STORAGE_KEY)
      } catch {}
      return {}
    }
    try {
      const saved = sessionStorage.getItem(SCAN_ANGLES_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as Record<string, string>) : {}
    } catch {
      return {}
    }
  })

  // Clean up on component unmount:
  // If the user navigates away from Scan without proceeding to /assess (e.g. Back to home, switching modules, or logging out),
  // ensure the scan session is cleared completely.
  useEffect(() => {
    return () => {
      if (!isProceedingToAssessRef.current) {
        try {
          sessionStorage.removeItem(SCAN_ANGLES_STORAGE_KEY)
        } catch {}
      }
    }
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  // Handle ESC key to exit full screen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const startCamera = useCallback(
    async (mode: 'environment' | 'user' = facingMode, isAutoStart = false) => {
      stopCamera()
      setCameraError(null)

      try {
        setCameraState('starting')
        const stream = await getMediaStreamWithFallback(mode)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted = true
          videoRef.current.setAttribute('playsinline', 'true')
          videoRef.current.setAttribute('webkit-playsinline', 'true')
          try {
            await videoRef.current.play()
          } catch (playErr) {
            console.warn('Video play error:', playErr)
          }
        }
        setCameraActive(true)
        setCameraState('active')
      } catch (err: any) {
        console.warn('Camera stream error:', err)
        setCameraActive(false)

        if (isAutoStart) {
          // If auto-start is rejected on page mount because the browser enforces a user gesture (e.g. iOS Safari),
          // transition to needs_gesture so tapping Enable Camera prompts the user.
          setCameraState('needs_gesture')
          return
        }

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraState('permission_denied')
          setCameraError(
            'Camera permission was not granted. Please allow camera permissions in your browser to scan live.'
          )
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraState('unsupported')
          setCameraError('No camera hardware found on this device.')
        } else {
          setCameraState('error')
          setCameraError(
            err.message?.includes('getUserMedia not supported')
              ? 'In-app live camera is not supported over HTTP by this mobile browser.'
              : 'Unable to start live camera feed. Tap Retry to try again.'
          )
        }
      }
    },
    [facingMode, stopCamera]
  )

  // Automatically attempt opening the camera when entering the scan device module
  useEffect(() => {
    startCamera(facingMode, true)
    return () => {
      stopCamera()
    }
  }, [facingMode, startCamera, stopCamera])

  useEffect(() => {
    if (Object.keys(capturedImages).length > 0) {
      try {
        sessionStorage.setItem(SCAN_ANGLES_STORAGE_KEY, JSON.stringify(capturedImages))
      } catch {
        // Ignore storage quota errors cleanly
      }
    }
  }, [capturedImages])

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    startCamera(nextMode, false)
  }

  const toggleFlash = async () => {
    const nextState = !flashOn
    setFlashOn(nextState)
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() as any) || {}
          if (capabilities.torch) {
            await (track as any).applyConstraints({
              advanced: [{ torch: nextState }],
            })
          }
        } catch {
          // torch constraint not supported on some platforms
        }
      }
    }
  }

  // Snap photo from the live video feed OR launch phone camera fallback
  const handleCaptureClick = () => {
    if (cameraActive && videoRef.current) {
      // Trigger visual shutter feedback
      setShutterFlash(true)
      setTimeout(() => setShutterFlash(false), 140)

      const video = videoRef.current
      const canvas = canvasRef.current || document.createElement('canvas')
      let width = video.videoWidth || 1280
      let height = video.videoHeight || 720

      // Constrain snapshot dimensions to keep within safe sessionStorage limits
      const maxDimension = 1280
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // If using user-facing camera, mirror the frame
      if (facingMode === 'user') {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      }

      ctx.drawImage(video, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

      const angleToSave = currentAngle
      setCapturedImages((prev) => {
        const next = {
          ...prev,
          [angleToSave]: dataUrl,
        }
        const nextPending = DEFAULT_ANGLES.find((a) => a.id !== angleToSave && !next[a.id])
        if (nextPending) {
          setCurrentAngle(nextPending.id)
        }
        return next
      })
    } else {
      // When camera is not active yet, tapping Capture starts the in-app camera!
      startCamera(facingMode, false)
    }
  }

  const completedCount = DEFAULT_ANGLES.filter((a) => Boolean(capturedImages[a.id])).length
  const activeConfig = DEFAULT_ANGLES.find((a) => a.id === currentAngle) ?? DEFAULT_ANGLES[0]

  const handleFileCapture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationErr = validateResidentImageFile(file)
    if (validationErr) {
      setValidationError(validationErr)
      e.target.value = ''
      return
    }

    setValidationError(null)
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
    if (!cameraActive) {
      startCamera(facingMode)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* Hidden file inputs for manual Fallback Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileCapture}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        style={{ display: 'none' }}
        onChange={handleFileCapture}
      />

      {/* Hidden canvas for taking instant snapshots from live video */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => {
            isProceedingToAssessRef.current = false
            try {
              sessionStorage.removeItem(SCAN_ANGLES_STORAGE_KEY)
            } catch {}
            setCapturedImages({})
            navigate(-1)
          }}
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
            Multi-Angle In-App Camera
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Flip camera button */}
          <IconButton
            size="small"
            onClick={toggleFacingMode}
            aria-label="Switch camera"
            title={facingMode === 'environment' ? 'Switch to Front Camera' : 'Switch to Rear Camera'}
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
            <CameraswitchRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Flash / Torch toggle button */}
          <IconButton
            size="small"
            onClick={toggleFlash}
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

          {/* Full Screen toggle button */}
          <IconButton
            size="small"
            onClick={toggleFullscreen}
            aria-label="Full screen camera"
            title="Open full screen camera"
            sx={{
              width: 38,
              height: 38,
              backgroundColor: isFullscreen ? '#0f172a' : '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              color: isFullscreen ? '#abf06b' : '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': { backgroundColor: isFullscreen ? '#1e293b' : '#f8fafc' },
            }}
          >
            <FullscreenRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Camera Viewport Window ── */}
      <Box
        sx={{
          ...(isFullscreen
            ? {
                position: 'fixed',
                inset: 0,
                zIndex: 1400,
                borderRadius: 0,
                border: 'none',
                width: '100vw',
                height: '100vh',
                minHeight: '100vh',
                aspectRatio: 'unset',
                pt: { xs: 'calc(14px + env(safe-area-inset-top, 0px))', sm: 2.5 },
                pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', sm: 2.5 },
                px: { xs: 2, sm: 3 },
                boxShadow: 'none',
              }
            : {
                borderRadius: 2,
                backgroundColor: '#020617',
                border: '1.5px solid #1e293b',
                p: 2,
                position: 'relative',
                minHeight: { xs: 300, sm: 380, md: 420 },
                aspectRatio: { xs: '4 / 3', sm: '16 / 10' },
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#020617',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Live Video Feed Element */}
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            display: capturedImages[currentAngle] ? 'none' : 'block',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* Shutter flash animation on capture */}
        {shutterFlash && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              opacity: 0.85,
              zIndex: 30,
              pointerEvents: 'none',
              transition: 'opacity 0.14s ease-out',
            }}
          />
        )}

        {/* Captured Photo Overlay (Shown if active angle has a saved photo) */}
        {capturedImages[currentAngle] && (
          unsupportedPreviewAngles[currentAngle] ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a',
                zIndex: 1,
                p: 2,
                gap: 1,
              }}
            >
              <PhotoLibraryRoundedIcon sx={{ fontSize: 48, color: '#abf06b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#ffffff' }}>
                {currentAngle.toUpperCase()} Image File Attached
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#94a3b8' }}>
                RAW / High-resolution format uploaded
              </Typography>
            </Box>
          ) : (
            <Box
              component="img"
              src={capturedImages[currentAngle]}
              alt={`Angle ${currentAngle}`}
              onError={() => setUnsupportedPreviewAngles((prev) => ({ ...prev, [currentAngle]: true }))}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1,
              }}
            />
          )
        )}

        {/* ── Dynamic Camera State Banners (Clean, Non-blocking, Friendly) ── */}

        {/* 1. Connecting State */}
        {cameraState === 'starting' && !capturedImages[currentAngle] && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              backgroundColor: 'rgba(2, 6, 23, 0.95)',
              zIndex: 2,
              textAlign: 'center',
              gap: 1.5,
            }}
          >
            <CircularProgress size={36} sx={{ color: '#abf06b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#ffffff' }}>
              Starting Camera...
            </Typography>
          </Box>
        )}

        {/* 2. Needs User Gesture (e.g. iOS Safari / Mobile Browser User Interaction Required) */}
        {cameraState === 'needs_gesture' && !capturedImages[currentAngle] && (
          <Box
            onClick={() => startCamera(facingMode, false)}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              backgroundColor: 'rgba(2, 6, 23, 0.92)',
              zIndex: 2,
              textAlign: 'center',
              gap: 1.25,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(171, 240, 107, 0.15)',
                border: '2px solid #abf06b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5,
                boxShadow: '0 0 20px rgba(171, 240, 107, 0.3)',
              }}
            >
              <TouchAppRoundedIcon sx={{ fontSize: 32, color: '#abf06b' }} />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
              Tap to Enable Camera
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#94a3b8', maxWidth: 300 }}>
              Tap here to grant camera permission and stream your device live.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  startCamera(facingMode, false)
                }}
                startIcon={<CameraAltRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  backgroundColor: '#abf06b',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  px: 2.5,
                  py: 0.75,
                  '&:hover': { backgroundColor: '#8ce442' },
                }}
              >
                Enable Camera
              </Button>
            </Box>
          </Box>
        )}

        {/* 3. Permission Denied State */}
        {cameraState === 'permission_denied' && !capturedImages[currentAngle] && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              backgroundColor: 'rgba(2, 6, 23, 0.95)',
              zIndex: 2,
              textAlign: 'center',
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CameraAltRoundedIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#ffffff' }}>
              Camera Permission Needed
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#94a3b8', maxWidth: 320 }}>
              {cameraError || 'Camera permission was not granted. Tap below to retry or take photos using your phone camera.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => startCamera(facingMode, false)}
                startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  backgroundColor: '#abf06b',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  '&:hover': { backgroundColor: '#8ce442' },
                }}
              >
                Retry Permission
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => cameraInputRef.current?.click()}
                startIcon={<CameraAltRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: '#475569',
                  color: '#e2e8f0',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  '&:hover': { borderColor: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Use Phone Camera
              </Button>
            </Box>
          </Box>
        )}

        {/* 5. Unsupported / Hardware Error State */}
        {(cameraState === 'unsupported' || cameraState === 'error') && !capturedImages[currentAngle] && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              backgroundColor: 'rgba(2, 6, 23, 0.95)',
              zIndex: 2,
              textAlign: 'center',
              gap: 1.25,
            }}
          >
            <CameraAltRoundedIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#ffffff' }}>
              In-App Camera Unavailable
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#94a3b8', maxWidth: 320 }}>
              {cameraError || 'You can still take device photos with your phone camera or upload from your gallery.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => cameraInputRef.current?.click()}
                startIcon={<CameraAltRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  backgroundColor: '#abf06b',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  '&:hover': { backgroundColor: '#8ce442' },
                }}
              >
                Take Photo
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => galleryInputRef.current?.click()}
                startIcon={<PhotoLibraryRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: '#475569',
                  color: '#e2e8f0',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  '&:hover': { borderColor: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Gallery
              </Button>
            </Box>
          </Box>
        )}

        {/* Live Alignment Guide Overlay & Sweep Beam (Shown when camera is live) */}
        {!capturedImages[currentAngle] && cameraActive && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Viewfinder Target Frame */}
            <Box
              sx={{
                width: isFullscreen ? { xs: '78%', sm: '56%', md: '42%' } : { xs: '76%', sm: '65%' },
                height: isFullscreen ? { xs: '40%', sm: '44%' } : { xs: '72%', sm: '70%' },
                maxHeight: isFullscreen ? { xs: 290, sm: 360 } : 'none',
                border: '1.5px dashed rgba(171, 240, 107, 0.75)',
                borderRadius: 2.5,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.32)',
              }}
            >
              {/* Center reticle */}
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #abf06b', opacity: 0.85 }} />

              {/* Animated laser scan beam */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: 2,
                  backgroundColor: '#abf06b',
                  boxShadow: '0 0 10px #abf06b, 0 0 4px #abf06b',
                  top: '50%',
                  animation: 'scanSweep 2.2s ease-in-out infinite alternate',
                  '@keyframes scanSweep': {
                    '0%': { top: '8%' },
                    '100%': { top: '92%' },
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {/* Decorative electric lime corner brackets (Standard mode only to prevent fullscreen clutter) */}
        {!isFullscreen && (
          <>
            <Box sx={{ position: 'absolute', top: 12, left: 12, width: 22, height: 22, borderTop: '2.5px solid #abf06b', borderLeft: '2.5px solid #abf06b', borderRadius: '3px 0 0 0', zIndex: 2 }} />
            <Box sx={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderTop: '2.5px solid #abf06b', borderRight: '2.5px solid #abf06b', borderRadius: '0 3px 0 0', zIndex: 2 }} />
            <Box sx={{ position: 'absolute', bottom: 12, left: 12, width: 22, height: 22, borderBottom: '2.5px solid #abf06b', borderLeft: '2.5px solid #abf06b', borderRadius: '0 0 0 3px', zIndex: 2 }} />
            <Box sx={{ position: 'absolute', bottom: 12, right: 12, width: 22, height: 22, borderBottom: '2.5px solid #abf06b', borderRight: '2.5px solid #abf06b', borderRadius: '0 0 3px 0', zIndex: 2 }} />
          </>
        )}

        {/* ── Top Bar inside Viewport ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            zIndex: 10,
            px: { xs: 0.5, sm: 1 },
          }}
        >
          {isFullscreen ? (
            /* Exit Full Screen Circular Icon Button in Fullscreen Mode */
            <IconButton
              onClick={toggleFullscreen}
              aria-label="Exit full screen"
              sx={{
                width: 38,
                height: 38,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#0f172a', color: '#abf06b', borderColor: '#abf06b' },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            /* Left spacer when not in fullscreen */
            <Box sx={{ width: 38 }} />
          )}

          {/* Center HUD status badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              px: { xs: 1.25, sm: 1.75 },
              py: 0.5,
              borderRadius: 9999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: capturedImages[currentAngle]
                  ? '#16a34a'
                  : cameraActive
                    ? '#22c55e'
                    : cameraState === 'needs_gesture'
                      ? '#38bdf8'
                      : '#f59e0b',
                boxShadow: capturedImages[currentAngle]
                  ? '0 0 8px #22c55e'
                  : cameraActive
                    ? '0 0 8px #abf06b'
                    : 'none',
              }}
            />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: { xs: '0.625rem', sm: '0.6875rem' }, letterSpacing: '0.04em' }}>
              {capturedImages[currentAngle]
                ? `CAPTURED: ${currentAngle.toUpperCase()}`
                : cameraActive
                  ? isFullscreen
                    ? `ALIGN ${currentAngle.toUpperCase()}`
                    : `LIVE • ${currentAngle.toUpperCase()}`
                  : cameraState === 'needs_gesture'
                    ? `TAP TO START`
                    : `READY • ${currentAngle.toUpperCase()}`}
            </Typography>
          </Box>

          {/* Right controls: Full Screen button (Windowed) OR Quick Flip & Flash (Fullscreen) */}
          {!isFullscreen ? (
            <ButtonBase
              onClick={toggleFullscreen}
              aria-label="Full screen camera"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                px: 1.25,
                py: 0.5,
                borderRadius: 9999,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  borderColor: '#abf06b',
                },
              }}
            >
              <FullscreenRoundedIcon sx={{ fontSize: 16, color: '#abf06b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem' }}>
                Full screen
              </Typography>
            </ButtonBase>
          ) : (
            /* In Fullscreen mode: Quick Flip & Flash toggles */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <IconButton
                size="small"
                onClick={toggleFacingMode}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#0f172a', color: '#abf06b' },
                }}
                aria-label="Flip camera"
              >
                <CameraswitchRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={toggleFlash}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: flashOn ? '#0f172a' : 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: flashOn ? '#abf06b' : '#ffffff',
                  '&:hover': { backgroundColor: '#0f172a' },
                }}
                aria-label="Toggle flash"
              >
                {flashOn ? <FlashOnRoundedIcon sx={{ fontSize: 18 }} /> : <FlashOffRoundedIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Fullscreen Validation Warning Banner */}
        {validationError && isFullscreen && (
          <Alert
            severity="warning"
            onClose={() => setValidationError(null)}
            sx={{
              position: 'absolute',
              top: { xs: 56, sm: 64 },
              left: 16,
              right: 16,
              zIndex: 35,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.75rem',
              backgroundColor: 'rgba(254, 243, 199, 0.95)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {validationError}
          </Alert>
        )}

        {/* ── Bottom HUD Bar (Standard Mode) OR Shutter Deck (Fullscreen Mode) ── */}
        {!isFullscreen ? (
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
                {cameraActive
                  ? 'In-App Live Stream'
                  : cameraState === 'needs_gesture'
                    ? 'Tap to Activate'
                    : 'Camera Ready'}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.6875rem', color: '#ffffff' }}>
              Target: {currentAngle.toUpperCase()} ({activeConfig.required ? 'Required' : 'Optional'})
            </Typography>
          </Box>
        ) : (
          /* Fullscreen Bottom Shutter Control Deck */
          <Box
            sx={{
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.25,
              width: '100%',
              pb: { xs: 1, sm: 2 },
            }}
          >
            {/* Guidance prompt capsule */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: 9999,
                px: { xs: 1.5, sm: 2 },
                py: 0.5,
                maxWidth: { xs: '92%', sm: 400 },
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  color: '#e2e8f0',
                  lineHeight: 1.3,
                }}
              >
                {activeConfig.prompt}
              </Typography>
            </Box>

            {/* 4 Angle selector pills (Single horizontal row, no wrap) */}
            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                flexWrap: 'nowrap',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 380,
                px: 1,
              }}
            >
              {DEFAULT_ANGLES.map((angle) => {
                const isCompleted = Boolean(capturedImages[angle.id])
                const isActive = angle.id === currentAngle
                return (
                  <ButtonBase
                    key={angle.id}
                    onClick={() => setCurrentAngle(angle.id)}
                    sx={{
                      flex: '1 1 0',
                      minWidth: 0,
                      py: 0.5,
                      px: { xs: 0.75, sm: 1.25 },
                      borderRadius: 9999,
                      border: isActive
                        ? '2px solid #abf06b'
                        : isCompleted
                          ? '1.5px solid #16a34a'
                          : '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: isActive
                        ? '#abf06b'
                        : isCompleted
                          ? 'rgba(22, 163, 74, 0.35)'
                          : 'rgba(15, 23, 42, 0.75)',
                      color: isActive ? '#0f172a' : '#ffffff',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.4,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {angle.label}
                    </Typography>
                    {isCompleted ? (
                      <CheckRoundedIcon sx={{ fontSize: 13, color: isActive ? '#0f172a' : '#22c55e' }} />
                    ) : angle.required ? (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#0f172a' : '#f59e0b',
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                  </ButtonBase>
                )
              })}
            </Box>

            {/* Shutter controls bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 3, sm: 4.5 },
                width: '100%',
                pt: 0.5,
              }}
            >
              {/* Gallery button */}
              <IconButton
                onClick={() => galleryInputRef.current?.click()}
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: 'rgba(15, 23, 42, 1)', color: '#abf06b' },
                }}
                title="Upload from gallery"
                aria-label="Upload from gallery"
              >
                <PhotoLibraryRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>

              {/* Circular Capture Shutter Button */}
              <Box
                onClick={handleCaptureClick}
                role="button"
                tabIndex={0}
                aria-label="Capture photo"
                sx={{
                  width: 66,
                  height: 66,
                  borderRadius: '50%',
                  border: '3.5px solid #abf06b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(4px)',
                  transition: 'transform 0.1s ease, box-shadow 0.2s ease',
                  boxShadow: '0 0 20px rgba(171, 240, 107, 0.35)',
                  '&:hover': {
                    transform: 'scale(1.04)',
                    boxShadow: '0 0 26px rgba(171, 240, 107, 0.55)',
                  },
                  '&:active': { transform: 'scale(0.92)' },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: '#abf06b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CameraAltRoundedIcon sx={{ fontSize: 26, color: '#0f172a' }} />
                </Box>
              </Box>

              {/* Retake or Done / Exit button */}
              {capturedImages[currentAngle] ? (
                <IconButton
                  onClick={() => handleRetake(currentAngle)}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: 'rgba(220, 38, 38, 0.85)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#dc2626' },
                  }}
                  title="Retake photo"
                  aria-label="Retake photo"
                >
                  <RefreshRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: 'rgba(15, 23, 42, 1)', color: '#abf06b' },
                  }}
                  title="Done full screen"
                  aria-label="Done full screen"
                >
                  <CheckRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Camera Action Controls (Uniform & Clean) ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
            gap: 1.25,
          }}
        >
          {/* Primary Capture Photo Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleCaptureClick}
            startIcon={<CameraAltRoundedIcon sx={{ fontSize: 22, color: '#abf06b' }} />}
            sx={{
              py: 1.4,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(15,23,42,0.18)',
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            {capturedImages[currentAngle]
              ? `Capture ${activeConfig.label} Again`
              : cameraActive
                ? 'Capture Photo'
                : 'Take Photo'}
          </Button>

          {/* Full Screen Button */}
          <Button
            variant="outlined"
            size="large"
            onClick={toggleFullscreen}
            startIcon={<FullscreenRoundedIcon sx={{ fontSize: 20, color: '#0f172a' }} />}
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
            Full screen
          </Button>

          {/* Upload Gallery Button */}
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
            Gallery
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
                    height: { xs: 100, sm: 125 },
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
                  {unsupportedPreviewAngles[angle.id] ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a',
                        p: 0.5,
                        gap: 0.25,
                      }}
                    >
                      <PhotoLibraryRoundedIcon sx={{ fontSize: 22, color: '#abf06b' }} />
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#ffffff' }}>
                        {angle.label}
                      </Typography>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.5625rem', color: '#abf06b' }}>
                        File Attached
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={img}
                      alt={`${angle.label} capture`}
                      onError={() => setUnsupportedPreviewAngles((prev) => ({ ...prev, [angle.id]: true }))}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
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
                  height: { xs: 100, sm: 125 },
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
          isProceedingToAssessRef.current = true
          try {
            sessionStorage.setItem(SCAN_ANGLES_STORAGE_KEY, JSON.stringify(capturedImages))
          } catch {}
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
        maxWidth="sm"
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
            unsupportedPreviewAngles[previewAngle] ? (
              <Box
                sx={{
                  py: 6,
                  px: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0f172a',
                  borderRadius: 1.5,
                  gap: 1.25,
                }}
              >
                <PhotoLibraryRoundedIcon sx={{ fontSize: 52, color: '#abf06b' }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                  {previewAngle.toUpperCase()} Image File Attached
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#94a3b8' }}>
                  RAW / High-resolution format ready for assessment
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={capturedImages[previewAngle]}
                alt={`${previewAngle} preview`}
                onError={() => previewAngle && setUnsupportedPreviewAngles((prev) => ({ ...prev, [previewAngle]: true }))}
                sx={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 1.5, backgroundColor: '#0f172a' }}
              />
            )
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
                const angleToRetake = previewAngle
                setPreviewAngle(null)
                handleRetake(angleToRetake)
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

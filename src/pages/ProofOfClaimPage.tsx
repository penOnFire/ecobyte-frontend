import { useEffect, useState, useRef, type FC, type ChangeEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { dropoffsApi, reuseApi } from '@/lib/api'
import thinkpadImg from '@/assets/ui/thinkpad.jpeg'
import galaxyImg from '@/assets/ui/galaxy_s10.jpeg'
import chargerImg from '@/assets/ui/charger.jpeg'
import ipadImg from '@/assets/ui/ipad.jpeg'
import keychronImg from '@/assets/ui/keychron.jpeg'
import type { UserReservationItem } from '@/types'

function resolveClaimItemImage(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('thinkpad') || lower.includes('laptop')) return thinkpadImg
  if (lower.includes('galaxy') || lower.includes('phone') || lower.includes('s10')) return galaxyImg
  if (lower.includes('charger') || lower.includes('cable') || lower.includes('usb')) return chargerImg
  if (lower.includes('ipad') || lower.includes('tablet')) return ipadImg
  return keychronImg
}

export const ProofOfClaimPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramReservationId = searchParams.get('reservationId') || ''
  const paramCode = searchParams.get('code') || ''
  const paramTitle = searchParams.get('title') || ''
  const paramSite = searchParams.get('site') || ''

  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  const [activeReservation, setActiveReservation] = useState<UserReservationItem | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [claimedDivertedKg, setClaimedDivertedKg] = useState<number | null>(null)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [claimSuccessOpen, setClaimSuccessOpen] = useState(false)
  const [shareToast, setShareToast] = useState(false)

  useEffect(() => {
    let active = true
    dropoffsApi
      .getMyRequests()
      .then((res) => {
        if (!active || !Array.isArray(res?.reservations)) return
        const matched =
          (paramReservationId &&
            res.reservations.find((r) => r.reservationId === paramReservationId)) ||
          (paramCode && res.reservations.find((r) => r.pickupCode === paramCode)) ||
          res.reservations[0] ||
          null
        if (matched) setActiveReservation(matched)
      })
      .catch(() => {
        // Keep URL query params if backend request cannot complete
      })
    return () => {
      active = false
    }
  }, [paramReservationId, paramCode])

  const reservationId = activeReservation?.reservationId || paramReservationId
  const pickupCode = activeReservation?.pickupCode || paramCode
  const itemTitle = activeReservation?.itemTitle || paramTitle || 'Reserved Reuse Item'
  const siteName = activeReservation?.siteName || paramSite || 'Commonwealth Area 1 Eco-Hub'
  const itemImage = resolveClaimItemImage(itemTitle)
  const [todayLabel] = useState(() =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date())
  )

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSubmitError(null)
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'EcoByte Refurbished Device Claim',
      text: `I claimed a verified ${itemTitle} through EcoByte Commonwealth!`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share error:', err)
        }
      }
    }
    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(
        `EcoByte Claim Voucher: ${itemTitle} at ${siteName}. Link: ${window.location.href}`
      )
      setShareToast(true)
    } catch {
      setShareToast(true)
    }
  }

  const handleCompleteClaim = async () => {
    setSubmitError(null)
    if (!reservationId || !pickupCode) {
      setSubmitError('No active reservation found to verify. Open Proof of Claim from an active reservation in My Requests.')
      return
    }
    if (!selectedFile) {
      setSubmitError('Please take or upload a handover photo before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await reuseApi.uploadProofOfClaim(reservationId, pickupCode, selectedFile)
      setClaimedDivertedKg(result.divertedKg)
      try {
        const stored = localStorage.getItem('ecobyte_user_reservations')
        if (stored) {
          const parsed: UserReservationItem[] = JSON.parse(stored)
          const remaining = parsed.filter(
            (r) => r.reservationId !== reservationId && r.pickupCode !== pickupCode
          )
          localStorage.setItem('ecobyte_user_reservations', JSON.stringify(remaining))
        }
      } catch {
        // Ignore storage cleanup failures
      }
      setClaimSuccessOpen(true)
    } catch (err: any) {
      setSubmitError(err?.message || 'Unable to verify claim right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />

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
            Proof of claim
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
            Step 2 of 2 • Photo verification
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <IconButton
            size="small"
            aria-label="Share Claim Voucher"
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
            <ShareRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            aria-label="Help"
            onClick={() => setHelpDialogOpen(true)}
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
            <HelpOutlineRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Upload Proof Photo Card ── */}
      <Card sx={{ p: 2.25, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: '#abf06b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CameraAltOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Upload proof photo
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.35, lineHeight: 1.45 }}>
              Take or upload any photo showing the e-waste item (handoff, receipt, or device at pickup site).
            </Typography>
          </Box>
        </Box>

        {/* Drag & drop or Preview Area */}
        {previewImage ? (
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #0f172a',
              height: 200,
              mb: 1.5,
              backgroundColor: '#0f172a',
            }}
          >
            <Box
              component="img"
              src={previewImage}
              alt="Proof Preview"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(15,23,42,0.85)',
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 9999,
                  color: '#abf06b',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                Photo Attached
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  setPreviewImage(null)
                  setSelectedFile(null)
                }}
                sx={{
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#dc2626' },
                }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            onClick={() => galleryInputRef.current?.click()}
            sx={{
              borderRadius: 1.5,
              border: '2px dashed #cbd5e1',
              backgroundColor: '#f8fafc',
              p: 2.5,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              mb: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#0f172a',
                backgroundColor: '#f1f5f9',
              },
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#0f172a' }} />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
              Drag &amp; drop or click to upload
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
              Supports JPG, PNG up to 10MB
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Button
            variant="contained"
            size="medium"
            onClick={() => cameraInputRef.current?.click()}
            startIcon={<CameraAltOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.2,
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            Take photo
          </Button>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => galleryInputRef.current?.click()}
            startIcon={<PhotoLibraryOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: '#e2e8f0',
              color: '#0f172a',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.2,
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1',
              },
            }}
          >
            Upload gallery
          </Button>
        </Box>
      </Card>

      {/* ── Item Details Card ── */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              Item details
            </Typography>
          </Box>
          <StatusBadge
            label={pickupCode ? `Code: ${pickupCode}` : 'No active code'}
            variant={pickupCode ? 'electric' : 'warning'}
            size="sm"
          />
        </Box>

        <Box
          sx={{
            backgroundColor: '#f8fafc',
            borderRadius: 1.25,
            p: 1.5,
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mb: 1.25 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={itemImage}
                alt={itemTitle}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                Item
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                {itemTitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 1, pt: 1.25, borderTop: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StorefrontRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b' }}>
                  Station
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
                  {siteName}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b' }}>
                  Date
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
                  {todayLabel}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ── Circularity Impact Card ── */}
      <Card sx={{ p: 2, borderRadius: 2, backgroundColor: '#0f172a', color: '#ffffff', border: '1px solid #1e293b', boxShadow: '0 2px 6px rgba(15,23,42,0.15)' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#abf06b',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ForestRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc' }}>
              Circularity impact
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#94a3b8', mt: 0.25, lineHeight: 1.45 }}>
              Claiming refurbished electronics diverts <strong style={{ color: '#abf06b' }}>~14.8 kg</strong> of e-waste from regional landfills.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Submit Proof Button ── */}
      {submitError && (
        <Alert severity="error" sx={{ borderRadius: 1.5, fontFamily: "'Quicksand', sans-serif", fontWeight: 600 }}>
          {submitError}
        </Alert>
      )}

      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          onClick={handleCompleteClaim}
          endIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9375rem',
            textTransform: 'none',
            boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
            '&:hover': { backgroundColor: '#1e293b' },
          }}
        >
          {isSubmitting ? 'Submitting verification...' : 'Submit proof & complete claim'}
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
          Status becomes Claimed automatically and adds to Completed requests.
        </Typography>
      </Box>

      {/* ── Help Dialog ── */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2.5,
              p: 1,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>
            How Proof of Claim Works
          </Typography>
          <IconButton size="small" onClick={() => setHelpDialogOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                1
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Meet the Hub Volunteer
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                  Show your pickup voucher code ({pickupCode || 'ECO-XXXX'}) at {siteName} desk.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                2
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Snap Handover Photo
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                  Upload a snapshot with the refurbished device, intake slip, or kiosk confirmation screen.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                3
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Get +150 Points &amp; Certificate
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                  Your claim is marked Completed in your requests list and Eco-Points are instantly credited.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setHelpDialogOpen(false)}
            sx={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 1.5,
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            Got it, thanks!
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Claim Success Dialog ── */}
      <Dialog
        open={claimSuccessOpen}
        onClose={() => {
          setClaimSuccessOpen(false)
          navigate('/requests?tab=completed')
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2.5,
              p: 2,
              textAlign: 'center',
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
        </Box>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
          Claim Verified &amp; Complete!
        </Typography>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 1, px: 1, lineHeight: 1.5 }}>
          Your handover for <strong>{itemTitle}</strong> is confirmed
          {claimedDivertedKg !== null && claimedDivertedKg > 0
            ? ` (${claimedDivertedKg} kg diverted)`
            : ''}
          . <strong>+150 Eco-Points</strong> have been awarded to your resident profile.
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setClaimSuccessOpen(false)
              navigate('/requests?tab=completed')
            }}
            sx={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              py: 1.2,
              borderRadius: 1.5,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            View in Completed Requests
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setClaimSuccessOpen(false)
              navigate('/dashboard')
            }}
            sx={{
              color: '#64748b',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Dialog>

      {/* ── Share Snackbar ── */}
      <Snackbar
        open={shareToast}
        autoHideDuration={3000}
        onClose={() => setShareToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
          Claim voucher copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  )
}

import { useEffect, useState, type FC } from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
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
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import keychronImg from '@/assets/ui/keychron.jpeg'
import { authApi, dropoffsApi, getCachedUser } from '@/lib/api'
import {
  buildPickupVoucherPdfBlob,
  buildVerificationMatrix,
} from '@/lib/pdf/voucherPdf'
import type { User, UserReservationItem } from '@/types'

function formatVoucherSchedule(expiresIso: string | null | undefined, fallbackMs: number) {
  const expiryDate = expiresIso ? new Date(expiresIso) : new Date(fallbackMs + 48 * 60 * 60 * 1000)
  const validExpiry = Number.isNaN(expiryDate.getTime())
    ? new Date(fallbackMs + 48 * 60 * 60 * 1000)
    : expiryDate

  const pickupDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(validExpiry)

  const heldUntilLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(validExpiry)

  const hoursRemaining = Math.max(
    1,
    Math.ceil((validExpiry.getTime() - fallbackMs) / (1000 * 60 * 60))
  )
  const remainingLabel =
    hoursRemaining >= 24
      ? `${Math.ceil(hoursRemaining / 24)} days remaining`
      : `${hoursRemaining}h remaining`

  return { pickupDateLabel, heldUntilLabel, remainingLabel }
}

export const ReservationPassPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramCode = searchParams.get('code')
  const paramTitle = searchParams.get('title')

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [mountedAtMs] = useState(() => Date.now())
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCachedUser())
  const [reservation, setReservation] = useState<UserReservationItem | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('ecobyte_user_reservations')
        if (local) {
          const list: UserReservationItem[] = JSON.parse(local)
          if (Array.isArray(list) && list.length > 0) {
            if (paramCode) {
              const found = list.find((r) => r.pickupCode === paramCode)
              if (found) return found
            }
            return list[0]
          }
        }
      } catch {}
    }
    return null
  })

  useEffect(() => {
    let active = true
    authApi
      .getProfile()
      .then((profile) => {
        if (active && profile) setCurrentUser(profile)
      })
      .catch(() => {
        // Keep cached user
      })
    dropoffsApi
      .getMyRequests()
      .then((res) => {
        if (!active) return
        if (Array.isArray(res?.reservations) && res.reservations.length > 0) {
          const matched = paramCode
            ? res.reservations.find((r) => r.pickupCode === paramCode)
            : res.reservations[0]
          if (matched) {
            setReservation(matched)
          }
        }
      })
      .catch(() => {
        // Keep fallback voucher details
      })
    return () => {
      active = false
    }
  }, [paramCode])

  const pickupCode = paramCode || reservation?.pickupCode || 'ECO-4821'
  const itemTitle = paramTitle || reservation?.itemTitle || 'Keychron K2 V2'
  const claimantName = currentUser?.fullName?.trim() || 'Resident Claimant'
  const collectionPlace = reservation?.siteName || 'Commonwealth Area 1 Eco-Hub'
  const desk = 'E-Waste Hub Desk 2'
  const statusLabel = reservation?.status ? `${reservation.status} (Active)` : 'Reserved (Active)'
  const { pickupDateLabel, heldUntilLabel, remainingLabel } = formatVoucherSchedule(
    reservation?.expiresAt,
    mountedAtMs
  )
  const qrMatrix = buildVerificationMatrix(`${pickupCode}|${itemTitle}`)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pickupCode)
      setToastMsg(`Pick-up code ${pickupCode} copied to clipboard!`)
    } catch {
      setToastMsg(`Code: ${pickupCode}`)
    }
    setMenuAnchor(null)
  }

  const handleDownloadPass = () => {
    const pdfBlob = buildPickupVoucherPdfBlob({
      pickupCode,
      itemTitle,
      claimantName,
      collectionPlace,
      desk,
      pickupDateLabel,
      heldUntilLabel,
      statusLabel,
    })
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ecobyte-voucher-${pickupCode}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setToastMsg('Official Pick-up Voucher (.pdf) downloaded successfully!')
  }

  const handleShare = async () => {
    setMenuAnchor(null)
    const shareData = {
      title: 'EcoByte Pick-up Pass',
      text: `My EcoByte pick-up code is ${pickupCode} for ${itemTitle} at ${collectionPlace}.`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setToastMsg('Pass shared successfully!')
      } catch {
        // User dismissed share
      }
    } else {
      await handleCopyCode()
    }
  }

  const handleGetDirections = () => {
    setMenuAnchor(null)
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      'Barangay Commonwealth Hall MRF, Commonwealth Avenue, Quezon City, Metro Manila'
    )}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
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
          onClick={(e) => setMenuAnchor(e.currentTarget)}
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

        {/* Three-Dot Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                minWidth: 190,
                fontFamily: "'Quicksand', sans-serif",
              },
            },
          }}
        >
          <MenuItem onClick={handleCopyCode} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Copy Pick-up Code</Typography>}
            />
          </MenuItem>
          <MenuItem onClick={handleShare} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ShareRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Share Voucher</Typography>}
            />
          </MenuItem>
          <MenuItem onClick={handleGetDirections} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <NavigationRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Get Hub Directions</Typography>}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              navigate('/reuse')
            }}
            sx={{ py: 1, color: '#dc2626' }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#dc2626' }}>
              <CancelOutlinedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>Cancel Reservation</Typography>}
            />
          </MenuItem>
        </Menu>
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
                {itemTitle}
              </Typography>
              <StatusBadge label="Reserved" variant="electric" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>
              Claimant: {claimantName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#0f172a', fontWeight: 600 }}>
                📍 {collectionPlace}
              </Typography>
              <Box sx={{ px: 0.75, py: 0.15, backgroundColor: '#f1f5f9', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b', fontWeight: 700 }}>
                  #{reservation?.reservationId ? `RSV-${reservation.reservationId}` : 'CIR-84920'}
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

        {/* Code Box & QR Verification Matrix */}
        <Box
          sx={{
            backgroundColor: '#020617',
            borderRadius: 1.25,
            p: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            border: '1px solid #334155',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                backgroundColor: '#ffffff',
                p: 0.6,
                borderRadius: 1,
                flexShrink: 0,
                display: 'flex',
              }}
              aria-label="Pick-up verification QR code"
            >
              <svg width="56" height="56" viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}>
                {qrMatrix.map((row, rIdx) =>
                  row.map((cell, cIdx) =>
                    cell ? (
                      <rect
                        key={`${rIdx}-${cIdx}`}
                        x={cIdx}
                        y={rIdx}
                        width={1}
                        height={1}
                        fill="#0f172a"
                      />
                    ) : null
                  )
                )}
              </svg>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Courier New', monospace",
                fontWeight: 800,
                fontSize: '1.375rem',
                letterSpacing: '0.12em',
                color: '#abf06b',
              }}
            >
              {pickupCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleCopyCode}
              aria-label="Copy code"
              sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Download Pass Voucher Button */}
        <Box sx={{ mt: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleDownloadPass}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18, color: '#abf06b' }} />}
            sx={{
              py: 0.85,
              borderColor: '#334155',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              fontFamily: "'Quicksand', sans-serif",
              '&:hover': {
                borderColor: '#abf06b',
                backgroundColor: 'rgba(171, 240, 107, 0.1)',
                color: '#abf06b',
              },
            }}
          >
            Download Official Pick-up Voucher (.pdf)
          </Button>
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
              {pickupDateLabel}
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
                {collectionPlace}
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                {desk}
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
                {heldUntilLabel}
              </Typography>
              <Box sx={{ mt: 0.25 }}>
                <StatusBadge label={remainingLabel} variant="electric" size="sm" />
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
          onClick={() => {
            const activeReservationId = reservation?.reservationId || searchParams.get('reservationId') || ''
            const params = new URLSearchParams({
              code: pickupCode,
              title: itemTitle,
              site: collectionPlace,
            })
            if (activeReservationId) params.set('reservationId', activeReservationId)
            navigate(`/proof-of-claim?${params.toString()}`)
          }}
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

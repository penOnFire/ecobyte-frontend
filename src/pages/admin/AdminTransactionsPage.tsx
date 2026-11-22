import { useEffect, useState, useMemo, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded'
import TimerOffRoundedIcon from '@mui/icons-material/TimerOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import {
  adminApi,
  getCachedUser,
  isNetworkError,
  resolveMediaUrl,
  type AdminTransactionItem,
  type PickupLookupResponse,
} from '@/lib/api'

type TxTab = 'claims' | 'listings' | 'disposals'

interface ClaimRecord {
  id: string
  rawId?: string
  listingId: string
  itemName: string
  type: string
  condition: string
  residentName: string
  residentEmail: string
  residentPhone?: string
  residentAddress?: string
  residentIdCode?: string
  validIdType?: string
  validIdNumber?: string
  barangay: string
  siteName: string
  pickupDate: string
  slot: string
  pickupCode: string
  status: 'Reserved' | 'Picked Up' | 'Expired'
  reservedAt: string
  expiresAt?: string | null
  resolvedAt?: string | null
  proofPhoto?: boolean
  proofUrl?: string | null
}

interface ListingRecord {
  id: string
  itemName: string
  type: string
  condition: string
  barangay: string
  siteName: string
  listedAt: string
  status: 'Available' | 'Reserved' | 'Claimed'
}

interface DisposalRecord {
  id: string
  itemName: string
  type: string
  requestId: string
  hazard: 'Low' | 'Medium' | 'High'
  reason: string
  by: string
  barangay: string
  at: string
  kg: number
}

const BARANGAYS = [
  { id: '', name: 'All barangays' },
  { id: 'commonwealth', name: 'Commonwealth' },
  { id: 'batasan', name: 'Batasan Hills' },
  { id: 'payatas', name: 'Payatas' },
  { id: 'holyspirit', name: 'Holy Spirit' },
  { id: 'bagongsilangan', name: 'Bagong Silangan' },
]

const TODAY_STR = new Date().toISOString().slice(0, 10)

const getInitialClaims = (): ClaimRecord[] => {
  let mappedLocalReservations: ClaimRecord[] = []
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ecobyte_user_reservations')
      if (stored) {
        const list = JSON.parse(stored)
        if (Array.isArray(list)) {
          mappedLocalReservations = list.map((r: any) => ({
            id: `CLAIM-${r.id || '001'}`,
            listingId: r.itemId || 'RH-LIVE',
            itemName: r.itemTitle || 'Reserved Device',
            type: 'Electronics',
            condition: 'Refurbished',
            residentName: localStorage.getItem('ecobyte_user_name') || 'Resident User',
            residentEmail: 'resident@ecobyte.ph',
            barangay: 'Commonwealth',
            siteName: r.pickupLocation?.name || 'Commonwealth Area 1 Eco-Hub',
            pickupDate: r.pickupDate || new Date().toISOString().slice(0, 10),
            slot: r.pickupSlot || '10:00 AM – 12:00 PM',
            pickupCode: r.pickupCode || '',
            status: r.status === 'CLAIMED' ? 'Picked Up' : r.status === 'EXPIRED' ? 'Expired' : 'Reserved',
            reservedAt: 'Recent',
            resolvedAt: r.status === 'CLAIMED' ? 'Verified' : null,
            proofPhoto: r.status === 'CLAIMED',
          }))
        }
      }
    } catch {
      // Ignore
    }
  }
  return mappedLocalReservations
}

const getInitialListings = (): ListingRecord[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_reuse_listings')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

const getInitialDisposals = (): DisposalRecord[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_disposal_records')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

const HEADER_CELL_STYLE = {
  padding: '10px 10px',
  fontSize: '10.5px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.03em',
  whiteSpace: 'nowrap' as const,
}

const BODY_CELL_STYLE = {
  padding: '10px 10px',
  verticalAlign: 'middle' as const,
  overflowWrap: 'anywhere' as const,
}

export const AdminTransactionsPage: FC = () => {
  const [tab, setTab] = useState<TxTab>('claims')
  const [claims, setClaims] = useState<ClaimRecord[]>(getInitialClaims)
  const [listings, setListings] = useState<ListingRecord[]>(getInitialListings)
  const [disposals, setDisposals] = useState<DisposalRecord[]>(getInitialDisposals)

  // Filters
  const [filterBrgy, setFilterBrgy] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  // Modals
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null)
  const [claimModalOpen, setClaimModalOpen] = useState(false)

  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verifyingClaim, setVerifyingClaim] = useState<ClaimRecord | null>(null)
  const [inputPickupCode, setInputPickupCode] = useState('')
  const [verifyStep, setVerifyStep] = useState<'code' | 'identity'>('code')
  const [lookupResult, setLookupResult] = useState<PickupLookupResponse | null>(null)
  const [identityConfirmed, setIdentityConfirmed] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  const currentUser = getCachedUser()
  const isSuperAdmin =
    (currentUser?.role || (typeof window !== 'undefined' ? localStorage.getItem('ecobyte_user_role') : '') || '').toUpperCase() ===
    'ADMIN'

  // Load live transactions from backend if available
  useEffect(() => {
    let active = true

    adminApi
      .getTransactions({ type: 'reuse', search })
      .then((data: AdminTransactionItem[]) => {
        if (!active || !Array.isArray(data)) return
        const mappedLiveClaims: ClaimRecord[] = data.map((d) => {
          const normalizedStatus = (d.status || '').toLowerCase()
          const isPickedUp =
            normalizedStatus === 'claimed' ||
            normalizedStatus === 'completed' ||
            normalizedStatus === 'picked_up' ||
            d.displayStatus === 'Picked Up'
          const isExpired =
            normalizedStatus === 'expired' ||
            normalizedStatus === 'cancelled' ||
            d.displayStatus === 'Expired'
          return {
            id: d.transactionNumber || d.id,
            rawId: d.rawId,
            listingId: d.rawId || 'RH-LIVE',
            itemName: d.itemName,
            type: d.category || 'Electronic',
            condition: d.condition || 'Inspected',
            residentName: d.residentName,
            residentEmail: d.residentEmail,
            residentPhone: d.residentPhone || '',
            residentAddress: d.residentAddress || '',
            residentIdCode: d.residentIdCode || '',
            validIdType: d.validIdType || '',
            validIdNumber: d.validIdNumber || '',
            barangay: d.residentBaseName || 'Commonwealth',
            siteName: d.siteName,
            pickupDate: d.dateSlot?.split(' ')[0] || new Date().toISOString().slice(0, 10),
            slot: d.dateSlot?.split(' ').slice(1).join(' ') || '10:00 AM – 12:00 PM',
            pickupCode: d.pickupCode || '',
            status: isPickedUp ? 'Picked Up' : isExpired ? 'Expired' : 'Reserved',
            reservedAt: d.createdAt || 'Recent',
            expiresAt: d.expiresAt || null,
            resolvedAt: d.resolvedAt
              ? new Date(d.resolvedAt).toLocaleString()
              : isPickedUp
                ? 'Verified'
                : null,
            proofPhoto: Boolean(d.proofPhoto),
            proofUrl: d.proofUrl || null,
          }
        })

        setClaims(mappedLiveClaims)
      })
      .catch((err) => {
        console.warn('Backend transactions unavailable:', err)
      })

    adminApi
      .getReuseInventory()
      .then((rows) => {
        if (!active || !Array.isArray(rows)) return
        const mappedListings: ListingRecord[] = rows.map((r) => ({
          id: r.id,
          itemName: r.title,
          type: r.category || 'Electronics',
          condition: r.condition || 'Good',
          barangay: 'Commonwealth',
          siteName: r.hub || 'Commonwealth Area 1 Eco-Hub',
          listedAt: r.createdAt?.slice(0, 10) || TODAY_STR,
          status: r.status === 'Available' ? 'Available' : r.status === 'Reserved' ? 'Reserved' : 'Claimed',
        }))
        setListings(mappedListings)
      })
      .catch(() => {})

    adminApi
      .getDisposalLogs()
      .then((rows) => {
        if (!active || !Array.isArray(rows) || rows.length === 0) return
        const mappedDisposals: DisposalRecord[] = rows.map((d) => ({
          id: d.manifestId || d.id || 'DSP',
          itemName: d.itemName || 'Disposal Unit',
          type: d.category || 'Electronics',
          requestId: d.manifestId,
          hazard: 'High',
          reason: d.decisionNotes || 'Deemed hazardous / unrecoverable',
          by: 'Barangay Official',
          barangay: 'Commonwealth',
          at: d.date?.slice(0, 10) || TODAY_STR,
          kg: d.totalWeightKg || 1.5,
        }))
        setDisposals((prev) => {
          const ids = new Set(mappedDisposals.map((m) => m.id))
          return [...mappedDisposals, ...prev.filter((p) => !ids.has(p.id))]
        })
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [search, refreshTick])

  // KPI calculations
  const totalClaimsCount = claims.length
  const reservedCount = claims.filter((c) => c.status === 'Reserved').length
  const pickedUpCount = claims.filter((c) => c.status === 'Picked Up').length
  const expiredCount = claims.filter((c) => c.status === 'Expired').length

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    let rows = claims.slice()
    if (filterBrgy) {
      rows = rows.filter((c) => c.barangay.toLowerCase() === filterBrgy.toLowerCase())
    }
    if (filterStatus) {
      rows = rows.filter((c) => c.status === filterStatus)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.itemName.toLowerCase().includes(q) ||
          c.residentName.toLowerCase().includes(q) ||
          c.siteName.toLowerCase().includes(q)
      )
    }
    return rows.sort((a, b) => b.reservedAt.localeCompare(a.reservedAt))
  }, [claims, filterBrgy, filterStatus, search])

  // Filtered Listings
  const filteredListings = useMemo(() => {
    let rows = listings.slice()
    if (filterBrgy) {
      rows = rows.filter((l) => l.barangay.toLowerCase() === filterBrgy.toLowerCase())
    }
    if (filterStatus) {
      rows = rows.filter((l) => l.status === filterStatus)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((l) => l.id.toLowerCase().includes(q) || l.itemName.toLowerCase().includes(q))
    }
    return rows.sort((a, b) => b.listedAt.localeCompare(a.listedAt))
  }, [listings, filterBrgy, filterStatus, search])

  // Filtered Disposals
  const filteredDisposals = useMemo(() => {
    let rows = disposals.slice()
    if (filterBrgy) {
      rows = rows.filter((d) => d.barangay.toLowerCase() === filterBrgy.toLowerCase())
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.itemName.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q) ||
          d.by.toLowerCase().includes(q)
      )
    }
    return rows.sort((a, b) => b.at.localeCompare(a.at))
  }, [disposals, filterBrgy, search])

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase()
    if (lower.includes('phone')) return SmartphoneRoundedIcon
    if (lower.includes('laptop')) return LaptopRoundedIcon
    if (lower.includes('battery')) return BatteryChargingFullRoundedIcon
    if (lower.includes('monitor') || lower.includes('tv')) return TvRoundedIcon
    if (lower.includes('cable') || lower.includes('charger') || lower.includes('keyboard')) return CableRoundedIcon
    return KitchenRoundedIcon
  }

  const handleOpenClaimModal = (claim: ClaimRecord) => {
    setSelectedClaim(claim)
    setClaimModalOpen(true)
  }

  const handleOpenVerifyModal = (claim?: ClaimRecord) => {
    setVerifyingClaim(claim ?? null)
    setInputPickupCode('')
    setVerifyStep('code')
    setLookupResult(null)
    setIdentityConfirmed(false)
    setVerifyError(null)
    setVerifyModalOpen(true)
  }

  const normalizeVerifyCode = (rawInput: string) => {
    const raw = rawInput.trim().toUpperCase()
    if (!raw) return ''
    if (/^\d{4}$/.test(raw)) return `ECO-${raw}`
    if (/^ECO\d{4}$/.test(raw)) return `ECO-${raw.slice(3)}`
    return raw
  }

  const handleLookupCode = async () => {
    const normalized = normalizeVerifyCode(inputPickupCode)
    if (!normalized) {
      setVerifyError('Please enter the verification code.')
      return
    }

    setIsLookingUp(true)
    setVerifyError(null)

    try {
      const res = await adminApi.lookupPickupCode({
        claimId: verifyingClaim?.id,
        pickupCode: normalized,
      })

      if (!res.matched || !res.success) {
        setVerifyError(res.error || res.message || 'Reject: Verification code does not match.')
        return
      }

      setLookupResult(res)
      setIdentityConfirmed(false)
      setVerifyStep('identity')
    } catch (err: unknown) {
      if (isNetworkError(err) && verifyingClaim) {
        const cleanInput = normalized.replace(/[^A-Z0-9]/g, '')
        const cleanTarget = (verifyingClaim.pickupCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (cleanTarget && cleanInput === cleanTarget) {
          setLookupResult({
            success: true,
            matched: true,
            claimId: verifyingClaim.rawId || verifyingClaim.id,
            transactionNumber: verifyingClaim.id,
            pickupCode: normalized,
            item: {
              id: verifyingClaim.listingId,
              title: verifyingClaim.itemName,
              category: verifyingClaim.type,
              condition: verifyingClaim.condition,
            },
            reservation: {
              reservedAt: verifyingClaim.reservedAt,
              expiresAt: verifyingClaim.expiresAt ?? null,
              siteName: verifyingClaim.siteName,
            },
            claimant: {
              id: '',
              fullName: verifyingClaim.residentName,
              email: verifyingClaim.residentEmail,
              phone: verifyingClaim.residentPhone || '',
              address: verifyingClaim.residentAddress || '',
              idCode: verifyingClaim.residentIdCode || '',
              validIdType: verifyingClaim.validIdType || '',
              validIdNumber: verifyingClaim.validIdNumber || '',
              baseName: verifyingClaim.barangay,
            },
          })
          setIdentityConfirmed(false)
          setVerifyStep('identity')
          return
        }
      }
      setVerifyError(
        (err as { message?: string })?.message ||
          'Reject: Verification code does not match this reservation.'
      )
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleReleaseClaim = async (claim: ClaimRecord) => {
    try {
      await adminApi.releaseClaim(claim.id, 'Unclaimed / Missed by resident')
      setToast({
        message: `${claim.itemName} has been released back to the Reuse Hub as Available.`,
        severity: 'success',
      })
      setClaimModalOpen(false)
      window.dispatchEvent(new Event('ecobyte:reservations-refresh'))
      setClaims((prev) =>
        prev.map((c) => (c.id === claim.id ? { ...c, status: 'Expired' } : c))
      )
      setRefreshTick((t) => t + 1)
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to release reservation back to Reuse Hub.',
        severity: 'error',
      })
    }
  }

  const handleVerifySubmit = async () => {
    const normalized = normalizeVerifyCode(lookupResult?.pickupCode || inputPickupCode)
    const targetClaimId = verifyingClaim?.id || lookupResult?.transactionNumber || lookupResult?.claimId
    if (!normalized || !targetClaimId) {
      setVerifyError('Please look up and verify the pick-up code first.')
      return
    }
    if (!identityConfirmed) {
      setVerifyError('Please confirm that you checked the reserving resident’s identity.')
      return
    }

    setIsVerifying(true)
    setVerifyError(null)

    try {
      const res = await adminApi.verifyPickupCode({
        claimId: lookupResult?.claimId || verifyingClaim?.id,
        pickupCode: normalized,
        identityConfirmed: true,
      })

      if (!res.matched || !res.success) {
        setVerifyError(res.error || res.message || 'Reject: Verification code does not match this reservation.')
        setIsVerifying(false)
        return
      }

      const resolvedClaimTx = lookupResult?.transactionNumber || verifyingClaim?.id
      const resolvedRawId = res.claimId || lookupResult?.claimId || verifyingClaim?.rawId

      setClaims((prev) =>
        prev.map((c) =>
          c.id === resolvedClaimTx || (resolvedRawId && c.rawId === resolvedRawId)
            ? {
                ...c,
                status: 'Picked Up',
                resolvedAt: 'Verified Just Now',
              }
            : c
        )
      )

      try {
        const stored = localStorage.getItem('ecobyte_user_reservations')
        if (stored) {
          const list = JSON.parse(stored)
          const updated = list.map((r: any) =>
            r.pickupCode === normalized ||
            r.pickupCode === verifyingClaim?.pickupCode ||
            (resolvedRawId && String(r.reservationId ?? r.id) === String(resolvedRawId))
              ? { ...r, status: 'CLAIMED' }
              : r
          )
          localStorage.setItem('ecobyte_user_reservations', JSON.stringify(updated))
        }
      } catch {
        // Ignore local storage errors
      }

      const confirmedItemName =
        lookupResult?.item?.title || verifyingClaim?.itemName || 'Reserved Item'
      setToast({
        message: `Pick-up & identity confirmed for ${confirmedItemName}! Status updated to Picked Up.`,
        severity: 'success',
      })
      setVerifyModalOpen(false)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      if (isNetworkError(err) && verifyingClaim) {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === verifyingClaim.id
              ? {
                  ...c,
                  status: 'Picked Up',
                  resolvedAt: 'Verified Just Now',
                }
              : c
          )
        )
        setToast({
          message: `Pick-up verified for ${verifyingClaim.itemName}! Status updated to Picked Up.`,
          severity: 'success',
        })
        setVerifyModalOpen(false)
      } else {
        setVerifyError(
          (err as { message?: string })?.message ||
            'Unable to confirm pick-up right now. Please try again.'
        )
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── KPI Summary Cards matching Prototype ── */}
      {isSuperAdmin ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}
        >
          {/* KPI 1: Transactions */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ReceiptLongRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Transactions
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {totalClaimsCount}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                All barangays
              </Typography>
            </Box>
          </Box>

          {/* KPI 2: Reserved */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ScheduleRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Reserved
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {reservedCount}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                Awaiting pick-up
              </Typography>
            </Box>
          </Box>

          {/* KPI 3: Picked up */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#f1f4f0',
                color: '#2e6022',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HandshakeRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Picked Up
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {pickedUpCount}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                Verified by officials
              </Typography>
            </Box>
          </Box>

          {/* KPI 4: Expired */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#fff1f2',
                color: '#be123c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TimerOffRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Expired
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {expiredCount}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                Unclaimed reservations
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {/* KPI 1: Awaiting pick-up (Sky) */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ScheduleRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Awaiting pick-up
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {reservedCount}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                {claims.filter((c) => c.status === 'Reserved' && c.pickupDate === TODAY_STR).length} scheduled today
              </Typography>
            </Box>
          </Box>

          {/* KPI 2: Picked up (Leaf) */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#f1f4f0',
                color: '#2e6022',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HandshakeRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Picked Up
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {pickedUpCount}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                Verified with pick-up code
              </Typography>
            </Box>
          </Box>

          {/* KPI 3: Disposal records (Amber) */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #dbe3d6',
              borderRadius: '1.25rem',
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '1rem',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DeleteForeverRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Disposal records
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
                {disposals.length}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                ≈ {disposals.reduce((a, d) => a + d.kg, 0).toFixed(1)} kg
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Main Transactions Card with 3 Tabs and Filters ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #dbe3d6',
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          overflow: 'hidden',
          p: { xs: 2.5, sm: 3 },
        }}
      >
        {/* Navigation Tabs Pill Container */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              backgroundColor: '#f1f5f9',
              borderRadius: '0.75rem',
            }}
          >
            <ButtonBase
              onClick={() => setTab('claims')}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                backgroundColor: tab === 'claims' ? '#ffffff' : 'transparent',
                color: tab === 'claims' ? '#0f172a' : '#64748b',
                boxShadow: tab === 'claims' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Pick-up Claims</span>
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: tab === 'claims' ? '#f1f4f0' : '#e2e8f0',
                  color: tab === 'claims' ? '#2e6022' : '#64748b',
                }}
              >
                {reservedCount}
              </Box>
            </ButtonBase>

            <ButtonBase
              onClick={() => setTab('listings')}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                backgroundColor: tab === 'listings' ? '#ffffff' : 'transparent',
                color: tab === 'listings' ? '#0f172a' : '#64748b',
                boxShadow: tab === 'listings' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Reuse Hub Listings</span>
            </ButtonBase>

            <ButtonBase
              onClick={() => setTab('disposals')}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                backgroundColor: tab === 'disposals' ? '#ffffff' : 'transparent',
                color: tab === 'disposals' ? '#0f172a' : '#64748b',
                boxShadow: tab === 'disposals' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Disposal Records</span>
            </ButtonBase>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {tab === 'claims' && !isSuperAdmin && (
              <ButtonBase
                onClick={() => handleOpenVerifyModal()}
                sx={{
                  px: 1.75,
                  py: 0.85,
                  borderRadius: '0.65rem',
                  background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  gap: 0.65,
                  boxShadow: '0 2px 6px rgba(46, 96, 34, 0.18)',
                  '&:hover': { opacity: 0.95 },
                }}
              >
                <QrCodeScannerRoundedIcon sx={{ fontSize: 16 }} />
                <span>Verify Pick-Up Code</span>
              </ButtonBase>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>
              <VisibilityRoundedIcon sx={{ fontSize: 18, color: '#4f8a24' }} />
              <span>
                {isSuperAdmin ? 'View-only · Super Admin Scope' : 'Official Portal Scope'}
              </span>
            </Box>
          </Box>
        </Box>

        {/* ── Filters & Search Row ── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>
            {tab === 'claims'
              ? `${filteredClaims.length} total transactions`
              : tab === 'listings'
                ? `${filteredListings.length} reuse items`
                : `${filteredDisposals.length} disposal logs`}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
              width: { xs: '100%', md: 620 },
            }}
          >
            {/* Barangay Filter */}
            <select
              value={filterBrgy}
              onChange={(e) => setFilterBrgy(e.target.value)}
              style={{
                height: 40,
                padding: '0 12px',
                borderRadius: '0.75rem',
                border: '1px solid #dbe3d6',
                backgroundColor: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#334155',
                outline: 'none',
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              {BARANGAYS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            {tab !== 'disposals' ? (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  height: 40,
                  padding: '0 12px',
                  borderRadius: '0.75rem',
                  border: '1px solid #dbe3d6',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  outline: 'none',
                  fontFamily: "'Quicksand', sans-serif",
                }}
              >
                <option value="">All statuses</option>
                {tab === 'claims' ? (
                  <>
                    <option value="Reserved">Reserved</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Expired">Expired</option>
                  </>
                ) : (
                  <>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Claimed">Claimed</option>
                  </>
                )}
              </select>
            ) : (
              <Box />
            )}

            {/* Search Input */}
            <Box sx={{ position: 'relative' }}>
              <SearchRoundedIcon
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: 18,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder={tab === 'claims' ? 'Search item, resident…' : 'Search keyword…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 34,
                  paddingRight: 12,
                  borderRadius: '0.75rem',
                  border: '1px solid #dbe3d6',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  outline: 'none',
                  fontFamily: "'Quicksand', sans-serif",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Table Content per Active Tab ── */}
        <Box sx={{ overflowX: { xs: 'auto', md: 'visible' }, mx: { xs: -2.5, sm: -3, md: 0 }, px: { xs: 2.5, sm: 3, md: 0 } }}>
          {tab === 'claims' && (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: { xs: 780, md: 0 },
                tableLayout: { md: 'fixed' },
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <colgroup>
                <col style={{ width: '24%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={HEADER_CELL_STYLE}>Item</th>
                  <th style={HEADER_CELL_STYLE}>Resident</th>
                  <th style={HEADER_CELL_STYLE}>Barangay</th>
                  <th style={HEADER_CELL_STYLE}>Pick-Up Site</th>
                  <th style={HEADER_CELL_STYLE}>Schedule</th>
                  <th style={HEADER_CELL_STYLE}>Status</th>
                  <th style={{ ...HEADER_CELL_STYLE, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>No transactions match your filters.</Typography>
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((c) => {
                    const ItemIcon = getTypeIcon(c.type)
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={BODY_CELL_STYLE}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#f1f4f0',
                                color: '#2e6022',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <ItemIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.78125rem', color: '#0f172a', lineHeight: 1.25 }}>
                                {c.itemName}
                              </Typography>
                              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, lineHeight: 1.25 }}>
                                {c.type} · {c.condition}
                              </Typography>
                            </Box>
                          </Box>
                        </td>
                        <td style={{ ...BODY_CELL_STYLE, fontWeight: 600, fontSize: '0.78125rem', color: '#1e293b' }}>
                          {c.residentName}
                        </td>
                        <td style={{ ...BODY_CELL_STYLE, fontWeight: 600, fontSize: '0.75rem', color: '#334155' }}>
                          {c.barangay}
                        </td>
                        <td style={{ ...BODY_CELL_STYLE, color: '#475569', fontWeight: 500, fontSize: '0.725rem', lineHeight: 1.35 }}>
                          {c.siteName}
                        </td>
                        <td style={BODY_CELL_STYLE}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a', lineHeight: 1.25 }}>
                            {c.pickupDate}
                          </Typography>
                          <Typography sx={{ fontSize: '0.675rem', color: '#64748b', lineHeight: 1.25 }}>
                            {c.slot}
                          </Typography>
                        </td>
                        <td style={BODY_CELL_STYLE}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.3,
                              borderRadius: '9999px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              backgroundColor:
                                c.status === 'Picked Up'
                                  ? '#f1f4f0'
                                  : c.status === 'Reserved'
                                    ? '#f0f9ff'
                                    : '#fff1f2',
                              color:
                                c.status === 'Picked Up'
                                  ? '#2e6022'
                                  : c.status === 'Reserved'
                                    ? '#0369a1'
                                    : '#be123c',
                              border: `1px solid ${
                                c.status === 'Picked Up'
                                  ? '#c5dcba'
                                  : c.status === 'Reserved'
                                    ? '#bae6fd'
                                    : '#fecdd3'
                              }`,
                            }}
                          >
                            {c.status}
                          </Box>
                        </td>
                        <td style={{ ...BODY_CELL_STYLE, textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 0.5 }}>
                            <ButtonBase
                              onClick={() => handleOpenClaimModal(c)}
                              sx={{
                                px: 1.1,
                                py: 0.45,
                                borderRadius: '0.5rem',
                                border: '1px solid #dbe3d6',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                '&:hover': { backgroundColor: '#f8faf6' },
                              }}
                            >
                              View
                            </ButtonBase>

                            {!isSuperAdmin && c.status === 'Reserved' && (
                              <ButtonBase
                                onClick={() => handleOpenVerifyModal(c)}
                                sx={{
                                  px: 1.1,
                                  py: 0.45,
                                  borderRadius: '0.5rem',
                                  background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                                  color: '#ffffff',
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  gap: 0.4,
                                  '&:hover': { opacity: 0.95 },
                                }}
                              >
                                <QrCodeScannerRoundedIcon sx={{ fontSize: 13 }} />
                                <span>Verify</span>
                              </ButtonBase>
                            )}
                          </Box>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </Box>
          )}

          {tab === 'listings' && (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: { xs: 720, md: 0 },
                tableLayout: { md: 'fixed' },
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={HEADER_CELL_STYLE}>Listing</th>
                  <th style={HEADER_CELL_STYLE}>Item</th>
                  <th style={HEADER_CELL_STYLE}>Condition</th>
                  <th style={HEADER_CELL_STYLE}>Barangay</th>
                  <th style={HEADER_CELL_STYLE}>Pick-Up Site</th>
                  <th style={HEADER_CELL_STYLE}>Listed Date</th>
                  <th style={HEADER_CELL_STYLE}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>No Reuse Hub listings found.</Typography>
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((l) => {
                    const ItemIcon = getTypeIcon(l.type)
                    return (
                      <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...BODY_CELL_STYLE, fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>{l.id}</td>
                        <td style={BODY_CELL_STYLE}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#f1f4f0',
                                color: '#2e6022',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <ItemIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.78125rem', color: '#0f172a', lineHeight: 1.25 }}>{l.itemName}</Typography>
                              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>{l.type}</Typography>
                            </Box>
                          </Box>
                        </td>
                        <td style={{ ...BODY_CELL_STYLE, fontWeight: 600, fontSize: '0.75rem', color: '#334155' }}>{l.condition}</td>
                        <td style={{ ...BODY_CELL_STYLE, fontWeight: 600, fontSize: '0.75rem', color: '#334155' }}>{l.barangay}</td>
                        <td style={{ ...BODY_CELL_STYLE, color: '#475569', fontSize: '0.725rem', lineHeight: 1.35 }}>{l.siteName}</td>
                        <td style={{ ...BODY_CELL_STYLE, fontWeight: 500, fontSize: '0.75rem', color: '#334155' }}>{l.listedAt}</td>
                        <td style={BODY_CELL_STYLE}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.3,
                              borderRadius: '9999px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              backgroundColor:
                                l.status === 'Available'
                                  ? '#f1f4f0'
                                  : l.status === 'Reserved'
                                    ? '#f0f9ff'
                                    : '#f1f5f9',
                              color:
                                l.status === 'Available'
                                  ? '#2e6022'
                                  : l.status === 'Reserved'
                                    ? '#0369a1'
                                    : '#475569',
                              border: `1px solid ${
                                l.status === 'Available'
                                  ? '#c5dcba'
                                  : l.status === 'Reserved'
                                    ? '#bae6fd'
                                    : '#cbd5e1'
                              }`,
                            }}
                          >
                            {l.status}
                          </Box>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </Box>
          )}

          {tab === 'disposals' && (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: { xs: 720, md: 0 },
                tableLayout: { md: 'fixed' },
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '21%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={HEADER_CELL_STYLE}>Record</th>
                  <th style={HEADER_CELL_STYLE}>Item &amp; Request</th>
                  <th style={HEADER_CELL_STYLE}>Hazard</th>
                  <th style={HEADER_CELL_STYLE}>Reason</th>
                  <th style={HEADER_CELL_STYLE}>Barangay</th>
                  <th style={HEADER_CELL_STYLE}>Inspected By</th>
                  <th style={HEADER_CELL_STYLE}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisposals.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>No disposal records match your filter.</Typography>
                    </td>
                  </tr>
                ) : (
                  filteredDisposals.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...BODY_CELL_STYLE, fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>{d.id}</td>
                      <td style={BODY_CELL_STYLE}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.78125rem', color: '#0f172a', lineHeight: 1.25 }}>{d.itemName}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {d.type} · {d.requestId}
                        </Typography>
                      </td>
                      <td style={BODY_CELL_STYLE}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.3,
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            backgroundColor:
                              d.hazard === 'High'
                                ? '#fff1f2'
                                : d.hazard === 'Medium'
                                  ? '#fffbeb'
                                  : '#f1f4f0',
                            color:
                              d.hazard === 'High'
                                ? '#be123c'
                                : d.hazard === 'Medium'
                                  ? '#b45309'
                                  : '#2e6022',
                            border: `1px solid ${
                              d.hazard === 'High'
                                ? '#fecdd3'
                                : d.hazard === 'Medium'
                                  ? '#fde68a'
                                  : '#c5dcba'
                            }`,
                          }}
                        >
                          {d.hazard} Risk
                        </Box>
                      </td>
                      <td style={{ ...BODY_CELL_STYLE, color: '#475569', fontSize: '0.725rem', fontWeight: 500, lineHeight: 1.35 }}>
                        {d.reason}
                      </td>
                      <td style={{ ...BODY_CELL_STYLE, fontWeight: 600, fontSize: '0.75rem', color: '#334155' }}>
                        {d.barangay}
                      </td>
                      <td style={{ ...BODY_CELL_STYLE, fontWeight: 600, fontSize: '0.75rem', color: '#1e293b' }}>
                        {d.by}
                      </td>
                      <td style={{ ...BODY_CELL_STYLE, color: '#64748b', fontSize: '0.725rem', fontWeight: 500 }}>
                        {d.at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Transaction Details Modal matching Prototype claimDetailBody ── */}
      <Dialog
        open={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
            Transaction Details
          </Typography>
          <IconButton size="small" onClick={() => setClaimModalOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedClaim && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Item Summary Banner */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '1rem',
                  backgroundColor: '#f8faf6',
                  border: '1px solid #dbe3d6',
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dbe3d6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2e6022',
                  }}
                >
                  {(() => {
                    const ModalIcon = getTypeIcon(selectedClaim.type)
                    return <ModalIcon sx={{ fontSize: 26 }} />
                  })()}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    {selectedClaim.itemName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                    {selectedClaim.listingId} · {selectedClaim.condition} condition
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.35,
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor:
                      selectedClaim.status === 'Picked Up'
                        ? '#f1f4f0'
                        : selectedClaim.status === 'Reserved'
                          ? '#f0f9ff'
                          : '#fff1f2',
                    color:
                      selectedClaim.status === 'Picked Up'
                        ? '#2e6022'
                        : selectedClaim.status === 'Reserved'
                          ? '#0369a1'
                          : '#be123c',
                    border: `1px solid ${
                      selectedClaim.status === 'Picked Up'
                        ? '#c5dcba'
                        : selectedClaim.status === 'Reserved'
                          ? '#bae6fd'
                          : '#fecdd3'
                    }`,
                  }}
                >
                  {selectedClaim.status}
                </Box>
              </Box>

              {/* Reservation & Pick-up Details Card */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '1rem',
                  border: '1px solid #dbe3d6',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4f8a24', mb: 0.5 }}>
                  <ReceiptLongRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Reservation &amp; Pick-Up Ledger
                  </Typography>
                </Box>

                {[
                  { label: 'Transaction', value: selectedClaim.id },
                  { label: 'Reserved by', value: `${selectedClaim.residentName} (${selectedClaim.residentEmail})` },
                  { label: 'Barangay', value: selectedClaim.barangay },
                  { label: 'Pick-up Site', value: selectedClaim.siteName },
                  { label: 'Pick-up Schedule', value: `${selectedClaim.pickupDate} · ${selectedClaim.slot}` },
                  { label: 'Reserved On', value: selectedClaim.reservedAt },
                  {
                    label: 'Pick-up Code',
                    value:
                      selectedClaim.status === 'Picked Up' ? (
                        <span
                          key="code-verified"
                          style={{
                            fontFamily: 'monospace',
                            letterSpacing: '0.12em',
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: '#f1f4f0',
                            color: '#2e6022',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                          }}
                        >
                          {selectedClaim.pickupCode || 'VERIFIED'}
                        </span>
                      ) : (
                        <span
                          key="code-hidden"
                          style={{
                            fontFamily: 'monospace',
                            letterSpacing: '0.18em',
                            color: '#94a3b8',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                          }}
                        >
                          •••••••
                        </span>
                      ),
                  },
                  ...(selectedClaim.resolvedAt ? [{ label: 'Resolved On', value: selectedClaim.resolvedAt }] : []),
                  {
                    label: 'Proof Photo',
                    value: selectedClaim.proofPhoto ? (
                      <Box key="photo-proof" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ color: '#2e6022', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} /> Uploaded &amp; Stored
                        </span>
                        {selectedClaim.proofUrl && (
                          <a
                            href={resolveMediaUrl(selectedClaim.proofUrl)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, textDecoration: 'underline' }}
                          >
                            View Photo
                          </a>
                        )}
                      </Box>
                    ) : selectedClaim.status === 'Picked Up' ? (
                      <span key="photo-pending" style={{ color: '#b45309', fontWeight: 700, fontSize: '0.78rem' }}>
                        Awaiting resident upload
                      </span>
                    ) : (
                      '—'
                    ),
                  },
                ].map((row, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.75,
                      borderBottom: '1px solid #f1f5f9',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>{row.label}</Typography>
                    <Typography component="div" sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!isSuperAdmin && selectedClaim?.status === 'Reserved' ? (
            <ButtonBase
              onClick={() => handleReleaseClaim(selectedClaim)}
              sx={{
                px: 2,
                py: 0.9,
                borderRadius: '0.75rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontWeight: 700,
                fontSize: '0.75rem',
                '&:hover': { backgroundColor: '#fecaca' },
              }}
            >
              Release back to Reuse Hub
            </ButtonBase>
          ) : (
            <Box />
          )}
          <ButtonBase
            onClick={() => setClaimModalOpen(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            Close
          </ButtonBase>
        </DialogActions>
      </Dialog>

      {/* ── Verify Pick-Up PIN + Resident Identity Confirmation Modal ── */}
      <Dialog
        open={verifyModalOpen}
        onClose={() => !isVerifying && !isLookingUp && setVerifyModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '0.75rem',
                backgroundColor: '#f1f4f0',
                color: '#2e6022',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {verifyStep === 'identity' ? (
                <VerifiedUserRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <QrCodeScannerRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', lineHeight: 1.2 }}>
                {verifyStep === 'identity'
                  ? 'Confirm Resident Identity'
                  : 'Verify Resident Pick-Up'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {verifyStep === 'identity'
                  ? 'Step 2 of 2 • Match claimant identity before releasing item'
                  : 'Step 1 of 2 • Enter pick-up code to verify reservation'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setVerifyModalOpen(false)}
            disabled={isVerifying || isLookingUp}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {verifyStep === 'code' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              {verifyingClaim ? (
                <Box sx={{ p: 2, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#4f8a24', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                    Selected Transaction · {verifyingClaim.id}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    {verifyingClaim.itemName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.35 }}>
                    Pickup Facility: <b>{verifyingClaim.siteName}</b>
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.35 }}>
                    Resident details will be revealed after the pick-up code matches.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 1.75, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                    Enter any resident&apos;s reservation code (e.g. <b>ECO-4821</b>) to look up the reserved item and confirm their identity.
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Official Verification Code
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 1.25 }}>
                  Enter the pick-up code presented by the resident:
                </Typography>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ECO-XXXX"
                  value={inputPickupCode}
                  onChange={(e) => {
                    setInputPickupCode(e.target.value.toUpperCase())
                    if (verifyError) setVerifyError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLookingUp) {
                      e.preventDefault()
                      void handleLookupCode()
                    }
                  }}
                  style={{
                    width: '100%',
                    height: 52,
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textAlign: 'center',
                    borderRadius: '0.75rem',
                    border: '1.5px solid #dbe3d6',
                    backgroundColor: '#ffffff',
                    fontFamily: 'monospace',
                    color: '#1e2e1a',
                    outline: 'none',
                    textTransform: 'uppercase',
                  }}
                />
              </Box>

              {verifyError && (
                <Alert severity="error" sx={{ borderRadius: '0.75rem', fontSize: '0.8125rem' }}>
                  {verifyError}
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#166534' }}>
                      Code Verified: {lookupResult?.pickupCode || normalizeVerifyCode(inputPickupCode)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                      {lookupResult?.item?.title || verifyingClaim?.itemName} ({lookupResult?.transactionNumber || verifyingClaim?.id})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: '0.9rem',
                  border: '1px solid #dbe3d6',
                  backgroundColor: '#f8faf6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e6022' }}>
                  <BadgeRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Reserving Resident Identity Check
                  </Typography>
                </Box>

                {[
                  {
                    label: 'Full Name',
                    value: lookupResult?.claimant?.fullName || verifyingClaim?.residentName || '—',
                    highlight: true,
                  },
                  {
                    label: 'Email',
                    value: lookupResult?.claimant?.email || verifyingClaim?.residentEmail || '—',
                  },
                  {
                    label: 'Contact Number',
                    value: lookupResult?.claimant?.phone || verifyingClaim?.residentPhone || 'Not provided',
                  },
                  {
                    label: 'Barangay / Base',
                    value: lookupResult?.claimant?.baseName || verifyingClaim?.barangay || 'Barangay Commonwealth',
                  },
                  {
                    label: 'Address',
                    value: lookupResult?.claimant?.address || verifyingClaim?.residentAddress || 'Not provided',
                  },
                  {
                    label: 'ID / Account Code',
                    value:
                      lookupResult?.claimant?.validIdType && lookupResult?.claimant?.validIdNumber
                        ? `${lookupResult.claimant.validIdType}: ${lookupResult.claimant.validIdNumber}`
                        : lookupResult?.claimant?.idCode ||
                          verifyingClaim?.residentIdCode ||
                          'Ask for valid Barangay/Gov ID',
                  },
                  {
                    label: 'Pickup Facility',
                    value: lookupResult?.reservation?.siteName || verifyingClaim?.siteName || 'Commonwealth Area 1 Eco-Hub',
                  },
                ].map((row) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      py: 0.5,
                      borderBottom: '1px solid #e7ede3',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                      {row.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        color: row.highlight ? '#0f172a' : '#1e293b',
                        fontWeight: row.highlight ? 800 : 700,
                        textAlign: 'right',
                      }}
                    >
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                component="label"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  p: 1.5,
                  borderRadius: '0.75rem',
                  border: identityConfirmed ? '1.5px solid #4f8a24' : '1.5px solid #dbe3d6',
                  backgroundColor: identityConfirmed ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={identityConfirmed}
                  onChange={(e) => {
                    setIdentityConfirmed(e.target.checked)
                    if (verifyError) setVerifyError(null)
                  }}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: '#2e6022', cursor: 'pointer' }}
                />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                  I checked the resident&apos;s ID / account details and confirmed this is the same person who reserved the item.
                </Typography>
              </Box>

              {verifyError && (
                <Alert severity="error" sx={{ borderRadius: '0.75rem', fontSize: '0.8125rem' }}>
                  {verifyError}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: 'space-between' }}>
          {verifyStep === 'identity' ? (
            <ButtonBase
              onClick={() => {
                setVerifyStep('code')
                setVerifyError(null)
              }}
              disabled={isVerifying}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.8125rem',
                gap: 0.5,
                '&:hover': { backgroundColor: '#e2e8f0' },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              <span>Re-enter Code</span>
            </ButtonBase>
          ) : (
            <ButtonBase
              onClick={() => setVerifyModalOpen(false)}
              disabled={isLookingUp}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.8125rem',
                '&:hover': { backgroundColor: '#e2e8f0' },
              }}
            >
              Cancel
            </ButtonBase>
          )}

          {verifyStep === 'code' ? (
            <ButtonBase
              onClick={handleLookupCode}
              disabled={isLookingUp}
              sx={{
                px: 3,
                py: 1,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                '&:hover': { opacity: 0.95 },
                '&:disabled': { opacity: 0.5 },
              }}
            >
              {isLookingUp ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Check Code & Resident'}
            </ButtonBase>
          ) : (
            <ButtonBase
              onClick={handleVerifySubmit}
              disabled={isVerifying || !identityConfirmed}
              sx={{
                px: 3,
                py: 1,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                '&:hover': { opacity: 0.95 },
                '&:disabled': { opacity: 0.45 },
              }}
            >
              {isVerifying ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                'Confirm Identity & Mark Picked Up'
              )}
            </ButtonBase>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Snackbar Feedback ── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: '0.75rem' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}

export default AdminTransactionsPage

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
import { adminApi, getCachedUser, type AdminTransactionItem } from '@/lib/api'

type TxTab = 'claims' | 'listings' | 'disposals'

interface ClaimRecord {
  id: string
  listingId: string
  itemName: string
  type: string
  condition: string
  residentName: string
  residentEmail: string
  barangay: string
  siteName: string
  pickupDate: string
  slot: string
  pickupCode: string
  status: 'Reserved' | 'Picked Up' | 'Expired'
  reservedAt: string
  resolvedAt?: string | null
  proofPhoto?: boolean
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

const INITIAL_CLAIMS: ClaimRecord[] = [
  {
    id: 'TX-0142',
    listingId: 'RH-0104',
    itemName: 'Samsung Galaxy A12 (Functional)',
    type: 'Mobile Phone',
    condition: 'Good',
    residentName: 'Juan Dela Cruz',
    residentEmail: 'juan.delacruz@gmail.com',
    barangay: 'Commonwealth',
    siteName: 'Commonwealth Central MRF (Base 1)',
    pickupDate: '2026-11-20',
    slot: '10:00 AM – 12:00 PM',
    pickupCode: 'ECO-2112',
    status: 'Reserved',
    reservedAt: '2026-11-18 10:24 AM',
    proofPhoto: false,
  },
  {
    id: 'TX-0141',
    listingId: 'RH-0098',
    itemName: 'Acer Aspire 5 Battery & Power Brick',
    type: 'Laptop',
    condition: 'Fair',
    residentName: 'Maria Santos',
    residentEmail: 'maria.santos@gmail.com',
    barangay: 'Batasan Hills',
    siteName: 'Batasan Hills MRF Annex',
    pickupDate: '2026-11-19',
    slot: '01:00 PM – 03:00 PM',
    pickupCode: 'ECO-9182',
    status: 'Picked Up',
    reservedAt: '2026-11-16 02:15 PM',
    resolvedAt: '2026-11-19 01:45 PM',
    proofPhoto: true,
  },
  {
    id: 'TX-0140',
    listingId: 'RH-0092',
    itemName: 'Dell 24" LED Monitor (Power Cable Included)',
    type: 'Monitor / TV',
    condition: 'Like New',
    residentName: 'Ricardo Dalisay',
    residentEmail: 'ricardo.d@yahoo.com',
    barangay: 'Payatas',
    siteName: 'Payatas Solid Waste Hub',
    pickupDate: '2026-11-15',
    slot: '08:00 AM – 10:00 AM',
    pickupCode: 'ECO-3341',
    status: 'Expired',
    reservedAt: '2026-11-11 09:30 AM',
    resolvedAt: '2026-11-16 12:00 AM',
    proofPhoto: false,
  },
  {
    id: 'TX-0139',
    listingId: 'RH-0089',
    itemName: 'Logitech Mechanical Keyboard & Mouse',
    type: 'Charger & Cables',
    condition: 'Good',
    residentName: 'Elena Ramos',
    residentEmail: 'elena.ramos@outlook.com',
    barangay: 'Commonwealth',
    siteName: 'Ecoville Covered Court Station',
    pickupDate: '2026-11-18',
    slot: '03:00 PM – 05:00 PM',
    pickupCode: 'ECO-7721',
    status: 'Picked Up',
    reservedAt: '2026-11-15 11:10 AM',
    resolvedAt: '2026-11-18 03:22 PM',
    proofPhoto: true,
  },
  {
    id: 'TX-0138',
    listingId: 'RH-0084',
    itemName: 'Anker PowerCore 20000mAh Power Bank',
    type: 'Battery / Power Bank',
    condition: 'Fair',
    residentName: 'Mark Anthony Reyes',
    residentEmail: 'mark.reyes@gmail.com',
    barangay: 'Holy Spirit',
    siteName: 'Holy Spirit Drop Point',
    pickupDate: '2026-11-21',
    slot: '10:00 AM – 12:00 PM',
    pickupCode: 'ECO-1942',
    status: 'Reserved',
    reservedAt: '2026-11-18 04:30 PM',
    proofPhoto: false,
  },
]

const INITIAL_LISTINGS: ListingRecord[] = [
  { id: 'RH-0104', itemName: 'Samsung Galaxy A12 (Functional)', type: 'Mobile Phone', condition: 'Good', barangay: 'Commonwealth', siteName: 'Commonwealth Central MRF (Base 1)', listedAt: '2026-11-17', status: 'Reserved' },
  { id: 'RH-0103', itemName: 'Asus Chromebook C202', type: 'Laptop', condition: 'Fair', barangay: 'Commonwealth', siteName: 'Commonwealth Central MRF (Base 1)', listedAt: '2026-11-17', status: 'Available' },
  { id: 'RH-0102', itemName: 'Philips 22-inch LCD Monitor', type: 'Monitor / TV', condition: 'Good', barangay: 'Batasan Hills', siteName: 'Batasan Hills MRF Annex', listedAt: '2026-11-16', status: 'Available' },
  { id: 'RH-0101', itemName: 'Xiaomi Mi Band 5 + USB Charger', type: 'Mobile Phone', condition: 'Like New', barangay: 'Payatas', siteName: 'Payatas Solid Waste Hub', listedAt: '2026-11-16', status: 'Available' },
  { id: 'RH-0098', itemName: 'Acer Aspire 5 Battery & Power Brick', type: 'Laptop', condition: 'Fair', barangay: 'Batasan Hills', siteName: 'Batasan Hills MRF Annex', listedAt: '2026-11-15', status: 'Claimed' },
  { id: 'RH-0092', itemName: 'Dell 24" LED Monitor', type: 'Monitor / TV', condition: 'Like New', barangay: 'Payatas', siteName: 'Payatas Solid Waste Hub', listedAt: '2026-11-10', status: 'Available' },
]

const INITIAL_DISPOSALS: DisposalRecord[] = [
  { id: 'DSP-0042', itemName: 'Swollen Li-Ion Laptop Pack', type: 'Battery / Power Bank', requestId: 'REQ-0211', hazard: 'High', reason: 'Severe thermal bulge · fire risk', by: 'Kgd. Maria Santos', barangay: 'Commonwealth', at: '2026-11-18', kg: 1.2 },
  { id: 'DSP-0041', itemName: 'Water-Damaged HP Motherboard', type: 'Laptop', requestId: 'REQ-0208', hazard: 'Medium', reason: 'Corroded traces and charred power IC', by: 'Kgd. Victor Lim', barangay: 'Batasan Hills', at: '2026-11-17', kg: 0.8 },
  { id: 'DSP-0040', itemName: 'CRT Monitor Shattered Vacuum Tube', type: 'Monitor / TV', requestId: 'REQ-0199', hazard: 'High', reason: 'Lead phosphor exposure risk', by: 'Kgd. Paolo Mendoza', barangay: 'Payatas', at: '2026-11-16', kg: 14.5 },
  { id: 'DSP-0039', itemName: 'Burnt Microwave Transformer', type: 'Small Appliance', requestId: 'REQ-0194', hazard: 'Medium', reason: 'Insulation breakdown & short circuit', by: 'Kgd. Maria Santos', barangay: 'Commonwealth', at: '2026-11-15', kg: 5.4 },
]

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
  const localIds = new Set(mappedLocalReservations.map((m) => m.id))
  return [...mappedLocalReservations, ...INITIAL_CLAIMS.filter((p) => !localIds.has(p.id))]
}

export const AdminTransactionsPage: FC = () => {
  const [tab, setTab] = useState<TxTab>('claims')
  const [claims, setClaims] = useState<ClaimRecord[]>(getInitialClaims)
  const [listings] = useState<ListingRecord[]>(INITIAL_LISTINGS)
  const [disposals] = useState<DisposalRecord[]>(INITIAL_DISPOSALS)

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
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const currentUser = getCachedUser()
  const isSuperAdmin =
    (currentUser?.role || (typeof window !== 'undefined' ? localStorage.getItem('ecobyte_user_role') : '') || '').toUpperCase() ===
    'ADMIN'

  // Load live transactions from backend if available
  useEffect(() => {
    let active = true

    adminApi
      .getTransactions({ search })
      .then((data: AdminTransactionItem[]) => {
        if (!active || !data || data.length === 0) return
        const mappedLiveClaims: ClaimRecord[] = data.map((d) => ({
          id: d.transactionNumber || d.id,
          listingId: d.rawId || 'RH-LIVE',
          itemName: d.itemName,
          type: d.category || 'Electronic',
          condition: 'Inspected',
          residentName: d.residentName,
          residentEmail: d.residentEmail,
          barangay: 'Commonwealth',
          siteName: d.siteName,
          pickupDate: d.dateSlot?.split(' ')[0] || new Date().toISOString().slice(0, 10),
          slot: d.dateSlot?.split(' ').slice(1).join(' ') || '10:00 AM – 12:00 PM',
          pickupCode: d.pickupCode || '',
          status:
            (d.status || '').toLowerCase() === 'completed'
              ? 'Picked Up'
              : (d.status || '').toLowerCase() === 'expired'
                ? 'Expired'
                : 'Reserved',
          reservedAt: d.createdAt || 'Recent',
          resolvedAt: (d.status || '').toLowerCase() === 'completed' ? 'Verified' : null,
          proofPhoto: (d.status || '').toLowerCase() === 'completed',
        }))

        // Merge live claims with local and initial prototype data
        setClaims((prev) => {
          const ids = new Set(mappedLiveClaims.map((m) => m.id))
          return [...mappedLiveClaims, ...prev.filter((p) => !ids.has(p.id))]
        })
      })
      .catch((err) => {
        console.warn('Using prototype transaction dataset:', err)
      })

    return () => {
      active = false
    }
  }, [search])

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

  const handleOpenVerifyModal = (claim: ClaimRecord) => {
    setVerifyingClaim(claim)
    setInputPickupCode('')
    setVerifyError(null)
    setVerifyModalOpen(true)
  }

  const handleVerifySubmit = async () => {
    if (!verifyingClaim) return
    const raw = inputPickupCode.trim().toUpperCase()
    if (!raw) {
      setVerifyError('Please enter the verification code.')
      return
    }

    // Auto-normalize if user typed without hyphen or only digits
    let normalized = raw
    if (/^\d{4}$/.test(raw)) {
      normalized = `ECO-${raw}`
    } else if (/^ECO\d{4}$/.test(raw)) {
      normalized = `ECO-${raw.slice(3)}`
    }

    const cleanInput = raw.replace(/[^A-Z0-9]/g, '')
    const cleanTarget = (verifyingClaim.pickupCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    const inputDigits = cleanInput.replace(/^ECO/, '')
    const targetDigits = cleanTarget.replace(/^ECO/, '')

    // Check if the input code matches another reservation in the system
    const matchingOtherClaim = claims.find((c) => {
      if (c.id === verifyingClaim.id || !c.pickupCode) return false
      const cClean = c.pickupCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
      const cDigits = cClean.replace(/^ECO/, '')
      return (
        cClean === cleanInput ||
        (cleanInput.length === 4 && cDigits === cleanInput) ||
        (cDigits.length === 4 && inputDigits === cDigits)
      )
    })

    const isTargetMatch =
      Boolean(cleanTarget) &&
      (cleanInput === cleanTarget ||
        (cleanInput.length === 4 && targetDigits === cleanInput) ||
        (inputDigits.length === 4 && targetDigits === inputDigits))

    if (matchingOtherClaim || !isTargetMatch) {
      setVerifyError('Reject: Verification code does not match this reservation.')
      return
    }

    setIsVerifying(true)
    setVerifyError(null)

    try {
      const res = await adminApi.verifyPickupCode({
        claimId: verifyingClaim.id,
        pickupCode: normalized,
      })

      if (!res.matched || !res.success) {
        setVerifyError(res.error || 'Reject: Verification code does not match this reservation.')
        setIsVerifying(false)
        return
      }

      setClaims((prev) =>
        prev.map((c) =>
          c.id === verifyingClaim.id
            ? {
                ...c,
                status: 'Picked Up',
                resolvedAt: 'Verified Just Now',
                proofPhoto: true,
              }
            : c
        )
      )

      try {
        const stored = localStorage.getItem('ecobyte_user_reservations')
        if (stored) {
          const list = JSON.parse(stored)
          const updated = list.map((r: any) =>
            r.pickupCode === verifyingClaim.pickupCode ||
            r.id === verifyingClaim.listingId ||
            `CLAIM-${r.id}` === verifyingClaim.id
              ? { ...r, status: 'CLAIMED' }
              : r
          )
          localStorage.setItem('ecobyte_user_reservations', JSON.stringify(updated))
        }
      } catch {
        // Ignore local storage errors
      }

      setToast({
        message: `Pick-up verified for ${verifyingClaim.itemName}! Status updated to Picked Up.`,
        severity: 'success',
      })
      setVerifyModalOpen(false)
    } catch {
      // Local check fallback
      if (isTargetMatch) {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === verifyingClaim.id
              ? {
                  ...c,
                  status: 'Picked Up',
                  resolvedAt: 'Verified Just Now',
                  proofPhoto: true,
                }
              : c
          )
        )

        try {
          const stored = localStorage.getItem('ecobyte_user_reservations')
          if (stored) {
            const list = JSON.parse(stored)
            const updated = list.map((r: any) =>
              r.pickupCode === verifyingClaim.pickupCode ||
              r.id === verifyingClaim.listingId ||
              `CLAIM-${r.id}` === verifyingClaim.id
                ? { ...r, status: 'CLAIMED' }
                : r
            )
            localStorage.setItem('ecobyte_user_reservations', JSON.stringify(updated))
          }
        } catch {
          // Ignore local storage errors
        }

        setToast({
          message: `Pick-up verified for ${verifyingClaim.itemName}! Status updated to Picked Up.`,
          severity: 'success',
        })
        setVerifyModalOpen(false)
      } else {
        setVerifyError('Reject: Verification code does not match this reservation.')
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>
            <VisibilityRoundedIcon sx={{ fontSize: 18, color: '#4f8a24' }} />
            <span>
              {isSuperAdmin ? 'View-only · Super Admin Scope' : 'Official Portal Scope'}
            </span>
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
                placeholder={tab === 'claims' ? 'Search TX, item, resident…' : 'Search keyword…'}
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
        <Box sx={{ overflowX: 'auto', mx: -3, px: 3 }}>
          {tab === 'claims' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Transaction</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resident</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Barangay</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pick-Up Site</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Schedule</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>No transactions match your filters.</Typography>
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((c) => {
                    const ItemIcon = getTypeIcon(c.type)
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {c.id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 180 }}>
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                backgroundColor: '#f1f4f0',
                                color: '#2e6022',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <ItemIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.2 }}>
                                {c.itemName}
                              </Typography>
                              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                                {c.listingId} · {c.condition}
                              </Typography>
                            </Box>
                          </Box>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                          {c.residentName}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                          {c.barangay}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {c.siteName}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                            {c.pickupDate}
                          </Typography>
                          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                            {c.slot}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.25,
                              py: 0.35,
                              borderRadius: '9999px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
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
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <ButtonBase
                              onClick={() => handleOpenClaimModal(c)}
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '0.5rem',
                                border: '1px solid #dbe3d6',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                '&:hover': { backgroundColor: '#f8faf6' },
                              }}
                            >
                              View
                            </ButtonBase>

                            {c.status === 'Reserved' && (
                              <ButtonBase
                                onClick={() => handleOpenVerifyModal(c)}
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '0.5rem',
                                  background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  gap: 0.5,
                                  '&:hover': { opacity: 0.95 },
                                }}
                              >
                                <QrCodeScannerRoundedIcon sx={{ fontSize: 14 }} />
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
            </table>
          )}

          {tab === 'listings' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Listing</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Condition</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Barangay</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pick-Up Site</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Listed Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
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
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{l.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                backgroundColor: '#f1f4f0',
                                color: '#2e6022',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <ItemIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>{l.itemName}</Typography>
                              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>{l.type}</Typography>
                            </Box>
                          </Box>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>{l.condition}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>{l.barangay}</td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.75rem' }}>{l.siteName}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500, color: '#334155' }}>{l.listedAt}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.25,
                              py: 0.35,
                              borderRadius: '9999px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
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
            </table>
          )}

          {tab === 'disposals' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Record</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Item &amp; Request</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hazard</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Barangay</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Inspected By</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
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
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{d.id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>{d.itemName}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {d.type} · {d.requestId}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.35,
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
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
                      <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>
                        {d.reason}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                        {d.barangay}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                        {d.by}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                        {d.at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                      <span key="photo-proof" style={{ color: '#2e6022', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} /> Uploaded &amp; Stored
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

        <DialogActions sx={{ px: 3, pb: 3 }}>
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

      {/* ── Verify Pick-Up PIN Modal ── */}
      <Dialog
        open={verifyModalOpen}
        onClose={() => !isVerifying && setVerifyModalOpen(false)}
        maxWidth="xs"
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
              <QrCodeScannerRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              Verify Resident Pick-Up
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setVerifyModalOpen(false)} disabled={isVerifying}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {verifyingClaim && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ p: 2, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  {verifyingClaim.itemName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                  Reserving Resident: <b>{verifyingClaim.residentName}</b>
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                  Pickup Facility: <b>{verifyingClaim.siteName}</b>
                </Typography>
              </Box>

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
                  onChange={(e) => setInputPickupCode(e.target.value.toUpperCase())}
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
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <ButtonBase
            onClick={() => setVerifyModalOpen(false)}
            disabled={isVerifying}
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

          <ButtonBase
            onClick={handleVerifySubmit}
            disabled={isVerifying}
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
            {isVerifying ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Confirm Pick-Up'}
          </ButtonBase>
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

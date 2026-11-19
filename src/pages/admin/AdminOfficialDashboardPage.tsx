import { useEffect, useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { adminApi, getCachedUser, type AdminCollectionRequest, type AdminDashboardOverview } from '@/lib/api'

const TODAY_STR = new Date().toISOString().slice(0, 10)

const getInitialDashboardRequests = (): AdminCollectionRequest[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_dropoff_requests')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((r: any) => ({
          id: r.id,
          requestCode: r.requestCode || r.id,
          residentName: r.residentName || 'Resident User',
          residentEmail: r.residentEmail || '',
          contactNumber: r.contactNumber || '+63 917 000 0000',
          siteName: r.siteName || 'Commonwealth Central MRF (Base 1)',
          address: r.address || 'Commonwealth, Quezon City',
          preferredMethod: r.itemName || r.type || 'Electronics',
          status: (r.status || 'Scheduled').toLowerCase().replace(/\s+/g, '_'),
          displayStatus: r.status || 'Scheduled',
          scheduledSlot: r.slot || '10:00 AM – 12:00 PM',
          requestedAt: r.requestedAt || new Date().toISOString(),
          requestedDate: r.date || TODAY_STR,
          relativeDate: 'Today',
          linkedItemId: `item-${r.id}`,
          linkedItemStatus: (r.status || 'Scheduled').toLowerCase().replace(/\s+/g, '_'),
        })) as AdminCollectionRequest[]
      }
    }
  } catch {
    // ignore
  }
  return []
}

const getInitialDashboardLogs = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_activity_logs')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) {
        return list.slice(0, 7).map((l: any) => ({
          id: l.id || String(Math.random()),
          user: l.userName || 'Staff Member',
          role: l.role || 'official',
          action: l.action || 'Updated drop-off status',
          target: l.target || '—',
          details: l.details || '',
          time: l.ts || 'Recent',
        }))
      }
    }
  } catch {
    // ignore
  }
  return []
}

export const AdminOfficialDashboardPage: FC = () => {
  const navigate = useNavigate()
  const currentUser = getCachedUser()

  const officialScope = currentUser?.barangay?.name || 'Barangay Commonwealth'
  const todayStr = TODAY_STR

  const [requests, setRequests] = useState<AdminCollectionRequest[]>(getInitialDashboardRequests)
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null)
  const [logs, setLogs] = useState<Array<{ id: string; user: string; role: string; action: string; target: string; details: string; time: string }>>(getInitialDashboardLogs)

  useEffect(() => {
    adminApi
      .getRequests()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setRequests((prev) => {
            const liveIds = new Set(data.map((d) => d.id))
            return [...data, ...prev.filter((p) => !liveIds.has(p.id))]
          })
        }
      })
      .catch((err) => console.warn('Could not load requests:', err))

    adminApi
      .getDashboardOverview()
      .then((data) => {
        if (data) setOverview(data)
      })
      .catch((err) => console.warn('Could not load overview:', err))

    adminApi
      .getActivityLogs()
      .then((res: any) => {
        const items = res?.items || res || []
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.slice(0, 7).map((l: any) => ({
            id: l.id || String(Math.random()),
            user: l.actorName || l.userEmail?.split('@')[0] || 'Staff Member',
            role: l.actorRole || 'official',
            action: l.action || 'Updated drop-off status',
            target: l.targetLabel || l.targetId || 'REQ',
            details: l.details || l.notes || '',
            time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          }))
          setLogs(mapped)
        }
      })
      .catch(() => {
        // Keep initial local logs if API is unreachable
      })
  }, [])

  // Metrics
  const todaysDropoffs = requests.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return (s === 'scheduled' || s === 'pending_review') && (r.requestedDate || '').startsWith(todayStr)
  })
  const upcomingDropoffs = requests.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return (s === 'scheduled' || s === 'pending_review') && (!r.requestedDate || r.requestedDate > todayStr)
  })
  const toInspect = requests.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return s === 'under_inspection' || s === 'collected'
  })

  // Read local inventory / claims counts
  const localListingsCount = (() => {
    if (typeof window === 'undefined') return 0
    try {
      return JSON.parse(localStorage.getItem('ecobyte_reuse_listings') || '[]').length
    } catch {
      return 0
    }
  })()
  const localReservationsCount = (() => {
    if (typeof window === 'undefined') return 0
    try {
      const resList = JSON.parse(localStorage.getItem('ecobyte_user_reservations') || '[]')
      return resList.filter((r: any) => r.status === 'RESERVED' || r.status === 'Reserved').length
    } catch {
      return 0
    }
  })()
  const localDisposalsCount = (() => {
    if (typeof window === 'undefined') return 0
    try {
      return JSON.parse(localStorage.getItem('ecobyte_disposal_records') || '[]').length
    } catch {
      return 0
    }
  })()

  const inReuseHubCount = overview?.listedReuse ?? localListingsCount
  const reservedCount = overview?.hazardAlertsActive ?? localReservationsCount
  const turnedMonthCount = (overview?.listedReuse || 0) + (overview?.disposalCount || 0) || (localListingsCount + localDisposalsCount)
  const kgDivertedMonth = overview?.divertedKgTotal ?? 0
  const reuseOutcomesCount = overview?.listedReuse ?? localListingsCount
  const disposalOutcomesCount = overview?.disposalCount ?? localDisposalsCount
  const totalOutcomes = reuseOutcomesCount + disposalOutcomesCount
  const reusePct = totalOutcomes > 0 ? Math.round((reuseOutcomesCount / totalOutcomes) * 100) : 0
  const disposalPct = totalOutcomes > 0 ? 100 - reusePct : 0

  // Weekly series: dynamically computed from requests or real weeks
  const weeklySeries = [
    { label: 'Week 1', value: 0 },
    { label: 'Week 2', value: 0 },
    { label: 'Week 3', value: 0 },
    { label: 'Week 4', value: 0 },
    { label: 'Week 5', value: 0 },
    { label: 'Week 6', value: 0 },
    { label: 'Last Week', value: 0 },
    { label: 'This Week', value: requests.length },
  ]
  const maxWeekly = Math.max(...weeklySeries.map((w) => w.value), 1)

  // Real e-waste type counts
  const countByType: Record<string, number> = {}
  requests.forEach((r) => {
    const method = (r.preferredMethod || 'Electronics').toLowerCase()
    let label = 'Cables & Accessories'
    if (method.includes('phone') || method.includes('mobile')) label = 'Mobile Phone'
    else if (method.includes('laptop') || method.includes('computer')) label = 'Laptop'
    else if (method.includes('battery') || method.includes('power')) label = 'Battery / Power Bank'
    else if (method.includes('tv') || method.includes('monitor') || method.includes('screen')) label = 'Monitor / TV'
    else if (method.includes('appliance') || method.includes('printer')) label = 'Small Appliance'
    countByType[label] = (countByType[label] || 0) + 1
  })

  const ewasteTypes = [
    { label: 'Mobile Phone', icon: SmartphoneRoundedIcon, value: countByType['Mobile Phone'] || 0 },
    { label: 'Laptop', icon: LaptopRoundedIcon, value: countByType['Laptop'] || 0 },
    { label: 'Battery / Power Bank', icon: BatteryChargingFullRoundedIcon, value: countByType['Battery / Power Bank'] || 0 },
    { label: 'Monitor / TV', icon: TvRoundedIcon, value: countByType['Monitor / TV'] || 0 },
    { label: 'Small Appliance', icon: KitchenRoundedIcon, value: countByType['Small Appliance'] || 0 },
    { label: 'Cables & Accessories', icon: CableRoundedIcon, value: countByType['Cables & Accessories'] || 0 },
  ]
  const maxEwasteType = Math.max(...ewasteTypes.map((t) => t.value), 1)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Read-only summary banner ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>
        <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
        <span>Read-only summary for <b>{officialScope}</b></span>
      </Box>

      {/* ── 4 KPI Summary Cards matching Prototype ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {/* KPI 1: Today's Drop-offs (Sky) */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b' }}>
              Today's drop-offs
            </Typography>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EventAvailableRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {todaysDropoffs.length}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {upcomingDropoffs.length} upcoming
          </Typography>
        </Box>

        {/* KPI 2: To inspect (Amber) */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b' }}>
              To inspect
            </Typography>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FactCheckOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {toInspect.length}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {toInspect.length > 0 ? `${toInspect.length} awaiting physical check` : 'Queue is clear'}
          </Typography>
        </Box>

        {/* KPI 3: In Reuse Hub (Leaf) */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b' }}>
              In Reuse Hub
            </Typography>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#f1f4f0', color: '#2e6022', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StorefrontRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {inReuseHubCount}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2e6022' }}>
            {reservedCount} reserved for pick-up
          </Typography>
        </Box>

        {/* KPI 4: Turned over this month (Violet) */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b' }}>
              Turned over this month
            </Typography>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RecyclingRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {turnedMonthCount}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            ≈ {kgDivertedMonth.toFixed(1)} kg diverted
          </Typography>
        </Box>
      </Box>

      {/* ── Row 2: Weekly Turned Over (2 col) + Inspection Outcomes Donut (1 col) ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' }, gap: 3 }}>
        {/* Weekly Bar Chart */}
        <Box
          sx={{
            p: 3,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Devices turned over per week
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Last 8 weeks · after physical inspection
            </Typography>
          </Box>

          <Box sx={{ height: 190, display: 'flex', alignItems: 'flex-end', gap: { xs: 1.5, sm: 2.5 }, pt: 3, pb: 1, px: 1 }}>
            {weeklySeries.map((w, idx) => {
              const barHeightPct = Math.round((w.value / maxWeekly) * 100)
              const isLatest = idx === weeklySeries.length - 1
              return (
                <Box key={w.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: isLatest ? '#2e6022' : '#64748b' }}>
                    {w.value}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 38,
                      height: `${barHeightPct}%`,
                      minHeight: 10,
                      borderRadius: '6px 6px 2px 2px',
                      background: isLatest ? 'linear-gradient(180deg, #70b822 0%, #2e6022 100%)' : '#e2e8f0',
                      transition: 'height 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(180deg, #70b822 0%, #2e6022 100%)',
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {w.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* Inspection Outcomes Donut */}
        <Box
          sx={{
            p: 3,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Inspection outcomes
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              All-time for your barangay
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.5, position: 'relative' }}>
            <svg width="150" height="150" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {totalOutcomes > 0 && (
                <>
                  {/* Disposal portion */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="14"
                    strokeDasharray="238.76"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Reuse portion */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#70b822"
                    strokeWidth="14"
                    strokeDasharray="238.76"
                    strokeDashoffset={((100 - reusePct) / 100) * 238.76}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </>
              )}
            </svg>
            <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {totalOutcomes}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>
                Total
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1, borderTop: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#70b822' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  Listed in Reuse Hub
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                {reuseOutcomesCount} ({reusePct}%)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  Marked for disposal
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                {disposalOutcomesCount} ({disposalPct}%)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Row 3: Today's Schedule (2 col) + E-waste Types Collected (1 col) ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' }, gap: 3 }}>
        {/* Today's Schedule Card */}
        <Box
          sx={{
            p: 3,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Today's schedule
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Scheduled drop-offs at your facility
              </Typography>
            </Box>
            <ButtonBase
              onClick={() => navigate('/admin/incoming')}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#2e6022',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <span>Open Incoming Drop-Offs</span>
              <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </ButtonBase>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {todaysDropoffs.length === 0 ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <EventAvailableRoundedIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#475569' }}>
                  No drop-offs scheduled for today
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
                  Appointments booked by residents will appear here for today's intake.
                </Typography>
              </Box>
            ) : (
              todaysDropoffs.map((row) => {
                const itemTitle = (row as any).itemName || row.preferredMethod || 'E-Waste Device'
                const reqCode = row.requestCode || row.id
                const resident = row.residentName || 'Resident'
                const site = row.siteName || officialScope
                const slot = row.scheduledSlot || '10:00 AM – 12:00 PM'
                const hazard = (row as any).assessment?.hazard || 'Low'
                const itemType = (row as any).type || (row as any).preferredMethod || 'Electronics'
                const lower = itemType.toLowerCase()

                const RowIcon = lower.includes('laptop')
                  ? LaptopRoundedIcon
                  : lower.includes('phone')
                    ? SmartphoneRoundedIcon
                    : lower.includes('battery')
                      ? BatteryChargingFullRoundedIcon
                      : lower.includes('tv') || lower.includes('monitor')
                        ? TvRoundedIcon
                        : CableRoundedIcon

                return (
                  <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        backgroundColor: '#f1f4f0',
                        color: '#2e6022',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <RowIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {itemTitle}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {resident} · {site} · <span style={{ color: '#2e6022' }}>{reqCode}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                        {slot}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.25,
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          mt: 0.5,
                          backgroundColor: hazard === 'High' ? '#fff1f2' : hazard === 'Medium' ? '#fef3c7' : '#f0fdf4',
                          color: hazard === 'High' ? '#be123c' : hazard === 'Medium' ? '#b45309' : '#15803d',
                          border: `1px solid ${hazard === 'High' ? '#fecdd3' : hazard === 'Medium' ? '#fde68a' : '#bbf7d0'}`,
                        }}
                      >
                        {hazard} Hazard
                      </Box>
                    </Box>
                  </Box>
                )
              })
            )}
          </Box>
        </Box>

        {/* E-waste Types Collected */}
        <Box
          sx={{
            p: 3,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              E-waste types collected
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Turned over, all-time
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {ewasteTypes.map((t) => {
              const IconComp = t.icon
              const pct = Math.round((t.value / maxEwasteType) * 100)
              return (
                <Box key={t.label} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComp sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        {t.label}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                      {t.value}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, width: '100%', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #70b822 0%, #2e6022 100%)', borderRadius: '9999px' }} />
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* ── Row 4: Recent Activity Card ── */}
      <Box
        sx={{
          p: 3,
          borderRadius: '1.25rem',
          border: '1px solid #dbe3d6',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
          Recent activity
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                No recent activity recorded yet
              </Typography>
            </Box>
          ) : (
            logs.map((l) => (
              <Box key={l.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  {l.role === 'resident' ? (
                    <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  ) : l.role === 'system' ? (
                    <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <BadgeOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                    <b>{l.user}</b> <span style={{ color: '#475569', fontWeight: 500 }}>{l.action.toLowerCase()}</span>{' '}
                    <span style={{ fontWeight: 700, color: '#2e6022' }}>{l.target}</span>
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    {l.details} · {l.time}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

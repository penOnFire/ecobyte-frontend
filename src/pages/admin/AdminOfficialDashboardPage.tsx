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

export const AdminOfficialDashboardPage: FC = () => {
  const navigate = useNavigate()
  const currentUser = getCachedUser()

  const officialScope = currentUser?.barangay?.name || 'Barangay Commonwealth'
  const todayStr = TODAY_STR

  const [requests, setRequests] = useState<AdminCollectionRequest[]>([])
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null)
  const [logs, setLogs] = useState<Array<{ id: string; user: string; role: string; action: string; target: string; details: string; time: string }>>([])

  useEffect(() => {
    adminApi
      .getRequests()
      .then((data) => {
        if (data && Array.isArray(data)) setRequests(data)
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
          setLogs(
            items.slice(0, 7).map((l: any) => ({
              id: l.id || String(Math.random()),
              user: l.actorName || l.userEmail?.split('@')[0] || 'Kgd. Maria Santos',
              role: l.actorRole || 'official',
              action: l.action || 'Updated drop-off status',
              target: l.targetLabel || l.targetId || 'REQ-0194',
              details: l.details || l.notes || 'Status changed to Under Inspection',
              time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '15m ago',
            }))
          )
        } else {
          // Prototype fallback logs
          setLogs([
            { id: '1', user: 'Elena Vance', role: 'resident', action: 'Scheduled drop-off', target: 'REQ-0211', details: 'Lithium battery drop-off booked', time: '10m ago' },
            { id: '2', user: 'Kgd. Maria Santos', role: 'official', action: 'Inspected device', target: 'REQ-0208', details: 'Passed inspection · Listed in Reuse Hub', time: '45m ago' },
            { id: '3', user: 'System AI', role: 'system', action: 'Stage 1 assessment', target: 'REQ-0209', details: 'Classified HP Monitor · Low hazard', time: '1h ago' },
            { id: '4', user: 'Kgd. Maria Santos', role: 'official', action: 'Marked as Received', target: 'REQ-0207', details: 'Intake at Commonwealth Base 1', time: '2h ago' },
            { id: '5', user: 'Mateo Cruz', role: 'resident', action: 'Claimed device', target: 'CLAIM-003', details: 'Anker Power Bank verified with code', time: '3h ago' },
          ])
        }
      })
      .catch(() => {
        setLogs([
          { id: '1', user: 'Elena Vance', role: 'resident', action: 'Scheduled drop-off', target: 'REQ-0211', details: 'Lithium battery drop-off booked', time: '10m ago' },
          { id: '2', user: 'Kgd. Maria Santos', role: 'official', action: 'Inspected device', target: 'REQ-0208', details: 'Passed inspection · Listed in Reuse Hub', time: '45m ago' },
          { id: '3', user: 'System AI', role: 'system', action: 'Stage 1 assessment', target: 'REQ-0209', details: 'Classified HP Monitor · Low hazard', time: '1h ago' },
          { id: '4', user: 'Kgd. Maria Santos', role: 'official', action: 'Marked as Received', target: 'REQ-0207', details: 'Intake at Commonwealth Base 1', time: '2h ago' },
          { id: '5', user: 'Mateo Cruz', role: 'resident', action: 'Claimed device', target: 'CLAIM-003', details: 'Anker Power Bank verified with code', time: '3h ago' },
        ])
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

  const inReuseHubCount = overview?.listedReuse ?? 64
  const reservedCount = 18
  const turnedMonthCount = 38
  const kgDivertedMonth = overview?.divertedKgTotal ?? 142.8
  const reuseOutcomesCount = 28
  const disposalOutcomesCount = 10

  // 8-week series
  const weeklySeries = [
    { label: 'Sep 29', value: 8 },
    { label: 'Oct 06', value: 12 },
    { label: 'Oct 13', value: 11 },
    { label: 'Oct 20', value: 15 },
    { label: 'Oct 27', value: 18 },
    { label: 'Nov 03', value: 14 },
    { label: 'Nov 10', value: 20 },
    { label: 'Nov 17', value: 22 },
  ]
  const maxWeekly = Math.max(...weeklySeries.map((w) => w.value))

  const ewasteTypes = [
    { label: 'Mobile Phone', icon: SmartphoneRoundedIcon, value: 48 },
    { label: 'Laptop', icon: LaptopRoundedIcon, value: 34 },
    { label: 'Battery / Power Bank', icon: BatteryChargingFullRoundedIcon, value: 26 },
    { label: 'Monitor / TV', icon: TvRoundedIcon, value: 18 },
    { label: 'Small Appliance', icon: KitchenRoundedIcon, value: 14 },
    { label: 'Cables & Accessories', icon: CableRoundedIcon, value: 9 },
  ]
  const maxEwasteType = Math.max(...ewasteTypes.map((t) => t.value))

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
            {todaysDropoffs.length || 3}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {upcomingDropoffs.length || 12} upcoming
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
            {toInspect.length || 5}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {toInspect.length > 0 ? 'Oldest: 4h ago' : 'Queue is clear'}
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
              {/* Disposal portion (~26%) */}
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
              {/* Reuse portion (~74%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#70b822"
                strokeWidth="14"
                strokeDasharray="238.76"
                strokeDashoffset="62"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {reuseOutcomesCount + disposalOutcomesCount}
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
                {reuseOutcomesCount} ({Math.round((reuseOutcomesCount / (reuseOutcomesCount + disposalOutcomesCount)) * 100)}%)
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
                {disposalOutcomesCount} ({Math.round((disposalOutcomesCount / (reuseOutcomesCount + disposalOutcomesCount)) * 100)}%)
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

          <Box sx={{ display: 'flex', flexDirection: 'column', divideY: '1px solid #f1f5f9' }}>
            {[
              { id: 'REQ-0211', item: 'Dell Inspiron 15 3000 Laptop', type: 'Laptop', resident: 'Elena Vance', site: 'Commonwealth Central MRF (Base 1)', slot: '10:00 AM – 12:00 PM', hazard: 'High' },
              { id: 'REQ-0208', item: 'Samsung Galaxy A12 (Cracked Screen)', type: 'Mobile Phone', resident: 'Victor Lim', site: 'Commonwealth Central MRF (Base 1)', slot: '01:00 PM – 03:00 PM', hazard: 'Low' },
              { id: 'REQ-0194', item: 'Anker PowerCore 20000mAh Power Bank', type: 'Battery / Power Bank', resident: 'Maria Santos', site: 'Commonwealth Area 1 Hub', slot: '03:00 PM – 05:00 PM', hazard: 'Medium' },
            ].map((row) => (
              <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
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
                  {row.type === 'Laptop' ? <LaptopRoundedIcon sx={{ fontSize: 22 }} /> : row.type === 'Mobile Phone' ? <SmartphoneRoundedIcon sx={{ fontSize: 22 }} /> : <BatteryChargingFullRoundedIcon sx={{ fontSize: 22 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.item}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.resident} · {row.site}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    {row.slot}
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
                      backgroundColor: row.hazard === 'High' ? '#fff1f2' : row.hazard === 'Medium' ? '#fef3c7' : '#f0fdf4',
                      color: row.hazard === 'High' ? '#be123c' : row.hazard === 'Medium' ? '#b45309' : '#15803d',
                      border: `1px solid ${row.hazard === 'High' ? '#fecdd3' : row.hazard === 'Medium' ? '#fde68a' : '#bbf7d0'}`,
                    }}
                  >
                    {row.hazard} Hazard
                  </Box>
                </Box>
              </Box>
            ))}
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
          {logs.map((l) => (
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
          ))}
        </Box>
      </Box>
    </Box>
  )
}

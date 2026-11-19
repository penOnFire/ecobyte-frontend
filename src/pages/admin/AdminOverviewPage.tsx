import { useEffect, useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import { adminApi, type AdminDashboardOverview } from '@/lib/api'

interface BarangayStats {
  id: string
  name: string
  requests: number
  turned: number
  pending: number
  missedRate: number
  hub: number
  disposed: number
  kg: number
}

export const AdminOverviewPage: FC = () => {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null)

  const localRequestsCount = (() => {
    if (typeof window === 'undefined') return 0
    try {
      return JSON.parse(localStorage.getItem('ecobyte_dropoff_requests') || '[]').length
    } catch {
      return 0
    }
  })()
  const localListingsCount = (() => {
    if (typeof window === 'undefined') return 0
    try {
      return JSON.parse(localStorage.getItem('ecobyte_reuse_listings') || '[]').length
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

  useEffect(() => {
    adminApi
      .getDashboardOverview()
      .then((data) => {
        if (data) setOverview(data)
      })
      .catch((err) => {
        console.warn('Could not load live overview:', err)
      })
  }, [])

  const totalRequests = overview?.totalProcessed ?? localRequestsCount
  const totalTurned = (overview?.listedReuse || 0) + (overview?.disposalCount || 0) || (localListingsCount + localDisposalsCount)
  const totalKg = overview?.divertedKgTotal ?? 0
  const totalHub = overview?.listedReuse ?? localListingsCount
  const activeRequestsCount = overview?.awaitingInspection ?? 0
  const activeUsers = overview?.hazardAlertsActive ?? 1

  const stats: BarangayStats[] = [
    { id: 'commonwealth', name: 'Commonwealth', requests: totalRequests, turned: totalTurned, pending: activeRequestsCount, missedRate: 0, hub: totalHub, disposed: overview?.disposalCount ?? localDisposalsCount, kg: totalKg },
    { id: 'batasan', name: 'Batasan Hills', requests: 0, turned: 0, pending: 0, missedRate: 0, hub: 0, disposed: 0, kg: 0 },
    { id: 'payatas', name: 'Payatas', requests: 0, turned: 0, pending: 0, missedRate: 0, hub: 0, disposed: 0, kg: 0 },
    { id: 'holyspirit', name: 'Holy Spirit', requests: 0, turned: 0, pending: 0, missedRate: 0, hub: 0, disposed: 0, kg: 0 },
    { id: 'bagongsilangan', name: 'Bagong Silangan', requests: 0, turned: 0, pending: 0, missedRate: 0, hub: 0, disposed: 0, kg: 0 },
  ]

  const maxTurned = Math.max(...stats.map((s) => s.turned), 1)

  // 8-week series
  const weeklySeries = [
    { label: 'Week 1', value: 0 },
    { label: 'Week 2', value: 0 },
    { label: 'Week 3', value: 0 },
    { label: 'Week 4', value: 0 },
    { label: 'Week 5', value: 0 },
    { label: 'Week 6', value: 0 },
    { label: 'Last Week', value: 0 },
    { label: 'This Week', value: totalTurned },
  ]
  const maxWeekly = Math.max(...weeklySeries.map((w) => w.value), 1)

  const ewasteTypes = [
    { label: 'Mobile Phone', icon: SmartphoneRoundedIcon, value: overview?.categories?.find((c) => c.name.toLowerCase().includes('phone'))?.units || 0 },
    { label: 'Laptop', icon: LaptopRoundedIcon, value: overview?.categories?.find((c) => c.name.toLowerCase().includes('laptop'))?.units || 0 },
    { label: 'Battery / Power Bank', icon: BatteryChargingFullRoundedIcon, value: overview?.categories?.find((c) => c.name.toLowerCase().includes('battery'))?.units || 0 },
    { label: 'Monitor / TV', icon: TvRoundedIcon, value: overview?.categories?.find((c) => c.name.toLowerCase().includes('monitor') || c.name.toLowerCase().includes('tv'))?.units || 0 },
    { label: 'Charger & Cables', icon: CableRoundedIcon, value: overview?.categories?.find((c) => c.name.toLowerCase().includes('cable'))?.units || 0 },
    { label: 'Small Appliance', icon: KitchenRoundedIcon, value: overview?.categories?.find((c) => c.name.toLowerCase().includes('appliance'))?.units || 0 },
  ]
  const maxType = Math.max(...ewasteTypes.map((t) => t.value), 1)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4, fontFamily: "'Quicksand', sans-serif" }}>
      {/* Scope Telemetry Notice */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>
        <VisibilityRoundedIcon sx={{ fontSize: 18, color: '#4f8a24' }} />
        <span>View-only dashboard across all barangays &amp; Commonwealth MRF stations</span>
      </Box>

      {/* 4 KPI Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {/* KPI 1: Collection Requests */}
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
            <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Collection Requests
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {totalRequests.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              {activeRequestsCount} active in progress
            </Typography>
          </Box>
        </Box>

        {/* KPI 2: Devices Turned Over */}
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
              color: '#3e6b27',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RecyclingRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Devices Turned Over
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {totalTurned.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              ≈ {totalKg.toFixed(1)} kg diverted
            </Typography>
          </Box>
        </Box>

        {/* KPI 3: Reuse Hub Items */}
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
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StorefrontRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Reuse Hub Items
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {totalHub}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              {overview?.listedReuse ? `${overview.listedReuse} listed` : 'Available in hub'}
            </Typography>
          </Box>
        </Box>

        {/* KPI 4: Active Users */}
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
              backgroundColor: '#fffbeb',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PeopleOutlineRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              Active Users
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', mt: 0.25, lineHeight: 1.1 }}>
              {activeUsers}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              7 officials · 35 residents
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Grid: 8-Week Turned Over Bar Chart & E-waste Types Horizontal Bars */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '7fr 5fr' }, gap: 3 }}>
        {/* Weekly Chart */}
        <Box sx={{ backgroundColor: '#ffffff', border: '1px solid #dbe3d6', borderRadius: '1.25rem', p: 3, boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)' }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
              Turned over per week (all barangays)
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
              Last 8 weeks · Verified intake turnover
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 2 }, height: 180, pt: 2, overflowX: 'auto' }}>
            {weeklySeries.map((w) => {
              const heightPct = (w.value / maxWeekly) * 130
              return (
                <Box key={w.label} sx={{ flex: 1, minWidth: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569' }}>
                    {w.value}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 42,
                      height: `${heightPct}px`,
                      background: 'linear-gradient(135deg, #70b822 0%, #2e6022 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'opacity 0.15s ease',
                      '&:hover': { opacity: 0.85 },
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

        {/* E-Waste Types Bars */}
        <Box sx={{ backgroundColor: '#ffffff', border: '1px solid #dbe3d6', borderRadius: '1.25rem', p: 3, boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)' }}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
              E-waste types collected
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
              Turned over, all barangays
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ewasteTypes.map((t) => {
              const Icon = t.icon
              const pct = (t.value / maxType) * 100
              return (
                <Box key={t.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, fontSize: '0.75rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#334155', fontWeight: 600 }}>
                      <Icon sx={{ fontSize: 16, color: '#64748b' }} />
                      <span>{t.label}</span>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: '#64748b' }}>{t.value}</Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 9999, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, backgroundColor: '#70b822', borderRadius: 9999 }} />
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* Barangay Summary Table */}
      <Box sx={{ backgroundColor: '#ffffff', border: '1px solid #dbe3d6', borderRadius: '1.25rem', p: 3, boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
              Barangay Summary
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
              Operational volume and diversion metrics across Quezon City hubs
            </Typography>
          </Box>
          <ButtonBase
            onClick={() => navigate('/admin/reports')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#3e6b27',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <span>Open Reports</span>
            <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
          </ButtonBase>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Barangay</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Requests</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Turned over</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: 140 }}>Volume Share</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>In progress</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Missed rate</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Reuse Hub</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Disposed</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Diverted</th>
              </tr>
            </thead>
            <tbody style={{ color: '#0f172a' }}>
              {stats.map((s) => {
                const pctOfMax = (s.turned / maxTurned) * 100
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#3e6b27' }} />
                        <span>{s.name}</span>
                      </Box>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.requests}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{s.turned}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <Box sx={{ height: 6, width: 100, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pctOfMax}%`, backgroundColor: '#70b822', borderRadius: 9999 }} />
                      </Box>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.pending}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: s.missedRate > 6 ? '#e11d48' : '#334155' }}>
                      {s.missedRate}%
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.hub}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.disposed}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#3e6b27', whiteSpace: 'nowrap' }}>
                      {s.kg.toFixed(1)} kg
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  )
}

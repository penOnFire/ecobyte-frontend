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
import { COMMONWEALTH_BASES } from '@/components/admin/adminAccessData'

interface BaseStats {
  id: string
  baseId: number
  name: string
  facility: string
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
  const [liveRequests, setLiveRequests] = useState<any[]>([])

  const localRequests = (() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('ecobyte_dropoff_requests') || '[]')
    } catch {
      return []
    }
  })()
  const localListings = (() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('ecobyte_reuse_listings') || '[]')
    } catch {
      return []
    }
  })()
  const localDisposals = (() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('ecobyte_disposal_records') || '[]')
    } catch {
      return []
    }
  })()

  useEffect(() => {
    let active = true
    adminApi
      .getDashboardOverview()
      .then((data) => {
        if (active && data) setOverview(data)
      })
      .catch((err) => {
        console.warn('Could not load live overview:', err)
      })

    adminApi
      .getRequests()
      .then((reqs) => {
        if (active && Array.isArray(reqs)) setLiveRequests(reqs)
      })
      .catch((err) => {
        console.warn('Could not load live requests:', err)
      })

    return () => {
      active = false
    }
  }, [])

  // Consolidate live requests and local storage records
  const allRequests = (() => {
    const map = new Map<string, any>()
    for (const r of liveRequests) {
      if (r && (r.id || r.requestCode)) {
        map.set(String(r.requestCode || r.id), r)
      }
    }
    for (const r of localRequests) {
      if (r && (r.id || r.requestCode)) {
        const key = String(r.requestCode || r.id)
        if (!map.has(key)) {
          map.set(key, r)
        }
      }
    }
    return Array.from(map.values())
  })()

  const resolveBaseId = (item: any): number => {
    if (!item) return 1
    const rawId = Number(item.residentBaseId ?? item.unitAreaId ?? item.baseId)
    if (rawId >= 1 && rawId <= 9) return rawId

    const str = `${item.residentBaseName || ''} ${item.siteName || ''} ${item.address || ''} ${item.location || ''} ${item.facility || ''}`.toLowerCase()
    for (let i = 1; i <= 9; i++) {
      if (str.includes(`base ${i}`) || str.includes(`base-${i}`) || str.includes(`area ${i}`)) {
        return i
      }
    }
    if (str.includes('martan')) return 2
    if (str.includes('don fabian') || str.includes('fabian')) return 3
    if (str.includes('katuparan') || str.includes('litex')) return 4
    if (str.includes('riverside') || str.includes('mrt-7')) return 5
    if (str.includes('kristong hari')) return 6
    if (str.includes('upper kamias') || str.includes('kamias')) return 7
    if (str.includes('pilot')) return 8
    if (str.includes('lupang pangako')) return 9
    return 1
  }

  const totalRequests = overview?.totalProcessed ?? allRequests.length
  const totalTurned = (overview?.listedReuse || 0) + (overview?.disposalCount || 0) || (localListings.length + localDisposals.length)
  const totalKg = overview?.divertedKgTotal ?? 0
  const totalHub = overview?.listedReuse ?? localListings.length
  const activeRequestsCount = overview?.awaitingInspection ?? 0
  const activeUsers = overview?.hazardAlertsActive ?? 1

  // Compute breakdown per Barangay Commonwealth base station (Bases 1 to 9)
  const baseStatsMap = new Map<number, {
    requests: number
    turned: number
    pending: number
    missed: number
    hub: number
    disposed: number
    kg: number
  }>()

  for (let i = 1; i <= 9; i++) {
    baseStatsMap.set(i, { requests: 0, turned: 0, pending: 0, missed: 0, hub: 0, disposed: 0, kg: 0 })
  }

  for (const r of allRequests) {
    const bId = resolveBaseId(r)
    const st = baseStatsMap.get(bId) || baseStatsMap.get(1)!
    st.requests += 1

    const statusNorm = (r.status || r.displayStatus || '').toLowerCase().replace(/[\s_-]+/g, '')
    if (statusNorm.includes('turn') || statusNorm.includes('complete')) {
      st.turned += 1
      const weight = Number(r.assessment?.impact?.kg || r.estimatedWeightKg || 1.5)
      st.kg += weight
    } else if (statusNorm.includes('sched') || statusNorm.includes('inspect') || statusNorm.includes('collect') || statusNorm.includes('progress') || statusNorm.includes('pending')) {
      st.pending += 1
    } else if (statusNorm.includes('miss')) {
      st.missed += 1
    }
  }

  for (const l of localListings) {
    const bId = resolveBaseId(l)
    const st = baseStatsMap.get(bId) || baseStatsMap.get(1)!
    st.hub += 1
  }

  for (const d of localDisposals) {
    const bId = resolveBaseId(d)
    const st = baseStatsMap.get(bId) || baseStatsMap.get(1)!
    st.disposed += 1
    const weight = Number(d.kg || 1.5)
    st.kg += weight
  }

  // Ensure Base 1 (Brgy. Hall Complex / Central MRF) captures general system-level baseline volume
  const sumReq = Array.from(baseStatsMap.values()).reduce((sum, s) => sum + s.requests, 0)
  const sumTurn = Array.from(baseStatsMap.values()).reduce((sum, s) => sum + s.turned, 0)
  const sumPend = Array.from(baseStatsMap.values()).reduce((sum, s) => sum + s.pending, 0)
  const sumHub = Array.from(baseStatsMap.values()).reduce((sum, s) => sum + s.hub, 0)
  const sumDisp = Array.from(baseStatsMap.values()).reduce((sum, s) => sum + s.disposed, 0)
  const sumKg = Array.from(baseStatsMap.values()).reduce((sum, s) => sum + s.kg, 0)

  const base1 = baseStatsMap.get(1)!
  if (totalRequests > sumReq) base1.requests += (totalRequests - sumReq)
  if (totalTurned > sumTurn) base1.turned += (totalTurned - sumTurn)
  if (activeRequestsCount > sumPend) base1.pending += (activeRequestsCount - sumPend)
  if (totalHub > sumHub) base1.hub += (totalHub - sumHub)
  if ((overview?.disposalCount ?? localDisposals.length) > sumDisp) {
    base1.disposed += ((overview?.disposalCount ?? localDisposals.length) - sumDisp)
  }
  if (totalKg > sumKg) base1.kg += (totalKg - sumKg)

  const stats: BaseStats[] = COMMONWEALTH_BASES.map((b) => {
    const bData = baseStatsMap.get(b.id) || { requests: 0, turned: 0, pending: 0, missed: 0, hub: 0, disposed: 0, kg: 0 }
    const missedRate = bData.requests > 0 ? Math.round((bData.missed / bData.requests) * 100) : 0
    return {
      id: `base-${b.id}`,
      baseId: b.id,
      name: b.name,
      facility: b.facility,
      requests: bData.requests,
      turned: bData.turned,
      pending: bData.pending,
      missedRate,
      hub: bData.hub,
      disposed: bData.disposed,
      kg: Number(bData.kg.toFixed(1)),
    }
  })

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
        <span>View-only dashboard across all Barangay Commonwealth base stations &amp; Central MRF</span>
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
              Turned over across all base stations
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

      {/* Base Stations Summary Table */}
      <Box sx={{ backgroundColor: '#ffffff', border: '1px solid #dbe3d6', borderRadius: '1.25rem', p: 3, boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
              Base Stations Summary
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
              Operational volume and diversion metrics across Barangay Commonwealth
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
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Base Station</th>
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
                const pctOfMax = maxTurned > 0 ? (s.turned / maxTurned) * 100 : 0
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#3e6b27', flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                            {s.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
                            {s.facility}
                          </Typography>
                        </Box>
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

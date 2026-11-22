import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import { COMMONWEALTH_BASES } from '@/components/admin/adminAccessData'
import { adminApi, type AdminReportsData } from '@/lib/api'

type ReportTab = 'totals' | 'requests' | 'reuse'

const BASE_FILTERS = [
  { id: '', name: 'All 9 bases (Commonwealth)' },
  ...COMMONWEALTH_BASES.map((b) => ({ id: String(b.id), name: b.name })),
]

const EMPTY_REPORTS_DATA: AdminReportsData = {
  totals: {
    totalVolumeProcessed: 0,
    totalWeightKg: 0,
    divertedKgTotal: 0,
    activeRequests: 0,
    completedRequests: 0,
    missedRequests: 0,
    diversionRatePct: 0,
  },
  ewasteType: [],
  hazardRisk: {
    total: 0,
    low: { count: 0, pct: 0 },
    medium: { count: 0, pct: 0 },
    high: { count: 0, pct: 0 },
  },
  requests: {
    total: 0,
    scheduled: 0,
    underInspection: 0,
    turnedOver: 0,
    completed: 0,
    missed: 0,
    cancelled: 0,
    fulfillmentRatePct: 0,
  },
  slotUsage: [],
  reuseHub: {
    totalListed: 0,
    reserved: 0,
    claimed: 0,
    conversionRatePct: 0,
    avgHoldDays: '0.0 days',
  },
}

export const AdminReportsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('totals')
  const [selectedBaseId, setSelectedBaseId] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<string>('56')
  const [reportsData, setReportsData] = useState<AdminReportsData>(EMPTY_REPORTS_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [exportToast, setExportToast] = useState(false)

  useEffect(() => {
    let active = true

    adminApi
      .getReportsData({
        baseId: selectedBaseId || undefined,
        days: selectedRange,
      })
      .then((res) => {
        if (active && res) {
          setReportsData(res)
          setLoadError(null)
        }
      })
      .catch((err: any) => {
        if (active) {
          console.warn('Could not load reports from database:', err)
          setLoadError(err?.message || 'Unable to load reports from database.')
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedBaseId, selectedRange])

  const handleBaseChange = (nextBaseId: string) => {
    setIsLoading(true)
    setLoadError(null)
    setSelectedBaseId(nextBaseId)
  }

  const handleRangeChange = (nextRange: string) => {
    setIsLoading(true)
    setLoadError(null)
    setSelectedRange(nextRange)
  }

  const data = reportsData

  const handleExportCSV = () => {
    const filename = `ecobyte-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    let rows: string[][] = []

    if (activeTab === 'totals') {
      rows = [
        ['E-waste type', 'Requests', 'Turned over', 'Reuse', 'Disposal', 'Est. kg'],
        ...data.ewasteType.map((c) => [
          c.name,
          String(c.units),
          String(c.turnedOverUnits),
          String(c.reuseUnits),
          String(c.disposalUnits),
          String(c.weightKg.toFixed(1)),
        ]),
      ]
    } else if (activeTab === 'requests') {
      rows = [
        [
          'Drop-off site',
          'Base',
          'Morning (8-11:30 AM)',
          'Afternoon (1-3:30 PM)',
          'Evening (4-6 PM)',
          'Booked',
          'Capacity',
          'Utilization',
        ],
        ...data.slotUsage.map((s) => [
          s.facility,
          s.baseName,
          String(s.morning),
          String(s.afternoon),
          String(s.evening),
          String(s.booked),
          String(s.capacity),
          `${s.utilizationPct}%`,
        ]),
      ]
    } else {
      rows = [
        ['Metric', 'Value'],
        ['Items Listed in Reuse Hub', String(data.reuseHub.totalListed)],
        ['Active Reservations', String(data.reuseHub.reserved)],
        ['Claimed Devices', String(data.reuseHub.claimed)],
        ['Pick-Up Conversion Rate', `${data.reuseHub.conversionRatePct}%`],
        ['Average Hold Duration', data.reuseHub.avgHoldDays],
      ]
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setExportToast(true)
  }

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase()
    if (lower.includes('phone')) return SmartphoneRoundedIcon
    if (lower.includes('laptop')) return LaptopRoundedIcon
    if (lower.includes('battery')) return BatteryChargingFullRoundedIcon
    if (lower.includes('monitor') || lower.includes('tv')) return TvRoundedIcon
    if (lower.includes('charger') || lower.includes('cable')) return CableRoundedIcon
    return KitchenRoundedIcon
  }

  const hazardBars = [
    {
      label: 'Low risk (Safe Handling)',
      value: data.hazardRisk.low.count,
      pct: data.hazardRisk.low.pct,
      color: '#70b822',
    },
    {
      label: 'Medium risk (Cathode/LCD)',
      value: data.hazardRisk.medium.count,
      pct: data.hazardRisk.medium.pct,
      color: '#f59e0b',
    },
    {
      label: 'High risk (Swollen Li-Ion)',
      value: data.hazardRisk.high.count,
      pct: data.hazardRisk.high.pct,
      color: '#e11d48',
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4, fontFamily: "'Quicksand', sans-serif" }}>
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #dbe3d6',
          p: 3,
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
        }}
      >
        {/* Top Controls: 3 Tabs on left, Base + Range + Export CSV on right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 2,
            mb: 3.5,
          }}
        >
          {/* Tabs */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              backgroundColor: '#f1f5f9',
              borderRadius: '0.75rem',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'totals' as const, label: 'Totals & E-Waste Types' },
              { id: 'requests' as const, label: 'Requests & Slot Usage' },
              { id: 'reuse' as const, label: 'Reuse Hub Metrics' },
            ].map((t) => {
              const active = activeTab === t.id
              return (
                <ButtonBase
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    backgroundColor: active ? '#ffffff' : 'transparent',
                    color: active ? '#0f172a' : '#64748b',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    '&:hover': { color: '#0f172a' },
                  }}
                >
                  {t.label}
                </ButtonBase>
              )
            })}
          </Box>

          {/* Filters & Export */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {isLoading && <CircularProgress size={18} sx={{ color: '#2e6022' }} />}

            {/* Base selector */}
            <select
              aria-label="Filter reports by Commonwealth base"
              value={selectedBaseId}
              onChange={(e) => handleBaseChange(e.target.value)}
              style={{
                height: '2.5rem',
                borderRadius: '0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0 1rem',
                outline: 'none',
              }}
            >
              {BASE_FILTERS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Date range selector */}
            <select
              aria-label="Filter reports by date range"
              value={selectedRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              style={{
                height: '2.5rem',
                borderRadius: '0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0 1rem',
                outline: 'none',
              }}
            >
              <option value="30">Last 30 days</option>
              <option value="56">Last 8 weeks</option>
              <option value="all">All time</option>
            </select>

            {/* Export CSV button */}
            <ButtonBase
              onClick={handleExportCSV}
              sx={{
                height: '2.5rem',
                px: 2,
                borderRadius: '0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #dbe3d6',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
              }}
            >
              <DownloadRoundedIcon sx={{ fontSize: 18, color: '#4f8a24' }} />
              <span>Export CSV</span>
            </ButtonBase>
          </Box>
        </Box>

        {loadError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '0.75rem' }}>
            {loadError}
          </Alert>
        )}

        {/* Tab 1: Totals & E-Waste Types */}
        {activeTab === 'totals' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* 4 Mini Metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Requests
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {data.requests.total}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Turned Over
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {data.requests.turnedOver + data.requests.completed}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Listed for Reuse
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f8a24', mt: 0.25 }}>
                  {data.reuseHub.totalListed}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Diverted
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {data.totals.divertedKgTotal.toFixed(1)} kg
                </Typography>
              </Box>
            </Box>

            {/* Split: Table on left, Hazard Breakdown on right */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '8fr 4fr' }, gap: 3, alignItems: 'start' }}>
              {/* Types Breakdown Table */}
              <Box sx={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>E-waste type</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Submitted</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Turned over</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Reuse</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Disposal</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Est. weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ewasteType.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          No e-waste records found for the selected base and timeframe.
                        </td>
                      </tr>
                    ) : (
                      data.ewasteType.map((t) => {
                        const Icon = getTypeIcon(t.name)
                        return (
                          <tr key={t.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon sx={{ fontSize: 16, color: '#64748b' }} />
                                <span>{t.name}</span>
                              </Box>
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{t.units}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700 }}>{t.turnedOverUnits}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#4f8a24' }}>{t.reuseUnits}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#b45309' }}>{t.disposalUnits}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.weightKg.toFixed(1)} kg</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </Box>

              {/* AI Hazard Risk Distribution */}
              <Box sx={{ p: 2.5, borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    AI hazard risk distribution
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>
                    {data.hazardRisk.total} assessed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {hazardBars.map((h) => (
                    <Box key={h.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', mb: 0.5 }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{h.label}</span>
                        <span style={{ fontWeight: 700, color: '#64748b' }}>{h.value} · {h.pct}%</span>
                      </Box>
                      <Box sx={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${h.pct}%`, backgroundColor: h.color, borderRadius: 9999 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Tab 2: Requests & Slot Usage */}
        {activeTab === 'requests' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                Drop-off slot usage across Commonwealth stations
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Actual booked drop-off requests per time window vs. station capacity
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Drop-off site</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Base</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Morning</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Afternoon</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Evening</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Booked</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slotUsage.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No drop-off station records found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    data.slotUsage.map((s) => (
                      <tr key={s.facility} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.facility}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>{s.baseName}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f4f0', color: '#3e6b27' }}>
                            {s.morning}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#70b822', color: '#ffffff' }}>
                            {s.afternoon}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
                            {s.evening}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {s.booked} / {s.capacity}
                        </td>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ height: 6, width: 80, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${s.utilizationPct}%`, backgroundColor: '#0ea5e9', borderRadius: 9999 }} />
                            </Box>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{s.utilizationPct}%</span>
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          </Box>
        )}

        {/* Tab 3: Reuse Hub Metrics */}
        {activeTab === 'reuse' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Items Listed
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {data.reuseHub.totalListed}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Active Reservations
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0ea5e9', mt: 0.25 }}>
                  {data.reuseHub.reserved}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Pick-Up Success Rate
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f8a24', mt: 0.25 }}>
                  {data.reuseHub.conversionRatePct}%
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  Avg. Days to Claim
                </Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {data.reuseHub.avgHoldDays}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Export Toast */}
      <Snackbar
        open={exportToast}
        autoHideDuration={3000}
        onClose={() => setExportToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setExportToast(false)}>
          CSV exported successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminReportsPage

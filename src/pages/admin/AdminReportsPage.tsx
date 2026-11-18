import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
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
import { adminApi, type AdminReportsData } from '@/lib/api'

type ReportTab = 'totals' | 'requests' | 'reuse'

const BARANGAYS = [
  { id: '', name: 'All barangays' },
  { id: 'commonwealth', name: 'Commonwealth' },
  { id: 'batasan', name: 'Batasan Hills' },
  { id: 'payatas', name: 'Payatas' },
  { id: 'holyspirit', name: 'Holy Spirit' },
  { id: 'bagongsilangan', name: 'Bagong Silangan' },
]

const FALLBACK_REPORTS: AdminReportsData = {
  totals: {
    totalVolumeProcessed: 320,
    totalWeightKg: 485.5,
    divertedKgTotal: 312.2,
    activeRequests: 42,
    completedRequests: 268,
    missedRequests: 10,
    diversionRatePct: 64,
  },
  ewasteType: [
    { name: 'Mobile Phone', units: 110, weightKg: 22.0, hazardUnits: 8, reuseRatePercent: 72 },
    { name: 'Laptop', units: 85, weightKg: 187.0, hazardUnits: 14, reuseRatePercent: 68 },
    { name: 'Battery / Power Bank', units: 55, weightKg: 19.25, hazardUnits: 25, reuseRatePercent: 20 },
    { name: 'Monitor / TV', units: 45, weightKg: 247.5, hazardUnits: 12, reuseRatePercent: 50 },
    { name: 'Charger & Cables', units: 40, weightKg: 12.0, hazardUnits: 2, reuseRatePercent: 60 },
    { name: 'Small Appliance', units: 25, weightKg: 50.0, hazardUnits: 1, reuseRatePercent: 65 },
  ],
  requests: {
    total: 360,
    scheduled: 28,
    underInspection: 14,
    turnedOver: 245,
    completed: 45,
    missed: 18,
    cancelled: 10,
    fulfillmentRatePct: 84,
  },
  slotUsage: [
    { facility: 'Barangay Hall Drop-Off (Commonwealth)', capacity: 42, booked: 34, available: 8, utilizationPct: 81 },
    { facility: 'Ecoville Covered Court', capacity: 28, booked: 21, available: 7, utilizationPct: 75 },
    { facility: 'Litex Market MRF', capacity: 35, booked: 22, available: 13, utilizationPct: 63 },
    { facility: 'Batasan Hills Barangay Hall', capacity: 35, booked: 24, available: 11, utilizationPct: 68 },
    { facility: 'Payatas MRF Station', capacity: 35, booked: 19, available: 16, utilizationPct: 54 },
  ],
  reuseHub: {
    totalListed: 148,
    reserved: 22,
    claimed: 115,
    conversionRatePct: 78,
    avgHoldDays: '3.2 days',
  },
}

export const AdminReportsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('totals')
  const [selectedBrgy, setSelectedBrgy] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<string>('56')
  const [reportsData, setReportsData] = useState<AdminReportsData>(FALLBACK_REPORTS)
  const [exportToast, setExportToast] = useState(false)

  useEffect(() => {
    adminApi
      .getReportsData()
      .then((res: AdminReportsData) => {
        if (res) setReportsData(res)
      })
      .catch((err: unknown) => {
        console.warn('Could not load reports, using standard dataset:', err)
      })
  }, [selectedBrgy, selectedRange])

  const data = reportsData || FALLBACK_REPORTS

  const handleExportCSV = () => {
    let filename = `ecobyte-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    let rows: string[][] = []

    if (activeTab === 'totals') {
      rows = [
        ['E-waste type', 'Requests', 'Turned over', 'Reuse', 'Disposal', 'Est. kg'],
        ...data.ewasteType.map((c) => [
          c.name,
          String(c.units),
          String(Math.round(c.units * 0.85)),
          String(Math.round(c.units * 0.85 * (c.reuseRatePercent / 100))),
          String(Math.round(c.units * 0.85 * (1 - c.reuseRatePercent / 100))),
          String(c.weightKg.toFixed(1)),
        ]),
      ]
    } else if (activeTab === 'requests') {
      rows = [
        ['Drop-off site', 'Barangay', '8-10 AM', '10-12 PM', '1-3 PM', '3-5 PM', 'Booked', 'Capacity (7d)', 'Utilization'],
        ...data.slotUsage.map((s) => [
          s.facility,
          'Commonwealth',
          String(Math.round(s.booked * 0.3)),
          String(Math.round(s.booked * 0.35)),
          String(Math.round(s.booked * 0.2)),
          String(Math.round(s.booked * 0.15)),
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
        ['Claim Conversion Rate', `${data.reuseHub.conversionRatePct}%`],
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4, fontFamily: "'Quicksand', sans-serif" }}>
      {/* Header card matching prototype */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #dbe3d6',
          p: 3,
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
        }}
      >
        {/* Top Controls: 3 Tabs on left, Barangay + Range + Export CSV on right */}
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
            {/* Barangay selector */}
            <select
              value={selectedBrgy}
              onChange={(e) => setSelectedBrgy(e.target.value)}
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
              {BARANGAYS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Date range selector */}
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
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

            {/* Split: Table on left, Hazard Donut Breakdown on right */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '8fr 4fr' }, gap: 3, alignItems: 'start' }}>
              {/* Types Breakdown Table */}
              <Box sx={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>E-waste type</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Requests</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Turned over</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Reuse</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Disposal</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Est. weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ewasteType.map((t) => {
                      const Icon = getTypeIcon(t.name)
                      const turned = Math.round(t.units * 0.85)
                      const reuse = Math.round(turned * (t.reuseRatePercent / 100))
                      const disposal = turned - reuse
                      return (
                        <tr key={t.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon sx={{ fontSize: 16, color: '#64748b' }} />
                              <span>{t.name}</span>
                            </Box>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{t.units}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700 }}>{turned}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#4f8a24' }}>{reuse}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#b45309' }}>{disposal}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.weightKg.toFixed(1)} kg</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Box>

              {/* AI Hazard Risk Distribution */}
              <Box sx={{ p: 2.5, borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', mb: 2 }}>
                  AI hazard risk distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Low risk (Safe Handling)', value: 182, pct: 57, color: '#70b822' },
                    { label: 'Medium risk (Cathode/LCD)', value: 94, pct: 29, color: '#f59e0b' },
                    { label: 'High risk (Swollen Li-Ion)', value: 44, pct: 14, color: '#e11d48' },
                  ].map((h) => (
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
                Slot usage · next 7 days
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Booked drop-offs per time slot vs. station capacity (per slot per day)
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Drop-off site</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Barangay</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>8–10 AM</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>10 AM–12 PM</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>1–3 PM</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>3–5 PM</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slotUsage.map((s, idx) => {
                    const slot1 = Math.round(s.booked * 0.3)
                    const slot2 = Math.round(s.booked * 0.35)
                    const slot3 = Math.round(s.booked * 0.2)
                    const slot4 = s.booked - slot1 - slot2 - slot3
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.facility}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>Commonwealth</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f4f0', color: '#3e6b27' }}>
                            {slot1}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#70b822', color: '#ffffff' }}>
                            {slot2}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f4f0', color: '#3e6b27' }}>
                            {slot3}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
                            {slot4}
                          </span>
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
                    )
                  })}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setExportToast(false)}>
          CSV exported successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminReportsPage

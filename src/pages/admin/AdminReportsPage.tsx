import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { adminApi, type AdminReportsData } from '@/lib/api'

type ReportTab = 'totals' | 'ewasteType' | 'requests' | 'slotUsage' | 'reuseHub'

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
    { name: 'Computers & Laptops', units: 110, weightKg: 220, hazardUnits: 8, reuseRatePercent: 72 },
    { name: 'Mobile Devices & Tablets', units: 85, weightKg: 35, hazardUnits: 14, reuseRatePercent: 68 },
    { name: 'Monitors & Displays', units: 55, weightKg: 145, hazardUnits: 12, reuseRatePercent: 50 },
    { name: 'Peripherals & Cables', units: 45, weightKg: 40, hazardUnits: 2, reuseRatePercent: 60 },
    { name: 'Batteries & Power Units', units: 25, weightKg: 45.5, hazardUnits: 25, reuseRatePercent: 20 },
  ],
  requests: {
    total: 320,
    scheduled: 28,
    underInspection: 14,
    turnedOver: 245,
    completed: 23,
    missed: 10,
    cancelled: 0,
    fulfillmentRatePct: 84,
  },
  slotUsage: [
    { facility: 'Commonwealth MRF Base', capacity: 40, booked: 28, available: 12, utilizationPct: 70 },
    { facility: 'Area 1 Eco-Drop Hub', capacity: 30, booked: 24, available: 6, utilizationPct: 80 },
    { facility: 'Pilot Station B', capacity: 25, booked: 15, available: 10, utilizationPct: 60 },
    { facility: 'Unit Station 4', capacity: 20, booked: 11, available: 9, utilizationPct: 55 },
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
  const [data, setData] = useState<AdminReportsData>(FALLBACK_REPORTS)
  const [isLoading, setIsLoading] = useState(true)
  const [exportToast, setExportToast] = useState(false)

  useEffect(() => {
    let active = true
    adminApi
      .getReportsData()
      .then((res) => {
        if (active && res) {
          setData(res)
        }
      })
      .catch((err) => {
        console.warn('Could not load reports from backend, using fallback data:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleExportCSV = () => {
    let rows: string[][] = []
    let filename = `ecobyte-report-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`

    if (activeTab === 'totals') {
      rows = [
        ['Metric', 'Value'],
        ['Total Volume Processed', String(data.totals.totalVolumeProcessed)],
        ['Total Weight (kg)', String(data.totals.totalWeightKg)],
        ['Total Diverted (kg)', String(data.totals.divertedKgTotal)],
        ['Active Drop-Off Requests', String(data.totals.activeRequests)],
        ['Completed Requests', String(data.totals.completedRequests)],
        ['Missed Requests', String(data.totals.missedRequests)],
        ['Diversion Rate', `${data.totals.diversionRatePct}%`],
      ]
    } else if (activeTab === 'ewasteType') {
      rows = [
        ['Category', 'Units', 'Weight (kg)', 'Hazmat Alerts', 'Reuse Rate (%)'],
        ...data.ewasteType.map((c) => [
          c.name,
          String(c.units),
          String(c.weightKg),
          String(c.hazardUnits),
          `${c.reuseRatePercent}%`,
        ]),
      ]
    } else if (activeTab === 'requests') {
      rows = [
        ['Status', 'Count'],
        ['Total Requests', String(data.requests.total)],
        ['Scheduled', String(data.requests.scheduled)],
        ['Under Inspection', String(data.requests.underInspection)],
        ['Turned Over', String(data.requests.turnedOver)],
        ['Completed', String(data.requests.completed)],
        ['Missed', String(data.requests.missed)],
        ['Fulfillment Rate', `${data.requests.fulfillmentRatePct}%`],
      ]
    } else if (activeTab === 'slotUsage') {
      rows = [
        ['Facility', 'Capacity', 'Booked', 'Available', 'Utilization Rate (%)'],
        ...data.slotUsage.map((s) => [
          s.facility,
          String(s.capacity),
          String(s.booked),
          String(s.available),
          `${s.utilizationPct}%`,
        ]),
      ]
    } else {
      rows = [
        ['Metric', 'Value'],
        ['Total Listed in Reuse Hub', String(data.reuseHub.totalListed)],
        ['Active Reservations', String(data.reuseHub.reserved)],
        ['Claimed Items', String(data.reuseHub.claimed)],
        ['Conversion Rate', `${data.reuseHub.conversionRatePct}%`],
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

  const tabs: Array<{ id: ReportTab; label: string; icon: typeof BarChartRoundedIcon }> = [
    { id: 'totals', label: '1. Totals', icon: TrendingUpRoundedIcon },
    { id: 'ewasteType', label: '2. E-Waste Type', icon: DevicesRoundedIcon },
    { id: 'requests', label: '3. Requests', icon: FactCheckRoundedIcon },
    { id: 'slotUsage', label: '4. Slot Usage', icon: EventAvailableRoundedIcon },
    { id: 'reuseHub', label: '5. Reuse Hub', icon: Inventory2RoundedIcon },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '9999px',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Module 7 • Super Admin System Oversight
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.125rem' },
              color: '#0b1c30',
              letterSpacing: '-0.025em',
            }}
          >
            System Reports &amp; Analytics
          </Typography>
        </Box>

        {/* Export Button */}
        <ButtonBase
          onClick={handleExportCSV}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2.25,
            py: 1,
            borderRadius: '9999px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.28)',
            '&:hover': { backgroundColor: '#15803d' },
          }}
        >
          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Export {tabs.find((t) => t.id === activeTab)?.label} CSV</span>
        </ButtonBase>
      </Box>

      {/* ── 5 Tab Navigation Strip ── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.25,
          p: 1,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          const Icon = tab.icon
          return (
            <ButtonBase
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.25,
                py: 1.1,
                borderRadius: '8px',
                backgroundColor: active ? '#16a34a' : 'transparent',
                color: active ? '#ffffff' : '#475569',
                fontSize: '0.8125rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: active ? '#15803d' : '#f1f5f9',
                },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <span>{tab.label}</span>
            </ButtonBase>
          )
        })}
      </Box>

      {/* ── Tab Content Views ── */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} color="success" />
        </Box>
      ) : activeTab === 'totals' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Volume Processed
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {data.totals.totalVolumeProcessed} Units
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, mt: 0.5 }}>
              Across all barangay MRF hubs
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total E-Waste Weight
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {data.totals.totalWeightKg} kg
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, mt: 0.5 }}>
              Gross intake weight
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Diverted from Landfill
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
              {data.totals.divertedKgTotal} kg
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, mt: 0.5 }}>
              {data.totals.diversionRatePct}% Diversion rate
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Missed Drop-Offs
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#be123c', mt: 0.5 }}>
              {data.totals.missedRequests}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#9f1239', fontWeight: 600, mt: 0.5 }}>
              Capacity slots auto-released
            </Typography>
          </Box>
        </Box>
      ) : activeTab === 'ewasteType' ? (
        <Box sx={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              E-Waste Category Stream Breakdown
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Distribution of equipment types, hazard flags, and reuse conversion ratios.
            </Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>CATEGORY</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>UNITS</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>TOTAL WEIGHT</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>HAZMAT ALERTS</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>REUSE CONVERSION</th>
                </tr>
              </thead>
              <tbody>
                {data.ewasteType.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', fontSize: '0.8125rem' }}>{c.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#334155' }}>{c.units}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#334155' }}>{c.weightKg} kg</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, backgroundColor: c.hazardUnits > 0 ? '#fee2e2' : '#f1f5f9', color: c.hazardUnits > 0 ? '#991b1b' : '#64748b' }}>
                        {c.hazardUnits > 0 ? `${c.hazardUnits} Flagged` : 'None'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: c.reuseRatePercent >= 50 ? '#15803d' : '#475569', fontSize: '0.8125rem' }}>
                      {c.reuseRatePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      ) : activeTab === 'requests' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', mb: 2 }}>
              Intake Pipeline Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Scheduled Drop-Offs', count: data.requests.scheduled, color: '#d97706', bg: '#fef3c7' },
                { label: 'Under Inspection', count: data.requests.underInspection, color: '#0284c7', bg: '#e0f2fe' },
                { label: 'Turned Over (Reuse / Disposal)', count: data.requests.turnedOver, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Completed Deliveries', count: data.requests.completed, color: '#0f766e', bg: '#ccfbf1' },
                { label: 'Missed Appointments', count: data.requests.missed, color: '#e11d48', bg: '#ffe4e6' },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>{item.label}</Typography>
                  <Box sx={{ px: 1.25, py: 0.25, borderRadius: '9999px', backgroundColor: item.bg, color: item.color, fontWeight: 800, fontSize: '0.8125rem' }}>
                    {item.count}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Overall Intake Fulfillment Rate
            </Typography>
            <Typography sx={{ fontSize: '3.5rem', fontWeight: 800, color: '#16a34a', my: 1 }}>
              {data.requests.fulfillmentRatePct}%
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#475569', maxWidth: 300 }}>
              Percentage of residents whose e-waste successfully completed physical inspection and turnover.
            </Typography>
          </Box>
        </Box>
      ) : activeTab === 'slotUsage' ? (
        <Box sx={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Drop-Off Station Slot Capacity Utilization
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Capacity, booked slots, and current utilization per designated MRF station.
            </Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>FACILITY</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>DAILY CAPACITY</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>BOOKED SLOTS</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>AVAILABLE SLOTS</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>UTILIZATION</th>
                </tr>
              </thead>
              <tbody>
                {data.slotUsage.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', fontSize: '0.8125rem' }}>{s.facility}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#334155' }}>{s.capacity} slots</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#334155' }}>{s.booked} booked</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#16a34a', fontWeight: 700 }}>{s.available} open</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: s.utilizationPct >= 75 ? '#d97706' : '#16a34a', fontSize: '0.8125rem' }}>
                      {s.utilizationPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      ) : (
        /* Reuse Hub Tab */
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Listed Items
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {data.reuseHub.totalListed}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, mt: 0.5 }}>
              Refurbished &amp; working devices
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active Reservations
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', mt: 0.5 }}>
              {data.reuseHub.reserved}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, mt: 0.5 }}>
              Pending resident station pick-up
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Claimed Devices
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
              {data.reuseHub.claimed}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, mt: 0.5 }}>
              {data.reuseHub.conversionRatePct}% Claim rate
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Average Hold Time
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
              {data.reuseHub.avgHoldDays}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, mt: 0.5 }}>
              Before resident pick-up
            </Typography>
          </Box>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={exportToast}
        autoHideDuration={3000}
        onClose={() => setExportToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setExportToast(false)}>
          Report CSV downloaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminReportsPage

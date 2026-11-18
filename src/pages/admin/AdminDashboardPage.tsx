import { useEffect, useState, type FC } from 'react'
import { Box, ButtonBase, Typography, Snackbar, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { adminApi, getCachedUser, type AdminDashboardOverview } from '@/lib/api'
import { AdminOverviewPage } from './AdminOverviewPage'

interface DateRangeData {
  totalProcessed: number
  totalWeight: string
  trendPct: string
  runRate: string
  awaitingInspection: number
  scheduledRequestsCount: number
  avgDwell: string
  listedReuse: number
  reuseRate: string
  reuseAvgDays: string
  disposalCount: number
  disposalPct: string
  batchNo: string
  highRiskCount: number
  primaryStream: string
  hazardShare: string
  netIntakeWeight: string
  forecastCallout: string
  yAxisMax: number
  bars: Array<{ name: string; count: number; y: number; height: number; fill: string; capFill?: string }>
  tableRows: Array<{
    name: string
    units: string
    weight: string
    hazmat: string
    hazmatBg: string
    hazmatColor: string
    rate: string
    rateColor: string
    dot: string
  }>
}

function buildDashboardData(overview: AdminDashboardOverview): DateRangeData {
  const categories = overview.categories || []
  const maxUnits = Math.max(4, ...categories.map((c) => c.units))
  const yAxisMax = Math.ceil(maxUnits / 4) * 4
  const palette = ['#15803d', '#16a34a', '#22c55e', '#334155', '#d97706', '#0f766e']

  const bars = categories.slice(0, 6).map((c, idx) => {
    const height = Math.max(8, Math.round((c.units / yAxisMax) * 160))
    return {
      name: c.name,
      count: c.units,
      y: 200 - height,
      height,
      fill: palette[idx % palette.length],
      capFill: idx % 2 === 0 ? '#4ade80' : '#86efac',
    }
  })

  const tableRows = categories.map((c, idx) => ({
    name: c.name,
    units: String(c.units),
    weight: `${c.weightKg} kg`,
    hazmat: c.hazardUnits > 0 ? `${c.hazardUnits} Flagged` : 'Standard',
    hazmatBg: c.hazardUnits > 0 ? '#fee2e2' : '#f1f5f9',
    hazmatColor: c.hazardUnits > 0 ? '#991b1b' : '#475569',
    rate: `${c.reuseRatePercent}%`,
    rateColor: c.reuseRatePercent >= 50 ? '#15803d' : '#475569',
    dot: palette[idx % palette.length],
  }))

  const topStream = [...categories].sort((a, b) => b.units - a.units)[0]
  const totalProcessed = overview.totalProcessed || 0
  const disposalPct =
    totalProcessed > 0 ? `${((overview.disposalCount / totalProcessed) * 100).toFixed(1)}%` : '0%'

  return {
    totalProcessed,
    totalWeight: `${overview.totalWeightKg} kg`,
    trendPct: 'Live DB',
    runRate: `${overview.divertedKgTotal} kg diverted`,
    awaitingInspection: overview.awaitingInspection + overview.scheduledRequestsCount,
    scheduledRequestsCount: overview.scheduledRequestsCount,
    avgDwell: `${overview.scheduledRequestsCount} scheduled`,
    listedReuse: overview.listedReuse,
    reuseRate: `${overview.reuseConversionRatePercent}%`,
    reuseAvgDays: `${overview.divertedKgTotal} kg saved`,
    disposalCount: overview.disposalCount,
    disposalPct,
    batchNo: 'PostgreSQL Live',
    highRiskCount: overview.hazardAlertsActive,
    primaryStream: topStream ? `${topStream.name} (${topStream.units})` : 'No items yet',
    hazardShare: `${overview.hazardAlertsActive} active alerts`,
    netIntakeWeight: `${overview.totalWeightKg} kg`,
    forecastCallout: `${totalProcessed} units`,
    yAxisMax,
    bars,
    tableRows,
  }
}

const EMPTY_OVERVIEW: AdminDashboardOverview = {
  totalProcessed: 0,
  totalWeightKg: 0,
  divertedKgTotal: 0,
  awaitingInspection: 0,
  scheduledRequestsCount: 0,
  listedReuse: 0,
  reuseConversionRatePercent: 0,
  disposalCount: 0,
  hazardAlertsActive: 0,
  categories: [],
}

export const AdminDashboardPage: FC = () => {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'q3' | 'custom'>('30d')
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
  const [exportSnackbar, setExportSnackbar] = useState(false)
  const [overview, setOverview] = useState<AdminDashboardOverview>(EMPTY_OVERVIEW)

  const currentUser = getCachedUser()
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('ecobyte_user_role') : ''
  const isSuperAdmin = (currentUser?.role || storedRole || '').toUpperCase() === 'ADMIN'

  useEffect(() => {
    let active = true
    adminApi
      .getDashboardOverview()
      .then((res) => {
        if (active && res) {
          setOverview(res)
        }
      })
      .catch((err) => {
        console.error('Failed to load admin dashboard overview:', err)
      })
    return () => {
      active = false
    }
  }, [dateRange])

  if (isSuperAdmin) {
    return <AdminOverviewPage />
  }

  const currentData = buildDashboardData(overview)

  const handleExportLog = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Category,Units,Weight_kg,Hazmat_Flags,Reuse_Rate',
        ...currentData.tableRows.map(
          (row) => `"${row.name}",${row.units},"${row.weight}","${row.hazmat}",${row.rate}`
        ),
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ecobyte-telemetry-log-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setExportSnackbar(true)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* ── Top Utility & Filter Strip ── */}
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
              Operational Telemetry
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
            Dashboard
          </Typography>
        </Box>

        {/* Date Range Tabs & Export */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#ffffff',
            p: 0.75,
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              backgroundColor: '#eff4ff',
              p: 0.5,
              borderRadius: '9999px',
              gap: 0.5,
            }}
          >
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'q3', label: 'Q3 2024' },
              { id: 'custom', label: 'Custom' },
            ].map((tab) => {
              const active = dateRange === tab.id
              return (
                <ButtonBase
                  key={tab.id}
                  onClick={() => setDateRange(tab.id as typeof dateRange)}
                  sx={{
                    px: 1.75,
                    py: 0.6,
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    backgroundColor: active ? '#16a34a' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 1px 4px rgba(22, 163, 74, 0.3)' : 'none',
                    '&:hover': {
                      color: active ? '#ffffff' : '#0b1c30',
                    },
                  }}
                >
                  {tab.label}
                </ButtonBase>
              )
            })}
          </Box>

          <Box sx={{ width: 1, height: 18, backgroundColor: '#cbd5e1', mx: 0.5 }} />

          <ButtonBase
            onClick={handleExportLog}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.75,
              py: 0.6,
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              color: '#334155',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#eff4ff',
                color: '#0b1c30',
              },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Export Log</span>
          </ButtonBase>
        </Box>
      </Box>

      {/* ── Role-Specific Operational Hub & Navigation (Module 6A vs Module 7) ── */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSuperAdmin ? (
              <ShieldOutlinedIcon sx={{ fontSize: 20, color: '#2e6022' }} />
            ) : (
              <LocationOnOutlinedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
            )}
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: isSuperAdmin ? '#1e2e1a' : '#166534',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isSuperAdmin
                ? 'Super Admin Central Portal • System-Wide Oversight (All Barangays)'
                : 'Barangay Official Station Dashboard • Commonwealth Central MRF (Read-Only)'}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.25,
              borderRadius: '9999px',
              backgroundColor: isSuperAdmin ? '#f1f4f0' : '#dcfce7',
              border: `1px solid ${isSuperAdmin ? '#cbd5e1' : '#bbf7d0'}`,
              color: isSuperAdmin ? '#334155' : '#15803d',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}
          >
            {isSuperAdmin ? 'Module 7 Workflows' : 'Module 6A Workflows'}
          </Box>
        </Box>

        {/* Action Grid */}
        {!isSuperAdmin ? (
          /* Official Actions: Incoming Drop-Offs, Inspection, Transactions */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <ButtonBase
              onClick={() => navigate('/admin/incoming')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#16a34a',
                  backgroundColor: '#f0fdf4',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MoveToInboxRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                Incoming Drop-Offs
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                View scheduled devices, click 'Received' to move to inspection, or mark missed.
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/admin/to-inspect')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#16a34a',
                  backgroundColor: '#f0fdf4',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                Inspection &amp; Disposal
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                Triage oldest-first. Auto-list items in Reuse Hub or auto-create disposal records.
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/admin/transactions')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#16a34a',
                  backgroundColor: '#f0fdf4',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                Transactions &amp; Pick-Up
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                Review transaction ledger, verify resident pick-up passcodes, and confirm handoff.
              </Typography>
            </ButtonBase>
          </Box>
        ) : (
          /* Super Admin Actions: Reports, Transactions, Manage Users, Activity Logs */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <ButtonBase
              onClick={() => navigate('/admin/reports')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#2e6022',
                  backgroundColor: '#f1f4f0',
                  boxShadow: '0 4px 12px rgba(46, 96, 34, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChartRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                System Reports
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                Totals, e-waste classification, requests, station slot usage, and reuse hub.
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/admin/transactions')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#2e6022',
                  backgroundColor: '#f1f4f0',
                  boxShadow: '0 4px 12px rgba(46, 96, 34, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                Transactions &amp; Reuse
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                System-wide transactions ledger across all stations and active reuse inventory.
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/admin/access')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#2e6022',
                  backgroundColor: '#f1f4f0',
                  boxShadow: '0 4px 12px rgba(46, 96, 34, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                Manage Users
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                Provision officials, assign stations, manage roles, and toggle account access.
              </Typography>
            </ButtonBase>

            <ButtonBase
              onClick={() => navigate('/admin/activity-logs')}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#2e6022',
                  backgroundColor: '#f1f4f0',
                  boxShadow: '0 4px 12px rgba(46, 96, 34, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HistoryRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                Activity Logs
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                System-wide immutable audit trail: user actions, role changes, and timestamps.
              </Typography>
            </ButtonBase>
          </Box>
        )}
      </Box>

      {/* ── 5-Metric Strip ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* Metric 1: Items collected */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 2.25,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.05em',
              }}
            >
              Items collected
            </Typography>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0b1c30',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {currentData.totalProcessed.toLocaleString()}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1,
                py: 0.25,
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              <TrendingUpRoundedIcon sx={{ fontSize: 14 }} /> {currentData.trendPct}
            </Box>
          </Box>
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Intake run rate</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{currentData.runRate}</Typography>
          </Box>
        </Box>

        {/* Metric 2: Awaiting inspection */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 2.25,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.05em',
              }}
            >
              Awaiting inspection
            </Typography>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HourglassTopRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0b1c30',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {currentData.awaitingInspection}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: '#ffdcc3',
                color: '#804300',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              Queue Active
            </Box>
          </Box>
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Avg. dwell</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{currentData.avgDwell}</Typography>
          </Box>
        </Box>

        {/* Metric 3: Listed in Reuse Hub */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 2.25,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.05em',
              }}
            >
              Listed in Reuse Hub
            </Typography>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PublishedWithChangesRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#15803d',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {currentData.listedReuse.toLocaleString()}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1,
                py: 0.25,
                borderRadius: '9999px',
                backgroundColor: '#bbf7d0',
                color: '#14532d',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              {currentData.reuseRate}
            </Box>
          </Box>
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Turnaround</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{currentData.reuseAvgDays}</Typography>
          </Box>
        </Box>

        {/* Metric 4: Marked for disposal */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 2.25,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.05em',
              }}
            >
              Marked for disposal
            </Typography>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: '#eff4ff',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DeleteSweepOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0b1c30',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {currentData.disposalCount.toLocaleString()}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1,
                py: 0.25,
                borderRadius: '9999px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              {currentData.disposalPct}
            </Box>
          </Box>
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Smelt lot batch</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{currentData.batchNo}</Typography>
          </Box>
        </Box>

        {/* Metric 5: High health risk */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 2.25,
            border: '1px solid #fee2e2',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gridColumn: { xs: 'span 2', md: 'span 1' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#dc2626',
                letterSpacing: '0.05em',
              }}
            >
              High health risk
            </Typography>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#dc2626',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {currentData.highRiskCount}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              Hazmat ISO
            </Box>
          </Box>
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: '1px solid #fee2e2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Sealed containment</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>100% Secure</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Primary Split Grid (Left: Bar chart / Right: Line chart + Banner) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* LEFT PANEL: Items by e-waste type */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Panel Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              pb: 2,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#0b1c30',
                  letterSpacing: '-0.01em',
                }}
              >
                Items by e-waste type
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                Categorical distribution across active inspection streams
              </Typography>
            </Box>

            {/* Toggle View Mode */}
            <Box
              sx={{
                display: 'inline-flex',
                backgroundColor: '#eff4ff',
                p: 0.5,
                borderRadius: '8px',
                gap: 0.5,
              }}
            >
              <ButtonBase
                onClick={() => setViewMode('chart')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  backgroundColor: viewMode === 'chart' ? '#ffffff' : 'transparent',
                  color: viewMode === 'chart' ? '#0b1c30' : '#475569',
                  boxShadow: viewMode === 'chart' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <BarChartRoundedIcon sx={{ fontSize: 16 }} />
                <span>Chart</span>
              </ButtonBase>
              <ButtonBase
                onClick={() => setViewMode('table')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#0b1c30' : '#475569',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <TableRowsRoundedIcon sx={{ fontSize: 16 }} />
                <span>Breakdown</span>
              </ButtonBase>
            </Box>
          </Box>

          {/* Mode A: Chart View */}
          {viewMode === 'chart' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* SVG Bar Chart */}
              <Box sx={{ position: 'relative', width: '100%', height: 280, pt: 1 }}>
                <svg
                  viewBox="0 0 540 230"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  <line x1="45" y1="20" x2="520" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="45" y1="65" x2="520" y2="65" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="45" y1="110" x2="520" y2="110" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="45" y1="155" x2="520" y2="155" stroke="#e2e8f0" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="45" y1="200" x2="520" y2="200" stroke="#cbd5e1" strokeWidth="1.2" />

                  {/* Y-Axis numbers */}
                  <text x="35" y="24" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">{currentData.yAxisMax}</text>
                  <text x="35" y="69" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">{Math.round(currentData.yAxisMax * 0.75)}</text>
                  <text x="35" y="114" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">{Math.round(currentData.yAxisMax * 0.5)}</text>
                  <text x="35" y="159" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">{Math.round(currentData.yAxisMax * 0.25)}</text>
                  <text x="35" y="204" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">0</text>

                  {/* Bars Rendered Dynamically from currentData */}
                  {currentData.bars.map((bar, i) => {
                    const xCoord = 65 + i * 77
                    return (
                      <g key={bar.name} style={{ cursor: 'pointer' }}>
                        <rect x={xCoord} y={bar.y} width="46" height={bar.height} rx="4" fill={bar.fill} />
                        {bar.capFill && (
                          <rect x={xCoord} y={bar.y} width="46" height={Math.min(8, bar.height)} rx="2" fill={bar.capFill} opacity="0.9" />
                        )}
                        <text x={xCoord + 23} y={bar.y - 8} textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">
                          {bar.count}
                        </text>
                        <text x={xCoord + 23} y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">
                          {bar.name}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </Box>

              {/* Metric summary 3-column row */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid #f1f5f9',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ backgroundColor: '#eff4ff', py: 1.25, px: 1.5, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Primary Waste Stream
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#15803d', mt: 0.25 }}>
                    {currentData.primaryStream}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#eff4ff', py: 1.25, px: 1.5, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Hazard Share
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706', mt: 0.25 }}>
                    {currentData.hazardShare}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#eff4ff', py: 1.25, px: 1.5, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Net Intake Weight
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#15803d', mt: 0.25 }}>
                    {currentData.netIntakeWeight}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            /* Mode B: Breakdown Table View */
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eff4ff', color: '#475569', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 12px', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }}>E-Waste Stream</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Units</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Yield Weight</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Hazmat Index</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}>Reuse Rate</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                  {currentData.tableRows.map((row) => (
                    <tr key={row.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: row.dot, marginRight: 8 }} />
                        {row.name}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.units}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.weight}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 700, backgroundColor: row.hazmatBg, color: row.hazmatColor }}>
                          {row.hazmat}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: row.rateColor, fontVariantNumeric: 'tabular-nums' }}>{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>

        {/* RIGHT PANEL & SUB-BAR */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Predictive Generation Line Chart Card */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              p: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1.5,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#0b1c30',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Predicted generation
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                  Automated ML forecast across upcoming rolling cycles
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.35,
                  borderRadius: '9999px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '9999px',
                    backgroundColor: '#22c55e',
                    boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)',
                  }}
                />
                95% CI
              </Box>
            </Box>

            {/* Predictive Line Chart SVG */}
            <Box sx={{ position: 'relative', width: '100%', height: 250 }}>
              <svg
                viewBox="0 0 420 220"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                {/* Confidence Interval Area */}
                <path
                  d="M 45 130 C 95 125, 145 110, 195 95 C 245 80, 295 65, 345 50 C 370 42, 395 38, 405 35 L 405 95 C 395 102, 370 110, 345 118 C 295 135, 245 145, 195 150 C 145 155, 95 158, 45 160 Z"
                  fill="#86efac"
                  opacity="0.25"
                />

                {/* Horizontal Grid lines */}
                <line x1="40" y1="35" x2="410" y2="35" stroke="#e2e8f0" strokeDasharray="2 2" opacity="0.6" />
                <line x1="40" y1="80" x2="410" y2="80" stroke="#e2e8f0" strokeDasharray="2 2" opacity="0.6" />
                <line x1="40" y1="125" x2="410" y2="125" stroke="#e2e8f0" strokeDasharray="2 2" opacity="0.6" />
                <line x1="40" y1="170" x2="410" y2="170" stroke="#e2e8f0" strokeDasharray="2 2" opacity="0.6" />
                <line x1="40" y1="195" x2="410" y2="195" stroke="#cbd5e1" strokeWidth="1.2" />

                {/* Division line */}
                <line x1="220" y1="25" x2="220" y2="195" stroke="#16a34a" strokeDasharray="3 3" opacity="0.4" strokeWidth="1.5" />
                <text x="215" y="32" textAnchor="end" fontSize="8" fill="#64748b" fontWeight="600">HISTORICAL</text>
                <text x="225" y="32" textAnchor="start" fontSize="8" fill="#15803d" fontWeight="700">MODEL PROJECTION →</text>

                {/* Y Axis */}
                <text x="32" y="38" textAnchor="end" fontSize="8.5" fill="#64748b">2.4k</text>
                <text x="32" y="83" textAnchor="end" fontSize="8.5" fill="#64748b">1.8k</text>
                <text x="32" y="128" textAnchor="end" fontSize="8.5" fill="#64748b">1.2k</text>
                <text x="32" y="173" textAnchor="end" fontSize="8.5" fill="#64748b">0.6k</text>

                {/* Historical Solid Path */}
                <path
                  d="M 45 145 L 90 138 L 135 124 L 180 132 L 220 112"
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Predictive Dashed Path */}
                <path
                  d="M 220 112 L 270 94 L 320 82 L 365 68 L 405 52"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                <circle cx="45" cy="145" r="3.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="90" cy="138" r="3.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="135" cy="124" r="3.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="180" cy="132" r="3.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="220" cy="112" r="4.5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />

                <circle cx="270" cy="94" r="3.5" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
                <circle cx="320" cy="82" r="3.5" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
                <circle cx="365" cy="68" r="3.5" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
                <circle cx="405" cy="52" r="4.5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />

                {/* Callout box at end */}
                <rect x="345" y="24" width="65" height="18" rx="4" fill="#15803d" />
                <text x="377" y="36" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="700">{currentData.forecastCallout}</text>

                {/* X Axis Months */}
                <text x="45" y="209" textAnchor="middle" fontSize="9" fill="#64748b">May</text>
                <text x="90" y="209" textAnchor="middle" fontSize="9" fill="#64748b">Jun</text>
                <text x="135" y="209" textAnchor="middle" fontSize="9" fill="#64748b">Jul</text>
                <text x="180" y="209" textAnchor="middle" fontSize="9" fill="#64748b">Aug</text>
                <text x="220" y="209" textAnchor="middle" fontSize="9" fill="#15803d" fontWeight="700">Sep</text>
                <text x="270" y="209" textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600">Oct*</text>
                <text x="320" y="209" textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600">Nov*</text>
                <text x="365" y="209" textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600">Dec*</text>
                <text x="405" y="209" textAnchor="middle" fontSize="9" fill="#16a34a" fontWeight="600">Jan*</text>
              </svg>
            </Box>

            {/* Metric micro-summary */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #dcfce7',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsightsRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#14532d' }}>
                  Expected surge in Q4 enterprise decommissioning:
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
                +28.5% YoY
              </Typography>
            </Box>
          </Box>

          {/* Bottom Sub-bar */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              p: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '9999px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                Automatic: no admin action needed here
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '4px',
                  backgroundColor: '#eff4ff',
                  color: '#475569',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Sync: 2m ago
              </Box>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8', cursor: 'pointer' }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Export Logs Feedback ── */}
      <Snackbar
        open={exportSnackbar}
        autoHideDuration={3500}
        onClose={() => setExportSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setExportSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 700,
            fontFamily: "'Rethink Sans', 'Inter', sans-serif",
            backgroundColor: '#15803d',
            color: '#ffffff',
          }}
        >
          Operational telemetry log exported successfully (.csv)
        </Alert>
      </Snackbar>
    </Box>
  )
}
export default AdminDashboardPage


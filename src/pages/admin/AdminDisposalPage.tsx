import { useEffect, useState, type FC, type MouseEvent } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { adminApi, type AdminDisposalLogItem } from '@/lib/api'

interface DisposalRecord {
  id: string
  recordNumber: string
  item: string
  pathwayTag: 'Critical Hazard' | 'Precious Metals' | 'Polymer Shred' | 'Salvage Components'
  pathwaySub: string
  pathwayDetail: string
  date: string
  periodLabel: string
  status: string
  weightKg: number
  isHazard?: boolean
}

function mapDisposalLog(log: AdminDisposalLogItem, index: number): DisposalRecord {
  const combined = `${log.category || ''} ${log.itemName || ''} ${log.decisionNotes || ''}`.toLowerCase()
  const isHazard =
    combined.includes('battery') ||
    combined.includes('lipo') ||
    combined.includes('lithium') ||
    combined.includes('hazard') ||
    combined.includes('critical')
  const parsedDate = new Date(log.date)
  const validDate = !Number.isNaN(parsedDate.getTime())
  const dateDisplay = validDate
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(parsedDate)
    : log.date
  const periodLabel = validDate
    ? new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsedDate)
    : log.date.slice(0, 7)

  return {
    id: log.id || `${log.manifestId}-${index}`,
    recordNumber: log.manifestId,
    item: log.itemName || 'Hazardous E-Waste Unit',
    pathwayTag: isHazard ? 'Critical Hazard' : 'Salvage Components',
    pathwaySub: `${Number(log.totalWeightKg ?? 0).toFixed(2)} kg`,
    pathwayDetail: log.decisionNotes || log.recycler,
    date: dateDisplay,
    periodLabel,
    status: log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : 'Tagged',
    weightKg: Number(log.totalWeightKg ?? 0),
    isHazard,
  }
}

function triggerDisposalCsvDownload(records: DisposalRecord[]): void {
  const csv =
    'data:text/csv;charset=utf-8,' +
    [
      'Manifest_ID,Item,Pathway,Weight_kg,Details,Date,Status',
      ...records.map(
        (r) =>
          `${r.recordNumber},"${r.item.replace(/"/g, '""')}",${r.pathwayTag},${r.weightKg},"${r.pathwayDetail.replace(/"/g, '""')}",${r.date},${r.status}`
      ),
    ].join('\n')
  const link = document.createElement('a')
  link.href = encodeURI(csv)
  link.download = `ecobyte-disposal-manifests-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const AdminDisposalPage: FC = () => {
  const [records, setRecords] = useState<DisposalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Critical Hazard' | 'Precious Metals' | 'Polymer Shred' | 'Salvage Components'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const [periodAnchor, setPeriodAnchor] = useState<null | HTMLElement>(null)
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)

  useEffect(() => {
    let active = true
    adminApi
      .getDisposalLogs()
      .then((logs) => {
        if (!active) return
        setRecords(logs.map(mapDisposalLog))
        setErrorMsg(null)
      })
      .catch((err: any) => {
        if (!active) return
        console.warn('Could not load disposal logs from backend, keeping cached records:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const availablePeriods = ['all', ...Array.from(new Set(records.map((r) => r.periodLabel)))]

  const handlePeriodClick = (event: MouseEvent<HTMLElement>) => {
    setPeriodAnchor(event.currentTarget)
  }

  const handlePeriodSelect = (period: string) => {
    setPeriodFilter(period)
    setCurrentPage(1)
    setPeriodAnchor(null)
  }

  const handleFilterClick = (event: MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget)
  }

  const handleCategorySelect = (category: typeof categoryFilter) => {
    setCategoryFilter(category)
    setCurrentPage(1)
    setFilterAnchor(null)
  }

  const filteredRecords = records.filter((rec) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesSearch =
        rec.recordNumber.toLowerCase().includes(q) ||
        rec.item.toLowerCase().includes(q) ||
        rec.pathwayTag.toLowerCase().includes(q) ||
        rec.pathwayDetail.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }

    if (periodFilter !== 'all' && rec.periodLabel !== periodFilter) {
      return false
    }

    if (categoryFilter !== 'all' && rec.pathwayTag !== categoryFilter) {
      return false
    }

    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize)
  const totalDivertedKg = Number(records.reduce((sum, r) => sum + r.weightKg, 0).toFixed(2))
  const hazardCount = records.filter((r) => r.isHazard).length
  const hazardPct = records.length > 0 ? Math.round((hazardCount / records.length) * 100) : 0
  const salvagePct = records.length > 0 ? 100 - hazardPct : 0

  const handleExportManifest = () => {
    triggerDisposalCsvDownload(filteredRecords)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* ── Page Header Row ── */}
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
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Lifecycle Governance
            </Typography>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
              Audit Manifest
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
            Disposal records
          </Typography>
        </Box>

        {/* Sync Indicator & CSV Export */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 0.85,
              borderRadius: '9999px',
              backgroundColor: '#eff4ff',
              border: '1px solid #dce9ff',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '9999px',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
              EPA &amp; Basel Convention Sync: Active
            </Typography>
          </Box>

          <ButtonBase
            onClick={handleExportManifest}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2.25,
              py: 0.85,
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
              '&:hover': { backgroundColor: '#15803d' },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Export Manifest CSV</span>
          </ButtonBase>
        </Box>
      </Box>

      {/* ── Primary Split Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '8fr 4fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Left Main Panel: Records Table & Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Filter and Operational Bar */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              p: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <SearchRoundedIcon
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: 18,
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Record ID (#DR-...), Serial, or Item..."
                style={{
                  width: '100%',
                  height: 38,
                  paddingLeft: 36,
                  paddingRight: 12,
                  borderRadius: 8,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ButtonBase
                onClick={handlePeriodClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: '8px',
                  backgroundColor: periodFilter !== 'all' ? '#eff4ff' : '#f1f5f9',
                  color: periodFilter !== 'all' ? '#1e40af' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#e0e7ff' },
                }}
              >
                <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
                <span>Period: {periodFilter === 'all' ? 'All' : periodFilter}</span>
              </ButtonBase>

              <Menu
                anchorEl={periodAnchor}
                open={Boolean(periodAnchor)}
                onClose={() => setPeriodAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                      minWidth: 150,
                    },
                  },
                }}
              >
                {availablePeriods.map((period) => (
                  <MenuItem
                    key={period}
                    selected={periodFilter === period}
                    onClick={() => handlePeriodSelect(period)}
                    sx={{ fontSize: '0.8125rem', py: 0.8 }}
                  >
                    <ListItemText primary={period === 'all' ? 'All Periods' : period} />
                    {periodFilter === period && (
                      <ListItemIcon sx={{ minWidth: 24, justifyContent: 'flex-end' }}>
                        <CheckRoundedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                ))}
              </Menu>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: '8px',
                  backgroundColor: '#eff4ff',
                  color: '#15803d',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Chain-of-Custody: 100%</span>
              </Box>

              <ButtonBase
                onClick={handleFilterClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: '8px',
                  backgroundColor: categoryFilter !== 'all' ? '#dcfce7' : '#f1f5f9',
                  color: categoryFilter !== 'all' ? '#15803d' : '#0f172a',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#e2e8f0' },
                }}
              >
                <FilterListRoundedIcon sx={{ fontSize: 16 }} />
                <span>{categoryFilter !== 'all' ? categoryFilter : 'Filters'}</span>
              </ButtonBase>

              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={() => setFilterAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                      minWidth: 190,
                    },
                  },
                }}
              >
                {(
                  [
                    'all',
                    'Critical Hazard',
                    'Precious Metals',
                    'Polymer Shred',
                    'Salvage Components',
                  ] as const
                ).map((cat) => (
                  <MenuItem
                    key={cat}
                    selected={categoryFilter === cat}
                    onClick={() => handleCategorySelect(cat)}
                    sx={{ fontSize: '0.8125rem', py: 0.8 }}
                  >
                    <ListItemText primary={cat === 'all' ? 'All Waste Streams' : cat} />
                    {categoryFilter === cat && (
                      <ListItemIcon sx={{ minWidth: 24, justifyContent: 'flex-end' }}>
                        <CheckRoundedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>

          {/* High-Density Certified Records Table */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr auto',
                  sm: '2fr 3fr 4fr 2fr 1fr',
                },
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                backgroundColor: '#eff4ff',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#475569',
                alignItems: 'center',
              }}
            >
              <Box>Record</Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Item Description</Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>AI Suggestion &amp; Pathway</Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Marked On</Box>
              <Box sx={{ textAlign: 'right' }}>Status</Box>
            </Box>

            {/* Table Rows */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {isLoading ? (
                <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} sx={{ color: '#16a34a' }} />
                </Box>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => (
                  <Box
                    key={rec.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr auto',
                        sm: '2fr 3fr 4fr 2fr 1fr',
                      },
                      gap: 1.5,
                      alignItems: 'center',
                      px: 2.5,
                      py: 1.75,
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: '#eff4ff' },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    {/* Record ID */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          color: '#16a34a',
                        }}
                      >
                        {rec.recordNumber}
                      </Typography>
                      {rec.isHazard ? (
                        <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#d97706' }} />
                      ) : (
                        <LockRoundedIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                      )}
                    </Box>

                    {/* Item Description */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                        {rec.item}
                      </Typography>
                    </Box>

                    {/* AI Suggestion & Pathway */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.15,
                            borderRadius: '4px',
                            backgroundColor: rec.isHazard ? '#fee2e2' : '#dcfce7',
                            color: rec.isHazard ? '#dc2626' : '#15803d',
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {rec.pathwayTag}
                        </Box>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {rec.pathwaySub}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {rec.pathwayDetail}
                      </Typography>
                    </Box>

                    {/* Marked On */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                        {rec.date}
                      </Typography>
                    </Box>

                    {/* Status Badge */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.25,
                          py: 0.25,
                          borderRadius: '9999px',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {rec.status}
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 6, textAlign: 'center', color: '#64748b' }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    No certified records found matching your filter criteria.
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
                    Try clearing your search query or selecting a different waste stream or period.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Table Footer */}
            <Box
              sx={{
                p: 1.5,
                px: 2.5,
                backgroundColor: '#eff4ff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                <span>All manifests cryptographically signed and turned over to certified downstream smelters.</span>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <span>
                  Showing {filteredRecords.length > 0 ? (safePage - 1) * pageSize + 1 : 0}-
                  {Math.min(safePage * pageSize, filteredRecords.length)} of {filteredRecords.length} records • Page {safePage} of {totalPages}
                </span>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ButtonBase
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    aria-label="Previous page"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: safePage <= 1 ? '#cbd5e1' : '#0f172a',
                      cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                      '&:hover': safePage > 1 ? { backgroundColor: '#f1f5f9' } : {},
                    }}
                  >
                    <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: safePage >= totalPages ? '#cbd5e1' : '#0f172a',
                      cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                      '&:hover': safePage < totalPages ? { backgroundColor: '#f1f5f9' } : {},
                    }}
                  >
                    <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                  </ButtonBase>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Quick Facility Logistics 3-card row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                  Next Courier Haul
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Tomorrow, 08:30 AM (Umicore)
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  backgroundColor: '#eff4ff',
                  color: '#006a61',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                  Buffer Zone Load
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  480 kg / 2,000 kg (24%)
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  backgroundColor: '#ffdcc3',
                  color: '#804300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                  R2v3 / e-Stewards
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Certified downstream chain
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Secondary Panel: Records & Disposal Summary */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Records Explainer Card */}
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
            <Box sx={{ pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  Records
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '4px',
                    backgroundColor: '#eff4ff',
                    color: '#475569',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Auto-Pipeline
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Created automatically when an item is marked for disposal.
              </Typography>
            </Box>

            {/* Disposal Summary Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Disposal summary by e-waste type
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16a34a' }}>
                Q4 Fiscal Target
              </Typography>
            </Box>

            {/* Circular Metric Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#eff4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>
                  Total Diverted to Smelters
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {totalDivertedKg}
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#16a34a' }}>
                    kg
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75, color: '#15803d', fontSize: '0.6875rem', fontWeight: 700 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 14 }} />
                  <span>{records.length} logged manifests</span>
                </Box>
              </Box>

              {/* Donut Chart */}
              <Box sx={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#dce9ff" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#16a34a" strokeDasharray="42 100" strokeLinecap="round" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f59e0b" strokeDasharray="28 100" strokeDashoffset="-42" strokeLinecap="round" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#006a61" strokeDasharray="20 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="3" />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    100%
                  </Typography>
                  <Typography sx={{ fontSize: '0.5rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Tracked
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Category Breakdown Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              {[
                { label: 'Lithium / Critical Hazards', count: `${hazardCount} items`, percent: hazardPct, color: '#f59e0b' },
                { label: 'Certified Recycling & Salvage', count: `${records.length - hazardCount} items`, percent: salvagePct, color: '#16a34a' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#475569' }}>
                      {item.count} ({item.percent}%)
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 6, borderRadius: '9999px', backgroundColor: '#eff4ff', overflow: 'hidden' }}>
                    <Box sx={{ width: `${item.percent}%`, height: '100%', backgroundColor: item.color, borderRadius: '9999px' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={4500}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
export default AdminDisposalPage


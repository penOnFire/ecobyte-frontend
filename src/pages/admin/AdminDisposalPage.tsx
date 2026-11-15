import { useState, type FC, type MouseEvent } from 'react'
import { Box, ButtonBase, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
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

interface DisposalRecord {
  id: string
  recordNumber: string
  item: string
  pathwayTag: string
  pathwaySub: string
  pathwayDetail: string
  date: string
  status: string
  isHazard?: boolean
}

const DISPOSAL_RECORDS: DisposalRecord[] = [
  {
    id: '1',
    recordNumber: '#DR-9842',
    item: 'Cisco Catalyst 3850',
    pathwayTag: 'Precious Metals',
    pathwaySub: '99.2% match',
    pathwayDetail: 'Further assessment (Gold/Palladium Recovery)',
    date: 'Oct 24, 2024',
    status: 'Turned over',
  },
  {
    id: '2',
    recordNumber: '#DR-9839',
    item: 'DJI Matrice 300 TB60 LiPo',
    pathwayTag: 'Critical Hazard',
    pathwaySub: 'Class 9',
    pathwayDetail: 'Further assessment (Severe Thermal Risk / Swollen)',
    date: 'Oct 24, 2024',
    status: 'Turned over',
    isHazard: true,
  },
  {
    id: '3',
    recordNumber: '#DR-9831',
    item: 'Dell PowerEdge Server Blade',
    pathwayTag: 'Precious Metals',
    pathwaySub: '98.6% match',
    pathwayDetail: 'Smelting extraction (PCB Gold Fingers)',
    date: 'Oct 23, 2024',
    status: 'Turned over',
  },
  {
    id: '4',
    recordNumber: '#DR-9814',
    item: 'Zebra TC52x Handheld Scanner',
    pathwayTag: 'Polymer Shred',
    pathwaySub: 'Zero Landfill',
    pathwayDetail: 'Further assessment (Plastic Shredding & Pellets)',
    date: 'Oct 22, 2024',
    status: 'Turned over',
  },
  {
    id: '5',
    recordNumber: '#DR-9807',
    item: 'HP LaserJet Enterprise M608',
    pathwayTag: 'Salvage Components',
    pathwaySub: 'Recycled',
    pathwayDetail: 'Further assessment (Fuser unit & board recycling)',
    date: 'Oct 21, 2024',
    status: 'Turned over',
  },
  {
    id: '6',
    recordNumber: '#DR-9799',
    item: 'Apple MacBook Pro 15 (2018)',
    pathwayTag: 'Precious Metals',
    pathwaySub: '99.0% match',
    pathwayDetail: 'Logic board gold recovery & chassis aluminum melt',
    date: 'Oct 19, 2024',
    status: 'Turned over',
  },
  {
    id: '7',
    recordNumber: '#DR-9782',
    item: 'Samsung Galaxy Note 8 Battery',
    pathwayTag: 'Critical Hazard',
    pathwaySub: 'Class 9',
    pathwayDetail: 'Hazmat isolation cell (Severe electrolyte rupture)',
    date: 'Oct 15, 2024',
    status: 'Turned over',
    isHazard: true,
  },
  {
    id: '8',
    recordNumber: '#DR-9764',
    item: 'APC Smart-UPS 1500VA',
    pathwayTag: 'Critical Hazard',
    pathwaySub: 'Lead-Acid',
    pathwayDetail: 'Acid neutralizer chamber and lead reclamation',
    date: 'Oct 10, 2024',
    status: 'Turned over',
    isHazard: true,
  },
  {
    id: '9',
    recordNumber: '#DR-9740',
    item: 'Sony Trinitron CRT 21-inch',
    pathwayTag: 'Salvage Components',
    pathwaySub: 'Heavy Metal',
    pathwayDetail: 'Phosphor & leaded funnel glass certified segregation',
    date: 'Sep 28, 2024',
    status: 'Turned over',
  },
  {
    id: '10',
    recordNumber: '#DR-9715',
    item: 'Lenovo ThinkPad T470 Chassis',
    pathwayTag: 'Polymer Shred',
    pathwaySub: 'ABS/PC Resin',
    pathwayDetail: 'Cryogenic milling into high-grade feedstock',
    date: 'Sep 22, 2024',
    status: 'Turned over',
  },
  {
    id: '11',
    recordNumber: '#DR-9690',
    item: 'Industrial Inverter Controller',
    pathwayTag: 'Precious Metals',
    pathwaySub: 'Copper/Silver',
    pathwayDetail: 'Electrolytic refining and busbar extraction',
    date: 'Sep 14, 2024',
    status: 'Turned over',
  },
  {
    id: '12',
    recordNumber: '#DR-9650',
    item: 'Segway Ninebot ES4 External Battery',
    pathwayTag: 'Critical Hazard',
    pathwaySub: 'Class 9',
    pathwayDetail: 'Submerged brine discharge & pyrometallurgical smelt',
    date: 'Aug 29, 2024',
    status: 'Turned over',
    isHazard: true,
  },
  {
    id: '13',
    recordNumber: '#DR-9610',
    item: 'Canon PIXMA Inkjet Housing',
    pathwayTag: 'Polymer Shred',
    pathwaySub: 'Zero Landfill',
    pathwayDetail: 'Non-toxic plastic compounding lot #4',
    date: 'Aug 18, 2024',
    status: 'Turned over',
  },
]

export const AdminDisposalPage: FC = () => {
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState<'all' | 'Oct 2024' | 'Sep 2024' | 'Aug 2024'>('Oct 2024')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Critical Hazard' | 'Precious Metals' | 'Polymer Shred' | 'Salvage Components'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const [periodAnchor, setPeriodAnchor] = useState<null | HTMLElement>(null)
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)

  const handlePeriodClick = (event: MouseEvent<HTMLElement>) => {
    setPeriodAnchor(event.currentTarget)
  }

  const handlePeriodSelect = (period: typeof periodFilter) => {
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

  const filteredRecords = DISPOSAL_RECORDS.filter((rec) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesSearch =
        rec.recordNumber.toLowerCase().includes(q) ||
        rec.item.toLowerCase().includes(q) ||
        rec.pathwayTag.toLowerCase().includes(q) ||
        rec.pathwayDetail.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }

    // Period filter
    if (periodFilter !== 'all') {
      if (!rec.date.includes(periodFilter)) return false
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (rec.pathwayTag !== categoryFilter) return false
    }

    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize)

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
                {(['all', 'Oct 2024', 'Sep 2024', 'Aug 2024'] as const).map((period) => (
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
              {paginatedRecords.length > 0 ? (
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
                    18.4
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#16a34a' }}>
                    Tons
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75, color: '#15803d', fontSize: '0.6875rem', fontWeight: 700 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 14 }} />
                  <span>+12.4% vs last billing cycle</span>
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
                { label: 'Precious Metals (Gold/Pd)', weight: '7.7 Tons', percent: 42, color: '#16a34a' },
                { label: 'Lithium Battery Hazards', weight: '5.2 Tons', percent: 28, color: '#f59e0b' },
                { label: 'Circuit Boards / PCBs', weight: '3.7 Tons', percent: 20, color: '#006a61' },
                { label: 'Structural Polymers', weight: '1.8 Tons', percent: 10, color: '#64748b' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#475569' }}>
                      {item.weight} ({item.percent}%)
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
    </Box>
  )
}
export default AdminDisposalPage


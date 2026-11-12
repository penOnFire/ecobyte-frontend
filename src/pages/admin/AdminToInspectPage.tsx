import { useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded'
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded'
import DnsRoundedIcon from '@mui/icons-material/DnsRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

interface QueueItem {
  id: string
  name: string
  serial: string
  specs: string
  date: string
  relativeDate: string
  risk: 'High Risk' | 'Medium Risk' | 'Low Risk'
  suggestion: string
  icon: typeof LaptopMacRoundedIcon
}

const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'AP-882194-X',
    name: 'MacBook Pro 15" Retina',
    serial: 'SN: AP-882194-X',
    specs: 'Core i7, 16GB',
    date: 'Oct 22, 2024',
    relativeDate: '4 days ago',
    risk: 'High Risk',
    suggestion: 'Battery swelling detected, recommend hazardous disposal or battery replacement',
    icon: LaptopMacRoundedIcon,
  },
  {
    id: 'DE-552011-R',
    name: 'Dell PowerEdge R740xd',
    serial: 'SN: DE-552011-R',
    specs: '2U Chassis',
    date: 'Oct 23, 2024',
    relativeDate: '3 days ago',
    risk: 'Low Risk',
    suggestion: 'Fully intact chassis, suitable for enterprise refurbishing and reuse',
    icon: DnsRoundedIcon,
  },
  {
    id: 'CS-00914-SW',
    name: 'Cisco Catalyst 3850',
    serial: 'SN: CS-00914-SW',
    specs: '48-Port PoE',
    date: 'Oct 24, 2024',
    relativeDate: '2 days ago',
    risk: 'Low Risk',
    suggestion: 'Power supply intact, factory reset verified, route to Reuse Hub',
    icon: HubRoundedIcon,
  },
  {
    id: 'ZB-4410-X',
    name: 'Zebra TC52x Scanner',
    serial: 'SN: ZB-4410-X',
    specs: 'Android Handheld',
    date: 'Oct 25, 2024',
    relativeDate: '1 day ago',
    risk: 'Medium Risk',
    suggestion: 'Minor display scuff, check barcode imager functionality',
    icon: QrCodeScannerRoundedIcon,
  },
  {
    id: 'DJI-TB60-993',
    name: 'DJI Matrice 300 TB60',
    serial: 'SN: DJI-TB60-993',
    specs: 'LiPo Smart Battery',
    date: 'Oct 25, 2024',
    relativeDate: '1 day ago',
    risk: 'High Risk',
    suggestion: 'Thermal deformation detected, immediate battery isolation required',
    icon: BatteryAlertRoundedIcon,
  },
  {
    id: 'LN-991204-C',
    name: 'Lenovo ThinkPad X1 Carbon',
    serial: 'SN: LN-991204-C',
    specs: '8th Gen i5',
    date: 'Oct 26, 2024',
    relativeDate: 'Today',
    risk: 'Low Risk',
    suggestion: 'Clean cosmetic condition, test display backlight and keyboard',
    icon: LaptopMacRoundedIcon,
  },
]

export const AdminToInspectPage: FC = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'waiting' | 'inspected' | 'all'>('waiting')
  const [search, setSearch] = useState('')

  const filteredItems = QUEUE_ITEMS.filter((item) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.serial.toLowerCase().includes(q) ||
      item.suggestion.toLowerCase().includes(q)
    )
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* ── Top Headline & Triage Stat Header ── */}
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
              Triage &amp; Intake Ledger
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
            To inspect
          </Typography>
        </Box>

        {/* Quick Stats Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 0.85,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <PendingActionsRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
              Pending queue:
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
              6 Assets
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 0.85,
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#dc2626' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b' }}>
              2 Critical hazards
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Primary 2-Column Responsive Workspace Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Left Main Panel: Filters & Queue Table */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Search & Status Filter Module */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              p: 2.5,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Search Input Bar */}
            <Box sx={{ position: 'relative', width: '100%' }}>
              <SearchRoundedIcon
                sx={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: 20,
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items by serial, model, or category..."
                style={{
                  width: '100%',
                  height: 44,
                  paddingLeft: 44,
                  paddingRight: 60,
                  borderRadius: 8,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  backgroundColor: '#e2e8f0',
                  color: '#64748b',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                ⌘K
              </Box>
            </Box>

            {/* Filter Pill Tabs + FIFO Indicator */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  backgroundColor: '#f1f5f9',
                  p: 0.5,
                  borderRadius: '9999px',
                  gap: 0.5,
                }}
              >
                <ButtonBase
                  onClick={() => setFilter('waiting')}
                  sx={{
                    px: 2,
                    py: 0.7,
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    backgroundColor: filter === 'waiting' ? '#16a34a' : 'transparent',
                    color: filter === 'waiting' ? '#ffffff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: filter === 'waiting' ? '0 1px 4px rgba(22, 163, 74, 0.3)' : 'none',
                  }}
                >
                  <span>Waiting</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: '9999px',
                      backgroundColor: filter === 'waiting' ? 'rgba(255,255,255,0.25)' : '#cbd5e1',
                      color: filter === 'waiting' ? '#ffffff' : '#0f172a',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                    }}
                  >
                    6
                  </span>
                </ButtonBase>

                <ButtonBase
                  onClick={() => setFilter('inspected')}
                  sx={{
                    px: 2,
                    py: 0.7,
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    backgroundColor: filter === 'inspected' ? '#ffffff' : 'transparent',
                    color: filter === 'inspected' ? '#0f172a' : '#475569',
                    border: filter === 'inspected' ? '1px solid #e2e8f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span>Inspected</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: '9999px',
                      backgroundColor: '#cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                    }}
                  >
                    18
                  </span>
                </ButtonBase>

                <ButtonBase
                  onClick={() => setFilter('all')}
                  sx={{
                    px: 2,
                    py: 0.7,
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    backgroundColor: filter === 'all' ? '#ffffff' : 'transparent',
                    color: filter === 'all' ? '#0f172a' : '#475569',
                    border: filter === 'all' ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  <span>All items</span>
                </ButtonBase>
              </Box>

              {/* FIFO Sorting Tool */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SwapVertRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  FIFO Sorted
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  (Oldest dropped off first)
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Device Queue Card List & Headers */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Table Header Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr auto',
                  sm: '3fr 1.5fr 1.5fr 3fr 1fr',
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
              <Box>Item &amp; Asset Details</Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Dropped Off</Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Health Risk</Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>AI Suggestion</Box>
              <Box sx={{ textAlign: 'right' }}>Action</Box>
            </Box>

            {/* Table Rows */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {filteredItems.map((item) => {
                const Icon = item.icon
                const isHighRisk = item.risk === 'High Risk'
                const isMediumRisk = item.risk === 'Medium Risk'

                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr auto',
                        sm: '3fr 1.5fr 1.5fr 3fr 1fr',
                      },
                      gap: 1.5,
                      alignItems: 'center',
                      px: 2.5,
                      py: 1.75,
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        backgroundColor: '#eff4ff',
                      },
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    {/* Item Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shrink: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#0b1c30',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.6875rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.serial} • {item.specs}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Dropped Off */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                        {item.date}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: item.relativeDate.includes('Today') ? '#16a34a' : isHighRisk ? '#dc2626' : '#64748b',
                        }}
                      >
                        {item.relativeDate}
                      </Typography>
                    </Box>

                    {/* Health Risk Badge */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.25,
                          py: 0.35,
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: isHighRisk ? '#fee2e2' : isMediumRisk ? '#fef3c7' : '#dcfce7',
                          color: isHighRisk ? '#b91c1c' : isMediumRisk ? '#b45309' : '#15803d',
                        }}
                      >
                        {!isHighRisk && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '9999px',
                              backgroundColor: isMediumRisk ? '#d97706' : '#16a34a',
                            }}
                          />
                        )}
                        {item.risk}
                      </Box>
                    </Box>

                    {/* AI Suggestion */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.6875rem',
                          color: '#475569',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {item.suggestion}
                      </Box>
                    </Box>

                    {/* Inspect Button */}
                    <Box sx={{ textAlign: 'right' }}>
                      <ButtonBase
                        onClick={() => navigate(`/admin/inspect?item=${item.id}`)}
                        sx={{
                          height: 32,
                          px: 1.75,
                          borderRadius: '8px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          boxShadow: '0 1px 3px rgba(22, 163, 74, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            backgroundColor: '#15803d',
                          },
                        }}
                      >
                        <span>Inspect</span>
                        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                      </ButtonBase>
                    </Box>
                  </Box>
                )
              })}
            </Box>

            {/* Bottom Pagination Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.5,
                backgroundColor: '#eff4ff',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <span>Showing 1-6 of 6 triage items awaiting physical diagnostic</span>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.35,
                    borderRadius: '4px',
                    backgroundColor: '#e2e8f0',
                    color: '#94a3b8',
                    fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                >
                  Previous
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#0f172a', px: 0.5 }}>1</Typography>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.35,
                    borderRadius: '4px',
                    backgroundColor: '#e2e8f0',
                    color: '#94a3b8',
                    fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                >
                  Next
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Secondary Panel: 'How it works' SOP */}
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            p: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
                  <SchemaRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#0b1c30',
                    letterSpacing: '-0.01em',
                  }}
                >
                  How it works
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '9999px',
                  backgroundColor: '#eff4ff',
                  color: '#475569',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                Standard SOP
              </Box>
            </Box>

            {/* Step Progression Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Step 1 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.75,
                  p: 1.75,
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '9999px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shrink: 0,
                  }}
                >
                  1
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Resident drops off the device
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                    Physical intake pod logs weight and photographic scan.
                  </Typography>
                </Box>
              </Box>

              {/* Step 2 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.75,
                  p: 1.75,
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '9999px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shrink: 0,
                  }}
                >
                  2
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    System checks it in
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                    Automated visual diagnostics and OEM model verification.
                  </Typography>
                </Box>
              </Box>

              {/* Step 3 (Active highlight step) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.75,
                  p: 1.75,
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.12)',
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '9999px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shrink: 0,
                  }}
                >
                  3
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                      You inspect it physically
                    </Typography>
                    <Box
                      sx={{
                        px: 0.75,
                        py: 0.15,
                        borderRadius: '4px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontSize: '0.5625rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      Current
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#334155', mt: 0.25 }}>
                    Verify safety markers, cosmetic grade, and test boot status.
                  </Typography>
                </Box>
              </Box>

              {/* Step 4 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.75,
                  p: 1.75,
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '9999px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shrink: 0,
                  }}
                >
                  4
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    List in Reuse Hub or mark for disposal
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                    Grade A/B routed to refurb catalog; hazardous lots to smelt recycling.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Circular Efficiency Visual Metric */}
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#eff4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Daily Triage Rate
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  84.2%
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#16a34a', mt: 0.25 }}>
                  +12% faster than target SLA
                </Typography>
              </Box>

              {/* Donut gauge */}
              <Box sx={{ position: 'relative', width: 56, height: 56 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#dce9ff"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#16a34a"
                    strokeDasharray="84, 100"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bottom Note Box */}
          <Box
            sx={{
              p: 1.75,
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
              Automatic: no admin action needed here
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default AdminToInspectPage

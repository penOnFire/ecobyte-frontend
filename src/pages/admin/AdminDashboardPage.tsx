import { useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
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

export const AdminDashboardPage: FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'q3' | 'custom'>('7d')
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

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
              1,420
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
              <TrendingUpRoundedIcon sx={{ fontSize: 14 }} /> +8.4%
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
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>47 / day</Typography>
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
              24
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
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>3.8 hrs</Typography>
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
              850
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
              59.8%
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
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Est. recovery</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>$42.8k</Typography>
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
              546
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
              38.4%
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
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Batch #18</Typography>
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
              12
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
                  <text x="35" y="24" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">500</text>
                  <text x="35" y="69" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">375</text>
                  <text x="35" y="114" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">250</text>
                  <text x="35" y="159" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">125</text>
                  <text x="35" y="204" textAnchor="end" fontSize="9" fill="#64748b" fontWeight="600">0</text>

                  {/* Bar 1: Laptops (412) */}
                  <g style={{ cursor: 'pointer' }}>
                    <rect x="65" y="52" width="46" height="148" rx="4" fill="#15803d" />
                    <rect x="65" y="52" width="46" height="8" rx="2" fill="#4ade80" opacity="0.9" />
                    <text x="88" y="44" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">412</text>
                    <text x="88" y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">Laptops</text>
                  </g>

                  {/* Bar 2: Li-Ion (284) */}
                  <g style={{ cursor: 'pointer' }}>
                    <rect x="142" y="98" width="46" height="102" rx="4" fill="#16a34a" />
                    <rect x="142" y="98" width="46" height="8" rx="2" fill="#86efac" opacity="0.9" />
                    <text x="165" y="90" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">284</text>
                    <text x="165" y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">Li-Ion</text>
                  </g>

                  {/* Bar 3: Mobile/IoT (320) */}
                  <g style={{ cursor: 'pointer' }}>
                    <rect x="220" y="85" width="46" height="115" rx="4" fill="#22c55e" />
                    <rect x="220" y="85" width="46" height="8" rx="2" fill="#bbf7d0" opacity="0.9" />
                    <text x="243" y="77" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">320</text>
                    <text x="243" y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">Mobile/IoT</text>
                  </g>

                  {/* Bar 4: Displays (185) */}
                  <g style={{ cursor: 'pointer' }}>
                    <rect x="298" y="133" width="46" height="67" rx="4" fill="#15803d" />
                    <rect x="298" y="133" width="46" height="6" rx="2" fill="#4ade80" opacity="0.9" />
                    <text x="321" y="125" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">185</text>
                    <text x="321" y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">Displays</text>
                  </g>

                  {/* Bar 5: Small Appliances (145) */}
                  <g style={{ cursor: 'pointer' }}>
                    <rect x="375" y="148" width="46" height="52" rx="4" fill="#334155" />
                    <text x="398" y="140" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">145</text>
                    <text x="398" y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">Appliances</text>
                  </g>

                  {/* Bar 6: Telemetry/Network (74) */}
                  <g style={{ cursor: 'pointer' }}>
                    <rect x="452" y="173" width="46" height="27" rx="4" fill="#d97706" />
                    <rect x="452" y="173" width="46" height="4" rx="1" fill="#fde68a" opacity="0.9" />
                    <text x="475" y="165" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">74</text>
                    <text x="475" y="217" textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">Network</text>
                  </g>
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
                    Laptops / Compute (29%)
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#eff4ff', py: 1.25, px: 1.5, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Hazard Share
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706', mt: 0.25 }}>
                    20.0% (Li-Ion)
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#eff4ff', py: 1.25, px: 1.5, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Net Intake Weight
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#15803d', mt: 0.25 }}>
                    3,890 kg
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
                  {[
                    { name: 'Laptops & PCs', units: '412', weight: '1,154 kg', hazmat: 'Class II', hazmatBg: '#f1f5f9', hazmatColor: '#475569', rate: '78.4%', rateColor: '#15803d', dot: '#15803d' },
                    { name: 'Lithium Battery Packs', units: '284', weight: '426 kg', hazmat: 'Critical', hazmatBg: '#fee2e2', hazmatColor: '#991b1b', rate: '14.1%', rateColor: '#d97706', dot: '#16a34a' },
                    { name: 'Smart Devices & Mobiles', units: '320', weight: '160 kg', hazmat: 'Class I', hazmatBg: '#f1f5f9', hazmatColor: '#475569', rate: '84.2%', rateColor: '#15803d', dot: '#22c55e' },
                    { name: 'CRT & Flat Displays', units: '185', weight: '1,380 kg', hazmat: 'Heavy Metal', hazmatBg: '#ffdcc3', hazmatColor: '#804300', rate: '42.0%', rateColor: '#475569', dot: '#15803d' },
                    { name: 'Small Office Appliances', units: '145', weight: '580 kg', hazmat: 'Class I', hazmatBg: '#f1f5f9', hazmatColor: '#475569', rate: '62.8%', rateColor: '#15803d', dot: '#334155' },
                    { name: 'Telemetry & Routing', units: '74', weight: '190 kg', hazmat: 'Class II', hazmatBg: '#f1f5f9', hazmatColor: '#475569', rate: '91.9%', rateColor: '#15803d', dot: '#d97706' },
                  ].map((row) => (
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
                <text x="377" y="36" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="700">~2,180 u</text>

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
    </Box>
  )
}
export default AdminDashboardPage

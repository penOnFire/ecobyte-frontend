import { useEffect, useState, type FC } from 'react'
import { Alert, Box, ButtonBase, CircularProgress, Snackbar, Typography } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded'
import TabletMacRoundedIcon from '@mui/icons-material/TabletMacRounded'
import MouseRoundedIcon from '@mui/icons-material/MouseRounded'
import RouterRoundedIcon from '@mui/icons-material/RouterRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { adminApi, type AdminReuseInventoryItem } from '@/lib/api'

interface HubItem {
  id: string
  name: string
  sub: string
  grade: string
  hub: string
  locker: string
  status: 'Available' | 'Reserved' | 'Claimed'
  pickupDate: string
  icon: typeof LaptopMacRoundedIcon
  colorBg: string
  colorText: string
}

function mapInventoryItem(item: AdminReuseInventoryItem): HubItem {
  const cat = `${item.category} ${item.title}`.toLowerCase()
  let icon = LaptopMacRoundedIcon
  if (cat.includes('keyboard') || cat.includes('peripheral')) icon = KeyboardRoundedIcon
  else if (cat.includes('monitor') || cat.includes('display')) icon = DesktopWindowsRoundedIcon
  else if (cat.includes('tablet') || cat.includes('ipad') || cat.includes('phone')) icon = TabletMacRoundedIcon
  else if (cat.includes('mouse')) icon = MouseRoundedIcon
  else if (cat.includes('router') || cat.includes('switch')) icon = RouterRoundedIcon

  const isAvail = item.status === 'Available'
  const isRes = item.status === 'Reserved'

  return {
    id: item.id,
    name: item.title,
    sub: item.description || item.category,
    grade: item.condition,
    hub: item.hub || 'Commonwealth Area 1 Eco-Hub',
    locker: item.lockerBay,
    status: item.status,
    pickupDate: item.createdAt || '—',
    icon,
    colorBg: isAvail ? '#ecfdf5' : isRes ? '#fef3c7' : '#f1f5f9',
    colorText: isAvail ? '#15803d' : isRes ? '#b45309' : '#475569',
  }
}

export const AdminReuseHubPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'Available' | 'Reserved' | 'Claimed'>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<HubItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .getReuseInventory()
      .then((rows) => {
        if (!active) return
        setItems(rows.map(mapInventoryItem))
        setErrorMsg(null)
      })
      .catch((err: any) => {
        if (!active) return
        console.warn('Could not load Reuse Hub inventory from backend, keeping cached items:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const availableCount = items.filter((i) => i.status === 'Available').length
  const reservedCount = items.filter((i) => i.status === 'Reserved').length
  const claimedCount = items.filter((i) => i.status === 'Claimed').length

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all' && item.status !== activeTab) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.hub.toLowerCase().includes(q)
    )
  })

  const handleExportCsv = () => {
    const csv =
      'data:text/csv;charset=utf-8,' +
      [
        'ID,Item,Category_Condition,Hub,Locker,Status,Date',
        ...filteredItems.map(
          (i) =>
            `${i.id},"${i.name.replace(/"/g, '""')}","${i.grade}","${i.hub}","${i.locker}",${i.status},${i.pickupDate}`
        ),
      ].join('\n')
    const link = document.createElement('a')
    link.href = encodeURI(csv)
    link.download = `ecobyte-reuse-inventory-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* ── Top Context Header Area ── */}
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
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Circulation Engine
            </Typography>
            <Box sx={{ width: 6, height: 6, borderRadius: '9999px', backgroundColor: '#16a34a' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Auto-Synced System
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
            Reuse Hub listings
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
            Live resident exchange portal status, auto-updated via QR station check-ins.
          </Typography>
        </Box>

        {/* Quick Tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 0.85,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '9999px',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              Node: Central-Depot-01
            </Typography>
          </Box>

          <ButtonBase
            onClick={handleExportCsv}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.85,
              borderRadius: '10px',
              backgroundColor: '#eff4ff',
              border: '1px solid #dce9ff',
              color: '#0f172a',
              fontFamily: "'Rethink Sans', 'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Export Ledger</span>
          </ButtonBase>
        </Box>
      </Box>

      {/* ── Main Grid Layout ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '8fr 4fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* LEFT PANEL: Filtered Listings */}
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
          {/* Filter Tabs & Search */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
            }}
          >
            {/* Status Tabs */}
            <Box
              sx={{
                display: 'inline-flex',
                backgroundColor: '#f1f5f9',
                p: 0.5,
                borderRadius: '9999px',
                gap: 0.5,
              }}
            >
              {[
                { id: 'all', label: 'All Listings', count: items.length },
                { id: 'Available', label: 'Available', count: availableCount },
                { id: 'Reserved', label: 'Reserved', count: reservedCount },
                { id: 'Claimed', label: 'Claimed', count: claimedCount },
              ].map((tab) => {
                const active = activeTab === tab.id
                return (
                  <ButtonBase
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    sx={{
                      px: 2,
                      py: 0.6,
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                      backgroundColor: active ? '#16a34a' : 'transparent',
                      color: active ? '#ffffff' : '#475569',
                      boxShadow: active ? '0 1px 4px rgba(22, 163, 74, 0.3)' : 'none',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{ marginLeft: 4, opacity: active ? 0.9 : 0.65 }}>({tab.count})</span>
                  </ButtonBase>
                )
              })}
            </Box>

            {/* Search Input */}
            <Box sx={{ position: 'relative', width: { xs: '100%', md: 240 } }}>
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
                placeholder="Search serial, brand, SKU..."
                style={{
                  width: '100%',
                  height: 36,
                  paddingLeft: 34,
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
          </Box>

          {/* Listings Table */}
          <Box
            sx={{
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #e2e8f0', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  <th style={{ padding: '10px 16px', width: '38%' }}>Item</th>
                  <th style={{ padding: '10px 16px', width: '26%' }}>Drop-off</th>
                  <th style={{ padding: '10px 16px', width: '18%' }}>Status</th>
                  <th style={{ padding: '10px 16px', width: '18%' }}>Pick-up date</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.8125rem', color: '#0f172a' }}>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '28px 16px', textAlign: 'center' }}>
                      <CircularProgress size={24} sx={{ color: '#16a34a' }} />
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '28px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                      No Reuse Hub listings found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                  const Icon = item.icon
                  const isAvailable = item.status === 'Available'
                  const isReserved = item.status === 'Reserved'
                  const isClaimed = item.status === 'Claimed'

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Item */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              backgroundColor: item.colorBg,
                              color: item.colorText,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon sx={{ fontSize: 18 }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{item.sub}</span>
                              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                              <span style={{ fontWeight: 600 }}>{item.grade}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Drop-off */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.hub}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{item.locker}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 10px',
                            borderRadius: 9999,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            backgroundColor: isAvailable ? '#dcfce7' : isReserved ? '#fef3c7' : '#f1f5f9',
                            color: isAvailable ? '#15803d' : isReserved ? '#b45309' : '#475569',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: isAvailable ? '#16a34a' : isReserved ? '#d97706' : '#94a3b8',
                            }}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Pick-up date */}
                      <td style={{ padding: '12px 16px' }}>
                        {isReserved ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b45309', fontWeight: 700 }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
                            <span>{item.pickupDate}</span>
                          </div>
                        ) : (
                          <span style={{ color: isClaimed ? '#0f172a' : '#94a3b8', fontWeight: isClaimed ? 600 : 400 }}>
                            {item.pickupDate}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <Box
              sx={{
                p: 1.5,
                px: 2,
                backgroundColor: '#eff4ff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <span>Showing {filteredItems.length} of {items.length} items</span>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    cursor: 'not-allowed',
                  }}
                >
                  <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#0f172a', px: 0.5 }}>Page 1</Typography>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RIGHT PANEL: Listing Summary */}
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
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#0b1c30',
                }}
              >
                Listing summary
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Circulation inventory &amp; turnover metrics
              </Typography>
            </Box>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9999px',
                backgroundColor: '#eff4ff',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QueryStatsRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          {/* 2x2 Metric Count Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {/* Available */}
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#eff4ff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Available
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {availableCount}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: '#15803d', fontSize: '0.6875rem', fontWeight: 700 }}>
                <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} />
                <span>Live catalog</span>
              </Box>
            </Box>

            {/* Reserved */}
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#eff4ff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Reserved
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d97706' }} />
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {reservedCount}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: '#475569', fontSize: '0.6875rem', fontWeight: 600 }}>
                <HourglassTopRoundedIcon sx={{ fontSize: 14, color: '#d97706' }} />
                <span>Pending pickup</span>
              </Box>
            </Box>

            {/* Claimed */}
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#eff4ff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Claimed
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#64748b' }} />
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {claimedCount}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: '#475569', fontSize: '0.6875rem', fontWeight: 600 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                <span>Verified claims</span>
              </Box>
            </Box>

            {/* Expired */}
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#eff4ff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Total Units
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {items.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: '#475569', fontSize: '0.6875rem', fontWeight: 600 }}>
                <RestartAltRoundedIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                <span>Active listings</span>
              </Box>
            </Box>
          </Box>

          {/* Live Flow Visualizer */}
          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#eff4ff', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Locker Occupancy &amp; Circulation
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                86% Efficiency
              </Typography>
            </Box>

            {/* SVG Sparkline */}
            <svg viewBox="0 0 280 40" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: 48 }}>
              <rect x="0" y="24" width="280" height="6" rx="3" fill="#e2e8f0" />
              <rect x="0" y="24" width="115" height="6" rx="3" fill="#16a34a" />
              <rect x="119" y="24" width="55" height="6" rx="3" fill="#f59e0b" />
              <rect x="178" y="24" width="98" height="6" rx="3" fill="#64748b" />
              <circle cx="20" cy="12" r="3" fill="#16a34a" />
              <circle cx="80" cy="8" r="3" fill="#16a34a" />
              <circle cx="140" cy="14" r="3" fill="#f59e0b" />
              <circle cx="210" cy="6" r="3" fill="#64748b" />
              <circle cx="265" cy="10" r="3" fill="#64748b" />
              <path d="M 20 12 Q 50 4 80 8 T 140 14 T 210 6 T 265 10" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
            </svg>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', pt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                <span>Avail ({availableCount})</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span>Res ({reservedCount})</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#64748b' }} />
                <span>Claimed ({claimedCount})</span>
              </Box>
            </Box>
          </Box>

          {/* Automatic Callout */}
          <Box
            sx={{
              mt: 'auto',
              p: 2,
              borderRadius: '10px',
              backgroundColor: '#eff4ff',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
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
                flexShrink: 0,
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                Automatic: no admin action needed here
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.25, lineHeight: 1.3 }}>
                Hardware lockers self-unlock upon NFC verification. All item states and reservations mutate programmatically.
              </Typography>
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
export default AdminReuseHubPage


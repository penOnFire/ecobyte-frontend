import { useCallback, useEffect, useState, type FC } from 'react'
import { Alert, Box, ButtonBase, CircularProgress, Snackbar, Typography } from '@mui/material'
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
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import {
  adminApi,
  type AdminCollectionRequest,
  type AdminInspectionQueueItem,
} from '@/lib/api'

function resolveCategoryIcon(category?: string, name?: string) {
  const lower = `${category || ''} ${name || ''}`.toLowerCase()
  if (lower.includes('battery') || lower.includes('lipo') || lower.includes('lithium')) {
    return BatteryAlertRoundedIcon
  }
  if (lower.includes('server') || lower.includes('rack')) return DnsRoundedIcon
  if (lower.includes('router') || lower.includes('switch') || lower.includes('network')) {
    return HubRoundedIcon
  }
  if (lower.includes('phone') || lower.includes('scanner') || lower.includes('tablet')) {
    return QrCodeScannerRoundedIcon
  }
  return LaptopMacRoundedIcon
}

export const AdminToInspectPage: FC = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'waiting' | 'inspected' | 'all'>('waiting')
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState<AdminCollectionRequest[]>([])
  const [queueItems, setQueueItems] = useState<AdminInspectionQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const fetchIntakeQueue = useCallback(async () => {
    const [reqs, items] = await Promise.all([
      adminApi.getRequests(),
      adminApi.getInspectionQueue('all'),
    ])
    return { reqs, items }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { reqs, items } = await fetchIntakeQueue()
      setRequests(reqs)
      setQueueItems(items)
    } catch (err: any) {
      console.error('Failed to load admin intake queue:', err)
      setToast({
        message: err?.message || 'Unable to load intake requests from the backend.',
        severity: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fetchIntakeQueue])

  useEffect(() => {
    let active = true
    fetchIntakeQueue()
      .then(({ reqs, items }) => {
        if (!active) return
        setRequests(reqs)
        setQueueItems(items)
      })
      .catch((err: any) => {
        if (!active) return
        console.error('Failed to load admin intake queue:', err)
        setToast({
          message: err?.message || 'Unable to load intake requests from the backend.',
          severity: 'error',
        })
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [fetchIntakeQueue])

  const isWaitingRequest = (req: AdminCollectionRequest) => {
    const s = (req.status || '').toLowerCase()
    return s === 'pending_review' || s === 'scheduled' || s === 'collected'
  }

  const isInspectedRequest = (req: AdminCollectionRequest) => {
    const s = (req.status || '').toLowerCase()
    return s === 'turned_over' || s === 'completed'
  }

  const waitingRequestsCount = requests.filter(isWaitingRequest).length
  const inspectedRequestsCount = requests.filter(isInspectedRequest).length
  const waitingItemsCount = queueItems.filter((i) => i.queueBucket !== 'inspected').length
  const inspectedItemsCount = queueItems.filter((i) => i.queueBucket === 'inspected').length

  const totalWaitingCount = waitingRequestsCount + waitingItemsCount
  const totalInspectedCount = inspectedRequestsCount + inspectedItemsCount
  const highRiskCount = queueItems.filter(
    (i) => i.queueBucket !== 'inspected' && i.risk === 'High Risk'
  ).length

  const filteredRequests = requests.filter((req) => {
    if (filter === 'waiting' && !isWaitingRequest(req)) return false
    if (filter === 'inspected' && !isInspectedRequest(req)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      req.requestCode.toLowerCase().includes(q) ||
      req.residentName.toLowerCase().includes(q) ||
      req.residentEmail.toLowerCase().includes(q) ||
      req.siteName.toLowerCase().includes(q) ||
      req.scheduledSlot.toLowerCase().includes(q)
    )
  })

  const filteredItems = queueItems.filter((item) => {
    if (filter === 'waiting' && item.queueBucket === 'inspected') return false
    if (filter === 'inspected' && item.queueBucket !== 'inspected') return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.serial.toLowerCase().includes(q) ||
      item.specs.toLowerCase().includes(q) ||
      item.suggestion.toLowerCase().includes(q)
    )
  })

  const handleMarkCollected = async (req: AdminCollectionRequest) => {
    setBusyRequestId(req.id)
    try {
      await adminApi.updateRequestStatus(req.id, 'collected')
      setToast({
        message: `${req.requestCode} marked as Collected at Barangay Hub.`,
        severity: 'success',
      })
      await loadData()
    } catch (err: any) {
      setToast({
        message: err?.message || 'Failed to update request status.',
        severity: 'error',
      })
    } finally {
      setBusyRequestId(null)
    }
  }

  const handleInspectRequest = async (req: AdminCollectionRequest) => {
    if (req.linkedItemId) {
      navigate(`/admin/inspect?item=${req.linkedItemId}`)
      return
    }
    setBusyRequestId(req.id)
    try {
      const res = await adminApi.startRequestInspection(req.id)
      navigate(`/admin/inspect?item=${res.itemId}`)
    } catch (err: any) {
      setToast({
        message: err?.message || 'Unable to start physical inspection for this request.',
        severity: 'error',
      })
      setBusyRequestId(null)
    }
  }

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
              {totalWaitingCount} {totalWaitingCount === 1 ? 'Item' : 'Items'}
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
              {highRiskCount} Critical hazards
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
                      minWidth: 18,
                      height: 18,
                      paddingInline: 5,
                      borderRadius: '9999px',
                      backgroundColor: filter === 'waiting' ? 'rgba(255,255,255,0.25)' : '#cbd5e1',
                      color: filter === 'waiting' ? '#ffffff' : '#0f172a',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                    }}
                  >
                    {totalWaitingCount}
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
                      minWidth: 18,
                      height: 18,
                      paddingInline: 5,
                      borderRadius: '9999px',
                      backgroundColor: '#cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                    }}
                  >
                    {totalInspectedCount}
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

          {/* Resident Drop-Off Requests Ledger */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.5,
                backgroundColor: '#f0fdf4',
                borderBottom: '1px solid #bbf7d0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                  Resident Drop-off Requests
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>
                {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} sx={{ color: '#16a34a' }} />
              </Box>
            ) : filteredRequests.length === 0 ? (
              <Box sx={{ py: 3.5, px: 2.5, textAlign: 'center', color: '#64748b' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  No resident drop-off requests match this filter.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {filteredRequests.map((req) => {
                  const statusLower = (req.status || '').toLowerCase()
                  const canCollect = statusLower === 'scheduled' || statusLower === 'pending_review'
                  const canInspect = statusLower !== 'cancelled' && statusLower !== 'completed' && statusLower !== 'turned_over'
                  const isBusy = busyRequestId === req.id

                  return (
                    <Box
                      key={req.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '2.5fr 2fr 2fr auto' },
                        gap: 1.5,
                        alignItems: 'center',
                        px: 2.5,
                        py: 1.75,
                        borderBottom: '1px solid #f1f5f9',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0b1c30' }}>
                            {req.requestCode}
                          </Typography>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.2,
                              borderRadius: '9999px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              backgroundColor:
                                statusLower === 'turned_over' || statusLower === 'completed'
                                  ? '#dcfce7'
                                  : statusLower === 'collected'
                                    ? '#e0f2fe'
                                    : '#fef3c7',
                              color:
                                statusLower === 'turned_over' || statusLower === 'completed'
                                  ? '#15803d'
                                  : statusLower === 'collected'
                                    ? '#0369a1'
                                    : '#b45309',
                            }}
                          >
                            {req.displayStatus}
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, mt: 0.25 }}>
                          {req.residentName} • {req.residentEmail || req.contactNumber}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                          {req.siteName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {req.scheduledSlot}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                          {req.requestedDate}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {req.relativeDate}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        {canCollect && (
                          <ButtonBase
                            disabled={isBusy}
                            onClick={() => void handleMarkCollected(req)}
                            sx={{
                              height: 32,
                              px: 1.5,
                              borderRadius: '8px',
                              backgroundColor: '#eff4ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              '&:hover': { backgroundColor: '#dbeafe' },
                            }}
                          >
                            Mark Collected
                          </ButtonBase>
                        )}
                        {canInspect && (
                          <ButtonBase
                            disabled={isBusy}
                            onClick={() => void handleInspectRequest(req)}
                            sx={{
                              height: 32,
                              px: 1.75,
                              borderRadius: '8px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              '&:hover': { backgroundColor: '#15803d' },
                            }}
                          >
                            <span>Inspect</span>
                            <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                          </ButtonBase>
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
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
              {isLoading ? (
                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} sx={{ color: '#16a34a' }} />
                </Box>
              ) : filteredItems.length === 0 ? (
                <Box sx={{ py: 4, px: 2.5, textAlign: 'center', color: '#64748b' }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    No e-waste items match this filter.
                  </Typography>
                </Box>
              ) : (
                filteredItems.map((item) => {
                  const Icon = resolveCategoryIcon(item.category, item.name)
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
                            color: item.relativeDate.includes('Just') ? '#16a34a' : isHighRisk ? '#dc2626' : '#64748b',
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
                })
              )}
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
              <span>
                Showing {filteredItems.length} of {filteredItems.length} intake item(s)
              </span>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, color: '#0f172a', px: 0.5 }}>Page 1</Typography>
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

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity || 'success'}
          variant="filled"
          sx={{ width: '100%', fontWeight: 700 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
export default AdminToInspectPage


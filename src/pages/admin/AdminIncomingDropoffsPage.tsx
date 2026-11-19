import { useEffect, useMemo, useState, type FC } from 'react'
import {
  Alert,
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import { adminApi, getCachedUser, type AdminCollectionRequest } from '@/lib/api'

type DropoffTab = 'today' | 'upcoming' | 'overdue' | 'history'

interface HistoryEntry {
  status: string
  note?: string
  ts: string
  by: string
}

interface DropoffRecord {
  id: string
  requestCode: string
  itemName: string
  type: string
  residentId: string
  residentName: string
  residentEmail?: string
  siteId: string
  siteName: string
  date: string
  slot: string
  status: 'Scheduled' | 'Under Inspection' | 'Turned Over' | 'Missed' | 'Cancelled'
  assessment: {
    detectedType: string
    confidence: number
    hazard: 'Low' | 'Medium' | 'High'
    recommendation: 'Repair & Reuse' | 'Safe Disposal' | 'Refurbish'
    impact: {
      kg: number
      materials: string
    }
    checklist: {
      powersOn: string
      screen: string
      battery: string
      missingParts: string
      waterDamage: string
      notes?: string
    }
  }
  history: HistoryEntry[]
}

const getInitialDropoffs = (): DropoffRecord[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_dropoff_requests')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.warn('Could not read local drop-offs:', e)
  }
  return []
}

const TODAY_STR = new Date().toISOString().slice(0, 10)

export const AdminIncomingDropoffsPage: FC = () => {
  const [tab, setTab] = useState<DropoffTab>('today')
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState<DropoffRecord[]>(getInitialDropoffs)
  const [selectedReq, setSelectedReq] = useState<DropoffRecord | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const todayStr = TODAY_STR

  // Load live requests from backend if available
  useEffect(() => {
    let active = true
    adminApi
      .getRequests()
      .then((data: AdminCollectionRequest[]) => {
        if (!active || !data || data.length === 0) return
        const mappedLive: DropoffRecord[] = data.map((d) => {
          const sLower = (d.status || '').toLowerCase()
          const normalizedStatus: DropoffRecord['status'] =
            sLower === 'under_inspection' || sLower === 'collected'
              ? 'Under Inspection'
              : sLower === 'turned_over' || sLower === 'completed'
              ? 'Turned Over'
              : sLower === 'missed'
              ? 'Missed'
              : sLower === 'cancelled'
              ? 'Cancelled'
              : 'Scheduled'

          return {
            id: d.id,
            requestCode: d.requestCode || d.id,
            itemName: d.preferredMethod || 'Resident E-Waste Device',
            type: d.preferredMethod || 'Electronics',
            residentId: 'res-01',
            residentName: d.residentName || 'Resident User',
            residentEmail: d.residentEmail,
            siteId: 'S01',
            siteName: d.siteName || 'Commonwealth Central MRF (Base 1)',
            date: d.requestedDate || todayStr,
            slot: d.scheduledSlot || '10:00 AM – 12:00 PM',
            status: normalizedStatus,
            assessment: {
              detectedType: 'Electronic Hardware',
              confidence: 90,
              hazard: (d.preferredMethod || '').toLowerCase().includes('battery') ? 'High' : 'Low',
              recommendation: 'Repair & Reuse',
              impact: { kg: 1.5, materials: 'Recoverable metals & components' },
              checklist: {
                powersOn: 'Yes',
                screen: 'Good',
                battery: 'Standard',
                missingParts: 'None',
                waterDamage: 'No',
                notes: d.displayStatus,
              },
            },
            history: [
              {
                status: normalizedStatus,
                note: d.displayStatus || 'Intake recorded',
                ts: d.requestedDate || todayStr,
                by: d.residentName || 'Staff',
              },
            ],
          }
        })

        setRequests((prev) => {
          const ids = new Set(mappedLive.map((m) => m.id))
          const merged = [...mappedLive, ...prev.filter((p) => !ids.has(p.id))]
          try {
            localStorage.setItem('ecobyte_dropoff_requests', JSON.stringify(merged))
          } catch {
            // ignore
          }
          return merged
        })
      })
      .catch((err) => {
        console.warn('Backend requests unavailable:', err)
      })

    return () => {
      active = false
    }
  }, [todayStr])

  // Partition requests into sets
  const sets = useMemo(() => {
    return {
      today: requests.filter((r) => r.status === 'Scheduled' && r.date === todayStr),
      upcoming: requests.filter((r) => r.status === 'Scheduled' && r.date > todayStr),
      overdue: requests.filter((r) => r.status === 'Scheduled' && r.date < todayStr),
      history: requests.filter((r) => r.status !== 'Scheduled'),
    }
  }, [requests, todayStr])

  // Filter rows for current tab
  const filteredRows = useMemo(() => {
    let list = sets[tab]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.requestCode.toLowerCase().includes(q) ||
          r.itemName.toLowerCase().includes(q) ||
          r.residentName.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) =>
      tab === 'history' ? (b.date + b.slot).localeCompare(a.date + a.slot) : (a.date + a.slot).localeCompare(b.date + b.slot)
    )
  }, [sets, tab, search])

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase()
    if (lower.includes('phone')) return SmartphoneRoundedIcon
    if (lower.includes('laptop')) return LaptopRoundedIcon
    if (lower.includes('battery')) return BatteryChargingFullRoundedIcon
    if (lower.includes('monitor') || lower.includes('tv')) return TvRoundedIcon
    if (lower.includes('cable') || lower.includes('charger') || lower.includes('keyboard')) return CableRoundedIcon
    return KitchenRoundedIcon
  }

  const handleOpenDetailModal = (req: DropoffRecord) => {
    setSelectedReq(req)
    setDetailModalOpen(true)
  }

  const handleMarkReceived = async (req: DropoffRecord) => {
    setIsProcessing(true)
    try {
      await adminApi.markDropoffReceived(req.id).catch(() => {
        // Fallback for local/offline prototype
      })

      const staffUser = getCachedUser()
      const staffName = staffUser?.fullName || 'Barangay Official'

      const updatedHistory: HistoryEntry = {
        status: 'Under Inspection',
        note: 'Marked Received at facility intake',
        ts: new Date().toLocaleString(),
        by: staffName,
      }

      setRequests((prev) => {
        const next = prev.map((r) =>
          r.id === req.id
            ? {
                ...r,
                status: 'Under Inspection' as const,
                history: [...r.history, updatedHistory],
              }
            : r
        )
        try {
          localStorage.setItem('ecobyte_dropoff_requests', JSON.stringify(next))
          const existingLogs = JSON.parse(localStorage.getItem('ecobyte_activity_logs') || '[]')
          const logEntry = {
            id: `log-${Date.now()}`,
            ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
            userId: staffUser?.id || 'staff',
            userName: staffName,
            role: 'official',
            action: 'Marked as Received',
            target: req.requestCode || req.id,
            details: `Intake bench verification at ${req.siteName}`,
            barangay: staffUser?.barangay?.name || 'Commonwealth',
          }
          localStorage.setItem('ecobyte_activity_logs', JSON.stringify([logEntry, ...existingLogs.slice(0, 50)]))
        } catch {
          // ignore
        }
        return next
      })

      setToast({
        message: `Device marked Received! Moved to Inspection Queue (${req.requestCode}).`,
        severity: 'success',
      })
      setDetailModalOpen(false)
    } catch {
      setToast({
        message: 'Failed to mark device as received.',
        severity: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarkMissed = async (req: DropoffRecord) => {
    setIsProcessing(true)
    try {
      await adminApi.markDropoffMissed(req.id).catch(() => {
        // Fallback for local/offline prototype
      })

      const staffUser = getCachedUser()
      const staffName = staffUser?.fullName || 'Barangay Official'

      const updatedHistory: HistoryEntry = {
        status: 'Missed',
        note: 'Resident did not arrive for scheduled slot',
        ts: new Date().toLocaleString(),
        by: staffName,
      }

      setRequests((prev) => {
        const next = prev.map((r) =>
          r.id === req.id
            ? {
                ...r,
                status: 'Missed' as const,
                history: [...r.history, updatedHistory],
              }
            : r
        )
        try {
          localStorage.setItem('ecobyte_dropoff_requests', JSON.stringify(next))
          const existingLogs = JSON.parse(localStorage.getItem('ecobyte_activity_logs') || '[]')
          const logEntry = {
            id: `log-${Date.now()}`,
            ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
            userId: staffUser?.id || 'staff',
            userName: staffName,
            role: 'official',
            action: 'Marked as Missed',
            target: req.requestCode || req.id,
            details: `Resident absent for slot ${req.slot}`,
            barangay: staffUser?.barangay?.name || 'Commonwealth',
          }
          localStorage.setItem('ecobyte_activity_logs', JSON.stringify([logEntry, ...existingLogs.slice(0, 50)]))
        } catch {
          // ignore
        }
        return next
      })

      setToast({
        message: `Marked as Missed. Time slot released for ${req.requestCode}.`,
        severity: 'success',
      })
      setDetailModalOpen(false)
    } catch {
      setToast({
        message: 'Failed to mark drop-off as missed.',
        severity: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const hints: Record<DropoffTab, string> = {
    today: 'Click View to open the drop-off details and click Mark as Received once the resident hands over the device.',
    upcoming: 'Scheduled drop-offs for the coming days. Actions open on the scheduled date.',
    overdue: 'Past their scheduled date and never arrived. Mark as Missed to release the booking slot — or Received if it arrived late.',
    history: 'Drop-offs that were received, turned over, missed, or cancelled.',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Main Card matching Prototype ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #dbe3d6',
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
          p: 3,
        }}
      >
        {/* Top Controls: 4 Tabs & Search Input */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
          {/* Tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: { xs: 0.5, lg: 0 } }}>
            {[
              { id: 'today' as DropoffTab, label: 'Today', count: sets.today.length },
              { id: 'upcoming' as DropoffTab, label: 'Upcoming', count: sets.upcoming.length },
              { id: 'overdue' as DropoffTab, label: 'Overdue', count: sets.overdue.length },
              { id: 'history' as DropoffTab, label: 'History' },
            ].map((t) => {
              const active = tab === t.id
              return (
                <ButtonBase
                  key={t.id}
                  onClick={() => setTab(t.id)}
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
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    border: active ? '1px solid #e2e8f0' : '1px solid transparent',
                    '&:hover': {
                      color: '#0f172a',
                      backgroundColor: active ? '#ffffff' : '#f8faf6',
                    },
                  }}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        px: 0.85,
                        py: 0.1,
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: active ? '#f1f4f0' : '#e2e8f0',
                        color: active ? '#2e6022' : '#475569',
                      }}
                    >
                      {t.count}
                    </Box>
                  )}
                </ButtonBase>
              )
            })}
          </Box>

          {/* Search Box */}
          <Box sx={{ position: 'relative', width: { xs: '100%', lg: 280 } }}>
            <SearchRoundedIcon
              sx={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: 18,
              }}
            />
            <input
              type="text"
              placeholder="Search item, resident, code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: '0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #dbe3d6',
                paddingLeft: 36,
                paddingRight: 14,
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </Box>
        </Box>

        {/* Hint Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            fontSize: '0.75rem',
            color: '#475569',
            fontWeight: 500,
            backgroundColor: '#f8faf6',
            border: '1px solid #dbe3d6',
            borderRadius: '0.75rem',
            px: 2,
            py: 1.25,
            mb: 2.5,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }} />
          <span>{hints[tab]}</span>
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: 'auto', mx: -3, px: 3 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8faf6', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Request</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Item</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resident</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Drop-off site</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Schedule</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>AI Hazard</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {tab === 'overdue' ? 'No overdue drop-offs.' : 'No drop-offs here.'}
                    </Typography>
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const ItemIcon = getTypeIcon(r.type)
                  const canMiss = r.status === 'Scheduled' && r.date < todayStr

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                          {r.id}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                          {r.requestCode}
                        </Typography>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 160 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '10px',
                              backgroundColor: '#f1f4f0',
                              color: '#2e6022',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <ItemIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.2 }}>
                              {r.itemName}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                              {r.type}
                            </Typography>
                          </Box>
                        </Box>
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
                        {r.residentName}
                      </td>

                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {r.siteName}
                      </td>

                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: r.date < todayStr && r.status === 'Scheduled' ? '#be123c' : '#0f172a',
                          }}
                        >
                          {r.date === todayStr ? 'Today' : r.date}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {r.slot}
                        </Typography>
                      </td>

                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.25,
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: r.assessment.hazard === 'High' ? '#fff1f2' : r.assessment.hazard === 'Medium' ? '#fef3c7' : '#f0fdf4',
                            color: r.assessment.hazard === 'High' ? '#be123c' : r.assessment.hazard === 'Medium' ? '#b45309' : '#15803d',
                            border: `1px solid ${r.assessment.hazard === 'High' ? '#fecdd3' : r.assessment.hazard === 'Medium' ? '#fde68a' : '#bbf7d0'}`,
                          }}
                        >
                          {r.assessment.hazard} Hazard
                        </Box>
                      </td>

                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.35,
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor:
                              r.status === 'Under Inspection'
                                ? '#f0f9ff'
                                : r.status === 'Turned Over'
                                ? '#f1f4f0'
                                : r.status === 'Missed'
                                ? '#fff1f2'
                                : '#fef3c7',
                            color:
                              r.status === 'Under Inspection'
                                ? '#0369a1'
                                : r.status === 'Turned Over'
                                ? '#2e6022'
                                : r.status === 'Missed'
                                ? '#be123c'
                                : '#b45309',
                            border: `1px solid ${
                              r.status === 'Under Inspection'
                                ? '#bae6fd'
                                : r.status === 'Turned Over'
                                ? '#c5dcba'
                                : r.status === 'Missed'
                                ? '#fecdd3'
                                : '#fde68a'
                            }`,
                          }}
                        >
                          {r.status}
                        </Box>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <ButtonBase
                            onClick={() => handleOpenDetailModal(r)}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '0.5rem',
                              border: '1px solid #dbe3d6',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              '&:hover': { backgroundColor: '#f8faf6' },
                            }}
                          >
                            View
                          </ButtonBase>

                          {canMiss && (
                            <ButtonBase
                              onClick={() => handleMarkMissed(r)}
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '0.5rem',
                                border: '1px solid #fecdd3',
                                backgroundColor: '#fff1f2',
                                color: '#be123c',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                gap: 0.5,
                                '&:hover': { backgroundColor: '#ffe4e6' },
                              }}
                            >
                              <EventBusyRoundedIcon sx={{ fontSize: 14 }} />
                              <span>Missed</span>
                            </ButtonBase>
                          )}
                        </Box>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* ── View Detail Modal matching requestDetailBody(r) in Prototype ── */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            fontFamily: "'Quicksand', sans-serif",
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              Drop-Off Request Details
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Intake review and status management
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDetailModalOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {selectedReq && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Header Box */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '1rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #dbe3d6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e6022' }}>
                  {(() => {
                    const IconComp = getTypeIcon(selectedReq.type)
                    return <IconComp sx={{ fontSize: 26 }} />
                  })()}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2 }}>
                    {selectedReq.itemName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                    {selectedReq.type} · <span style={{ fontFamily: 'monospace' }}>{selectedReq.id}</span>
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.35,
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor: selectedReq.status === 'Under Inspection' ? '#f0f9ff' : selectedReq.status === 'Turned Over' ? '#f1f4f0' : selectedReq.status === 'Missed' ? '#fff1f2' : '#fef3c7',
                    color: selectedReq.status === 'Under Inspection' ? '#0369a1' : selectedReq.status === 'Turned Over' ? '#2e6022' : selectedReq.status === 'Missed' ? '#be123c' : '#b45309',
                    border: `1px solid ${selectedReq.status === 'Under Inspection' ? '#bae6fd' : selectedReq.status === 'Turned Over' ? '#c5dcba' : selectedReq.status === 'Missed' ? '#fecdd3' : '#fde68a'}`,
                  }}
                >
                  {selectedReq.status}
                </Box>
              </Box>

              {/* 2-Column Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {/* Drop-Off & Resident */}
                <Box sx={{ p: 2, borderRadius: '1rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#0284c7', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <PersonRoundedIcon sx={{ fontSize: 16 }} />
                    <span>Drop-Off &amp; Resident</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Resident</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.residentName}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Drop-off site</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.siteName}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Date</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.date}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Time slot</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.slot}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Request code</span>
                    <span style={{ fontWeight: 700, color: '#2e6022', fontFamily: 'monospace', backgroundColor: '#f1f4f0', padding: '2px 8px', borderRadius: 4 }}>
                      {selectedReq.requestCode}
                    </span>
                  </Box>
                </Box>

                {/* AI Stage 1 Assessment */}
                <Box sx={{ p: 2, borderRadius: '1rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#2e6022', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <SmartToyRoundedIcon sx={{ fontSize: 16 }} />
                    <span>AI Stage 1 Assessment</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Detected type</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.assessment.detectedType} ({selectedReq.assessment.confidence}%)</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Hazard risk</span>
                    <span style={{ fontWeight: 700, color: selectedReq.assessment.hazard === 'High' ? '#be123c' : '#15803d' }}>{selectedReq.assessment.hazard}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Stage 1 result</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.assessment.recommendation}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Est. weight</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReq.assessment.impact.kg} kg</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Recoverable</span>
                    <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>{selectedReq.assessment.impact.materials}</span>
                  </Box>
                </Box>
              </Box>

              {/* Resident Condition Checklist */}
              <Box sx={{ p: 2, borderRadius: '1rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#2e6022', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <ChecklistRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Resident Condition Checklist</span>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                  {[
                    ['Powers on', selectedReq.assessment.checklist.powersOn],
                    ['Screen', selectedReq.assessment.checklist.screen],
                    ['Battery', selectedReq.assessment.checklist.battery],
                    ['Missing parts', selectedReq.assessment.checklist.missingParts],
                    ['Water damage', selectedReq.assessment.checklist.waterDamage],
                  ].map(([k, v]) => {
                    const isAlert = ['Swollen', 'Leaking', 'Yes'].includes(v) && k !== 'Powers on'
                    return (
                      <Box
                        key={k}
                        sx={{
                          p: 1.25,
                          borderRadius: '0.75rem',
                          backgroundColor: isAlert ? '#fff1f2' : '#f8fafc',
                          border: `1px solid ${isAlert ? '#fecdd3' : '#e2e8f0'}`,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                          {k}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: isAlert ? '#be123c' : '#0f172a', mt: 0.25 }}>
                          {v}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
                {selectedReq.assessment.checklist.notes && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>
                    <NotesRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    <span>“{selectedReq.assessment.checklist.notes}”</span>
                  </Box>
                )}
              </Box>

              {/* Status Timeline */}
              <Box sx={{ p: 2, borderRadius: '1rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#2e6022', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <TimelineRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Status Timeline</span>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, position: 'relative', borderLeft: '2px solid #e2e8f0', ml: 1 }}>
                  {selectedReq.history.map((h, idx) => (
                    <Box key={idx} sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -23,
                          top: 4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#2e6022',
                          boxShadow: '0 0 0 3px #ffffff',
                        }}
                      />
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                        {h.status} {h.note ? <span style={{ color: '#64748b', fontWeight: 500 }}>· {h.note}</span> : ''}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>
                        {h.ts} · {h.by}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <ButtonBase
            onClick={() => setDetailModalOpen(false)}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            Close
          </ButtonBase>

          {selectedReq && selectedReq.status === 'Scheduled' && selectedReq.date < todayStr && (
            <ButtonBase
              onClick={() => handleMarkMissed(selectedReq)}
              disabled={isProcessing}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: '0.75rem',
                border: '1px solid #fecdd3',
                backgroundColor: '#fff1f2',
                color: '#be123c',
                fontWeight: 700,
                fontSize: '0.8125rem',
                '&:hover': { backgroundColor: '#ffe4e6' },
              }}
            >
              Mark as Missed
            </ButtonBase>
          )}

          {selectedReq && selectedReq.status === 'Scheduled' && selectedReq.date <= todayStr && (
            <ButtonBase
              onClick={() => handleMarkReceived(selectedReq)}
              disabled={isProcessing}
              sx={{
                px: 3,
                py: 1,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                gap: 1,
                '&:hover': { opacity: 0.95 },
                '&:disabled': { opacity: 0.5 },
              }}
            >
              {isProcessing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
              <span>Mark as Received</span>
            </ButtonBase>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Snackbar Feedback ── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: '0.75rem' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}

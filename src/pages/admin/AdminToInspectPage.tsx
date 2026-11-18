import { useEffect, useState, type FC } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { AdminDisposalPage } from '@/pages/admin/AdminDisposalPage'
import { adminApi, type AdminCollectionRequest } from '@/lib/api'

export interface InspectionQueueRecord {
  id: string
  requestCode: string
  itemName: string
  type: string
  residentName: string
  siteName: string
  receivedAt: string
  assessment: {
    hazard: 'Low' | 'Medium' | 'High'
    recommendation: 'Repair & Reuse' | 'Safe Disposal' | 'Refurbish'
  }
}

const getInitialQueue = (): InspectionQueueRecord[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ecobyte_dropoff_requests')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((r: any) => {
            const s = (r.status || '').toLowerCase()
            return s === 'under inspection' || s === 'under_inspection' || s === 'collected'
          })
          .map((r: any) => ({
            id: r.id,
            requestCode: r.requestCode || r.id,
            itemName: r.itemName || r.preferredMethod || 'Resident E-Waste Device',
            type: r.type || 'Electronics',
            residentName: r.residentName || 'Resident User',
            siteName: r.siteName || 'Commonwealth Central MRF (Base 1)',
            receivedAt: r.receivedAt || r.date || 'Recent',
            assessment: {
              hazard: (r.assessment?.hazard || 'Low') as 'Low' | 'Medium' | 'High',
              recommendation: (r.assessment?.recommendation || 'Repair & Reuse') as 'Repair & Reuse' | 'Safe Disposal' | 'Refurbish',
            },
          }))
      }
    }
  } catch {
    // ignore
  }
  return []
}

export const AdminToInspectPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'disposal' ? 'disposal' : 'queue'

  const [queue, setQueue] = useState<InspectionQueueRecord[]>(getInitialQueue)

  useEffect(() => {
    let active = true
    adminApi
      .getRequests()
      .then((data: AdminCollectionRequest[]) => {
        if (!active || !data || data.length === 0) return
        const liveUnderInspection: InspectionQueueRecord[] = data
          .filter((d) => {
            const s = (d.status || '').toLowerCase()
            return s === 'under_inspection' || s === 'collected'
          })
          .map((d) => ({
            id: d.id,
            requestCode: d.requestCode || d.id,
            itemName: d.preferredMethod || 'Resident E-Waste Device',
            type: d.preferredMethod || 'Electronics',
            residentName: d.residentName || 'Resident User',
            siteName: d.siteName || 'Commonwealth Central MRF (Base 1)',
            receivedAt: d.requestedDate || 'Recent',
            assessment: {
              hazard: ((d.preferredMethod || '').toLowerCase().includes('battery') ? 'High' : 'Low') as 'Low' | 'Medium' | 'High',
              recommendation: 'Repair & Reuse' as const,
            },
          }))

        setQueue((prev) => {
          const liveIds = new Set(liveUnderInspection.map((m) => m.id))
          return [...liveUnderInspection, ...prev.filter((p) => !liveIds.has(p.id))]
        })
      })
      .catch((err) => {
        console.warn('Backend requests unavailable:', err)
      })

    return () => {
      active = false
    }
  }, [])

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase()
    if (lower.includes('phone')) return SmartphoneRoundedIcon
    if (lower.includes('laptop')) return LaptopRoundedIcon
    if (lower.includes('battery')) return BatteryChargingFullRoundedIcon
    if (lower.includes('monitor') || lower.includes('tv')) return TvRoundedIcon
    if (lower.includes('cable') || lower.includes('charger') || lower.includes('keyboard')) return CableRoundedIcon
    return KitchenRoundedIcon
  }

  if (activeTab === 'disposal') {
    return <AdminDisposalPage />
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Info Banner matching Prototype ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          fontSize: '0.75rem',
          color: '#475569',
          fontWeight: 600,
          backgroundColor: '#ffffff',
          border: '1px solid #dbe3d6',
          borderRadius: '1rem',
          px: 2.5,
          py: 1.75,
          boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }} />
        <span>
          Oldest submissions first. Physically inspect each device, use the AI result only as a reference, then decide:{' '}
          <b style={{ color: '#0f172a' }}>List in Reuse Hub</b> or <b style={{ color: '#0f172a' }}>Mark for Disposal</b>.
        </span>
      </Box>

      {/* ── Inspection Queue Cards Grid matching Prototype ── */}
      {queue.length === 0 ? (
        <Box
          sx={{
            p: 6,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <TaskAltRoundedIcon sx={{ fontSize: 44, color: '#70b822' }} />
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Inspection queue is clear.
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
            New devices appear here once marked as Received.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', '2xl': 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {queue.map((r, i) => {
            const ItemIcon = getTypeIcon(r.type)
            const isFirst = i === 0

            return (
              <Box
                key={r.id}
                sx={{
                  p: 3,
                  borderRadius: '1.25rem',
                  border: isFirst ? '2px solid rgba(112, 184, 34, 0.5)' : '1px solid #dbe3d6',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.25,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(30, 46, 26, 0.06)',
                  },
                }}
              >
                {/* Header row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      backgroundColor: '#f1f4f0',
                      color: '#2e6022',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ItemIcon sx={{ fontSize: 24 }} />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.itemName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      {r.type} · <span style={{ fontFamily: 'monospace' }}>{r.id}</span>
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.35,
                      borderRadius: '8px',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      backgroundColor: isFirst ? '#2e6022' : '#f1f5f9',
                      color: isFirst ? '#ffffff' : '#64748b',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{i + 1}{isFirst ? ' Oldest' : ''}
                  </Box>
                </Box>

                {/* 3 Metric Tiles matching Prototype */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, textAlign: 'center' }}>
                  <Box sx={{ p: 1.25, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Waiting
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
                      {i === 0 ? '4h' : i === 1 ? '1d' : `${i + 1}d`}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.25, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      AI Says
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', mt: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.assessment.recommendation}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.25, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Hazard
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        mt: 0.25,
                        color: r.assessment.hazard === 'High' ? '#be123c' : r.assessment.hazard === 'Medium' ? '#b45309' : '#15803d',
                      }}
                    >
                      {r.assessment.hazard}
                    </Typography>
                  </Box>
                </Box>

                {/* Resident & Site details */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  <PersonRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <span style={{ color: '#1e293b' }}>{r.residentName}</span>
                  <span>·</span>
                  <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.siteName}</span>
                </Box>

                {/* Action button */}
                <ButtonBase
                  onClick={() => navigate(`/admin/inspect/${r.id}`)}
                  sx={{
                    width: '100%',
                    height: 42,
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: '0 1px 3px rgba(46, 96, 34, 0.2)',
                    transition: 'opacity 0.15s ease',
                    '&:hover': { opacity: 0.95 },
                  }}
                >
                  <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Inspect device</span>
                </ButtonBase>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

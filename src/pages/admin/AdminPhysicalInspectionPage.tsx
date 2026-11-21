import { useEffect, useState, type FC } from 'react'
import { Alert, Box, ButtonBase, CircularProgress, Snackbar, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded'
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded'
import TvRoundedIcon from '@mui/icons-material/TvRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import { adminApi, getScopedOfficialBaseId, type AdminCollectionRequest } from '@/lib/api'

interface DeviceDetails {
  id: string
  requestCode: string
  linkedItemId?: string | null
  itemName: string
  type: string
  residentName: string
  siteName: string
  receivedAt: string
  status: string
  photos: {
    front: boolean
    back: boolean
    left: boolean
    right: boolean
  }
  checklist: {
    powersOn: string
    screen: string
    battery: string
    missingParts: string
    waterDamage: string
    notes?: string
  }
  assessment: {
    detectedType: string
    confidence: number
    hazard: 'Low' | 'Medium' | 'High'
    recommendation: string
    impactKg: number
    materials: string
    components: string[]
  }
}

const findLocalDevice = (targetId?: string): DeviceDetails | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ecobyte_dropoff_requests')
    if (!raw) return null
    const parsed: any[] = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const scopedBaseId = getScopedOfficialBaseId()
    const list = scopedBaseId
      ? parsed.filter((d) => String(d?.residentBaseId ?? '') === scopedBaseId)
      : parsed
    if (list.length === 0) return null

    let match = targetId
      ? list.find((d) => d.id === targetId || d.requestCode === targetId)
      : list.find((d) => {
          const s = (d.status || '').toLowerCase()
          return s === 'under inspection' || s === 'under_inspection'
        })

    if (!match && !targetId && list.length > 0) {
      match = list[0]
    }

    if (match) {
      return {
        id: match.id,
        requestCode: match.requestCode || match.id,
        itemName: match.itemName || match.preferredMethod || 'Resident E-Waste Device',
        type: match.type || 'Electronics',
        residentName: match.residentName || 'Resident User',
        siteName: match.siteName || 'Commonwealth Central MRF (Base 1)',
        receivedAt: match.receivedAt || match.date || 'Today',
        status: 'Under Inspection',
        photos: { front: true, back: true, left: true, right: false },
        checklist: {
          powersOn: match.assessment?.checklist?.powersOn || 'Yes',
          screen: match.assessment?.checklist?.screen || 'Good',
          battery: match.assessment?.checklist?.battery || 'Standard',
          missingParts: match.assessment?.checklist?.missingParts || 'None',
          waterDamage: match.assessment?.checklist?.waterDamage || 'No',
          notes: match.assessment?.checklist?.notes || match.displayStatus || '',
        },
        assessment: {
          detectedType: match.assessment?.detectedType || match.type || 'Electronic Hardware',
          confidence: match.assessment?.confidence || 92,
          hazard: match.assessment?.hazard || 'Low',
          recommendation: match.assessment?.recommendation || 'Repair & Reuse',
          impactKg: match.assessment?.impact?.kg || 1.5,
          materials: match.assessment?.impact?.materials || 'Recoverable metals · Plastics',
          components: ['Mainboard', 'Power Supply', 'Chassis'],
        },
      }
    }
  } catch {
    // ignore
  }
  return null
}

export const AdminPhysicalInspectionPage: FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [device, setDevice] = useState<DeviceDetails | null>(() => findLocalDevice(id))
  const [works, setWorks] = useState<'Yes' | 'Partially' | 'No' | ''>('')
  const [condition, setCondition] = useState<'Good' | 'Fair' | 'Poor' | 'Damaged' | ''>('')
  const [notes, setNotes] = useState('')
  const [decision, setDecision] = useState<'reuse' | 'dispose' | ''>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .getRequests()
      .then((data: AdminCollectionRequest[]) => {
        if (!active || !Array.isArray(data)) return
        const found = id ? data.find((d) => d.id === id || d.requestCode === id) : data.find((d) => (d.status || '').toLowerCase() === 'under_inspection')
        if (!found) {
          setDevice(null)
          return
        }
        setDevice({
            id: found.id,
            requestCode: found.requestCode || found.id,
            linkedItemId: found.linkedItemId || null,
            itemName: found.itemName || found.preferredMethod || 'Resident E-Waste Device',
            type: found.itemCategory || found.preferredMethod || 'Electronics',
            residentName: found.residentName || 'Resident User',
            siteName: found.siteName || 'Commonwealth Central MRF (Base 1)',
            receivedAt: found.requestedDate || 'Today',
            status: 'Under Inspection',
            photos: { front: true, back: true, left: true, right: false },
            checklist: {
              powersOn: 'Yes',
              screen: 'Good',
              battery: 'Standard',
              missingParts: 'None',
              waterDamage: 'No',
              notes: found.displayStatus || '',
            },
            assessment: {
              detectedType: found.preferredMethod || 'Electronic Unit',
              confidence: 92,
              hazard: (found.preferredMethod || '').toLowerCase().includes('battery') ? 'High' : 'Low',
              recommendation: 'Repair & Reuse',
              impactKg: 2.5,
              materials: 'Recoverable metals · Plastics · Silicon',
              components: ['Chassis', 'Power Supply', 'Logic Board'],
            },
          })
      })
      .catch((err) => {
        console.warn('Could not load specific request from API:', err)
      })

    return () => {
      active = false
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!device) return
    if (!works) {
      setFormError('Please indicate whether the device works.')
      return
    }
    if (!condition) {
      setFormError('Please select the physical condition.')
      return
    }
    if (!decision) {
      setFormError('Please choose a routing decision (List in Reuse Hub or Mark for Disposal).')
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const targetId = device.linkedItemId || device.id
      await adminApi.submitInspectionVerdict(targetId, {
        action: decision === 'reuse' ? 'REUSE' : 'DISPOSAL',
        conditionGrade: condition,
        benchNotes: notes || `Inspected: Works: ${works}, Condition: ${condition}`,
      })

      // Also ensure the collection request status is marked turned_over on backend
      if (device.id) {
        await adminApi.updateRequestStatus(device.id, 'turned_over').catch(() => {})
      }

      // Sync with localStorage
      try {
        const storedReqs = JSON.parse(localStorage.getItem('ecobyte_dropoff_requests') || '[]')
        const updatedReqs = storedReqs.map((r: any) =>
          r.id === device.id || r.requestCode === device.requestCode || r.id === device.requestCode || r.requestCode === device.id
            ? { ...r, status: 'Turned Over' }
            : r
        )
        localStorage.setItem('ecobyte_dropoff_requests', JSON.stringify(updatedReqs))

        if (decision === 'reuse') {
          const storedListings = JSON.parse(localStorage.getItem('ecobyte_reuse_listings') || '[]')
          const newListing = {
            id: `RH-${Math.floor(1000 + Math.random() * 9000)}`,
            itemName: device.itemName,
            type: device.type,
            condition,
            barangay: 'Commonwealth',
            siteName: device.siteName,
            listedAt: new Date().toISOString().slice(0, 10),
            status: 'Available',
          }
          localStorage.setItem('ecobyte_reuse_listings', JSON.stringify([newListing, ...storedListings]))
        } else {
          const storedDisposals = JSON.parse(localStorage.getItem('ecobyte_disposal_records') || '[]')
          const newDisposal = {
            id: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
            itemName: device.itemName,
            type: device.type,
            requestId: device.requestCode || device.id,
            hazard: device.assessment.hazard,
            reason: notes || `Failed diagnostics: Works: ${works}, Condition: ${condition}`,
            by: 'Barangay Official',
            barangay: 'Commonwealth',
            at: new Date().toISOString().slice(0, 10),
            kg: device.assessment.impactKg || 1.5,
          }
          localStorage.setItem('ecobyte_disposal_records', JSON.stringify([newDisposal, ...storedDisposals]))
        }

        const existingLogs = JSON.parse(localStorage.getItem('ecobyte_activity_logs') || '[]')
        const logEntry = {
          id: `log-${Date.now()}`,
          ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
          userId: 'staff',
          userName: 'Barangay Official',
          role: 'official',
          action: decision === 'reuse' ? 'Inspected device → Listed in Reuse Hub' : 'Inspected device → Marked for disposal',
          target: device.requestCode || device.id,
          details: `${device.itemName} (${condition})`,
          barangay: 'Commonwealth',
        }
        localStorage.setItem('ecobyte_activity_logs', JSON.stringify([logEntry, ...existingLogs.slice(0, 50)]))
      } catch (syncErr) {
        console.warn('Failed to sync inspection locally:', syncErr)
      }

      setToast({
        message:
          decision === 'reuse'
            ? `Inspection completed! ${device.itemName} is now listed in the Reuse Hub.`
            : `Inspection completed! Disposal record created for ${device.itemName}.`,
        severity: 'success',
      })
      window.dispatchEvent(new Event('ecobyte:admin-badges-refresh'))

      setTimeout(() => {
        navigate('/admin/to-inspect')
      }, 1200)
    } catch {
      setToast({
        message: 'Failed to save inspection verdict.',
        severity: 'error',
      })
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase()
    if (lower.includes('phone')) return SmartphoneRoundedIcon
    if (lower.includes('laptop')) return LaptopRoundedIcon
    if (lower.includes('battery')) return BatteryChargingFullRoundedIcon
    if (lower.includes('monitor') || lower.includes('tv')) return TvRoundedIcon
    if (lower.includes('cable') || lower.includes('charger') || lower.includes('keyboard')) return CableRoundedIcon
    return KitchenRoundedIcon
  }

  if (!device) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
        <ButtonBase
          onClick={() => navigate('/admin/to-inspect')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 700,
            width: 'fit-content',
            '&:hover': { color: '#0f172a' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          <span>Inspection Queue</span>
        </ButtonBase>
        <Box sx={{ p: 6, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #dbe3d6' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', mb: 1 }}>
            No Device Selected for Inspection
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 3 }}>
            Please select an incoming device from the Inspection Queue to conduct physical diagnostics.
          </Typography>
          <ButtonBase
            onClick={() => navigate('/admin/to-inspect')}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: '0.75rem',
              backgroundColor: '#70b822',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            Open Inspection Queue
          </ButtonBase>
        </Box>
      </Box>
    )
  }

  const ItemIcon = getTypeIcon(device.type)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6, fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Breadcrumb / Back Link ── */}
      <ButtonBase
        onClick={() => navigate('/admin/to-inspect')}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: 700,
          width: 'fit-content',
          '&:hover': { color: '#0f172a' },
        }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        <span>Inspection Queue</span>
      </ButtonBase>

      {/* ── 2-Column Grid matching inspectionForm(u, id) in Prototype ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '3fr 2fr' }, gap: 3, alignItems: 'start' }}>
        {/* Left Column: Device Card & AI Assessment Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Card 1: Device Details & Photos */}
          <Box
            sx={{
              p: 3,
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Device Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
                  {device.itemName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                  {device.type} · <span style={{ fontFamily: 'monospace' }}>{device.id}</span> · {device.siteName}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                }}
              >
                {device.status}
              </Box>
            </Box>

            {/* 4 Photos Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
              {[
                { label: 'Front', ok: device.photos.front, req: true },
                { label: 'Back', ok: device.photos.back, req: true },
                { label: 'Left', ok: device.photos.left, req: false },
                { label: 'Right', ok: device.photos.right, req: false },
              ].map((p) => (
                <Box
                  key={p.label}
                  sx={{
                    aspectRatio: '1/1',
                    borderRadius: '1rem',
                    border: p.ok ? '1px solid #dbe3d6' : '1px dashed #cbd5e1',
                    backgroundColor: p.ok ? '#f8faf6' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    p: 1,
                  }}
                >
                  <ItemIcon sx={{ fontSize: 28, color: p.ok ? '#2e6022' : '#94a3b8' }} />
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    {p.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: p.ok ? '#2e6022' : '#94a3b8' }}>
                    {p.ok ? 'Uploaded' : p.req ? 'Missing' : 'Optional · none'}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Resident & Received Timestamp */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box sx={{ p: 1.75, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Resident
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {device.residentName}
                </Typography>
              </Box>

              <Box sx={{ p: 1.75, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Received
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
                  {device.receivedAt}
                </Typography>
              </Box>
            </Box>

            {/* Resident Condition Checklist */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1 }}>
                Resident Condition Checklist
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                {[
                  ['Powers on', device.checklist.powersOn],
                  ['Screen', device.checklist.screen],
                  ['Battery', device.checklist.battery],
                  ['Missing', device.checklist.missingParts],
                  ['Water dmg.', device.checklist.waterDamage],
                ].map(([k, v]) => {
                  const isAlert = ['Swollen', 'Leaking'].includes(v) || (k === 'Water dmg.' && v === 'Yes')
                  return (
                    <Box
                      key={k}
                      sx={{
                        p: 1.25,
                        borderRadius: '0.75rem',
                        border: `1px solid ${isAlert ? '#fecdd3' : '#dbe3d6'}`,
                        backgroundColor: isAlert ? '#fff1f2' : '#ffffff',
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
              {device.checklist.notes && (
                <Typography sx={{ mt: 1.5, p: 1.5, borderRadius: '0.75rem', backgroundColor: '#f8faf6', border: '1px solid #dbe3d6', fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                  “{device.checklist.notes}”
                </Typography>
              )}
            </Box>
          </Box>

          {/* Card 2: AI Assessment (Reference Only) */}
          <Box
            sx={{
              p: 3,
              borderRadius: '1.25rem',
              border: '1px solid #dbe3d6',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyRoundedIcon sx={{ fontSize: 20, color: '#2e6022' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                AI assessment
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                (reference only)
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {/* Detected type */}
              <Box sx={{ p: 2, borderRadius: '0.75rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Detected type
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
                  {device.assessment.detectedType}
                </Typography>
                <Box sx={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: '9999px', mt: 1.5, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${device.assessment.confidence}%`, backgroundColor: '#2e6022', borderRadius: '9999px' }} />
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                  {device.assessment.confidence}% confidence
                </Typography>
              </Box>

              {/* Potential health risk */}
              <Box sx={{ p: 2, borderRadius: '0.75rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Potential health risk
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.25,
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    mt: 0.5,
                    backgroundColor: device.assessment.hazard === 'High' ? '#fff1f2' : '#f0fdf4',
                    color: device.assessment.hazard === 'High' ? '#be123c' : '#15803d',
                    border: `1px solid ${device.assessment.hazard === 'High' ? '#fecdd3' : '#bbf7d0'}`,
                  }}
                >
                  {device.assessment.hazard} Hazard
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mt: 1 }}>
                  {device.assessment.materials}
                </Typography>
              </Box>

              {/* Stage 1 recommendation */}
              <Box sx={{ p: 2, borderRadius: '0.75rem', border: '1px solid #dbe3d6', backgroundColor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Stage 1 recommendation
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  {device.assessment.recommendation}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, mt: 1 }}>
                  Est. {device.assessment.impactKg} kg diverted
                </Typography>
              </Box>
            </Box>

            {/* Detected components */}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1 }}>
                Detected components
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {device.assessment.components.map((comp) => (
                  <Box
                    key={comp}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {comp}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Column: Physical Inspection Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            borderRadius: '1.25rem',
            border: '1px solid #dbe3d6',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(30, 46, 26, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            position: { xl: 'sticky' },
            top: { xl: 24 },
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Physical inspection form
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
              Stage 2 · Barangay Official
            </Typography>
          </Box>

          {/* Question 1: Does the device work? */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Does the device work?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {(['Yes', 'Partially', 'No'] as const).map((opt) => {
                const selected = works === opt
                return (
                  <ButtonBase
                    key={opt}
                    type="button"
                    onClick={() => setWorks(opt)}
                    sx={{
                      p: 1.5,
                      borderRadius: '0.75rem',
                      border: selected ? '2px solid #2e6022' : '1px solid #dbe3d6',
                      backgroundColor: selected ? '#f1f4f0' : '#ffffff',
                      color: selected ? '#2e6022' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: selected ? '4px solid #2e6022' : '2px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <span>{opt}</span>
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>

          {/* Question 2: Physical condition */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Physical condition
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {(['Good', 'Fair', 'Poor', 'Damaged'] as const).map((opt) => {
                const selected = condition === opt
                return (
                  <ButtonBase
                    key={opt}
                    type="button"
                    onClick={() => setCondition(opt)}
                    sx={{
                      p: 1.5,
                      borderRadius: '0.75rem',
                      border: selected ? '2px solid #2e6022' : '1px solid #dbe3d6',
                      backgroundColor: selected ? '#f1f4f0' : '#ffffff',
                      color: selected ? '#2e6022' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: selected ? '4px solid #2e6022' : '2px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                      }}
                    />
                    <span>{opt}</span>
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>

          {/* Question 3: Inspection notes */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Inspection notes
            </Typography>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tested OK, battery holds charge, minor scratches"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '0.75rem',
                border: '1px solid #dbe3d6',
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </Box>

          {/* Question 4: Routing decision */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', mb: 1 }}>
              Routing decision
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Option 1: Reuse Hub */}
              <ButtonBase
                type="button"
                onClick={() => setDecision('reuse')}
                sx={{
                  p: 1.75,
                  borderRadius: '0.75rem',
                  border: decision === 'reuse' ? '2px solid #2e6022' : '1px solid #dbe3d6',
                  backgroundColor: decision === 'reuse' ? '#f1f4f0' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: decision === 'reuse' ? '5px solid #2e6022' : '2px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    flexShrink: 0,
                  }}
                />
                <StorefrontRoundedIcon sx={{ fontSize: 22, color: decision === 'reuse' ? '#2e6022' : '#64748b' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                    List in Reuse Hub
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    Creates an Available listing residents can reserve
                  </Typography>
                </Box>
              </ButtonBase>

              {/* Option 2: Mark for Disposal */}
              <ButtonBase
                type="button"
                onClick={() => setDecision('dispose')}
                sx={{
                  p: 1.75,
                  borderRadius: '0.75rem',
                  border: decision === 'dispose' ? '2px solid #be123c' : '1px solid #dbe3d6',
                  backgroundColor: decision === 'dispose' ? '#fff1f2' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: decision === 'dispose' ? '5px solid #be123c' : '2px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    flexShrink: 0,
                  }}
                />
                <DeleteForeverRoundedIcon sx={{ fontSize: 22, color: decision === 'dispose' ? '#be123c' : '#64748b' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                    Mark for Disposal
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    Creates a formal disposal record
                  </Typography>
                </Box>
              </ButtonBase>
            </Box>
          </Box>

          {/* High risk alert */}
          {device.assessment.hazard === 'High' && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1.5,
                borderRadius: '0.75rem',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
              <span>High-risk item. Handle batteries with gloves and store in the designated hazardous bin.</span>
            </Box>
          )}

          {/* Error alert */}
          {formError && (
            <Alert severity="error" sx={{ borderRadius: '0.75rem', fontSize: '0.8125rem' }}>
              {formError}
            </Alert>
          )}

          {/* Submit Button */}
          <ButtonBase
            type="submit"
            disabled={isSubmitting}
            sx={{
              width: '100%',
              height: 46,
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2e6022 0%, #70b822 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              boxShadow: '0 2px 4px rgba(46, 96, 34, 0.25)',
              transition: 'opacity 0.15s ease',
              '&:hover': { opacity: 0.95 },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {isSubmitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <TaskAltRoundedIcon sx={{ fontSize: 20 }} />}
            <span>Save decision &amp; turn over</span>
          </ButtonBase>
        </Box>
      </Box>

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

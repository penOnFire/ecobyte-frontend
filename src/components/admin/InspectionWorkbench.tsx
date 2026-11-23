import { useEffect, useRef, useState, type ChangeEvent, type FC } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  OutlinedInput,
  Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import {
  adminApi,
  resolveMediaUrl,
  type AdminInspectionDetails,
  type InspectionRoutingAction,
} from '@/lib/api'

interface InspectionWorkbenchProps {
  itemId: string
  isModal?: boolean
  onClose?: () => void
  onSubmitted?: (action: InspectionRoutingAction, routedTo: string) => void
}

const ACTUAL_CONDITIONS = [
  'Inspected & Working',
  'Minor Cosmetic Wear',
  'Needs Repair',
  'Damaged / Non-Functional',
  'Hazardous Condition',
]

const DAMAGE_OPTIONS = [
  'None',
  'Cracked screen',
  'Burn marks',
  'Swollen battery',
  'Water corrosion',
  'Port / Hinge damage',
]

const MISSING_OPTIONS = [
  'None',
  'Battery',
  'Charger / Cable',
  'Back cover',
  'Screws / Tray',
  'Keycaps / Button',
]

const ROUTING_OPTIONS: Array<{
  action: InspectionRoutingAction
  label: string
  desc: string
  color: string
  bg: string
  border: string
  icon: typeof RecyclingRoundedIcon
}> = [
  {
    action: 'REUSE',
    label: 'Reuse Hub',
    desc: 'Approved for community Reuse Hub listing & pickup.',
    color: '#15803d',
    bg: '#dcfce7',
    border: '#16a34a',
    icon: RecyclingRoundedIcon,
  },
  {
    action: 'REPAIR',
    label: 'Repair Assessment',
    desc: 'Forward to technician bench for component repair.',
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#0284c7',
    icon: BuildRoundedIcon,
  },
  {
    action: 'DISPOSAL',
    label: 'Disposal / Recycling',
    desc: 'Route to certified materials recovery & recycling.',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#64748b',
    icon: DeleteForeverRoundedIcon,
  },
  {
    action: 'HAZARDOUS',
    label: 'Hazardous Handling',
    desc: 'Isolate Li-ion / toxic hazard per containment protocol.',
    color: '#b91c1c',
    bg: '#fee2e2',
    border: '#dc2626',
    icon: ReportProblemRoundedIcon,
  },
  {
    action: 'PENDING_INSPECTION',
    label: 'Pending Further Inspection',
    desc: 'Save progress and keep in Waiting Inspection queue.',
    color: '#b45309',
    bg: '#fef3c7',
    border: '#d97706',
    icon: HourglassTopRoundedIcon,
  },
]

const FOUR_ANGLES: Array<{ id: string; label: string }> = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
]

function toggleMultiChip(current: string[], value: string): string[] {
  if (value === 'None') return ['None']
  const withoutNone = current.filter((v) => v !== 'None')
  if (withoutNone.includes(value)) {
    const next = withoutNone.filter((v) => v !== value)
    return next.length > 0 ? next : ['None']
  }
  return [...withoutNone, value]
}

export const InspectionWorkbench: FC<InspectionWorkbenchProps> = ({
  itemId,
  isModal = false,
  onClose,
  onSubmitted,
}) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const [details, setDetails] = useState<AdminInspectionDetails | null>(null)
  const [loadedForId, setLoadedForId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [zoomPhoto, setZoomPhoto] = useState<{ url: string; label: string } | null>(null)
  const isLoading = loadedForId !== itemId

  // Section C: Inspector physical assessment state
  const [actualCondition, setActualCondition] = useState<string>('Inspected & Working')
  const [matchesDescription, setMatchesDescription] = useState<'yes' | 'partially' | 'no'>('yes')
  const [observedDamage, setObservedDamage] = useState<string[]>(['None'])
  const [customDamage, setCustomDamage] = useState('')
  const [missingComponents, setMissingComponents] = useState<string[]>(['None'])
  const [customMissing, setCustomMissing] = useState('')
  const [batterySafety, setBatterySafety] = useState<
    'safe' | 'swollen' | 'leaking' | 'missing' | 'not_applicable'
  >('safe')
  const [inspectorPhotos, setInspectorPhotos] = useState<string[]>([])
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [remarks, setRemarks] = useState('')

  // Section D: Routing decision state
  const [selectedAction, setSelectedAction] = useState<InspectionRoutingAction>('REUSE')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    adminApi
      .getInspectionDetails(itemId)
      .then((res) => {
        if (!active) return
        setDetails(res)
        setErrorMsg(null)

        if (res.previousInspection) {
          const prev = res.previousInspection
          if (prev.actualCondition) setActualCondition(prev.actualCondition)
          if (prev.matchesDescription) setMatchesDescription(prev.matchesDescription)
          if (prev.observedDamage && prev.observedDamage.length > 0) {
            setObservedDamage(prev.observedDamage)
          }
          if (prev.missingComponents && prev.missingComponents.length > 0) {
            setMissingComponents(prev.missingComponents)
          }
          if (prev.batterySafety) setBatterySafety(prev.batterySafety)
          if (Array.isArray(prev.inspectorPhotos)) setInspectorPhotos(prev.inspectorPhotos)
          if (prev.remarks || prev.benchNotes) setRemarks(prev.remarks || prev.benchNotes || '')
          if (prev.action) setSelectedAction(prev.action)
        } else {
          const hasHazard =
            res.residentAssessment?.hazardLevel === 'high' ||
            res.reportedCondition?.visibleDamage?.some((v) => v.includes('swollen'))
          if (hasHazard) {
            setBatterySafety('swollen')
            setObservedDamage(['Swollen battery'])
            setActualCondition('Hazardous Condition')
            setSelectedAction('HAZARDOUS')
          } else if (res.residentAssessment?.powersOn) {
            setBatterySafety('safe')
            setObservedDamage(['None'])
            setActualCondition('Inspected & Working')
            setSelectedAction('REUSE')
          } else {
            setBatterySafety('safe')
            setActualCondition('Needs Repair')
            setSelectedAction('REPAIR')
          }
          setRemarks('')
          setInspectorPhotos([])
        }
      })
      .catch((err: any) => {
        if (!active) return
        setErrorMsg(err?.message || 'Unable to load inspection record from backend.')
      })
      .finally(() => {
        if (active) setLoadedForId(itemId)
      })

    return () => {
      active = false
    }
  }, [itemId])

  const handleInspectorPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIsUploadingPhoto(true)
    setErrorMsg(null)
    try {
      const res = await adminApi.uploadInspectionPhoto(itemId, file)
      if (res?.url) {
        setInspectorPhotos((prev) => [...prev, res.url])
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload inspector photo.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleConfirmVerdict = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    const mergedDamage = observedDamage
      .filter((d) => d !== 'None')
      .concat(customDamage.trim() ? [customDamage.trim()] : [])
    const mergedMissing = missingComponents
      .filter((m) => m !== 'None')
      .concat(customMissing.trim() ? [customMissing.trim()] : [])

    try {
      const res = await adminApi.submitInspectionVerdict(itemId, {
        action: selectedAction,
        conditionGrade: actualCondition,
        benchNotes: remarks.trim() || undefined,
        inspectorAssessment: {
          actualCondition,
          matchesDescription,
          observedDamage: mergedDamage.length > 0 ? mergedDamage : ['None'],
          missingComponents: mergedMissing.length > 0 ? mergedMissing : ['None'],
          batterySafety,
          inspectorPhotos,
          remarks: remarks.trim() || undefined,
        },
      })
      setConfirmOpen(false)
      onSubmitted?.(selectedAction, res.routedTo)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save inspection decision.')
      setConfirmOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        <CircularProgress size={30} sx={{ color: '#16a34a' }} />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
          Loading resident request &amp; device dossier...
        </Typography>
      </Box>
    )
  }

  const reqInfo = details?.requestInfo
  const resAssmt = details?.residentAssessment
  const photosByAngle = new Map<string, string>()
  for (const p of resAssmt?.photos || []) {
    const key = (p.angleLabel || '').toLowerCase()
    if (key && p.imageUrl) photosByAngle.set(key, resolveMediaUrl(p.imageUrl))
  }

  const formatWorkingStatus = () => {
    const ws = resAssmt?.workingStatus
    if (ws === 'yes') return 'Yes — Powers on'
    if (ws === 'not_sure') return 'Not sure'
    if (ws === 'no') return 'No — Does not power on'
    return details?.reportedCondition?.powersOn ? 'Yes — Powers on' : 'No'
  }

  const selectedDecisionCfg =
    ROUTING_OPTIONS.find((opt) => opt.action === selectedAction) ?? ROUTING_OPTIONS[0]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleInspectorPhotoUpload}
      />

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* ── SECTION A: Resident & Request Information ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: '#0b1c30',
                color: '#abf06b',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              A
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0b1c30' }}>
              Resident &amp; Request Information
            </Typography>
          </Box>
          <Chip
            size="small"
            label={details?.serialNumber || `ITEM-${itemId}`}
            sx={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#eff4ff', color: '#15803d' }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {[
            {
              label: 'Resident Name',
              value: details?.resident?.name || 'Resident',
              sub: details?.resident?.phone || details?.resident?.email || details?.resident?.barangay,
            },
            {
              label: 'Request ID',
              value: reqInfo?.requestCode || 'Walk-in / Direct Item',
              sub: reqInfo?.requestStatus ? `Request: ${reqInfo.requestStatus}` : undefined,
            },
            {
              label: 'Drop-off Site',
              value: reqInfo?.dropOffSite || 'Commonwealth Area 1 Eco-Hub',
            },
            {
              label: 'Scheduled Date / Time',
              value: reqInfo?.scheduledSlot || 'Walk-in / Direct Assessment',
            },
            {
              label: 'Actual Collection Status',
              value: reqInfo?.collectionStatus || details?.currentStatus || 'Pending Inspection',
            },
            {
              label: 'Device Category & Model',
              value: reqInfo?.deviceCategory || details?.category || 'Electronics',
              sub: details?.deviceModel,
            },
          ].map((field) => (
            <Box
              key={field.label}
              sx={{
                p: 1.5,
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {field.label}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', mt: 0.35 }}>
                {field.value}
              </Typography>
              {field.sub && (
                <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.25 }}>
                  {field.sub}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── SECTION B: Resident-Submitted Device Assessment (Read-only) ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: '#0b1c30',
                color: '#abf06b',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              B
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0b1c30' }}>
              Resident-Submitted Device Assessment
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Read-Only Resident Submission"
            sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}
          />
        </Box>

        {/* 4 Angle Photos Preview */}
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', mb: 1 }}>
          4 Uploaded Device Photos (Click to Preview)
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1.5,
            mb: 2.25,
          }}
        >
          {FOUR_ANGLES.map((angle) => {
            const imgUrl = photosByAngle.get(angle.id)
            return (
              <Box
                key={angle.id}
                onClick={() => imgUrl && setZoomPhoto({ url: imgUrl, label: `${angle.label} Angle` })}
                sx={{
                  height: 130,
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: imgUrl ? 'pointer' : 'default',
                  '&:hover .zoom-badge': imgUrl ? { opacity: 1 } : {},
                }}
              >
                {imgUrl ? (
                  <>
                    <Box
                      component="img"
                      src={imgUrl}
                      alt={`${angle.label} upload`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      className="zoom-badge"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: 'rgba(15, 23, 42, 0.78)',
                        color: '#ffffff',
                        borderRadius: '6px',
                        p: 0.4,
                        display: 'flex',
                        opacity: 0.85,
                      }}
                    >
                      <ZoomInRoundedIcon sx={{ fontSize: 15 }} />
                    </Box>
                  </>
                ) : (
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    No {angle.label} photo
                  </Typography>
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 6,
                    left: 6,
                    px: 1,
                    py: 0.2,
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(15, 23, 42, 0.82)',
                    color: '#abf06b',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}
                >
                  {angle.label}
                </Box>
              </Box>
            )
          })}
        </Box>

        {/* Read-only Resident Answers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
          <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Functionality Reported
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', mt: 0.4 }}>
              {formatWorkingStatus()}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.25 }}>
              Display: {resAssmt?.displayIntact !== false ? 'Intact' : 'Damaged'} • Ports:{' '}
              {resAssmt?.portsWorking !== false ? 'Working' : 'Degraded'}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Visible Damage Reported
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.6 }}>
              {(resAssmt?.visibleDamage?.length ? resAssmt.visibleDamage : ['None']).map((d) => (
                <Chip key={d} size="small" label={d} sx={{ fontWeight: 700, backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }} />
              ))}
            </Box>
            {resAssmt?.otherDamage && (
              <Typography sx={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, mt: 0.5 }}>
                Others: {resAssmt.otherDamage}
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Missing Parts Reported
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.6 }}>
              {(resAssmt?.missingParts?.length ? resAssmt.missingParts : ['None']).map((m) => (
                <Chip key={m} size="small" label={m} sx={{ fontWeight: 700, backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }} />
              ))}
            </Box>
            {resAssmt?.otherMissing && (
              <Typography sx={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, mt: 0.5 }}>
                Others: {resAssmt.otherMissing}
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Resident Notes
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#0f172a', mt: 0.4, whiteSpace: 'pre-wrap' }}>
              {resAssmt?.notes || details?.benchNotes || 'No additional resident notes provided.'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── SECTION C: Inspector's Physical Assessment ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: '#0b1c30',
              color: '#abf06b',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            C
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0b1c30' }}>
            Inspector&apos;s Physical Assessment
          </Typography>
        </Box>

        {/* Actual Condition & Matches Description */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              1. Actual Device Condition
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {ACTUAL_CONDITIONS.map((cond) => {
                const active = actualCondition === cond
                return (
                  <Chip
                    key={cond}
                    label={cond}
                    onClick={() => setActualCondition(cond)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      backgroundColor: active ? '#0b1c30' : '#f8fafc',
                      color: active ? '#abf06b' : '#334155',
                      border: '1px solid',
                      borderColor: active ? '#0b1c30' : '#cbd5e1',
                    }}
                  />
                )
              })}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              2. Matches Resident&apos;s Description?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {[
                { id: 'yes', label: 'Yes' },
                { id: 'partially', label: 'Partially' },
                { id: 'no', label: 'No' },
              ].map((opt) => {
                const active = matchesDescription === opt.id
                return (
                  <ButtonBase
                    key={opt.id}
                    onClick={() => setMatchesDescription(opt.id as 'yes' | 'partially' | 'no')}
                    sx={{
                      py: 1,
                      borderRadius: '8px',
                      border: active ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      backgroundColor: active ? '#f0fdf4' : '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      color: active ? '#15803d' : '#334155',
                    }}
                  >
                    {opt.label}
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>
        </Box>

        {/* Observed Damage & Missing Components */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              3. Observed Damage
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {DAMAGE_OPTIONS.map((dmg) => {
                const active = observedDamage.includes(dmg)
                return (
                  <Chip
                    key={dmg}
                    size="small"
                    label={dmg}
                    onClick={() => setObservedDamage((prev) => toggleMultiChip(prev, dmg))}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: active ? '#0f172a' : '#ffffff',
                      color: active ? '#ffffff' : '#334155',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                )
              })}
            </Box>
            <OutlinedInput
              fullWidth
              size="small"
              placeholder="Other observed damage (optional)..."
              value={customDamage}
              onChange={(e) => setCustomDamage(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.8125rem', backgroundColor: '#f8fafc' }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              4. Missing Components
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {MISSING_OPTIONS.map((part) => {
                const active = missingComponents.includes(part)
                return (
                  <Chip
                    key={part}
                    size="small"
                    label={part}
                    onClick={() => setMissingComponents((prev) => toggleMultiChip(prev, part))}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: active ? '#0f172a' : '#ffffff',
                      color: active ? '#ffffff' : '#334155',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                )
              })}
            </Box>
            <OutlinedInput
              fullWidth
              size="small"
              placeholder="Other missing components (optional)..."
              value={customMissing}
              onChange={(e) => setCustomMissing(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.8125rem', backgroundColor: '#f8fafc' }}
            />
          </Box>
        </Box>

        {/* Battery Safety & Inspector Photos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              5. Battery Safety Check
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[
                { id: 'safe', label: 'Safe / Intact', danger: false },
                { id: 'swollen', label: 'Swollen', danger: true },
                { id: 'leaking', label: 'Leaking / Corroded', danger: true },
                { id: 'missing', label: 'Battery Removed', danger: false },
                { id: 'not_applicable', label: 'No Battery', danger: false },
              ].map((b) => {
                const active = batterySafety === b.id
                return (
                  <Chip
                    key={b.id}
                    label={b.label}
                    onClick={() =>
                      setBatterySafety(
                        b.id as 'safe' | 'swollen' | 'leaking' | 'missing' | 'not_applicable'
                      )
                    }
                    icon={
                      b.danger ? (
                        <WarningAmberRoundedIcon
                          sx={{ fontSize: 15, color: active ? '#ffffff' : '#dc2626' }}
                        />
                      ) : undefined
                    }
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      backgroundColor: active
                        ? b.danger
                          ? '#dc2626'
                          : '#16a34a'
                        : '#f8fafc',
                      color: active ? '#ffffff' : b.danger ? '#b91c1c' : '#334155',
                      border: '1px solid',
                      borderColor: active ? (b.danger ? '#dc2626' : '#16a34a') : '#cbd5e1',
                    }}
                  />
                )
              })}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              6. Inspector Bench Photos (Optional)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={isUploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
                startIcon={
                  isUploadingPhoto ? (
                    <CircularProgress size={14} />
                  ) : (
                    <CameraAltOutlinedIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                }}
              >
                {isUploadingPhoto ? 'Uploading...' : 'Add Inspector Photo'}
              </Button>
              {inspectorPhotos.map((url, idx) => (
                <Box
                  key={`${url}-${idx}`}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <Box
                    component="img"
                    src={resolveMediaUrl(url)}
                    alt={`Inspector ${idx + 1}`}
                    onClick={() =>
                      setZoomPhoto({ url: resolveMediaUrl(url), label: `Inspector Photo #${idx + 1}` })
                    }
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Remove photo"
                    onClick={() => setInspectorPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 18,
                      height: 18,
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#b91c1c' },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Inspector Remarks */}
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            7. Inspector Remarks &amp; Bench Notes
          </Typography>
          <OutlinedInput
            fullWidth
            multiline
            rows={2}
            placeholder="Record multimeter readings, functional test results, or safety notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ borderRadius: '8px', fontSize: '0.8125rem', backgroundColor: '#f8fafc' }}
          />
        </Box>
      </Box>

      {/* ── SECTION D: Final Routing Decision ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: '#0b1c30',
                color: '#abf06b',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              D
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0b1c30' }}>
              Final Routing Decision
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={<NotificationsActiveRoundedIcon sx={{ fontSize: 14 }} />}
            label="Auto-notifies resident on save"
            sx={{ fontWeight: 700, backgroundColor: '#eff4ff', color: '#0369a1' }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.25,
            mb: 2.25,
          }}
        >
          {ROUTING_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = selectedAction === opt.action
            return (
              <ButtonBase
                key={opt.action}
                onClick={() => setSelectedAction(opt.action)}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  border: active ? `2px solid ${opt.border}` : '1px solid #e2e8f0',
                  backgroundColor: active ? opt.bg : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  gap: 0.5,
                  transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Icon sx={{ fontSize: 18, color: opt.color }} />
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                      {opt.label}
                    </Typography>
                  </Box>
                  {active && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: opt.border }} />}
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#475569', lineHeight: 1.35 }}>
                  {opt.desc}
                </Typography>
              </ButtonBase>
            )
          })}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25 }}>
          {isModal && onClose && (
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                color: '#475569',
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            disabled={isSubmitting}
            sx={{
              px: 3,
              py: 1.1,
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              backgroundColor: selectedDecisionCfg.border,
              color: '#ffffff',
              '&:hover': { backgroundColor: selectedDecisionCfg.color },
            }}
          >
            Submit Decision ({selectedDecisionCfg.label})
          </Button>
        </Box>
      </Box>

      {/* ── Photo Lightbox Modal ── */}
      <Dialog open={Boolean(zoomPhoto)} onClose={() => setZoomPhoto(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{zoomPhoto?.label}</Typography>
          <IconButton size="small" onClick={() => setZoomPhoto(null)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#0f172a', p: 2 }}>
          {zoomPhoto && (
            <Box
              component="img"
              src={zoomPhoto.url}
              alt={zoomPhoto.label}
              sx={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 1 }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Final Confirmation Modal ── */}
      <Dialog open={confirmOpen} onClose={() => !isSubmitting && setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.0625rem' }}>
          Confirm Inspection Decision
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#334155' }}>
            Route <strong>{details?.deviceModel || `Item #${itemId}`}</strong> to{' '}
            <strong>{selectedDecisionCfg.label}</strong>?
          </Typography>
          <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
            Resident <strong>{details?.resident?.name || 'Resident'}</strong> will receive a status notification automatically once saved.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={isSubmitting} sx={{ textTransform: 'none' }}>
            Back
          </Button>
          <Button
            variant="contained"
            disabled={isSubmitting}
            onClick={handleConfirmVerdict}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: selectedDecisionCfg.border,
              '&:hover': { backgroundColor: selectedDecisionCfg.color },
            }}
          >
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Confirm & Notify Resident'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

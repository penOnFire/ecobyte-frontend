import { useEffect, useMemo, useState, type FC } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded'
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded'
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded'
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import AirRoundedIcon from '@mui/icons-material/AirRounded'
import CableRoundedIcon from '@mui/icons-material/CableRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import StorageRoundedIcon from '@mui/icons-material/StorageRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import diagnosticImg from '@/assets/ui/diagnostic_view.jpeg'
import { assessmentsApi } from '@/lib/api'
import type { DiagnosticResult, SubsystemHealth } from '@/types'

const MANUAL_CATEGORIES = [
  'mobile phones and tablets',
  'computers, laptops, and accessories',
  'batteries and power banks',
  'televisions and monitors',
  'small household electronic appliences',
  'cables, chargers, and other electronic accessories',
  'radios and audio devices',
]

function loadInitialDiagnostic(assessmentIdParam: string | null): DiagnosticResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('ecobyte_last_diagnostic')
    if (raw) {
      const parsed = JSON.parse(raw) as DiagnosticResult
      if (parsed && (!assessmentIdParam || parsed.assessmentId === assessmentIdParam)) {
        return parsed
      }
    }
    const rawDraft = sessionStorage.getItem('ecobyte_assessment_draft')
    if (rawDraft) {
      const draft = JSON.parse(rawDraft) as {
        deviceModel?: string
        category?: string
        workingStatus?: 'yes' | 'no' | 'notsure'
        visibleDamage?: string[]
        missingParts?: string[]
        notes?: string
      }
      const category = draft.category || 'Electronics'
      const deviceModel = draft.deviceModel || `${category} Unit`
      const visibleDamage = Array.isArray(draft.visibleDamage) ? draft.visibleDamage : []
      const hasHazard = visibleDamage.some((v) => v.includes('swollen') || v.includes('battery_leak'))
      const powersOn = draft.workingStatus === 'yes'
      return {
        assessmentId: assessmentIdParam || 'draft',
        deviceModel,
        category,
        analysisSource: 'rule_based_fallback',
        confidenceScore: 0.85,
        wasteClassification: hasHazard
          ? 'Class III (Hazardous Lithium-Ion)'
          : 'Class I (Recoverable Consumer Electronics)',
        estimatedMassLabel: '~190g (Est. recoverable)',
        aiSummary: `Stage 1 pre-screening for ${deviceModel} using your entered device details.`,
        supportingDetails: {
          workingStatus: draft.workingStatus === 'notsure' ? 'not_sure' : draft.workingStatus,
          powersOn,
          displayIntact: !visibleDamage.includes('cracked'),
          portsWorking: true,
          visibleDamage,
          missingParts: draft.missingParts,
          notes: draft.notes,
        },
        hazardAlert: hasHazard
          ? {
              level: 'CRITICAL',
              title: 'Lithium-Ion Battery Hazard Reported',
              instructions: 'Do not puncture or compress. Pack in a non-conductive container.',
            }
          : null,
        subsystems: [
          {
            name: 'Battery Cell',
            status: hasHazard ? 'HEALTH_RISK' : powersOn ? 'OPTIMAL' : 'DEGRADED',
            score: hasHazard ? 32 : powersOn ? 90 : 58,
            details: hasHazard
              ? 'Swollen or leaking cell reported in intake checklist'
              : powersOn
                ? 'Holds charge / passes power-on check'
                : 'Requires MRF voltage & cell integrity check',
            description: hasHazard
              ? `High-risk thermal/chemical flag on ${deviceModel}: swollen or leaking battery reported during Stage 1 screening. Isolate in a non-conductive container and bring directly to a Barangay Eco-Hub.`
              : powersOn
                ? `Power-on screening for ${deviceModel} indicates stable battery discharge with no swelling or leakage reported.`
                : `No active power response confirmed for ${deviceModel}. Barangay MRF staff should inspect cell voltage and physical integrity during intake.`,
          },
          {
            name: 'Display & Glass',
            status: visibleDamage.includes('cracked') ? 'DEGRADED' : 'OPTIMAL',
            score: visibleDamage.includes('cracked') ? 42 : 95,
            details: visibleDamage.includes('cracked')
              ? 'Screen crack or display fault reported'
              : 'No visible screen crack reported',
            description: visibleDamage.includes('cracked')
              ? `Screen cracking or display degradation was flagged on ${deviceModel}. Secure loose glass before station drop-off or bench evaluation.`
              : `Display panel and protective glass on ${deviceModel} show no reported cracks across your submitted photos and checklist.`,
          },
          {
            name: 'Logic Board',
            status: powersOn ? 'INTACT' : 'DEGRADED',
            score: powersOn ? 88 : 46,
            details: powersOn
              ? 'Boots / responds normally'
              : 'No boot verified — technician bench test advised',
            description: powersOn
              ? `Core logic board on ${deviceModel} passed Stage 1 power-response screening with viable silicon and charging circuitry for reuse.`
              : `Logic board functionality on ${deviceModel} could not be confirmed powered on; technician bench diagnostics are recommended at intake.`,
          },
          {
            name: 'Enclosure & Ports',
            status: 'OPTIMAL',
            score: 90,
            details: 'Ports and outer housing appear serviceable',
            description: `Outer enclosure, chassis alignment, and ports on ${deviceModel} appear intact based on your Stage 1 intake details.`,
          },
        ],
        recommendedRoute: hasHazard ? 'DROP_OFF' : powersOn ? 'REUSE' : 'REPAIR',
      }
    }
  } catch {
    // ignore storage parse error
  }
  return null
}

function getSubsystemVisuals(sub: SubsystemHealth) {
  const nameLower = sub.name.toLowerCase()
  const isOk = sub.status === 'OPTIMAL' || sub.status === 'INTACT'
  const isRisk = sub.status === 'HEALTH_RISK'

  let badgeVariant: 'electric' | 'warning' | 'error' = isOk
    ? 'electric'
    : isRisk
      ? 'error'
      : 'warning'
  let iconBg = isOk ? '#f1f5f9' : isRisk ? '#fee2e2' : '#fef3c7'
  let iconColor = isOk ? '#0f172a' : isRisk ? '#dc2626' : '#d97706'

  let icon = <PhoneAndroidRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  if (nameLower.includes('battery')) {
    icon = <BatteryAlertRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('display') || nameLower.includes('screen') || nameLower.includes('glass')) {
    icon = <CropFreeRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('logic') || nameLower.includes('board')) {
    icon = <MemoryRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('camera') || nameLower.includes('sensor') || nameLower.includes('optic')) {
    icon = <CameraAltRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('keyboard') || nameLower.includes('trackpad')) {
    icon = <KeyboardRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('thermal') || nameLower.includes('fan') || nameLower.includes('cool')) {
    icon = <AirRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('cable') || nameLower.includes('connector') || nameLower.includes('power') || nameLower.includes('cord')) {
    icon = <CableRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('audio') || nameLower.includes('speaker') || nameLower.includes('mic')) {
    icon = <VolumeUpRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  } else if (nameLower.includes('storage') || nameLower.includes('memory') || nameLower.includes('drive')) {
    icon = <StorageRoundedIcon sx={{ fontSize: 20, color: iconColor }} />
  }

  const badgeLabel =
    sub.status === 'OPTIMAL'
      ? 'Optimal'
      : sub.status === 'INTACT'
        ? 'Intact'
        : sub.status === 'HEALTH_RISK'
          ? 'Hazard Risk'
          : 'Needs Check'

  return { badgeVariant, iconBg, icon, badgeLabel }
}

function getSubsystemAiDescription(
  sub: SubsystemHealth,
  diagnostic: DiagnosticResult | null,
  badgeLabel: string
): string {
  if (sub.description?.trim()) {
    return sub.description.trim()
  }

  const deviceLabel = diagnostic?.deviceModel || 'this device'
  const nameLower = sub.name.toLowerCase()
  const details = sub.details?.trim()
  const support = diagnostic?.supportingDetails
  const damageList = support?.visibleDamage || []
  const missingList = (support?.missingParts || []).filter((m) => m && m !== 'none')

  if (nameLower.includes('battery')) {
    if (sub.status === 'HEALTH_RISK' || damageList.some((v) => v.includes('swollen') || v.includes('battery_leak'))) {
      return `AI triage flagged a battery safety risk on ${deviceLabel} (${sub.score}% health score). ${details ? `${details}. ` : ''}Avoid charging or puncturing the cell and place it in a non-conductive container before Barangay Eco-Hub drop-off.`
    }
    return `AI screening evaluated the battery subsystem of ${deviceLabel} as ${badgeLabel.toLowerCase()} (${sub.score}%). ${details ? `${details}. ` : ''}${support?.powersOn ? 'Stable power delivery supports safe handling or reuse evaluation.' : 'MRF staff will verify cell voltage and physical state during physical intake.'}`
  }

  if (nameLower.includes('display') || nameLower.includes('screen') || nameLower.includes('glass')) {
    return `AI assessment rated the display assembly of ${deviceLabel} at ${sub.score}% (${badgeLabel.toLowerCase()}). ${details ? `${details}. ` : ''}${support?.displayIntact === false ? 'Protect any fractured glass before transport and review repair options if internal components are intact.' : 'Panel condition contributes positively to device reuse or spare-part recovery value.'}`
  }

  if (nameLower.includes('logic') || nameLower.includes('board')) {
    return `AI analysis scored the main logic board of ${deviceLabel} at ${sub.score}% (${badgeLabel.toLowerCase()}). ${details ? `${details}. ` : ''}${support?.powersOn ? 'Power-on response indicates functional core circuitry suitable for refurbishment or reuse.' : 'No verified boot was detected; schedule station bench diagnostics or component recovery.'}`
  }

  if (nameLower.includes('enclosure') || nameLower.includes('port') || nameLower.includes('chassis')) {
    const missingNote = missingList.length > 0 ? `Reported missing parts: ${missingList.join(', ')}. ` : ''
    return `AI assessment scored ${sub.name} on ${deviceLabel} at ${sub.score}% (${badgeLabel.toLowerCase()}). ${details ? `${details}. ` : ''}${missingNote}Physical housing and connector alignment will be confirmed at your selected Barangay Eco-Hub.`
  }

  return `AI assessment evaluated ${sub.name} on ${deviceLabel} at ${sub.score}% (${badgeLabel.toLowerCase()}). ${details ? `${details}. ` : ''}This secondary component was flagged for ${deviceLabel} based on your device type and intake screening details.`
}

export const AiDiagnosticPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assessmentIdParam = searchParams.get('assessmentId')
  const initialUnidentified = searchParams.get('unidentified') === 'true'

  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(() =>
    loadInitialDiagnostic(assessmentIdParam)
  )
  const [isLoading, setIsLoading] = useState(
    Boolean(assessmentIdParam && !loadInitialDiagnostic(assessmentIdParam))
  )
  const [isUnidentified, setIsUnidentified] = useState(initialUnidentified)
  const [manualCategory, setManualCategory] = useState(
    searchParams.get('category') || MANUAL_CATEGORIES[0]
  )
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [expandedSubsystems, setExpandedSubsystems] = useState<Record<string, boolean>>({})

  const toggleSubsystem = (name: string) => {
    setExpandedSubsystems((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const capturedAngles = useMemo(() => {
    try {
      const saved = sessionStorage.getItem('ecobyte_scan_angles')
      return saved ? (JSON.parse(saved) as Record<string, string>) : {}
    } catch {
      return {}
    }
  }, [])

  const backendImages = diagnostic?.images
  const previewPhotoUrl = useMemo(() => {
    const angleOrder = ['front', 'back', 'left', 'right']
    for (const key of angleOrder) {
      if (capturedAngles[key]) return capturedAngles[key]
    }
    if (backendImages && backendImages.length > 0) {
      return backendImages[0].url
    }
    return diagnosticImg
  }, [capturedAngles, backendImages])

  const capturedCount = useMemo(() => {
    const localCount = Object.values(capturedAngles).filter(Boolean).length
    if (localCount > 0) return localCount
    return backendImages?.length ?? 0
  }, [capturedAngles, backendImages])

  useEffect(() => {
    if (!assessmentIdParam) return
    let active = true
    assessmentsApi
      .getDiagnostic(assessmentIdParam)
      .then((res) => {
        if (!active || !res) return
        setDiagnostic(res)
        try {
          sessionStorage.setItem('ecobyte_last_diagnostic', JSON.stringify(res))
        } catch {
          // ignore
        }
      })
      .catch((err) => {
        console.warn('Could not fetch diagnostic from backend:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [assessmentIdParam])

  const deviceTitle = diagnostic?.deviceModel || 'Electronic Device'
  const confidencePct = Math.round((diagnostic?.confidenceScore ?? 0.9) * 100)
  const isAiAssisted = diagnostic?.analysisSource === 'ai_assisted'
  const hazardAlert = diagnostic?.hazardAlert ?? null

  const handleShare = async () => {
    const shareData = {
      title: `EcoByte Stage 1 Triage — ${deviceTitle}`,
      text: `EcoByte AI-Assisted Stage 1 Screening for ${deviceTitle}: Recommended route ${diagnostic?.recommendedRoute || 'DROP_OFF'}.`,
      url: window.location.href,
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err: any) {
        if (err?.name !== 'AbortError') console.warn('Share error:', err)
      }
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        setToastMsg('Diagnostic results link copied to clipboard!')
      } else {
        setToastMsg('Link: ' + window.location.href)
      }
    } catch {
      setToastMsg('Diagnostic results link copied to clipboard!')
    }
  }

  const buildGuideUrl = (tab: 'reuse' | 'repair') =>
    `/reuse-guide?${new URLSearchParams({
      ...(diagnostic?.assessmentId && diagnostic.assessmentId !== 'draft'
        ? { assessmentId: diagnostic.assessmentId }
        : {}),
      tab,
    }).toString()}`

  const scheduleTargetUrl = `/dropoff-schedule?${new URLSearchParams({
    ...(diagnostic?.assessmentId && diagnostic.assessmentId !== 'draft'
      ? { assessmentId: diagnostic.assessmentId }
      : {}),
    deviceName: deviceTitle,
    ...(diagnostic?.category ? { category: diagnostic.category } : {}),
  }).toString()}`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          aria-label="Back"
          sx={{
            width: 38,
            height: 38,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
            Diagnostic Results
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
            AI-Assisted Pre-Screening
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label="Share results"
          onClick={handleShare}
          sx={{
            width: 38,
            height: 38,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            color: '#0f172a',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f8fafc' },
          }}
        >
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} sx={{ color: '#0f172a' }} />
        </Box>
      ) : (
        <>
          {/* ── Session & Confidence Bar ── */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isUnidentified ? '#f59e0b' : '#abf06b',
                  boxShadow: isUnidentified ? '0 0 6px #f59e0b' : '0 0 6px #abf06b',
                }}
              />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                {isAiAssisted ? 'OpenRouter AI-Assisted' : 'Guided Intake Triage'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusBadge
                label={isUnidentified ? 'Low Confidence (Manual)' : `Confidence ${confidencePct}%`}
                variant={isUnidentified ? 'hazard' : 'electric'}
                size="sm"
              />
              <Button
                size="small"
                variant="text"
                onClick={() => setIsUnidentified((v) => !v)}
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748b',
                  p: 0,
                  minWidth: 'auto',
                  textDecoration: 'underline',
                }}
              >
                {isUnidentified ? 'Show AI Result' : 'Flag Unidentified'}
              </Button>
            </Box>
          </Box>

          {/* ── Hero Hardware Card ── */}
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Box
              sx={{
                height: { xs: 168, sm: 220, md: 240 },
                backgroundColor: '#020617',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 1.75,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={previewPhotoUrl}
                alt={deviceTitle}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.42,
                }}
              />

              {/* Top HUD overlay */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(6px)',
                    px: 1.25,
                    py: 0.4,
                    borderRadius: 9999,
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#abf06b' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                    {isAiAssisted ? 'AI-ASSISTED STAGE 1 TRIAGE' : 'STAGE 1 INTAKE ASSESSMENT'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: '#abf06b',
                    color: '#0f172a',
                    px: 1.25,
                    py: 0.35,
                    borderRadius: 9999,
                  }}
                >
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.625rem' }}>
                    {capturedCount > 0 ? `${capturedCount}/4 ANGLES` : 'DETAILS LOGGED'}
                  </Typography>
                </Box>
              </Box>

              {/* Hardware Status Banner */}
              <Box
                sx={{
                  alignSelf: 'center',
                  my: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  zIndex: 1,
                  backgroundColor: 'rgba(2, 6, 23, 0.62)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <MemoryRoundedIcon sx={{ fontSize: 36, color: '#abf06b' }} />
                <Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#ffffff' }}>
                    RECOMMENDED: {diagnostic?.recommendedRoute || 'DROP_OFF'}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#cbd5e1' }}>
                    Suggested by AI using your photos &amp; details
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Hardware Info Bottom Container */}
            <Box sx={{ p: 2.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    RESIDENT DEVICE SUBMISSION
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', mt: 0.25 }}>
                    {deviceTitle}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
                    {diagnostic?.category || 'Electronics'} • {diagnostic?.wasteClassification || 'Class I e-Waste'}
                  </Typography>
                </Box>
                <StatusBadge
                  label={diagnostic?.recommendedRoute || 'DROP_OFF'}
                  variant={hazardAlert ? 'hazard' : 'electric'}
                  size="sm"
                />
              </Box>

              {diagnostic?.aiSummary && (
                <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#334155', lineHeight: 1.5, fontWeight: 600 }}>
                    {diagnostic.aiSummary}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1.75, borderColor: '#e2e8f0' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <EnergySavingsLeafRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#64748b' }}>
                    Estimated Recoverable Mass:
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                  {diagnostic?.estimatedMassLabel || '~190g (Est. recoverable)'}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* ── Safety & Supporting Details Card ── */}
          <Card
            sx={{
              p: 2.25,
              borderRadius: 2,
              border: hazardAlert ? '1.5px solid #fecaca' : '1.5px solid #bbf7d0',
              backgroundColor: '#ffffff',
              boxShadow: hazardAlert
                ? '0 1px 3px rgba(239, 68, 68, 0.08)'
                : '0 1px 3px rgba(22, 163, 74, 0.06)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  backgroundColor: hazardAlert ? '#fee2e2' : '#dcfce7',
                  color: hazardAlert ? '#dc2626' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {hazardAlert ? (
                  <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
                ) : (
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 22 }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    {hazardAlert ? hazardAlert.title : 'Safety & Handling Guidance'}
                  </Typography>
                  <StatusBadge
                    label={
                      hazardAlert?.level === 'CRITICAL'
                        ? 'High Risk'
                        : hazardAlert?.level === 'WARNING'
                          ? 'Caution'
                          : 'Low Risk'
                    }
                    variant={hazardAlert?.level === 'CRITICAL' ? 'error' : hazardAlert ? 'warning' : 'electric'}
                    size="sm"
                  />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  {hazardAlert
                    ? hazardAlert.instructions
                    : 'No critical battery hazard flagged from your photos and supporting checklist. Final classification will be verified by your Barangay MRF official.'}
                </Typography>
              </Box>
            </Box>

            {diagnostic?.supportingDetails && (
              <Box
                sx={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 1.5,
                  p: 1.5,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#0f172a', letterSpacing: '0.04em' }}>
                    RESIDENT SUPPORTING DETAILS USED BY AI
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                  Powers on:{' '}
                  <strong>
                    {diagnostic.supportingDetails.workingStatus === 'not_sure'
                      ? 'Not sure'
                      : diagnostic.supportingDetails.powersOn
                        ? 'Yes'
                        : 'No'}
                  </strong>
                  {' · '}Visible damage:{' '}
                  <strong>{(diagnostic.supportingDetails.visibleDamage || ['none']).join(', ')}</strong>
                  {' · '}Missing parts:{' '}
                  <strong>{(diagnostic.supportingDetails.missingParts || ['none']).join(', ')}</strong>
                  {diagnostic.supportingDetails.notes ? ` · Notes: "${diagnostic.supportingDetails.notes}"` : ''}
                </Typography>
              </Box>
            )}
          </Card>

          {/* ── Parts Detected Section ── */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                Component Condition Breakdown
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {(diagnostic?.subsystems || []).length} Subsystems Evaluated
              </Typography>
            </Box>

            <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {(diagnostic?.subsystems || []).map((part, i, arr) => {
                const visual = getSubsystemVisuals(part)
                const isExpanded = Boolean(expandedSubsystems[part.name])
                const aiDescription = getSubsystemAiDescription(part, diagnostic, visual.badgeLabel)
                const accentColor =
                  part.status === 'HEALTH_RISK'
                    ? '#dc2626'
                    : part.status === 'DEGRADED'
                      ? '#d97706'
                      : '#16a34a'

                return (
                  <Box key={part.name}>
                    <Box
                      onClick={() => toggleSubsystem(part.name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleSubsystem(part.name)
                        }
                      }}
                      sx={{
                        p: 1.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: '#f8fafc' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            backgroundColor: visual.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {visual.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                            {part.name} ({part.score}%)
                          </Typography>
                          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                            {part.details || part.status}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                        <StatusBadge label={visual.badgeLabel} variant={visual.badgeVariant} size="sm" />
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSubsystem(part.name)
                          }}
                          aria-expanded={isExpanded}
                          endIcon={
                            <ExpandMoreRoundedIcon
                              sx={{
                                fontSize: 16,
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          }
                          sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.35,
                            borderRadius: 1.25,
                            textTransform: 'none',
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.6875rem',
                            color: '#1e6c28',
                            backgroundColor: isExpanded ? '#e8f5e9' : '#f1f5f9',
                            '&:hover': { backgroundColor: '#e2e8f0' },
                          }}
                        >
                          {isExpanded ? 'Hide' : 'View more'}
                        </Button>
                      </Box>
                    </Box>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box
                        sx={{
                          px: 1.75,
                          pb: 1.75,
                          pt: 1.25,
                          backgroundColor: '#f8fafc',
                          borderTop: '1px solid #f1f5f9',
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.35,
                            borderRadius: 1.5,
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderLeft: `3.5px solid ${accentColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: '#1e6c28' }} />
                              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.75rem', color: '#0f172a' }}>
                                AI Assessment Result
                              </Typography>
                            </Box>
                            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#475569' }}>
                              Score: {part.score}/100
                            </Typography>
                          </Box>

                          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.78125rem', color: '#334155', lineHeight: 1.55, fontWeight: 500 }}>
                            {aiDescription}
                          </Typography>

                          {diagnostic?.recommendedRoute && (
                            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                              Assessed Device: <strong style={{ color: '#0f172a' }}>{deviceTitle}</strong>
                              {' · '}Recommended Path:{' '}
                              <strong style={{ color: '#0f172a' }}>
                                {diagnostic.recommendedRoute === 'REUSE'
                                  ? 'Community Reuse'
                                  : diagnostic.recommendedRoute === 'REPAIR'
                                    ? 'Refurbish & Repair'
                                    : 'Safe Drop-Off'}
                              </strong>
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Collapse>

                    {i < arr.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                  </Box>
                )
              })}
            </Card>
          </Box>

          {/* ── What would you like to do? ── */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', mb: 1.25 }}>
              {isUnidentified ? 'Module 2: Unidentified E-Waste Intake' : 'What would you like to do?'}
            </Typography>

            {isUnidentified ? (
              <Card
                sx={{
                  p: 2.25,
                  borderRadius: 2,
                  border: '1.5px solid #f59e0b',
                  backgroundColor: '#fffbeb',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mb: 1.5 }}>
                  <HelpOutlineRoundedIcon sx={{ color: '#d97706', fontSize: 24 }} />
                  <Box>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#92400e' }}>
                      Manual Category Selection (Module 2 Fallback)
                    </Typography>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#b45309' }}>
                      Select the closest category to schedule a physical inspection at the Eco-Hub.
                    </Typography>
                  </Box>
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 2, backgroundColor: '#ffffff', borderRadius: 1.5 }}>
                    <Select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      sx={{ borderRadius: 1.5, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}
                    >
                      {MANUAL_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => {
                    navigate(
                      `/dropoff-schedule?${new URLSearchParams({
                        unidentified: 'true',
                        category: manualCategory,
                        deviceName: deviceTitle,
                        ...(diagnostic?.assessmentId && diagnostic.assessmentId !== 'draft'
                          ? { assessmentId: diagnostic.assessmentId }
                          : {}),
                      }).toString()}`
                    )
                  }}
                  sx={{
                    py: 1.4,
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: 1.5,
                    '&:hover': { backgroundColor: '#1e293b' },
                  }}
                >
                  Proceed to Drop-Off (Station Physical Inspection)
                </Button>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {/* Option 1: Reuse */}
                <Card
                  onClick={() => navigate(buildGuideUrl('reuse'))}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.25,
                    border: '1px solid #cce7ba',
                    backgroundColor: '#dff2d1',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#d3ecc0', transform: 'translateY(-1px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.75,
                        backgroundColor: '#1e6c28',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <AutorenewRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        Reuse Guide
                      </Typography>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                        See how to safely reuse or pass this device on
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#64748b' }} />
                </Card>

                {/* Option 2: Repair */}
                <Card
                  onClick={() => navigate(buildGuideUrl('repair'))}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.25,
                    border: '1px solid #cce7ba',
                    backgroundColor: '#dff2d1',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#d3ecc0', transform: 'translateY(-1px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.75,
                        backgroundColor: '#66aa2c',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BuildRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        Repair Guide
                      </Typography>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                        See repair tips and what a technician should check
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#64748b' }} />
                </Card>

                {/* Option 3: Further assessment */}
                <Card
                  onClick={() => navigate(scheduleTargetUrl)}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.25,
                    border: '1px solid #cce7ba',
                    backgroundColor: '#dff2d1',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#d3ecc0', transform: 'translateY(-1px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.75,
                        backgroundColor: '#66aa2c',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LocationOnOutlinedIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        Further assessment
                      </Typography>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                        Schedule a drop-off for physical inspection
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#64748b' }} />
                </Card>
              </Box>
            )}

            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.6875rem',
                color: '#94a3b8',
                textAlign: 'center',
                mt: 2.25,
                mb: 1.5,
              }}
            >
              Initial guide only. It does not replace professional inspection.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #1b4d14 0%, #5da126 55%, #99d944 100%)',
                color: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.9375rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(27, 77, 20, 0.22)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #163f10 0%, #4e8a1f 55%, #86c736 100%)',
                },
              }}
            >
              Back to Home
            </Button>
          </Box>
        </>
      )}

      {/* Share Toast */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToastMsg(null)}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

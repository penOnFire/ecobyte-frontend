import { useEffect, useMemo, useState, type FC } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import DeviceThermostatRoundedIcon from '@mui/icons-material/DeviceThermostatRounded'
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded'
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { assessmentsApi, getCachedUser } from '@/lib/api'
import {
  COMMONWEALTH_FALLBACK_SITES,
  resolveSiteBaseNumber,
} from '@/components/map/commonwealthData'
import type { AssessedDeviceRecord, DiagnosticResult, User } from '@/types'

function loadStoredDiagnostic(assessmentIdParam: string | null): DiagnosticResult | null {
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
      const hasHazard = visibleDamage.some(
        (v) => v.includes('swollen') || v.includes('battery_leak')
      )
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
        aiSummary: `Stage 1 guide tailored to ${deviceModel} based on your entered condition details.`,
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
              instructions:
                'Do not puncture or compress. Bring safely in a non-conductive container.',
            }
          : null,
        subsystems: [
          {
            name: 'Battery Cell',
            status: hasHazard ? 'HEALTH_RISK' : powersOn ? 'OPTIMAL' : 'DEGRADED',
            score: hasHazard ? 32 : powersOn ? 90 : 58,
          },
          {
            name: 'Display & Glass',
            status: visibleDamage.includes('cracked') ? 'DEGRADED' : 'OPTIMAL',
            score: visibleDamage.includes('cracked') ? 42 : 95,
          },
          {
            name: 'Logic Board',
            status: powersOn ? 'INTACT' : 'DEGRADED',
            score: powersOn ? 88 : 46,
          },
          {
            name: 'Enclosure & Ports',
            status: 'OPTIMAL',
            score: 90,
          },
        ],
        recommendedRoute: hasHazard ? 'DROP_OFF' : powersOn ? 'REUSE' : 'REPAIR',
      }
    }
  } catch {
    // ignore storage errors
  }
  return null
}

function fromAssessedRecord(rec: AssessedDeviceRecord): DiagnosticResult {
  const isHigh = rec.hazardLevel === 'HIGH_HAZARD'
  const route =
    rec.handlingRecommendation === 'REUSE'
      ? 'REUSE'
      : rec.handlingRecommendation === 'REPAIR'
        ? 'REPAIR'
        : 'DROP_OFF'
  const damage = rec.visibleDamage || []
  const missing = rec.missingParts || []
  const batterySub = (rec.subsystems || []).find((s) =>
    s.name.toLowerCase().includes('battery')
  )
  const displaySub = (rec.subsystems || []).find((s) =>
    s.name.toLowerCase().includes('display')
  )
  const logicSub = (rec.subsystems || []).find((s) =>
    s.name.toLowerCase().includes('logic')
  )
  const powersOn = logicSub ? logicSub.score >= 60 : route === 'REUSE'
  const displayIntact = displaySub ? displaySub.score >= 60 : !damage.includes('cracked')

  return {
    assessmentId: rec.assessmentId,
    deviceModel: rec.deviceTitle,
    category: rec.category,
    analysisSource: rec.analysisSource,
    confidenceScore: rec.confidenceScore ?? 0.9,
    wasteClassification: isHigh
      ? 'Class III (Hazardous Lithium-Ion)'
      : 'Class I (Recoverable Consumer Electronics)',
    aiSummary: rec.aiSummary || rec.notes || undefined,
    supportingDetails: {
      powersOn,
      displayIntact,
      portsWorking: (batterySub?.score ?? 80) >= 50,
      visibleDamage: damage,
      missingParts: missing,
      notes: rec.notes,
    },
    hazardAlert: isHigh
      ? {
          level: 'CRITICAL',
          title: rec.hazardTitle || 'Critical Battery Hazard Flagged',
          instructions:
            'Do not attempt DIY battery puncture or opening. Drop off in a fire-safe container at your Barangay Eco-Hub.',
        }
      : null,
    subsystems: (rec.subsystems || []).map((s) => ({
      name: s.name,
      status:
        s.status === 'OPTIMAL' ||
        s.status === 'INTACT' ||
        s.status === 'DEGRADED' ||
        s.status === 'HEALTH_RISK'
          ? s.status
          : s.score >= 70
            ? 'INTACT'
            : 'DEGRADED',
      score: s.score,
      details: s.details,
      description: s.description,
    })),
    recommendedRoute: route,
  }
}

function resolveUserBase(user: User | null): number {
  if (!user) return 1
  if (user.barangay?.id) {
    const idNum = parseInt(user.barangay.id, 10)
    if (!isNaN(idNum) && idNum >= 1 && idNum <= 9) return idNum
  }
  return 1
}

export const ReuseRepairGuidePage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assessmentIdParam = searchParams.get('assessmentId')
  const tabParam = searchParams.get('tab')

  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(() =>
    loadStoredDiagnostic(assessmentIdParam)
  )
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !loadStoredDiagnostic(assessmentIdParam)
  )
  const [activeTab, setActiveTab] = useState<'reuse' | 'repair'>(() => {
    if (tabParam === 'repair') return 'repair'
    if (tabParam === 'reuse') return 'reuse'
    const initial = loadStoredDiagnostic(assessmentIdParam)
    return initial?.recommendedRoute === 'REPAIR' ? 'repair' : 'reuse'
  })
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [currentUser] = useState<User | null>(() => getCachedUser())

  useEffect(() => {
    let active = true
    if (assessmentIdParam) {
      assessmentsApi
        .getDiagnostic(assessmentIdParam)
        .then((res) => {
          if (!active || !res) return
          setDiagnostic(res)
          if (!tabParam && res.recommendedRoute === 'REPAIR') {
            setActiveTab('repair')
          }
          try {
            sessionStorage.setItem('ecobyte_last_diagnostic', JSON.stringify(res))
          } catch {
            // ignore
          }
        })
        .catch(() => {
          // keep stored/draft diagnostic if offline
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    } else if (!loadStoredDiagnostic(null)) {
      assessmentsApi
        .getMyAssessedItems()
        .then((items) => {
          if (!active || !Array.isArray(items) || items.length === 0) return
          const mapped = fromAssessedRecord(items[0])
          setDiagnostic(mapped)
          if (!tabParam && mapped.recommendedRoute === 'REPAIR') {
            setActiveTab('repair')
          }
        })
        .catch(() => {
          // user may not have prior assessments yet
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }

    return () => {
      active = false
    }
  }, [assessmentIdParam, tabParam])

  const userBaseNum = resolveUserBase(currentUser)
  const suggestedSite =
    COMMONWEALTH_FALLBACK_SITES.find(
      (s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum
    ) || COMMONWEALTH_FALLBACK_SITES[0]

  const deviceStatus = useMemo(() => {
    if (!diagnostic) return null

    const details = diagnostic.supportingDetails
    const visibleDamage = (details?.visibleDamage || []).filter((d) => d && d !== 'none')
    const missingParts = (details?.missingParts || []).filter((m) => m && m !== 'none')
    const hasBatteryHazard =
      diagnostic.hazardAlert?.level === 'CRITICAL' ||
      visibleDamage.some((v) => v.includes('swollen') || v.includes('battery_leak'))
    const hasWaterDamage = visibleDamage.some((v) => v.includes('water'))
    const hasScreenCrack =
      details?.displayIntact === false || visibleDamage.some((v) => v.includes('cracked'))
    const hasStructuralDamage = visibleDamage.some(
      (v) => v.includes('broken') || v.includes('burn') || v.includes('other:')
    )
    const powersOn = details?.powersOn ?? diagnostic.recommendedRoute === 'REUSE'
    const workingStatus = details?.workingStatus ?? (powersOn ? 'yes' : 'no')

    const subsystems = diagnostic.subsystems || []
    const avgScore =
      subsystems.length > 0
        ? Math.round(
            subsystems.reduce((sum, s) => sum + Number(s.score ?? 75), 0) /
              subsystems.length
          )
        : 80
    const viabilityPct = hasBatteryHazard ? Math.min(avgScore, 48) : avgScore

    const conditionTags: string[] = []
    if (workingStatus === 'yes' || powersOn) {
      conditionTags.push('Powers on')
    } else if (workingStatus === 'not_sure') {
      conditionTags.push('Power state unverified')
    } else {
      conditionTags.push('Does not power on')
    }
    if (hasBatteryHazard) conditionTags.push('Swollen / leaking battery')
    if (hasScreenCrack) conditionTags.push('Cracked / damaged screen')
    if (hasWaterDamage) conditionTags.push('Water / moisture damage')
    if (hasStructuralDamage) conditionTags.push('Body / structural damage')
    if (missingParts.length > 0) conditionTags.push(`Missing: ${missingParts.join(', ')}`)
    if (visibleDamage.length === 0 && missingParts.length === 0 && powersOn) {
      conditionTags.push('No visible damage')
    }

    const circularPathLabel =
      diagnostic.recommendedRoute === 'REUSE'
        ? 'Direct Reuse'
        : diagnostic.recommendedRoute === 'REPAIR'
          ? 'Repair First'
          : 'Station Drop-Off'

    const safeDiyLabel = hasBatteryHazard
      ? 'Restricted'
      : hasWaterDamage || !powersOn
        ? 'Bench Test'
        : hasScreenCrack || missingParts.length > 0
          ? 'Caution'
          : 'Safe DIY'

    const diySeverity: 'error' | 'warning' | 'ok' = hasBatteryHazard
      ? 'error'
      : hasWaterDamage || hasScreenCrack || !powersOn
        ? 'warning'
        : 'ok'

    const repairParts: string[] = []
    if (hasBatteryHazard) repairParts.push('OEM battery replacement (HazMat isolation)')
    if (hasScreenCrack) repairParts.push('Screen / digitizer assembly check')
    if (hasWaterDamage) repairParts.push('Ultrasonic logic board cleaning & corrosion check')
    if (!powersOn && !hasBatteryHazard && !hasWaterDamage) {
      repairParts.push('Charging IC / power rail diagnostics')
    }
    if (missingParts.length > 0) {
      repairParts.push(`Replace missing part(s): ${missingParts.join(', ')}`)
    }
    if (repairParts.length === 0) {
      repairParts.push('Preventive cleaning, port check, and battery calibration only')
    }

    const postChecks: string[] = [
      ...(hasScreenCrack ? ['✓ Touchscreen & Display Test'] : ['✓ Display Output Check']),
      ...(hasBatteryHazard || !powersOn
        ? ['✓ Safe Voltage & Cell Hold']
        : ['✓ Battery Cycle Stability']),
      '✓ Charging Port & Thermal Normal',
    ]

    return {
      hasBatteryHazard,
      hasWaterDamage,
      hasScreenCrack,
      hasStructuralDamage,
      powersOn,
      workingStatus,
      visibleDamage,
      missingParts,
      viabilityPct,
      conditionLine: conditionTags.join(' · '),
      circularPathLabel,
      safeDiyLabel,
      diySeverity,
      repairParts,
      postChecks,
    }
  }, [diagnostic])

  const handleShare = async () => {
    const shareTitle = diagnostic
      ? `EcoByte Guide — ${diagnostic.deviceModel}`
      : 'EcoByte Reuse & Repair Guide'
    const shareData = {
      title: shareTitle,
      text: diagnostic
        ? `Condition-based reuse & repair protocol for ${diagnostic.deviceModel} (${deviceStatus?.conditionLine}).`
        : 'Barangay Commonwealth EcoByte Device Lifecycle & Repair Protocol.',
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
        setToastMsg('Guide link copied to clipboard!')
      } else {
        setToastMsg('Link: ' + window.location.href)
      }
    } catch {
      setToastMsg('Guide link copied to clipboard!')
    }
  }

  const scheduleUrl = `/dropoff-schedule?${new URLSearchParams({
    ...(diagnostic?.assessmentId && diagnostic.assessmentId !== 'draft'
      ? { assessmentId: diagnostic.assessmentId }
      : {}),
    ...(diagnostic?.deviceModel ? { deviceName: diagnostic.deviceModel } : {}),
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
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.0625rem',
              color: '#0f172a',
            }}
          >
            Reuse &amp; Repair Guide
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            Condition-Aware Protocol
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label="Share guide"
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
      ) : !diagnostic || !deviceStatus ? (
        <Card
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px dashed #cbd5e1',
            backgroundColor: '#ffffff',
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 36, color: '#16a34a', mb: 1 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: '1rem',
              color: '#0f172a',
            }}
          >
            Scan a Device for Personalized Guidance
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.8125rem',
              color: '#64748b',
              mt: 0.75,
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            We tailor Reuse &amp; Repair instructions based on your phone or device&apos;s exact status (power, battery safety, screen condition, and missing parts).
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/scan')}
            sx={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 9999,
              px: 3,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            Scan &amp; Analyze Your Device
          </Button>
        </Card>
      ) : (
        <>
          {/* ── Assessed Device Status Card ── */}
          <Card
            sx={{
              p: 2.25,
              borderRadius: 2,
              border: deviceStatus.hasBatteryHazard
                ? '1.5px solid #fecaca'
                : '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <StatusBadge
                  label={
                    diagnostic.analysisSource === 'ai_assisted'
                      ? 'AI-ASSISTED DEVICE STATUS'
                      : 'DEVICE STATUS ASSESSMENT'
                  }
                  variant={deviceStatus.hasBatteryHazard ? 'hazard' : 'electric'}
                  size="sm"
                />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: '#0f172a',
                    mt: 0.75,
                  }}
                >
                  {diagnostic.deviceModel}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
                  {deviceStatus.hasBatteryHazard ||
                  deviceStatus.hasWaterDamage ||
                  !deviceStatus.powersOn ? (
                    <WarningAmberRoundedIcon
                      sx={{
                        fontSize: 16,
                        color: deviceStatus.hasBatteryHazard ? '#dc2626' : '#b45309',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 16, color: '#16a34a', flexShrink: 0 }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {deviceStatus.conditionLine}
                  </Typography>
                </Box>
              </Box>

              {/* Dynamic Viability Score Badge */}
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  border: `3.5px solid ${deviceStatus.hasBatteryHazard ? '#dc2626' : '#0f172a'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.1)',
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.9375rem',
                    color: '#0f172a',
                    lineHeight: 1,
                  }}
                >
                  {deviceStatus.viabilityPct}%
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.5rem',
                    color: '#64748b',
                    letterSpacing: '0.04em',
                  }}
                >
                  VIABLE
                </Typography>
              </Box>
            </Box>

            {diagnostic.aiSummary && (
              <Box
                sx={{
                  mb: 1.5,
                  p: 1.25,
                  borderRadius: 1.25,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.75rem',
                    color: '#334155',
                    fontWeight: 600,
                    lineHeight: 1.45,
                  }}
                >
                  {diagnostic.aiSummary}
                </Typography>
              </Box>
            )}

            {/* 3 Dynamic Status Mini Boxes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <Box
                sx={{
                  p: 1.25,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 1.25,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.625rem',
                    color: '#64748b',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  CIRCULAR PATH
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#0f172a',
                    mt: 0.25,
                  }}
                >
                  {deviceStatus.circularPathLabel}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  backgroundColor:
                    deviceStatus.diySeverity === 'error'
                      ? '#fee2e2'
                      : deviceStatus.diySeverity === 'warning'
                        ? '#fef3c7'
                        : '#dcfce7',
                  borderRadius: 1.25,
                  textAlign: 'center',
                  border: `1px solid ${
                    deviceStatus.diySeverity === 'error'
                      ? '#fecaca'
                      : deviceStatus.diySeverity === 'warning'
                        ? '#fde68a'
                        : '#bbf7d0'
                  }`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.625rem',
                    color:
                      deviceStatus.diySeverity === 'error'
                        ? '#991b1b'
                        : deviceStatus.diySeverity === 'warning'
                          ? '#92400e'
                          : '#166534',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  SAFE DIY
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color:
                      deviceStatus.diySeverity === 'error'
                        ? '#dc2626'
                        : deviceStatus.diySeverity === 'warning'
                          ? '#b45309'
                          : '#15803d',
                    mt: 0.25,
                  }}
                >
                  {deviceStatus.safeDiyLabel}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 1.25,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: '0.625rem',
                    color: '#64748b',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  CATEGORY
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#0f172a',
                    mt: 0.25,
                  }}
                >
                  {diagnostic.category || 'Electronics'}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* ── Segmented Guide Toggle ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Button
              variant={activeTab === 'reuse' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('reuse')}
              sx={{
                py: 1.25,
                borderRadius: 9999,
                backgroundColor: activeTab === 'reuse' ? '#0f172a' : '#ffffff',
                color: activeTab === 'reuse' ? '#ffffff' : '#0f172a',
                borderColor: activeTab === 'reuse' ? '#0f172a' : '#e2e8f0',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow:
                  activeTab === 'reuse' ? '0 2px 4px rgba(15,23,42,0.15)' : 'none',
                '&:hover': {
                  backgroundColor: activeTab === 'reuse' ? '#1e293b' : '#f8fafc',
                },
              }}
            >
              ♻️ Reuse Guide
            </Button>
            <Button
              variant={activeTab === 'repair' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('repair')}
              sx={{
                py: 1.25,
                borderRadius: 9999,
                backgroundColor: activeTab === 'repair' ? '#0f172a' : '#ffffff',
                color: activeTab === 'repair' ? '#ffffff' : '#0f172a',
                borderColor: activeTab === 'repair' ? '#0f172a' : '#e2e8f0',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow:
                  activeTab === 'repair' ? '0 2px 4px rgba(15,23,42,0.15)' : 'none',
                '&:hover': {
                  backgroundColor: activeTab === 'repair' ? '#1e293b' : '#f8fafc',
                },
              }}
            >
              🔧 Repair Guide
            </Button>
          </Box>

          {/* ── Guidance Content Tailored to Device Status ── */}
          {activeTab === 'reuse' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: '#0f172a',
                  }}
                >
                  Reuse Guidance for {diagnostic.deviceModel}
                </Typography>
                <StatusBadge
                  label={
                    deviceStatus.hasBatteryHazard
                      ? 'Drop-Off Required'
                      : deviceStatus.powersOn
                        ? 'Reuse Eligible'
                        : 'Repair Before Reuse'
                  }
                  variant={deviceStatus.hasBatteryHazard ? 'hazard' : 'electric'}
                  size="sm"
                />
              </Box>

              {/* Step 1: Safe Power & Daily Handling */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: deviceStatus.hasBatteryHazard
                        ? '#dc2626'
                        : '#0f172a',
                      color: deviceStatus.hasBatteryHazard ? '#ffffff' : '#abf06b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#0f172a',
                      }}
                    >
                      {deviceStatus.hasBatteryHazard
                        ? 'Stop using & do not charge'
                        : deviceStatus.hasWaterDamage
                          ? 'Keep powered off until dried & checked'
                          : deviceStatus.powersOn
                            ? 'Keep using safely'
                            : 'Avoid repeated power/charge attempts'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        mt: 0.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {deviceStatus.hasBatteryHazard
                        ? `Because ${diagnostic.deviceModel} has a reported swollen or leaking battery, discontinue use immediately and do not plug it into a charger before handing it over to your Barangay Eco-Hub.`
                        : deviceStatus.hasWaterDamage
                          ? `Moisture was reported on ${diagnostic.deviceModel}. Keep it powered off and unplugged so internal circuits do not short before inspection.`
                          : deviceStatus.powersOn
                            ? `${diagnostic.deviceModel} powers on properly. Keep charging cycles between 20% and 80% with a certified charger to preserve battery health before reuse or turnover.`
                            : `${diagnostic.deviceModel} currently does not power on (${deviceStatus.workingStatus === 'not_sure' ? 'power status unverified' : 'no boot'}). Do not force-charge with high-wattage adapters; let the station bench inspect the power rail first.`}
                    </Typography>

                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.25,
                        borderRadius: 1.25,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <DeviceThermostatRoundedIcon
                        sx={{ fontSize: 18, color: '#0f172a' }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.75rem',
                          color: '#0f172a',
                        }}
                      >
                        Store in a cool, dry place away from direct sunlight or dampness.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>

              {/* Step 2: Data Privacy, Clean & Store */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: '#0f172a',
                      color: '#abf06b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: '#0f172a',
                        }}
                      >
                        Prepare data &amp; sanitize exterior
                      </Typography>
                      <CleaningServicesRoundedIcon
                        sx={{ fontSize: 18, color: '#64748b' }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        mt: 0.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {deviceStatus.powersOn && !deviceStatus.hasBatteryHazard
                        ? 'Back up personal files, sign out of Google/Apple accounts (Factory Reset Protection), remove SIM/SD cards, and perform a full factory reset.'
                        : 'Since turning on the device is unsafe or unavailable, remove any physical SIM or microSD cards and unlink the device remotely from your Google/Apple account settings before turnover.'}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontSize: '0.75rem',
                            color: '#0f172a',
                          }}
                        >
                          {deviceStatus.hasScreenCrack
                            ? 'Place clear tape over cracked glass to prevent sharp shards before wiping lightly.'
                            : 'Wipe outer shell gently with a damp microfiber cloth (avoid open ports).'}
                        </Typography>
                      </Box>
                      {deviceStatus.missingParts.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                          <Typography
                            sx={{
                              fontFamily: "'Quicksand', sans-serif",
                              fontSize: '0.75rem',
                              color: '#0f172a',
                            }}
                          >
                            Note missing components ({deviceStatus.missingParts.join(', ')}) when handing over.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>

              {/* Step 3: Next Lifecycle Action */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: '#0f172a',
                      color: '#abf06b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: '#0f172a',
                        }}
                      >
                        {diagnostic.recommendedRoute === 'REUSE'
                          ? 'Circulate through the EcoByte Reuse Hub'
                          : 'Turn over to Barangay Commonwealth Eco-Hub'}
                      </Typography>
                      <VolunteerActivismRoundedIcon
                        sx={{ fontSize: 18, color: '#64748b' }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        mt: 0.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {diagnostic.recommendedRoute === 'REUSE'
                        ? `Because ${diagnostic.deviceModel} is functional, bring it to ${suggestedSite.name} for Stage 2 inspection so it can be verified and claimed by another Barangay Commonwealth resident.`
                        : `Schedule a drop-off at ${suggestedSite.name} so Barangay officials can safely handle refurbishment, parts harvesting, or certified e-waste disposal.`}
                    </Typography>
                    <Chip
                      size="small"
                      label={`Nearest Station: Base ${userBaseNum}`}
                      sx={{
                        mt: 1,
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        fontWeight: 700,
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </Box>
                </Box>
              </Card>

              {deviceStatus.hasBatteryHazard && (
                <Box
                  sx={{
                    backgroundColor: '#fffbeb',
                    borderRadius: 2,
                    border: '1.5px solid #fde68a',
                    p: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <WarningAmberRoundedIcon
                      sx={{ fontSize: 22, color: '#b45309', flexShrink: 0 }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#b45309',
                        }}
                      >
                        Hazard Warning: Swollen / Leaking Battery
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.8125rem',
                          color: '#92400e',
                          mt: 0.5,
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Do not attempt DIY battery puncture, heat gun application, or casing prying.</strong> Keep in a ventilated non-conductive container until handover at your Barangay Base station.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            /* Repair Guide Tab Tailored to Faults */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: '#0f172a',
                  }}
                >
                  Repair Protocol for {diagnostic.deviceModel}
                </Typography>
                <StatusBadge
                  label={
                    deviceStatus.hasBatteryHazard
                      ? 'HazMat Required'
                      : deviceStatus.diySeverity === 'ok'
                        ? 'Minor Servicing'
                        : 'Technician Advised'
                  }
                  variant={deviceStatus.hasBatteryHazard ? 'error' : 'warning'}
                  size="sm"
                />
              </Box>

              {/* Step 1: Fault-specific Safety Check */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: deviceStatus.hasBatteryHazard
                        ? '#dc2626'
                        : '#0f172a',
                      color: deviceStatus.hasBatteryHazard ? '#ffffff' : '#abf06b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#0f172a',
                      }}
                    >
                      {deviceStatus.hasBatteryHazard
                        ? 'Do not open swollen battery casing'
                        : deviceStatus.hasWaterDamage
                          ? 'Board cleaning before powering on'
                          : deviceStatus.hasScreenCrack
                            ? 'Stabilize cracked glass before repair'
                            : !deviceStatus.powersOn
                              ? 'Power-rail & charging port check'
                              : 'Port & battery health maintenance'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        mt: 0.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {deviceStatus.hasBatteryHazard
                        ? 'Isolate the device in a fireproof or non-conductive container. Do not pry glued batteries at home due to thermal runaway and fume risks.'
                        : deviceStatus.hasWaterDamage
                          ? 'Reported liquid exposure can leave mineral corrosion under shielding. Have a technician perform isopropyl/ultrasonic board cleaning instead of drying with heat.'
                          : deviceStatus.hasScreenCrack
                            ? 'Check whether touch input still responds and cover loose glass fractures with clear tape before scheduling display assembly replacement.'
                            : !deviceStatus.powersOn
                              ? 'Verify once with a known-good low-wattage cable and inspect the port gently with a wooden/plastic pick for compacted lint. If unresponsive, route to bench diagnostics.'
                              : 'Clean charging ports with a non-conductive pick and check battery health metrics in device settings—no major disassembly needed.'}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Step 2: Recommended Repair Scope */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: '#0f172a',
                      color: '#abf06b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: '#0f172a',
                        }}
                      >
                        Recommended Repair Focus
                      </Typography>
                      <BuildRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                    </Box>
                    <Box
                      component="ul"
                      sx={{
                        pl: 2.25,
                        mt: 0.75,
                        mb: 0,
                        color: '#475569',
                        fontSize: '0.8125rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {deviceStatus.repairParts.map((part) => (
                        <li key={part}>{part}</li>
                      ))}
                    </Box>
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.25,
                        borderRadius: 1.25,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#0f172a',
                          }}
                        >
                          {suggestedSite.name}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: '0.75rem',
                          color: '#64748b',
                        }}
                      >
                        Base {userBaseNum}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>

              {/* Step 3: Post-Repair Verification */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: '#0f172a',
                      color: '#abf06b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#0f172a',
                      }}
                    >
                      Verify after servicing
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        mt: 0.5,
                        lineHeight: 1.5,
                      }}
                    >
                      Confirm each flagged subsystem works safely before daily reuse or Barangay Reuse Hub turnover:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                      {deviceStatus.postChecks.map((checkLabel) => (
                        <Chip
                          key={checkLabel}
                          size="small"
                          label={checkLabel}
                          sx={{
                            backgroundColor: '#f1f5f9',
                            color: '#0f172a',
                            fontSize: '0.6875rem',
                            border: '1px solid #e2e8f0',
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          )}

          {/* ── Action Buttons ── */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              mt: 1,
              mb: 2,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate(scheduleUrl)}
              startIcon={<NavigationRoundedIcon sx={{ fontSize: 18, color: '#abf06b' }} />}
              sx={{
                py: 1.6,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
                '&:hover': {
                  backgroundColor: '#1e293b',
                },
              }}
            >
              Schedule Station Drop-Off ({diagnostic.deviceModel})
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                py: 1.4,
                borderColor: '#e2e8f0',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  borderColor: '#cbd5e1',
                },
              }}
            >
              Back to dashboard
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

import { useEffect, useState, type FC } from 'react'
import { Alert, Box, ButtonBase, CircularProgress, Dialog, Snackbar, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import thinkpadDetailImg from '@/assets/ui/thinkpad_detail.jpeg'
import { adminApi, type AdminInspectionDetails } from '@/lib/api'

export const AdminPhysicalInspectionPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const itemParam = searchParams.get('item') || ''

  const [details, setDetails] = useState<AdminInspectionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [bootState, setBootState] = useState<'yes' | 'no' | 'not_sure'>('yes')
  const [chassisCondition, setChassisCondition] = useState<'good' | 'damaged' | 'swollen'>('good')
  const [notes, setNotes] = useState('')

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    type: 'reuse' | 'disposal' | null
  }>({ open: false, type: null })

  useEffect(() => {
    let active = true
    const targetItemId = itemParam || 'item-201'
    adminApi
      .getInspectionDetails(targetItemId)
      .then((res) => {
        if (!active) return
        setDetails(res)
        setBootState(res.reportedCondition.powersOn ? 'yes' : 'no')
        if (res.reportedCondition.visibleDamage.includes('swollen_battery')) {
          setChassisCondition('swollen')
        } else if (!res.reportedCondition.displayIntact) {
          setChassisCondition('damaged')
        } else {
          setChassisCondition('good')
        }
        setNotes(res.benchNotes || '')
      })
      .catch((err: any) => {
        if (!active) return
        console.warn('Could not load inspection record from backend, keeping cached specs:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [itemParam])

  const handleQuickTelemetry = () => {
    setNotes(
      'Diagnostic bench check: Power draw steady. Display & chassis inspected. Ready for final disposition verdict.'
    )
  }

  const handleConfirmAction = async () => {
    const targetItemId = itemParam || details?.id || 'item-201'
    if (!confirmModal.type || !targetItemId) return
    setIsSubmitting(true)
    setErrorMsg(null)
    const action = confirmModal.type === 'reuse' ? 'REUSE' : 'DISPOSAL'
    const conditionGrade =
      chassisCondition === 'good' && bootState === 'yes'
        ? 'Inspected & Working'
        : chassisCondition === 'damaged'
          ? 'Minor Bezel Scratch'
          : 'Safe & Tested'
    try {
      await adminApi.submitInspectionVerdict(targetItemId, {
        action,
        conditionGrade,
        benchNotes: notes,
      })
      const target = confirmModal.type === 'reuse' ? '/admin/reuse-hub' : '/admin/disposal'
      setConfirmModal({ open: false, type: null })
      navigate(target)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit physical inspection verdict.')
      setConfirmModal({ open: false, type: null })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* ── Top Header / Breadcrumbs ── */}
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
            <ButtonBase
              onClick={() => navigate('/admin/to-inspect')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: 700,
                '&:hover': { color: '#0f172a' },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              <span>Back to Queue</span>
            </ButtonBase>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <Typography
              sx={{
                fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Physical Workstation
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              {isLoading ? 'Loading item...' : details?.deviceModel || 'Physical Inspection'}
            </Typography>
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: '6px',
                backgroundColor: '#eff4ff',
                color: '#16a34a',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              #{details?.serialNumber || itemParam || 'UNSELECTED'}
            </Box>
          </Box>
        </Box>

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
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '9999px',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
              Station 04 • Diagnostic Calibrated
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── 2-Column Split Layout ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
          gap: 3.5,
          alignItems: 'start',
        }}
      >
        {/* LEFT PANEL: Optical AI Diagnostic Dossier */}
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
                Optical AI Diagnostic Dossier
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Automated intake scan &amp; baseline telemetry
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: '4px',
                backgroundColor: '#eff4ff',
                color: '#16a34a',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Intake ID: #SCAN-9411
            </Box>
          </Box>

          {/* Photo Viewfinder with Defect Callouts */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 220,
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              border: '1px solid #cbd5e1',
            }}
          >
            <img
              src={thinkpadDetailImg}
              alt="Intake scan"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.85,
              }}
            />
            {/* Defect Annotation Box */}
            <Box
              sx={{
                position: 'absolute',
                top: '25%',
                left: '20%',
                width: '55%',
                height: '45%',
                border: '2px dashed #f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 1,
              }}
            >
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <WarningAmberRoundedIcon sx={{ fontSize: 12 }} />
                <span>Thermal Bulge (+1.8mm)</span>
              </Box>
              <Typography
                sx={{
                  alignSelf: 'flex-end',
                  color: '#ffffff',
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  px: 0.75,
                  py: 0.2,
                  borderRadius: '3px',
                }}
              >
                Scan Conf: 97.4%
              </Typography>
            </Box>
          </Box>

          {/* Hardware Specs Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              p: 2,
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>OEM / Model</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {details?.deviceModel || 'Electronic Device'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Serial Number</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                {details?.serialNumber || itemParam || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Resident Submitter</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {details?.resident?.name || 'Resident'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Barangay Base</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                {details?.resident?.barangay || 'Barangay Commonwealth'}
              </Typography>
            </Box>
          </Box>

          {/* Telemetry & Health Risk Scores */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Health Risk Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.75 }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 22, color: '#d97706' }} />
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309' }}>
                  Moderate
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Degraded Battery Subsystem
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Battery Degradation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 0.75 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                  71.8%
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '4px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontFamily: 'monospace',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}
                >
                  980 Cyc
                </Box>
              </Box>
              <Box sx={{ width: '100%', height: 6, borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ width: '71.8%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '9999px' }} />
              </Box>
            </Box>
          </Box>

          {/* AI Suggested Lifecycle Vector */}
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '9999px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RecyclingRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  AI Recommendation
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a' }}>
                  Reuse Hub (Refurb Ready)
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: '4px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              Cell Replacement
            </Box>
          </Box>
        </Box>

        {/* RIGHT PANEL: Admin Physical Inspection Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              p: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                  }}
                >
                  Physical Bench Verification
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Perform bench multimeter check, power drawdown test, and tactile inspection.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.35,
                  borderRadius: '9999px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '9999px', backgroundColor: '#16a34a' }} />
                ACTIVE SESSION
              </Box>
            </Box>

            {/* Question 1: Operational Power State */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '9999px',
                    backgroundColor: '#eff4ff',
                    color: '#0f172a',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  1
                </Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  Operational Power State: Does it turn on and boot?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Confirm display initialization, fan spin, chime, and basic bootloader response.
              </Typography>

              {/* 3 Radio Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mt: 0.5 }}>
                {[
                  { id: 'yes', label: 'Yes, Boots', sub: 'Display & OS Load', icon: CheckCircleRoundedIcon, color: '#16a34a' },
                  { id: 'no', label: 'No Power', sub: 'Zero Current Draw', icon: CancelRoundedIcon, color: '#dc2626' },
                  { id: 'not_sure', label: 'Intermittent', sub: 'Needs Diagnostic Hub', icon: HelpOutlineRoundedIcon, color: '#d97706' },
                ].map((opt) => {
                  const active = bootState === opt.id
                  const Icon = opt.icon
                  return (
                    <ButtonBase
                      key={opt.id}
                      onClick={() => setBootState(opt.id as typeof bootState)}
                      sx={{
                        p: 1.75,
                        borderRadius: '8px',
                        border: active ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        backgroundColor: active ? '#f0fdf4' : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: 0.5,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon sx={{ fontSize: 24, color: opt.color }} />
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                        {opt.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {opt.sub}
                      </Typography>
                    </ButtonBase>
                  )
                })}
              </Box>
            </Box>

            {/* Question 2: Physical Condition */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '9999px',
                      backgroundColor: '#eff4ff',
                      color: '#0f172a',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    2
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    Chassis &amp; Battery Physical Assessment
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#dc2626' }}>
                  <ShieldRoundedIcon sx={{ fontSize: 15 }} />
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Fire Protocol 9B applies
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                Visually gauge enclosure warping, glass fractures, and Li-ion pack expansion.
              </Typography>

              {/* 3 Pills */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mt: 0.5 }}>
                {[
                  { id: 'good', label: 'Grade A/B Clean', sub: 'Minimal wear, no flex' },
                  { id: 'damaged', label: 'Dented / Cracked', sub: 'Housing bent, screen OK' },
                  { id: 'swollen', label: 'Swollen Battery', sub: 'Expansion > 1.5mm. Hazmat.', isHazard: true },
                ].map((cond) => {
                  const active = chassisCondition === cond.id
                  return (
                    <ButtonBase
                      key={cond.id}
                      onClick={() => setChassisCondition(cond.id as typeof chassisCondition)}
                      sx={{
                        p: 1.5,
                        borderRadius: '8px',
                        border: active
                          ? cond.isHazard
                            ? '2px solid #dc2626'
                            : '2px solid #16a34a'
                          : '1px solid #e2e8f0',
                        backgroundColor: active
                          ? cond.isHazard
                            ? '#fee2e2'
                            : '#f0fdf4'
                          : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        gap: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 800,
                          color: cond.isHazard ? '#dc2626' : '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        {cond.isHazard && <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#dc2626' }} />}
                        {cond.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {cond.sub}
                      </Typography>
                    </ButtonBase>
                  )
                })}
              </Box>

              {/* Hazard Alert when Swollen Battery selected */}
              {chassisCondition === 'swollen' && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#dc2626' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.3 }}>
                    <strong>Hazardous Flag:</strong> Swollen battery triggers mandatory fire-retardant storage bin routing if slated for disposal. Refurbishing will mandate certified pack extraction.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Question 3: Bench Notes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '9999px',
                      backgroundColor: '#eff4ff',
                      color: '#0f172a',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    3
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    Physical Triage Telemetry Findings &amp; Bench Notes
                  </Typography>
                </Box>
                <ButtonBase
                  onClick={handleQuickTelemetry}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#16a34a',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <AutoFixHighRoundedIcon sx={{ fontSize: 15 }} />
                  <span>Insert Bench Telemetry</span>
                </ButtonBase>
              </Box>

              <Box sx={{ position: 'relative' }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 12,
                    paddingBottom: 28,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.6875rem',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                >
                  <KeyboardRoundedIcon sx={{ fontSize: 13 }} />
                  <span>UTF-8 Verified</span>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Decision Action Cards Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Terminal Lifecycle Routing
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                Immediate State Transition
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Option A: List in Reuse Hub */}
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  p: 2.5,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  borderLeft: '4px solid #16a34a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RecyclingRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: '4px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      Refurb &amp; Reuse
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    List in Reuse Hub
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                    Allocates to internal inventory, creates public circular listing, and queues for battery replacement kit refit.
                  </Typography>
                </Box>

                <ButtonBase
                  onClick={() => setConfirmModal({ open: true, type: 'reuse' })}
                  sx={{
                    width: '100%',
                    py: 1.25,
                    px: 2,
                    borderRadius: '8px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                    '&:hover': {
                      backgroundColor: '#15803d',
                    },
                  }}
                >
                  <RecyclingRoundedIcon sx={{ fontSize: 18 }} />
                  <span>List in Reuse Hub</span>
                </ButtonBase>
              </Box>

              {/* Option B: Mark for Disposal */}
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  p: 2.5,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  borderLeft: '4px solid #d97706',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: '#ffdcc3',
                        color: '#804300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DeleteForeverRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: '4px',
                        backgroundColor: '#ffdcc3',
                        color: '#804300',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      Certified Destruction
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Mark for Disposal
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                    Deems unit beyond practical economic recovery. Mandates certified downstream smelting, parts stripping, and EPA log.
                  </Typography>
                </Box>

                <ButtonBase
                  onClick={() => setConfirmModal({ open: true, type: 'disposal' })}
                  sx={{
                    width: '100%',
                    py: 1.25,
                    px: 2,
                    borderRadius: '8px',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    fontFamily: "'Rethink Sans', 'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                    '&:hover': {
                      backgroundColor: '#b45309',
                    },
                  }}
                >
                  <DeleteForeverRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Mark for Disposal</span>
                </ButtonBase>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Confirmation Modal ── */}
      <Dialog
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null })}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              p: 3,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: confirmModal.type === 'reuse' ? '#dcfce7' : '#ffdcc3',
                color: confirmModal.type === 'reuse' ? '#16a34a' : '#804300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {confirmModal.type === 'reuse' ? (
                <RecyclingRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <DeleteForeverRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
              {confirmModal.type === 'reuse' ? 'Confirm Reuse Listing' : 'Confirm Disposal Mandate'}
            </Typography>
          </Box>
          <ButtonBase onClick={() => setConfirmModal({ open: false, type: null })}>
            <CloseRoundedIcon sx={{ fontSize: 20, color: '#64748b' }} />
          </ButtonBase>
        </Box>

        <Box sx={{ py: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#334155' }}>
            Are you sure you want to transition asset <strong>#{itemParam}</strong> to{' '}
            <strong style={{ color: confirmModal.type === 'reuse' ? '#16a34a' : '#d97706' }}>
              {confirmModal.type === 'reuse' ? 'Available in Reuse Hub' : 'Turned Over for Disposal'}
            </strong>
            ?
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            {confirmModal.type === 'reuse'
              ? 'This will immediately publish the listing to resident portals and queue battery refit kits at Central Depot.'
              : 'This will auto-generate audit manifest record and initiate R2v3 hazardous destruction protocol.'}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
          <ButtonBase
            onClick={() => setConfirmModal({ open: false, type: null })}
            sx={{
              px: 2,
              py: 1,
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            disabled={isSubmitting}
            onClick={() => void handleConfirmAction()}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '8px',
              backgroundColor: confirmModal.type === 'reuse' ? '#16a34a' : '#d97706',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {isSubmitting && <CircularProgress size={14} color="inherit" />}
            <span>{isSubmitting ? 'Saving...' : 'Confirm & Proceed'}</span>
          </ButtonBase>
        </Box>
      </Dialog>

      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={5000}
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
export default AdminPhysicalInspectionPage

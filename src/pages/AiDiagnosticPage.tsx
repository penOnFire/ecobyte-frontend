import { useState, type FC } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded'
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded'
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded'
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import diagnosticImg from '@/assets/ui/diagnostic_view.jpeg'
import { getCachedUser } from '@/lib/api'
import type { User } from '@/types'
import {
  COMMONWEALTH_FALLBACK_SITES,
  resolveSiteBaseNumber,
} from '@/components/map/commonwealthData'

function resolveUserBase(user: User | null): number {
  if (!user) return 1
  if (user.barangay?.id) {
    const idNum = parseInt(user.barangay.id, 10)
    if (!isNaN(idNum) && idNum >= 1 && idNum <= 9) return idNum
    const match = /(?:base|area)[\s_-]*(\d+)/i.exec(user.barangay.id)
    if (match) return parseInt(match[1], 10)
  }
  if (user.barangay?.name) {
    const match = /(?:base|area)[\s_-]*(\d+)/i.exec(user.barangay.name)
    if (match) return parseInt(match[1], 10)
  }
  return 1
}

const MANUAL_CATEGORIES = [
  'Mobile Phones & Tablets',
  'Laptops & Desktop Computers',
  'Small Household Appliances',
  'Batteries, Cables & Adapters',
  'Audio & Entertainment Devices',
  'Unidentified / General Electronic Waste',
]

export const AiDiagnosticPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialUnidentified = searchParams.get('unidentified') === 'true'
  const [isUnidentified, setIsUnidentified] = useState(initialUnidentified)
  const [manualCategory, setManualCategory] = useState(
    searchParams.get('category') || MANUAL_CATEGORIES[0]
  )
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [currentUser] = useState<User | null>(() => getCachedUser())
  const userBaseNum = resolveUserBase(currentUser)
  const suggestedBaseSite =
    COMMONWEALTH_FALLBACK_SITES.find(
      (s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum
    ) || COMMONWEALTH_FALLBACK_SITES[0]

  const handleShare = async () => {
    const shareData = {
      title: 'EcoByte AI Diagnostic Result',
      text: 'EcoByte AI Multi-Angle Inspection: Galaxy S10 assessed with minor swelling. Reviewing circular turnover in Barangay Commonwealth.',
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
            AI Multi-Angle Inspection
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

      {/* ── Session & Confidence Bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            Session #SCAN-9042
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusBadge
            label={isUnidentified ? 'Low Confidence (Unidentified)' : 'Confidence 98.4%'}
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
            {isUnidentified ? 'Reset to Recognized' : 'Flag Unidentified'}
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
        {/* Mock X-Ray / Vision scan viewport */}
        <Box
          sx={{
            height: 168,
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
            src={diagnosticImg}
            alt="Hardware Diagnostic Scan"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
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
              <CropFreeRoundedIcon sx={{ fontSize: 13, color: '#abf06b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                AI MULTI-ANGLE LOCK
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
                6/6 ANGLES
              </Typography>
            </Box>
          </Box>

          {/* Internal circuitry graphic illustration */}
          <Box
            sx={{
              alignSelf: 'center',
              my: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 1,
            }}
          >
            <MemoryRoundedIcon sx={{ fontSize: 44, color: '#abf06b', filter: 'drop-shadow(0 0 8px rgba(171, 240, 107, 0.5))' }} />
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#ffffff' }}>
                BATTERY STATUS: DEGRADED (68%)
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#94a3b8' }}>
                INTERNAL GAS BUILDUP: DETECTED
              </Typography>
            </Box>
          </Box>

          {/* Warning badge overlay */}
          <Box
            sx={{
              alignSelf: 'center',
              backgroundColor: 'rgba(254, 243, 199, 0.95)',
              border: '1px solid #fde68a',
              borderRadius: 9999,
              px: 1.5,
              py: 0.4,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              zIndex: 1,
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#b45309' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#b45309' }}>
              Screen stress fractures identified
            </Typography>
          </Box>
        </Box>

        {/* Hardware Info Bottom Container */}
        <Box sx={{ p: 2.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                IDENTIFIED HARDWARE
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', mt: 0.25 }}>
                iPhone 11 Pro
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
                64GB Space Gray • Model A2160
              </Typography>
            </Box>
            <StatusBadge label="Class III e-Waste" variant="electric" size="sm" />
          </Box>

          <Divider sx={{ my: 1.75, borderColor: '#e2e8f0' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <EnergySavingsLeafRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#64748b' }}>
                Recoverable Mass:
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
              188g (91% EcoByte Recoverable)
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Potential Health Risk Card ── */}
      <Card
        sx={{
          p: 2.25,
          borderRadius: 2,
          border: '1.5px solid #fecaca',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(239, 68, 68, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.75 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                Potential health risk
              </Typography>
              <StatusBadge label="High Risk" variant="error" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
              <strong>Reason:</strong> Contains an aged, swollen lithium-ion battery exhibiting internal degassing stress and seal degradation.
            </Typography>
          </Box>
        </Box>

        {/* Mandatory precautions subcard */}
        <Box
          sx={{
            backgroundColor: '#fffbeb',
            borderRadius: 1.5,
            p: 1.5,
            border: '1px solid #fde68a',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#b45309' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#b45309', letterSpacing: '0.04em' }}>
              MANDATORY PRECAUTIONS
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#92400e', lineHeight: 1.5, fontWeight: 500 }}>
            Do not puncture, apply direct pressure, or expose to heat. Store immediately in a cool, fire-rated container isolated from flammable materials.
          </Typography>
        </Box>
      </Card>

      {/* ── Parts Detected Section ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
            Parts detected
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            4 Subsystems Analyzed
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {[
            {
              title: 'Battery',
              subtitle: 'Cell degassed • 68% Max Capacity',
              badge: 'Degraded',
              badgeVariant: 'error' as const,
              icon: <BatteryAlertRoundedIcon sx={{ fontSize: 20, color: '#dc2626' }} />,
              iconBg: '#fee2e2',
            },
            {
              title: 'Screen',
              subtitle: 'Surface glass fracture • Digitizer Intact',
              badge: 'Cracked',
              badgeVariant: 'warning' as const,
              icon: <CropFreeRoundedIcon sx={{ fontSize: 20, color: '#d97706' }} />,
              iconBg: '#fef3c7',
            },
            {
              title: 'Casing',
              subtitle: 'Minor chassis abrasions only',
              badge: 'OK',
              badgeVariant: 'electric' as const,
              icon: <PhoneAndroidRoundedIcon sx={{ fontSize: 20, color: '#0f172a' }} />,
              iconBg: '#f1f5f9',
            },
            {
              title: 'Logic Board',
              subtitle: 'Boot sequence & sensors pass',
              badge: 'Operational',
              badgeVariant: 'electric' as const,
              icon: <MemoryRoundedIcon sx={{ fontSize: 20, color: '#0f172a' }} />,
              iconBg: '#f1f5f9',
            },
          ].map((part, i, arr) => (
            <Box key={part.title}>
              <Box sx={{ p: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: part.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {part.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      {part.title}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                      {part.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <StatusBadge label={part.badge} variant={part.badgeVariant} size="sm" />
              </Box>
              {i < arr.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
            </Box>
          ))}
        </Card>
      </Box>

      {/* ── What would you like to do? ── */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', mb: 1.25 }}>
          {isUnidentified ? 'Module 2: Unidentified E-Waste Intake' : 'Stage 1 Decision: What would you like to do?'}
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
                  AI model confidence is low. Select the closest category to schedule a physical inspection at the Eco-Hub.
                </Typography>
              </Box>
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2, backgroundColor: '#ffffff', borderRadius: 1.5 }}>
              <Select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                sx={{ borderRadius: 1.5, fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.875rem' }}
              >
                {MANUAL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
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
                  `/schedule-dropoff?unidentified=true&category=${encodeURIComponent(manualCategory)}`
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
            {/* Stage 1 Option: Reuse & Repair Guide */}
            <Card
              onClick={() => navigate('/reuse-guide')}
              sx={{
                p: 1.75,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#0f172a', transform: 'translateY(-1px)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.5,
                    backgroundColor: '#f1f5f9',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BuildOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Reuse / Repair Guide
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                    Step-by-step circular guides, technician repair tips &amp; safe reuse
                  </Typography>
                </Box>
              </Box>
              <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
            </Card>

            {/* Stage 1 Option: Further Assessment (Drop-off Booking) */}
            <Card
              onClick={() => navigate('/schedule-dropoff')}
              sx={{
                p: 1.75,
                borderRadius: 2,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1px solid #1e293b',
                boxShadow: '0 2px 6px rgba(15,23,42,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { backgroundColor: '#1e293b', transform: 'translateY(-1px)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.5,
                    backgroundColor: '#abf06b',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#ffffff' }}>
                      Further Assessment (Station Drop-Off)
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        px: 0.75,
                        py: 0.15,
                        borderRadius: 1,
                      }}
                    >
                      Nearest: Area {userBaseNum}
                    </Box>
                  </Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#abf06b', mt: 0.25 }}>
                    Suggested: {suggestedBaseSite.name}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#94a3b8' }}>
                    Auto-suggests your nearest base station • Choose any Commonwealth hub freely
                  </Typography>
                </Box>
              </Box>
              <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#abf06b' }} />
            </Card>
          </Box>
        )}

        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#94a3b8',
            textAlign: 'center',
            mt: 2,
          }}
        >
          Initial guide only. It does not replace professional inspection.
        </Typography>
      </Box>

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

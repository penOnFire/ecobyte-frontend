import type { FC } from 'react'
import {
  Box,
  Card,
  Divider,
  IconButton,
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
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import diagnosticImg from '@/assets/ui/diagnostic_view.jpeg'

export const AiDiagnosticPage: FC = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      {/* ── Top Bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            borderRadius: '50%',
            color: '#292524',
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#292524' }}>
            Diagnostic Results
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c' }}>
            AI Multi-Angle Inspection
          </Typography>
        </Box>

        <IconButton
          size="small"
          sx={{
            width: 36,
            height: 36,
            backgroundColor: '#ffffff',
            border: '1px solid #ede8e1',
            borderRadius: '50%',
            color: '#292524',
          }}
        >
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Session & Confidence Bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4f5f4b' }} />
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#292524' }}>
            Session #SCAN-9042
          </Typography>
        </Box>
        <StatusBadge label="Confidence 98.4%" variant="muted" size="sm" />
      </Box>

      {/* ── Hero Hardware Card ── */}
      <Card sx={{ borderRadius: 4, border: '1px solid #ede8e1', overflow: 'hidden' }}>
        {/* Mock X-Ray / Vision scan viewport */}
        <Box
          sx={{
            height: 160,
            backgroundColor: '#1e293b',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1.5,
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
              opacity: 0.45,
            }}
          />

          {/* Top HUD overlay */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, position: 'relative' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(0,0,0,0.6)',
                px: 1,
                py: 0.35,
                borderRadius: 9999,
              }}
            >
              <CropFreeRoundedIcon sx={{ fontSize: 13, color: '#38c194' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#ffffff' }}>
                AI MULTI-ANGLE LOCK
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                px: 1,
                py: 0.3,
                borderRadius: 9999,
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem', color: '#1e293b' }}>
                6/6 Angles
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
            }}
          >
            <MemoryRoundedIcon sx={{ fontSize: 48, color: '#38c194', opacity: 0.8 }} />
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#ffffff' }}>
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
              backgroundColor: '#fffbeb',
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
            <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#d97706' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#78350f' }}>
              Screen stress fractures identified
            </Typography>
          </Box>
        </Box>

        {/* Hardware Info Bottom Container */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#78716c', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                IDENTIFIED HARDWARE
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#292524', mt: 0.25 }}>
                iPhone 11 Pro
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.25 }}>
                64GB Space Gray • Model A2160
              </Typography>
            </Box>
            <StatusBadge label="Class III e-Waste" variant="green-pill" />
          </Box>

          <Divider sx={{ my: 1.75 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <EnergySavingsLeafRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#78716c' }}>
                Recoverable Mass:
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#292524' }}>
              188g (91% EcoByte Recoverable)
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── Potential Health Risk Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1.5px solid #fecaca', backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
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
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                Potential health risk
              </Typography>
              <StatusBadge label="High Risk" variant="error" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
              <strong>Reason:</strong> Contains an aged, swollen lithium-ion battery exhibiting internal degassing stress and seal degradation.
            </Typography>
          </Box>
        </Box>

        {/* Mandatory precautions subcard */}
        <Box
          sx={{
            backgroundColor: '#faf3ea',
            borderRadius: 3,
            p: 1.5,
            border: '1px solid #ede4d8',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#78350f' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#78350f', letterSpacing: '0.04em' }}>
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
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
            Parts detected
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
            4 Subsystems Analyzed
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 4, border: '1px solid #ede8e1', overflow: 'hidden' }}>
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
              badgeVariant: 'available' as const,
              icon: <PhoneAndroidRoundedIcon sx={{ fontSize: 20, color: '#38a882' }} />,
              iconBg: '#ebf2eb',
            },
            {
              title: 'Logic Board',
              subtitle: 'Boot sequence & sensors pass',
              badge: 'Operational',
              badgeVariant: 'available' as const,
              icon: <MemoryRoundedIcon sx={{ fontSize: 20, color: '#38a882' }} />,
              iconBg: '#ebf2eb',
            },
          ].map((part, i, arr) => (
            <Box key={part.title}>
              <Box sx={{ p: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2.5,
                      backgroundColor: part.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {part.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
                      {part.title}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                      {part.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <StatusBadge label={part.badge} variant={part.badgeVariant} size="sm" />
              </Box>
              {i < arr.length - 1 && <Divider />}
            </Box>
          ))}
        </Card>
      </Box>

      {/* ── What would you like to do? ── */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524', mb: 1.25 }}>
          What would you like to do?
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {/* Reuse option */}
          <Card
            onClick={() => navigate('/reuse-guide')}
            sx={{
              p: 1.75,
              borderRadius: 4,
              border: '1.5px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#4f5f4b' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: '#ebf2eb',
                  color: '#4f5f4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RecyclingRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Reuse
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                  Keep using it or pass it on
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#78716c' }} />
          </Card>

          {/* Repair option */}
          <Card
            onClick={() => navigate('/drop-offs')}
            sx={{
              p: 1.75,
              borderRadius: 4,
              border: '1.5px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#4f5f4b' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: '#ebf2eb',
                  color: '#4f5f4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BuildOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Repair
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                  Get it fixed by a technician
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#78716c' }} />
          </Card>

          {/* Further Assessment option (Highlighted) */}
          <Card
            onClick={() => navigate('/drop-offs')}
            sx={{
              p: 1.75,
              borderRadius: 4,
              backgroundColor: '#faf3ea',
              border: '1.5px solid #ede4d8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#4f5f4b' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocationOnOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Further assessment
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                  Drop off for a physical inspection
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#78716c' }} />
          </Card>
        </Box>

        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#a8a29e',
            textAlign: 'center',
            mt: 2,
          }}
        >
          Initial guide only. It does not replace professional inspection.
        </Typography>
      </Box>
    </Box>
  )
}


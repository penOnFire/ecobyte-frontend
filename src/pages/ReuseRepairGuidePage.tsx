import { useState } from 'react'
import type { FC } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
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
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const ReuseRepairGuidePage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'reuse' | 'repair'>(() => {
    return searchParams.get('tab') === 'repair' ? 'repair' : 'reuse'
  })
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleShare = async () => {
    const shareData = {
      title: 'EcoByte Reuse & Repair Guide',
      text: 'Barangay Commonwealth EcoByte Device Lifecycle & Repair Protocol.',
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
            Reuse &amp; Repair Guide
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
            Lifecycle Protocol v3.2
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

      {/* ── Diagnostic Detected Card ── */}
      <Card
        sx={{
          p: 2.25,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <StatusBadge label="DIAGNOSTIC DETECTED" variant="electric" size="sm" />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', mt: 0.75 }}>
              iPhone 11 Pro
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#b45309' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Degassed Battery, Cracked Outer Glass
              </Typography>
            </Box>
          </Box>

          {/* 91% Viable Circular Badge */}
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              border: '3.5px solid #0f172a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              boxShadow: '0 2px 6px rgba(15,23,42,0.1)',
            }}
          >
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a', lineHeight: 1 }}>
              91%
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.5rem', color: '#64748b', letterSpacing: '0.04em' }}>
              VIABLE
            </Typography>
          </Box>
        </Box>

        {/* 3 mini stats boxes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          <Box sx={{ p: 1.25, backgroundColor: '#f1f5f9', borderRadius: 1.25, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
              CIRCULAR PATH
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a', mt: 0.25 }}>
              Refurbish First
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#fee2e2', borderRadius: 1.25, textAlign: 'center', border: '1px solid #fecaca' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#991b1b', fontWeight: 700, letterSpacing: '0.04em' }}>
              SAFE DIY
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#dc2626', mt: 0.25 }}>
              Restricted
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, backgroundColor: '#f1f5f9', borderRadius: 1.25, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
              EST. OFFSET
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a', mt: 0.25 }}>
              48.2 kg CO₂e
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
            boxShadow: activeTab === 'reuse' ? '0 2px 4px rgba(15,23,42,0.15)' : 'none',
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
            boxShadow: activeTab === 'repair' ? '0 2px 4px rgba(15,23,42,0.15)' : 'none',
            '&:hover': {
              backgroundColor: activeTab === 'repair' ? '#1e293b' : '#f8fafc',
            },
          }}
        >
          🔧 Repair Guide
        </Button>
      </Box>

      {/* ── Guidance Content ── */}
      {activeTab === 'reuse' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              Circular Lifecycle Guidance
            </Typography>
            <StatusBadge label="Phase 1: Retention" variant="electric" size="sm" />
          </Box>

          {/* Step 1 */}
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
                1
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                  Keep using safely
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  Maintain charge cycles strictly between <strong>20% and 80%</strong> to mitigate chemical battery swelling. Avoid fast-charging bricks above 18W to prevent catastrophic thermal stress.
                </Typography>

                {/* Sub-tip */}
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
                  <DeviceThermostatRoundedIcon sx={{ fontSize: 18, color: '#0f172a' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#0f172a' }}>
                    Prevent exposure to direct vehicle dashboard heat or moisture dampness.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Step 2 */}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Clean and store
                  </Typography>
                  <CleaningServicesRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  Perform an encrypted factory reset (<code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a' }}>Settings &gt; General &gt; Transfer or Reset</code>) after creating an off-device backup.
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#0f172a' }}>
                      Sanitize glass with 70% isopropyl alcohol wipe.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#0f172a' }}>
                      Store at 50% charge in a ventilated, dry room.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Step 3 */}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Pass it on
                  </Typography>
                  <VolunteerActivismRoundedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  Donate directly to certified local STEM classrooms or transfer custody through the <strong>EcoByte Certified Reuse Hub</strong> to earn carbon credits.
                </Typography>
                <Chip
                  size="small"
                  label="8 verified schools near you"
                  sx={{ mt: 1, backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 700, border: '1px solid #e2e8f0' }}
                />
              </Box>
            </Box>
          </Card>

          {/* Hazard Warning Swollen Battery */}
          <Box
            sx={{
              backgroundColor: '#fffbeb',
              borderRadius: 2,
              border: '1.5px solid #fde68a',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 22, color: '#b45309', flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#b45309' }}>
                  Hazard Warning: Swollen Battery
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#92400e', mt: 0.5, lineHeight: 1.5 }}>
                  Degassed or bloated pouch detected. <strong>Do not attempt DIY battery puncture, heat gun application, or casing prying.</strong> Risk of rapid thermal runaway and toxic gas discharge.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Repair Guide Tab */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              Certified Repair Protocols
            </Typography>
            <StatusBadge label="Technician Required" variant="error" size="sm" />
          </Box>

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
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
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
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                  Do not open if swollen
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  Adhere strictly to standard HazMat electronic isolation protocols. Wear eye protection (safety glasses) and isolate device in a non-combustible sand-bucket or fireproof LiPo safety pouch until technician transfer.
                </Typography>
              </Box>
            </Box>
          </Card>

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
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                  Refer to a certified technician
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  Book an appointment with certified partner repair kiosks. Genuine OEM battery replacement restores warranty and seals water-resistant gaskets to prevent future degradation.
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
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
                      EcoByte Authorized Hub
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                    0.8 mi away
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

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
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                  Test after repair
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#64748b', mt: 0.5, lineHeight: 1.5 }}>
                  Run EcoByte&apos;s post-repair diagnostic routine to verify digitizer alignment, battery handshake telemetry, and inductive charging stability.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                  <Chip size="small" label="✓ Touchscreen Multi-touch" sx={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '0.6875rem', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                  <Chip size="small" label="✓ Amperage Calibrated" sx={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '0.6875rem', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                  <Chip size="small" label="✓ Thermal Normal" sx={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '0.6875rem', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      )}

      {/* ── Action Buttons ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/dashboard')}
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
          Back to dashboard
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => navigate('/drop-offs')}
          startIcon={<NavigationRoundedIcon sx={{ fontSize: 18 }} />}
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
          Find repair drop-off
        </Button>
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

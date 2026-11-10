import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
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
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const ReuseRepairGuidePage: FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'reuse' | 'repair'>('reuse')

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
            Reuse &amp; Repair Guide
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c' }}>
            Lifecycle Protocol v3.2
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

      {/* ── Diagnostic Detected Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <StatusBadge label="DIAGNOSTIC DETECTED" variant="available" size="sm" />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#292524', mt: 0.5 }}>
              iPhone 11 Pro
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 15, color: '#d97706' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
                Degassed Battery, Cracked Outer Glass
              </Typography>
            </Box>
          </Box>

          {/* 91% Viable Circular Badge */}
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              border: '3.5px solid #4f5f4b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#faf8f5',
            }}
          >
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524', lineHeight: 1 }}>
              91%
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5rem', color: '#78716c' }}>
              VIABLE
            </Typography>
          </Box>
        </Box>

        {/* 3 mini stats boxes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          <Box sx={{ p: 1, backgroundColor: '#f4ede4', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#78716c', fontWeight: 700 }}>
              CIRCULAR PATH
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#292524', mt: 0.25 }}>
              Refurbish First
            </Typography>
          </Box>

          <Box sx={{ p: 1, backgroundColor: '#fee2e2', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#991b1b', fontWeight: 700 }}>
              SAFE DIY
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#dc2626', mt: 0.25 }}>
              Restricted
            </Typography>
          </Box>

          <Box sx={{ p: 1, backgroundColor: '#ebf2eb', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#2d3e2c', fontWeight: 700 }}>
              EST. OFFSET
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#2d3e2c', mt: 0.25 }}>
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
            backgroundColor: activeTab === 'reuse' ? '#4f5f4b' : '#ffffff',
            color: activeTab === 'reuse' ? '#ffffff' : '#292524',
            borderColor: '#ede8e1',
            fontWeight: 700,
            fontSize: '0.875rem',
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
            backgroundColor: activeTab === 'repair' ? '#4f5f4b' : '#ffffff',
            color: activeTab === 'repair' ? '#ffffff' : '#292524',
            borderColor: '#ede8e1',
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          🔧 Repair Guide
        </Button>
      </Box>

      {/* ── Guidance Content ── */}
      {activeTab === 'reuse' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
              Circular Lifecycle Guidance
            </Typography>
            <StatusBadge label="Phase 1: Retention" variant="available" size="sm" />
          </Box>

          {/* Step 1 */}
          <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                1
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Keep using safely
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
                  Maintain charge cycles strictly between <strong>20% and 80%</strong> to mitigate chemical battery swelling. Avoid fast-charging bricks above 18W to prevent catastrophic thermal stress.
                </Typography>

                {/* Sub-tip */}
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.25,
                    borderRadius: 2.5,
                    backgroundColor: '#faf8f5',
                    border: '1px solid #ede8e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <DeviceThermostatRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#292524' }}>
                    Prevent exposure to direct vehicle dashboard heat or moisture dampness.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Step 2 */}
          <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                2
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                    Clean and store
                  </Typography>
                  <CleaningServicesRoundedIcon sx={{ fontSize: 18, color: '#78716c' }} />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
                  Perform an encrypted factory reset (<code style={{ backgroundColor: '#f4ede4', padding: '2px 6px', borderRadius: 4 }}>Settings &gt; General &gt; Transfer or Reset</code>) after creating an off-device backup.
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#38a882' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#292524' }}>
                      Sanitize glass with 70% isopropyl alcohol wipe.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#38a882' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#292524' }}>
                      Store at 50% charge in a ventilated, dry room.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Step 3 */}
          <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                3
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                    Pass it on
                  </Typography>
                  <VolunteerActivismRoundedIcon sx={{ fontSize: 18, color: '#78716c' }} />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
                  Donate directly to certified local STEM classrooms or transfer custody through the <strong>EcoByte Certified Reuse Hub</strong> to earn carbon credits.
                </Typography>
                <Chip
                  size="small"
                  label="8 verified schools near you"
                  sx={{ mt: 1, backgroundColor: '#ebf2eb', color: '#384735', fontWeight: 700 }}
                />
              </Box>
            </Box>
          </Card>

          {/* Hazard Warning Swollen Battery */}
          <Box
            sx={{
              backgroundColor: '#fffbeb',
              borderRadius: 4,
              border: '1.5px solid #fde68a',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 22, color: '#d97706', flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#78350f' }}>
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
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
              Certified Repair Protocols
            </Typography>
            <StatusBadge label="Technician Required" variant="error" size="sm" />
          </Box>

          <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                1
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Do not open if swollen
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
                  Adhere strictly to standard HazMat electronic isolation protocols. Wear eye protection (safety glasses) and isolate device in a non-combustible sand-bucket or fireproof LiPo safety pouch until technician transfer.
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                2
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Refer to a certified technician
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
                  Book an appointment with certified partner repair kiosks. Genuine OEM battery replacement restores warranty and seals water-resistant gaskets to prevent future degradation.
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.25,
                    borderRadius: 2.5,
                    backgroundColor: '#faf8f5',
                    border: '1px solid #ede8e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#38a882' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#292524' }}>
                      EcoByte Authorized Hub
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                    0.8 mi away
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                3
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  Test after repair
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.8125rem', color: '#78716c', mt: 0.5, lineHeight: 1.5 }}>
                  Run EcoByte&apos;s post-repair diagnostic routine to verify digitizer alignment, battery handshake telemetry, and inductive charging stability.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                  <Chip size="small" label="✓ Touchscreen Multi-touch" sx={{ backgroundColor: '#ebf2eb', color: '#2d3e2c', fontSize: '0.6875rem' }} />
                  <Chip size="small" label="✓ Amperage Calibrated" sx={{ backgroundColor: '#ebf2eb', color: '#2d3e2c', fontSize: '0.6875rem' }} />
                  <Chip size="small" label="✓ Thermal Normal" sx={{ backgroundColor: '#ebf2eb', color: '#2d3e2c', fontSize: '0.6875rem' }} />
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
          onClick={() => navigate('/')}
          sx={{
            py: 1.6,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
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
            borderColor: '#ede8e1',
            color: '#292524',
            backgroundColor: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          Find repair drop-off
        </Button>
      </Box>
    </Box>
  )
}


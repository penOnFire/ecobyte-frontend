import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StepperTracker } from '@/components/ui/StepperTracker'
import ipadImg from '@/assets/ui/ipad.jpeg'
import keychronImg from '@/assets/ui/keychron.jpeg'

const TRACKER_STEPS = [
  { id: 1, label: 'Submitted' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Scheduled' },
  { id: 4, label: 'Collected' },
  { id: 5, label: 'Turned over' },
]

export const DashboardPage: FC = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1, pb: 4 }}>
      {/* ── Top Header Context & Hub Live Pill ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 600,
            fontSize: '0.6875rem',
            color: '#64748b',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Circular lifecycle diagnostics &amp; recovery
        </Typography>
        <StatusBadge label="Hub Live" variant="live" size="sm" />
      </Box>

      {/* ── Greeting: Large 40px Heading ── */}
      <Box sx={{ mt: -0.5, mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 500,
            fontSize: '2.375rem',
            color: '#0f172a',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Hello, Alex
        </Typography>
      </Box>

      {/* ── 3-Column Stats Card (Shadcn aesthetic) ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', textAlign: 'center' }}>
          {/* Requests */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              Requests
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#0f172a', my: 0.25, lineHeight: 1 }}>
              3
            </Typography>
            <StatusBadge label="Active" variant="active" size="sm" />
          </Box>

          {/* Assessed */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              Assessed
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#0f172a', my: 0.25, lineHeight: 1 }}>
              12
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#64748b', fontWeight: 700 }}>
              Total items
            </Typography>
          </Box>

          {/* Reserved */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
              Reserved
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#0f172a', my: 0.25, lineHeight: 1 }}>
              1
            </Typography>
            <StatusBadge label="Pending" variant="pending" size="sm" />
          </Box>
        </Box>
      </Card>

      {/* ── Active Request Tracker Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Active Request
                  </Typography>
                  <StatusBadge label="In Transit" variant="in-transit" size="sm" />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.2 }}>
                  Req #2041 • MacBook Pro 13″ &amp; 2 Li-ion
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => navigate('/requests')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#0f172a',
                cursor: 'pointer',
                '&:hover': { color: '#4f5f4b' },
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
                Details
              </Typography>
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* Stepper */}
          <Box sx={{ my: 1.5 }}>
            <StepperTracker steps={TRACKER_STEPS} currentStep={3} />
          </Box>

          {/* Driver pill */}
          <Box
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 15, color: '#64748b' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>
                Today, 3:30 PM • Certified Logistics
              </Typography>
            </Box>
            <Box sx={{ backgroundColor: '#e8ffbf', px: 1, py: 0.25, borderRadius: 9999 }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.625rem', color: '#1a3311', fontWeight: 700 }}>
                Driver assigned
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Latest in Reuse Hub ── */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#0f172a',
                textTransform: 'uppercase',
              }}
            >
              Latest in Reuse Hub
            </Typography>
            <StatusBadge label="Refurb" variant="available" size="sm" />
          </Box>
          <Typography
            onClick={() => navigate('/reuse')}
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Explore all
          </Typography>
        </Box>

        {/* Item 1: iPad 9th Gen */}
        <Card sx={{ p: 1.75, borderRadius: 4, mb: 1.25, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', gap: 1.75 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={ipadImg}
                alt="iPad 9th Gen"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 5,
                  left: 5,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: 1,
                  px: 0.6,
                  py: 0.15,
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#0f172a' }}>
                  Grade A
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    iPad 9th Gen 64GB
                  </Typography>
                  <StatusBadge label="Available" variant="available" size="sm" />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>
                  Battery: 94% • Screen: Flawless
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                  📍 San Antonio Hub • 0.8 km
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Free Claim
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/confirm-reservation')}
                  sx={{
                    borderRadius: 9999,
                    py: 0.4,
                    px: 1.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
                  }}
                >
                  Reserve
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Item 2: Keychron K2 */}
        <Card sx={{ p: 1.75, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', gap: 1.75 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={keychronImg}
                alt="Keychron K2"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 5,
                  left: 5,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: 1,
                  px: 0.6,
                  py: 0.15,
                }}
              >
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#0f172a' }}>
                  Restored
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Keychron K2 V2 Wireless
                  </Typography>
                  <StatusBadge label="Available" variant="available" size="sm" />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>
                  Gateron Brown • New Li-ion Cell
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                  📍 Bel-Air Drop Site • 1.4 km
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Free Claim
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/confirm-reservation')}
                  sx={{
                    borderRadius: 9999,
                    py: 0.4,
                    px: 1.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
                  }}
                >
                  Reserve
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ── Lithium-ion Protocol Warning Callout ── */}
      <Card
        sx={{
          p: 1.75,
          borderRadius: 4,
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 20, color: '#b45309', mt: 0.2 }} />
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#92400e' }}>
              Lithium-ion Protocol
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#b45309', mt: 0.2, lineHeight: 1.45 }}>
              Never puncture or crush swollen batteries. Pack separated items in anti-static or non-conductive bags prior to drop-off.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

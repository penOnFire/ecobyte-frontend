import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Greeting ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '1.625rem',
              color: '#292524',
              lineHeight: 1.15,
            }}
          >
            Hello, Alex
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 500,
              fontSize: '0.8125rem',
              color: '#78716c',
              mt: 0.35,
            }}
          >
            Circular lifecycle diagnostics &amp; recovery
          </Typography>
        </Box>
        <StatusBadge label="Hub Live" variant="live" />
      </Box>

      {/* ── 3-Column Stats Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', textAlign: 'center' }}>
          {/* Requests */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
              Requests
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#292524', my: 0.25, lineHeight: 1 }}>
              3
            </Typography>
            <StatusBadge label="Active" variant="active" size="sm" />
          </Box>

          {/* Assessed */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid #ede8e1', borderRight: '1px solid #ede8e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
              Assessed
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#292524', my: 0.25, lineHeight: 1 }}>
              12
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600 }}>
              Total items
            </Typography>
          </Box>

          {/* Reserved */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
              Reserved
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#292524', my: 0.25, lineHeight: 1 }}>
              1
            </Typography>
            <StatusBadge label="Pending" variant="pending" size="sm" />
          </Box>
        </Box>
      </Card>

      {/* ── Active Request Tracker Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  backgroundColor: '#4f5f4b',
                  color: '#ffffff',
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
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                    Active Request
                  </Typography>
                  <StatusBadge label="In Transit" variant="in-transit" size="sm" />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 500 }}>
                  Req #2041 • MacBook Pro 13″ &amp; 2 Li-ion
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => navigate('/requests')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#4f5f4b',
                cursor: 'pointer',
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.8125rem' }}>
                Details
              </Typography>
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          {/* Stepper */}
          <Box sx={{ my: 1.5 }}>
            <StepperTracker steps={TRACKER_STEPS} currentStep={3} />
          </Box>

          {/* Driver pill */}
          <Box
            sx={{
              backgroundColor: '#faf8f5',
              border: '1px solid #ede8e1',
              borderRadius: 3,
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 15, color: '#78716c' }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#292524', fontWeight: 600 }}>
                Today, 3:30 PM • Certified Logistics
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#4f5f4b', fontWeight: 700 }}>
              Driver assigned
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              color: '#292524',
              textTransform: 'uppercase',
            }}
          >
            Quick Actions
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
            Eco-Operations
          </Typography>
        </Box>

        <Grid container spacing={1.25}>
          {/* Scan Device */}
          <Grid size={{ xs: 6 }}>
            <Box
              onClick={() => navigate('/scan')}
              sx={{
                backgroundColor: '#4f5f4b',
                color: '#ffffff',
                borderRadius: 4,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                  Scan Device
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#e8f0e6', fontWeight: 500, mt: 0.25 }}>
                  AI diagnostic
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Reuse Hub */}
          <Grid size={{ xs: 6 }}>
            <Box
              onClick={() => navigate('/reuse')}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #ede8e1',
                borderRadius: 4,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  backgroundColor: '#ebf2eb',
                  color: '#4f5f4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RecyclingRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524', lineHeight: 1.2 }}>
                  Reuse Hub
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 500, mt: 0.25 }}>
                  Browse items
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Drop-offs */}
          <Grid size={{ xs: 6 }}>
            <Box
              onClick={() => navigate('/drop-offs')}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #ede8e1',
                borderRadius: 4,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  backgroundColor: '#faf8f5',
                  color: '#4f5f4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ede8e1',
                }}
              >
                <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524', lineHeight: 1.2 }}>
                  Drop-offs
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 500, mt: 0.25 }}>
                  4 nearby bins
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* My Requests */}
          <Grid size={{ xs: 6 }}>
            <Box
              onClick={() => navigate('/requests')}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #ede8e1',
                borderRadius: 4,
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  backgroundColor: '#faf8f5',
                  color: '#4f5f4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ede8e1',
                }}
              >
                <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524', lineHeight: 1.2 }}>
                  My Requests
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 500, mt: 0.25 }}>
                  3 ongoing
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

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
                color: '#292524',
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
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#4f5f4b',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Explore all
          </Typography>
        </Box>

        {/* Item 1: iPad 9th Gen */}
        <Card sx={{ p: 1.75, borderRadius: 4, mb: 1.25, border: '1px solid #ede8e1' }}>
          <Box sx={{ display: 'flex', gap: 1.75 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                backgroundColor: '#f4ede4',
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
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#292524' }}>
                  Grade A
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                    iPad 9th Gen 64GB
                  </Typography>
                  <StatusBadge label="Available" variant="available" size="sm" />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.2 }}>
                  Battery: 94% • Screen: Flawless
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                  📍 San Antonio Hub • 0.8 km
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#4f5f4b' }}>
                  Free Claim
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/reuse/ipad-9th')}
                  sx={{
                    borderRadius: 9999,
                    py: 0.4,
                    px: 1.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderColor: '#ddd8d0',
                  }}
                >
                  Reserve
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Item 2: Keychron K2 */}
        <Card sx={{ p: 1.75, borderRadius: 4, border: '1px solid #ede8e1' }}>
          <Box sx={{ display: 'flex', gap: 1.75 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                backgroundColor: '#f4ede4',
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
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.5625rem', color: '#292524' }}>
                  Restored
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                    Keychron K2 V2 Wireless
                  </Typography>
                  <StatusBadge label="Available" variant="available" size="sm" />
                </Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.2 }}>
                  Gateron Brown • New Li-ion Cell
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                  📍 Bel-Air Drop Site • 1.4 km
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#4f5f4b' }}>
                  Free Claim
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/reuse/keychron-k2')}
                  sx={{
                    borderRadius: 9999,
                    py: 0.4,
                    px: 1.75,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderColor: '#ddd8d0',
                  }}
                >
                  Reserve
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ── Lithium-ion Protocol Alert Card ── */}
      <Box
        sx={{
          borderRadius: 4,
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fde68a',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <WarningAmberRoundedIcon sx={{ color: '#d97706', fontSize: 22, mt: 0.15, flexShrink: 0 }} />
          <Box>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                color: '#78350f',
                mb: 0.35,
              }}
            >
              Lithium-ion Protocol
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.8125rem',
                color: '#92400e',
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              Never puncture or crush swollen batteries. Pack separated items in anti-static or non-conductive bags prior to drop-off.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

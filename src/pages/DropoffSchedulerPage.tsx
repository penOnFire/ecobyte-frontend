import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const DropoffSchedulerPage: FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(25)
  const [selectedWindow, setSelectedWindow] = useState('afternoon')
  const [selectedHub, setSelectedHub] = useState('pasig')

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
            Schedule &amp; Drop-off
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#78716c' }}>
            Select Date, Time &amp; Drop-off Site
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
          <TuneRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Official Intake Banner ── */}
      <Card sx={{ p: 1.75, borderRadius: 4, backgroundColor: '#ebf2eb', border: '1px solid #ceebc4' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                backgroundColor: '#384735',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#2d3e2c' }}>
                Official Drop-off Site Intake
              </Typography>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#384735' }}>
                Direct, certified e-waste processing
              </Typography>
            </Box>
          </Box>
          <StatusBadge label="Required" variant="grade" size="sm" />
        </Box>
      </Card>

      {/* ── Hazardous Alert Card ── */}
      <Card sx={{ p: 2, borderRadius: 4, border: '1.5px solid #fde68a', backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: '#fef3c7',
                color: '#b45309',
                px: 1,
                py: 0.25,
                borderRadius: 9999,
                mb: 0.75,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.625rem' }}>
                Hazardous Drop-off required
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: '#292524' }}>
              iPhone 11 Pro
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#dc2626', mt: 0.25 }}>
              ⚡ Swollen Battery / E-Waste Class III
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              backgroundColor: '#faf8f5',
              border: '1.5px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SmartphoneRoundedIcon sx={{ fontSize: 24, color: '#4f5f4b' }} />
          </Box>
        </Box>
      </Card>

      {/* ── Pick Date and Time ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              Pick a date and time
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
            October 2024
          </Typography>
        </Box>

        <Card sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
          {/* Calendar header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              October 2024
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: '#78716c' }}>
                <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#78716c' }}>
                <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Weekday headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1 }}>
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <Typography key={d} sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.6875rem', color: '#a8a29e' }}>
                {d}
              </Typography>
            ))}
          </Box>

          {/* Dates grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
            {/* Week 1 */}
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#d6cfc5' }}>30</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>1</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>2</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>3</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>4</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>5</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>6</Typography>

            {/* Week 4 active dates */}
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>21</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>22</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>23</Typography>
            <Typography sx={{ py: 0.75, fontSize: '0.75rem', color: '#a8a29e' }}>24</Typography>

            {/* 25 (Selected) */}
            <Box
              onClick={() => setSelectedDate(25)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: selectedDate === 25 ? '#4f5f4b' : '#ffffff',
                color: selectedDate === 25 ? '#ffffff' : '#292524',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                mx: 'auto',
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', lineHeight: 1 }}>
                25
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#38c194', mt: 0.2 }} />
            </Box>

            {/* 26 */}
            <Box
              onClick={() => setSelectedDate(26)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: selectedDate === 26 ? '2px solid #4f5f4b' : '1px solid #ede8e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                mx: 'auto',
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', lineHeight: 1 }}>
                26
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#4f5f4b', mt: 0.2 }} />
            </Box>

            {/* 27 */}
            <Box
              onClick={() => setSelectedDate(27)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: selectedDate === 27 ? '2px solid #4f5f4b' : '1px solid #ede8e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                mx: 'auto',
              }}
            >
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', lineHeight: 1 }}>
                27
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#4f5f4b', mt: 0.2 }} />
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4f5f4b' }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
                  Selected
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#38c194' }} />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c' }}>
                  Available
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#292524' }}>
              Selected: Oct {selectedDate}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* ── Pick Time Window ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              Pick Time Window
            </Typography>
          </Box>
          <StatusBadge label="Eco Slots Guaranteed" variant="available" size="sm" />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            {
              id: 'morning',
              title: 'Morning',
              hours: '09:00 AM - 11:00 AM',
              icon: <WbSunnyOutlinedIcon sx={{ fontSize: 18 }} />,
            },
            {
              id: 'afternoon',
              title: 'Afternoon',
              hours: '01:00 PM - 03:00 PM',
              icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
            },
            {
              id: 'evening',
              title: 'Evening',
              hours: '04:00 PM - 06:00 PM',
              icon: <NightsStayOutlinedIcon sx={{ fontSize: 18 }} />,
            },
          ].map((item) => {
            const isSelected = selectedWindow === item.id
            return (
              <Card
                key={item.id}
                onClick={() => setSelectedWindow(item.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 3.5,
                  border: isSelected ? '2px solid #4f5f4b' : '1px solid #ede8e1',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ color: isSelected ? '#4f5f4b' : '#78716c' }}>{item.icon}</Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                    {item.hours}
                  </Typography>
                </Box>
                <StatusBadge
                  label={isSelected ? 'Selected' : 'Available'}
                  variant={isSelected ? 'active' : 'muted'}
                  size="sm"
                />
              </Card>
            )
          })}
        </Box>
      </Box>

      {/* ── Nearby Drop-off Sites ── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              Nearby Drop-off Sites
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
            2 Active Nearby
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Site 1: Pasig Green Hub */}
          <Card
            onClick={() => setSelectedHub('pasig')}
            sx={{
              p: 1.75,
              borderRadius: 3.5,
              border: selectedHub === 'pasig' ? '2px solid #4f5f4b' : '1px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
                  Pasig Green Hub
                </Typography>
                <StatusBadge label="Instant Eco-Credit" variant="available" size="sm" />
              </Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.25 }}>
                📍 1.2 km away • Open 8:00 AM - 6:00 PM
              </Typography>
            </Box>
            {selectedHub === 'pasig' ? (
              <RadioButtonCheckedRoundedIcon sx={{ color: '#4f5f4b' }} />
            ) : (
              <RadioButtonUncheckedRoundedIcon sx={{ color: '#d6cfc5' }} />
            )}
          </Card>

          {/* Site 2: BGC Tech Exchange */}
          <Card
            onClick={() => setSelectedHub('bgc')}
            sx={{
              p: 1.75,
              borderRadius: 3.5,
              border: selectedHub === 'bgc' ? '2px solid #4f5f4b' : '1px solid #ede8e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
                  BGC Tech Exchange Kiosk
                </Typography>
                <StatusBadge label="Contactless Box" variant="muted" size="sm" />
              </Box>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.25 }}>
                📍 3.5 km away • Open 24/7 Smart Locker
              </Typography>
            </Box>
            {selectedHub === 'bgc' ? (
              <RadioButtonCheckedRoundedIcon sx={{ color: '#4f5f4b' }} />
            ) : (
              <RadioButtonUncheckedRoundedIcon sx={{ color: '#d6cfc5' }} />
            )}
          </Card>
        </Box>
      </Box>

      {/* ── Confirm Schedule CTA Button ── */}
      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/requests')}
          startIcon={<CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            py: 1.6,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          Confirm Schedule
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1 }}>
          <VerifiedUserOutlinedIcon sx={{ fontSize: 14, color: '#78716c' }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              color: '#78716c',
              textAlign: 'center',
            }}
          >
            Official e-waste intake &amp; verified recycling certificate issued upon drop-off
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}


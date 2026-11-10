import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Typography,
} from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import dropoffMapSvg from '@/assets/ui/dropoff_map.svg'

const FILTERS = ['All Sites (3)', 'Open Now', 'Staffed', '24/7 Smart Bin']

const DROP_SITES = [
  {
    id: 'san-antonio-hub',
    name: 'San Antonio Eco-Hub',
    status: 'Open Now',
    address: 'Bgy. San Antonio, Pasig City',
    distance: '0.8 km',
    hours: '8:00 AM - 5:00 PM',
    type: 'Staffed & Smart Bin',
  },
  {
    id: 'ortigas-exchange',
    name: 'Ortigas Green Exchange',
    status: 'Open Now',
    address: 'Emerald Ave, Ortigas Center',
    distance: '1.6 km',
    hours: '24/7 Smart Bin Access',
    type: '24/7 Smart Bin',
  },
  {
    id: 'uptown-eco',
    name: 'Uptown Eco Station',
    status: 'Open Now',
    address: 'Uptown Bonifacio, Taguig City',
    distance: '2.4 km',
    hours: '9:00 AM - 8:00 PM',
    type: 'Staffed Collection Hub',
  },
]

export const DropOffFinderPage: FC = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All Sites (3)')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#292524' }}>
            Drop-off Finder
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#78716c', mt: 0.25 }}>
            Find accredited e-waste sites
          </Typography>
        </Box>
        <StatusBadge label="GPS Active" variant="live" size="sm" />
      </Box>

      {/* ── Location Bar ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 3.5,
          p: 1.5,
          border: '1px solid #ede8e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MyLocationRoundedIcon sx={{ color: '#4f5f4b', fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#78716c', fontWeight: 600, display: 'block' }}>
              Searching near:
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
              Pasig &amp; Makati Area
            </Typography>
          </Box>
        </Box>
        <Button size="small" sx={{ color: '#4f5f4b', fontWeight: 700, fontSize: '0.75rem' }}>
          Change
        </Button>
      </Box>

      {/* ── Vector Map Card ── */}
      <Card
        sx={{
          height: 200,
          borderRadius: 4,
          backgroundColor: '#e2eae0',
          border: '1.5px solid #c8d8c5',
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
          src={dropoffMapSvg}
          alt="Drop-off Map"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
          <Chip
            size="small"
            label="2 Active Hubs in Metro"
            sx={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#4f5f4b', fontWeight: 700, fontSize: '0.6875rem' }}
          />
        </Box>

        {/* Center pin indicator */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#4f5f4b',
              color: '#ffffff',
              px: 1.5,
              py: 0.6,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              boxShadow: '0 4px 12px rgba(79,95,75,0.3)',
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
              San Antonio Eco-Hub (0.8 km)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, position: 'relative' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#384735', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.85)', px: 0.75, py: 0.25, borderRadius: 1.5 }}>
            Tap pin to view intake hours
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/dropoff-schedule')}
            sx={{
              backgroundColor: '#4f5f4b',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              borderRadius: 9999,
              px: 1.25,
              py: 0.35,
              '&:hover': { backgroundColor: '#384735' },
            }}
          >
            Schedule Intake
          </Button>
        </Box>
      </Card>

      {/* ── Filter Chips ── */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.25 }}>
        {FILTERS.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            onClick={() => setActiveFilter(filter)}
            sx={{
              fontWeight: 700,
              fontSize: '0.8125rem',
              backgroundColor: activeFilter === filter ? '#4f5f4b' : '#ffffff',
              color: activeFilter === filter ? '#ffffff' : '#78716c',
              border: activeFilter === filter ? 'none' : '1px solid #ede8e1',
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>

      {/* ── Sites List ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#292524' }}>
            Accredited Drop Sites
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
            3 Locations Found
          </Typography>
        </Box>

        {DROP_SITES.map((site) => (
          <Card key={site.id} sx={{ p: 2, borderRadius: 4, border: '1px solid #ede8e1' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#292524' }}>
                  {site.name}
                </Typography>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', mt: 0.25 }}>
                  {site.address}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#78716c' }} />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c' }}>
                    {site.hours}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <StatusBadge label={site.status} variant="available" size="sm" />
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", color: '#4f5f4b', fontWeight: 700, fontSize: '0.8125rem', mt: 0.75 }}>
                  {site.distance}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.75, pt: 1.25, borderTop: '1px solid #f4ede4' }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#78716c', fontWeight: 600 }}>
                {site.type}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/dropoff-schedule')}
                  startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderColor: '#ede8e1',
                    color: '#292524',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                  }}
                >
                  Schedule
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<NavigationRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    backgroundColor: '#4f5f4b',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                  }}
                >
                  Directions
                </Button>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

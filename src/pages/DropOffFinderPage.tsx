import { useEffect, useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
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
import { dropoffsApi } from '@/lib/api'
import type { DropOffSite } from '@/types'

const FILTERS = ['All Sites (9)', 'Open Now', 'Staffed', '24/7 Smart Bin']

/*
 * ==============================================================================
 * STATIC MOCK DATA (COMMENTED FOR BACKEND TESTING)
 * ==============================================================================
 * Original static mockup data for drop-off sites has been replaced with live
 * data fetched from GET /api/v1/dropoffs/sites (Barangay Commonwealth, 9 Areas).
 *
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
 * ==============================================================================
 */

export const DropOffFinderPage: FC = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All Sites (9)')
  const [sites, setSites] = useState<DropOffSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    dropoffsApi
      .getSites()
      .then((data) => {
        if (isMounted) {
          setSites(data || [])
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load drop-off sites from backend:', err)
        if (isMounted) {
          setFetchError('Backend not reachable or still initializing database.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredSites = sites.filter((site) => {
    const isStaffed = site.type?.toLowerCase().includes('staffed')
    const isSmartBin = site.type?.toLowerCase().includes('smart bin')
    if (activeFilter === 'Open Now') return site.isOpen
    if (activeFilter === 'Staffed') return isStaffed
    if (activeFilter === '24/7 Smart Bin') return isSmartBin
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.625rem', color: '#0f172a' }}>
            Drop-off Finder
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
            Find accredited e-waste sites (Barangay Commonwealth)
          </Typography>
        </Box>
        <StatusBadge label="GPS Active" variant="electric" size="sm" />
      </Box>

      {/* ── Location Bar ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 1.5,
          p: 1.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: '#abf06b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MyLocationRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Searching near:
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
              Commonwealth, Quezon City (9 Areas)
            </Typography>
          </Box>
        </Box>
        <Button size="small" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.75rem' }}>
          Change
        </Button>
      </Box>

      {/* ── Vector Map Card ── */}
      <Card
        sx={{
          height: 200,
          borderRadius: 2,
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1.75,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
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
            opacity: 0.85,
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
          <Chip
            size="small"
            label={`${sites.length || 9} Active Hubs in Commonwealth`}
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              color: '#abf06b',
              fontWeight: 700,
              fontSize: '0.6875rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
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
              backgroundColor: '#0f172a',
              color: '#abf06b',
              border: '1px solid #334155',
              px: 1.75,
              py: 0.6,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.75rem' }}>
              {sites[0]?.name || 'Area 1 Eco-Hub (Brgy Hall Complex)'} (0.8 km)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, position: 'relative' }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              color: '#ffffff',
              fontWeight: 700,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              px: 1,
              py: 0.35,
              borderRadius: 1.5,
              backdropFilter: 'blur(4px)',
            }}
          >
            Tap pin to view intake hours
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/schedule-dropoff')}
            sx={{
              backgroundColor: '#abf06b',
              color: '#0f172a',
              fontSize: '0.6875rem',
              fontWeight: 800,
              borderRadius: 9999,
              px: 1.5,
              py: 0.5,
              '&:hover': { backgroundColor: '#bef264' },
            }}
          >
            Schedule Intake
          </Button>
        </Box>
      </Card>

      {/* ── Filter Chips ── */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.25 }}>
        {FILTERS.map((filter) => {
          const isSel = activeFilter === filter
          return (
            <Chip
              key={filter}
              label={filter}
              onClick={() => setActiveFilter(filter)}
              sx={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                backgroundColor: isSel ? '#0f172a' : '#ffffff',
                color: isSel ? '#ffffff' : '#0f172a',
                border: isSel ? '1px solid #0f172a' : '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: isSel ? '0 1px 3px rgba(15,23,42,0.15)' : 'none',
                '&:hover': {
                  backgroundColor: isSel ? '#1e293b' : '#f8fafc',
                },
              }}
            />
          )
        })}
      </Box>

      {/* ── Sites List ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
            Accredited Drop Sites (Commonwealth)
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
            {isLoading ? 'Loading...' : `${filteredSites.length} Locations Found`}
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: '#0f172a' }} />
          </Box>
        ) : fetchError && sites.length === 0 ? (
          <Card sx={{ p: 2.5, textAlign: 'center', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#b91c1c' }}>
              {fetchError}
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
              Make sure the backend is running on http://localhost:3000
            </Typography>
          </Card>
        ) : (
          filteredSites.map((site) => (
            <Card key={site.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    {site.name}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                    {site.address}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#64748b' }} />
                    <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
                      {site.hours}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <StatusBadge label={site.isOpen ? 'Open Now' : 'Closed'} variant={site.isOpen ? 'electric' : 'muted'} size="sm" />
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", color: '#0f172a', fontWeight: 800, fontSize: '0.8125rem', mt: 0.75 }}>
                    {site.distance || `${site.distanceKm || 0.8} km`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.75, pt: 1.25, borderTop: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {site.type}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/schedule-dropoff')}
                    startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderColor: '#e2e8f0',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5,
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: '#cbd5e1',
                      },
                    }}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<NavigationRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5,
                      boxShadow: '0 1px 3px rgba(15,23,42,0.15)',
                      '&:hover': { backgroundColor: '#1e293b' },
                    }}
                  >
                    Directions
                  </Button>
                </Box>
              </Box>
            </Card>
          ))
        )}
      </Box>
    </Box>
  )
}

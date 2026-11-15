import { useEffect, useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import dropoffMapSvg from '@/assets/ui/dropoff_map.svg'
import { dropoffsApi } from '@/lib/api'
import type { DropOffSite } from '@/types'

const FILTERS = ['All Sites (9)', 'Open Now', 'Staffed', '24/7 Smart Bin']

const COMMONWEALTH_AREAS = [
  'Commonwealth, Quezon City (9 Areas)',
  'Area 1 (Brgy Hall Complex / Katuparan)',
  'Area 2 (Lupang Pangako / Riverside)',
  'Area 3 (Payatas Border / Market)',
  'Area 4 (Don Fabian / Litex)',
  'Area 5 (Commonwealth Market / MRT-7)',
  'Area 6 (Pilot Area / Eco-Depot)',
  'Area 7 (Kasunduan / Batasan Road)',
  'Area 8 (Holy Spirit / Commonwealth Ave)',
  'Area 9 (Veterans Village / Sandigan)',
]

const PIN_COORDINATES = [
  { top: '48%', left: '50%' },
  { top: '30%', left: '72%' },
  { top: '65%', left: '26%' },
  { top: '74%', left: '62%' },
]

const COMMONWEALTH_FALLBACK_SITES: DropOffSite[] = [
  {
    id: 'commonwealth-mrf-area1',
    name: 'Area 1 Eco-Hub (Brgy Hall Complex)',
    status: 'Open Now',
    isOpen: true,
    address: 'Commonwealth Ave. cor. Katuparan St.',
    distance: '0.8 km',
    distanceKm: 0.8,
    hours: '8:00 AM - 5:00 PM',
    type: 'Staffed & Smart Bin',
  },
  {
    id: 'litex-commercial-hub',
    name: 'Litex Market Green Exchange',
    status: 'Open Now',
    isOpen: true,
    address: 'Litex Road cor. Commonwealth Ave.',
    distance: '1.2 km',
    distanceKm: 1.2,
    hours: '24/7 Smart Bin Access',
    type: '24/7 Smart Bin',
  },
  {
    id: 'holy-spirit-drop',
    name: 'Area 3 Holy Spirit Drop Point',
    status: 'Open Now',
    isOpen: true,
    address: 'Don Fabian St., Commonwealth',
    distance: '1.8 km',
    distanceKm: 1.8,
    hours: '8:00 AM - 4:00 PM',
    type: 'Staffed Only',
  },
  {
    id: 'batasan-border-depot',
    name: 'Area 7 Batasan Border E-Depot',
    status: 'Open Now',
    isOpen: true,
    address: 'Batasan-San Mateo Road, Commonwealth',
    distance: '2.4 km',
    distanceKm: 2.4,
    hours: '24/7 Smart Bin Access',
    type: '24/7 Smart Bin',
  },
]

export const DropOffFinderPage: FC = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All Sites (9)')
  const [sites, setSites] = useState<DropOffSite[]>(COMMONWEALTH_FALLBACK_SITES)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSiteId, setSelectedSiteId] = useState<string>('commonwealth-mrf-area1')
  const [selectedArea, setSelectedArea] = useState('Commonwealth, Quezon City (9 Areas)')
  const [areaDialogOpen, setAreaDialogOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    dropoffsApi
      .getSites()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setSites(data)
          setSelectedSiteId(data[0].id)
        }
      })
      .catch((err) => {
        console.warn('Backend drop-off API unreachable, using Commonwealth cluster sites:', err)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleGetDirections = (site: DropOffSite) => {
    const destinationQuery = encodeURIComponent(
      `${site.name}, ${site.address}, Barangay Commonwealth, Quezon City`
    )
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  const handlePinClick = (siteId: string) => {
    setSelectedSiteId(siteId)
    const element = document.getElementById(`site-card-${siteId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

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
              {selectedArea}
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          onClick={() => setAreaDialogOpen(true)}
          sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
        >
          Change
        </Button>
      </Box>

      {/* ── Vector Map Card ── */}
      <Card
        sx={{
          height: 220,
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

        {/* Interactive map pins */}
        {sites.slice(0, 4).map((site, index) => {
          const coord = PIN_COORDINATES[index] || { top: '50%', left: '50%' }
          const isSelected = selectedSiteId === site.id
          return (
            <Box
              key={site.id}
              onClick={() => handlePinClick(site.id)}
              sx={{
                position: 'absolute',
                top: coord.top,
                left: coord.left,
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translate(-50%, -60%) scale(1.15)',
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: isSelected ? '#abf06b' : '#0f172a',
                  color: isSelected ? '#0f172a' : '#abf06b',
                  borderRadius: '50%',
                  width: isSelected ? 32 : 26,
                  height: isSelected ? 32 : 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected
                    ? '0 0 0 4px rgba(171, 240, 107, 0.35), 0 4px 10px rgba(0,0,0,0.5)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
                  border: isSelected ? '2px solid #ffffff' : '1px solid #abf06b',
                }}
              >
                <PlaceRoundedIcon sx={{ fontSize: isSelected ? 18 : 15 }} />
              </Box>
              {isSelected && (
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.625rem',
                    color: '#0f172a',
                    backgroundColor: '#abf06b',
                    px: 0.75,
                    py: 0.2,
                    borderRadius: 9999,
                    mt: 0.25,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  {site.name.split(' ')[0]}
                </Typography>
              )}
            </Box>
          )
        })}

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

        {/* Selected Hub Summary Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            position: 'relative',
          }}
        >
          {(() => {
            const currentSelected = sites.find((s) => s.id === selectedSiteId) || sites[0]
            return (
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
                  {currentSelected?.name || 'Area 1 Eco-Hub (Brgy Hall Complex)'} ({currentSelected?.distance || `${currentSelected?.distanceKm || 0.8} km`})
                </Typography>
              </Box>
            )
          })()}
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
            Tap pin to select hub
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
        ) : (
          filteredSites.map((site) => (
            <Card
              key={site.id}
              id={`site-card-${site.id}`}
              sx={{
                p: 2,
                borderRadius: 2,
                border: selectedSiteId === site.id ? '2px solid #0f172a' : '1px solid #e2e8f0',
                backgroundColor: selectedSiteId === site.id ? '#f8fafc' : '#ffffff',
                boxShadow: selectedSiteId === site.id ? '0 4px 12px rgba(15,23,42,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
              }}
            >
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
                      textTransform: 'none',
                      fontWeight: 700,
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
                    onClick={() => handleGetDirections(site)}
                    startIcon={<NavigationRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
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

      {/* ── Area Selection Dialog ── */}
      <Dialog
        open={areaDialogOpen}
        onClose={() => setAreaDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2.5,
              p: 1,
              fontFamily: "'Quicksand', sans-serif",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.125rem' }}>
            Select Commonwealth Area
          </Typography>
          <IconButton size="small" onClick={() => setAreaDialogOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 1 }}>
          <RadioGroup
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {COMMONWEALTH_AREAS.map((area) => (
              <FormControlLabel
                key={area}
                value={area}
                control={<Radio sx={{ color: '#0f172a', '&.Mui-checked': { color: '#0f172a' } }} />}
                label={
                  <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: selectedArea === area ? 700 : 500, fontSize: '0.875rem' }}>
                    {area}
                  </Typography>
                }
                sx={{ py: 0.5 }}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setAreaDialogOpen(false)}
            sx={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            Confirm Area
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

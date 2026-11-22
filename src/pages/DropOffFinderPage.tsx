import { useEffect, useState, type FC } from 'react'
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
  Snackbar,
  Alert,
} from '@mui/material'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { dropoffsApi, getCachedUser } from '@/lib/api'
import type { DropOffSite, User } from '@/types'
import { CommonwealthLeafletMap } from '@/components/map/CommonwealthLeafletMap'
import {
  COMMONWEALTH_FALLBACK_SITES,
  findPartitionForSite,
  resolveSiteBaseNumber,
} from '@/components/map/commonwealthData'

const FILTERS = ['All Sites (9)', 'Open Now', 'Staffed', '24/7 Smart Bin']

const COMMONWEALTH_AREAS = [
  'Commonwealth, Quezon City (All 9 Bases)',
  'Base 1 (Brgy. Hall Complex)',
  'Base 2 (Martan St.)',
  'Base 3 (Don Fabian)',
  'Base 4 (Katuparan)',
  'Base 5 (Riverside)',
  'Base 6 (Kristong Hari)',
  'Base 7 (Upper Kamias)',
  'Base 8 (Pilot Area)',
  'Base 9 (Lupang Pangako)',
]

// Haversine distance in km
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

export const DropOffFinderPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentUser] = useState<User | null>(() => getCachedUser())
  const userBaseNum = (() => {
    if (!currentUser) return 1
    if (currentUser.barangay?.id) {
      const idNum = parseInt(currentUser.barangay.id, 10)
      if (!isNaN(idNum) && idNum >= 1 && idNum <= 9) return idNum
      const match = /(?:base|area)[\s_-]*(\d+)/i.exec(currentUser.barangay.id)
      if (match) return parseInt(match[1], 10)
    }
    if (currentUser.barangay?.name) {
      const match = /(?:base|area)[\s_-]*(\d+)/i.exec(currentUser.barangay.name)
      if (match) return parseInt(match[1], 10)
    }
    return 1
  })()
  const initialBaseSite =
    COMMONWEALTH_FALLBACK_SITES.find(
      (s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum
    ) || COMMONWEALTH_FALLBACK_SITES[0]

  const [activeFilter, setActiveFilter] = useState('All Sites (9)')
  const [sites, setSites] = useState<DropOffSite[]>(COMMONWEALTH_FALLBACK_SITES)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialBaseSite.id)
  const [selectedArea, setSelectedArea] = useState('Commonwealth, Quezon City (All 9 Bases)')
  const [areaDialogOpen, setAreaDialogOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationToast, setLocationToast] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    dropoffsApi
      .getSites()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          // Place each site at its real Barangay Commonwealth base partition coordinates
          const enriched = data.map((d, i) => {
            const partition = findPartitionForSite(d.id, d.name, i)
            const fallback =
              COMMONWEALTH_FALLBACK_SITES[(partition?.num ?? i + 1) - 1] ||
              COMMONWEALTH_FALLBACK_SITES[i % COMMONWEALTH_FALLBACK_SITES.length]
            return {
              ...d,
              coordinates: partition
                ? { lat: partition.center[0], lng: partition.center[1] }
                : d.coordinates || fallback.coordinates,
            }
          })
          setSites(enriched)
          const match = enriched.find((s) => resolveSiteBaseNumber(s.id, s.name) === userBaseNum)
          setSelectedSiteId(match ? match.id : enriched[0].id)
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
  }, [userBaseNum])

  const handleGetDirections = (site: DropOffSite) => {
    let destinationQuery = encodeURIComponent(
      `${site.name}, ${site.address}, Barangay Commonwealth, Quezon City`
    )
    if (site.coordinates) {
      destinationQuery = `${site.coordinates.lat},${site.coordinates.lng}`
    }
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  const handlePinClick = (siteId: string) => {
    setSelectedSiteId(siteId)
  }

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationToast('Geolocation is not supported by your browser')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setIsLocating(false)
        setLocationToast('GPS synced! Commonwealth drop-off bases sorted by proximity.')

        // Re-calculate distances based on user's real GPS
        setSites((prevSites) => {
          const updated = prevSites.map((s) => {
            if (s.coordinates) {
              const dist = calculateHaversineDistanceKm(
                latitude,
                longitude,
                s.coordinates.lat,
                s.coordinates.lng
              )
              return {
                ...s,
                distanceKm: dist,
                distance: `${dist} km`,
              }
            }
            return s
          })
          return updated.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
        })
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setIsLocating(false)
        // Default to Commonwealth Barangay Hall coordinates if user denies permission
        setUserLocation({ lat: 14.7044, lng: 121.0965 })
        setLocationToast('Centered on Commonwealth Barangay Hall Complex')
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea)
    setAreaDialogOpen(false)

    const targetNum = resolveSiteBaseNumber(undefined, newArea)
    if (targetNum !== null) {
      const matched = sites.find((s, idx) => findPartitionForSite(s.id, s.name, idx)?.num === targetNum)
      if (matched) {
        handlePinClick(matched.id)
        return
      }
    }

    const fallbackSite = COMMONWEALTH_FALLBACK_SITES.find((_, idx) => idx + 1 === targetNum)
    if (fallbackSite) {
      handlePinClick(fallbackSite.id)
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <IconButton
            size="small"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
            aria-label="Back"
            sx={{
              width: 38,
              height: 38,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              flexShrink: 0,
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '1.375rem', color: '#0f172a', lineHeight: 1.2 }}>
              Drop-off Finder
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>
              Accredited e-waste sites (Barangay Commonwealth)
            </Typography>
          </Box>
        </Box>
        <Box onClick={handleLocateUser} sx={{ cursor: 'pointer', flexShrink: 0 }}>
          <StatusBadge
            label={userLocation ? 'GPS Synced' : isLocating ? 'Locating...' : 'Sync GPS'}
            variant={userLocation ? 'electric' : 'muted'}
            size="sm"
          />
        </Box>
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
            onClick={handleLocateUser}
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: userLocation ? '#38bdf8' : '#abf06b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'scale(1.05)' },
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
          Change Area
        </Button>
      </Box>

      {/* ── Live Interactive Leaflet Map for Commonwealth ── */}
      <CommonwealthLeafletMap
        sites={filteredSites}
        selectedSiteId={selectedSiteId}
        onSelectSite={handlePinClick}
        onGetDirections={handleGetDirections}
        userLocation={userLocation}
        onLocateUser={handleLocateUser}
        height={360}
      />

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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.25 }}>
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
            Accredited Drop Sites (Commonwealth)
          </Typography>
          <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b' }}>
            {isLoading ? 'Loading...' : `${filteredSites.length} Locations Found`}
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: '#0f172a' }} />
          </Box>
        ) : (
          filteredSites.map((site, index) => (
            <Card
              key={site.id}
              id={`site-card-${site.id}`}
              onClick={() => setSelectedSiteId(site.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: selectedSiteId === site.id ? '2px solid #0f172a' : '1px solid #e2e8f0',
                backgroundColor: selectedSiteId === site.id ? '#f8fafc' : '#ffffff',
                boxShadow: selectedSiteId === site.id ? '0 4px 12px rgba(15,23,42,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        {site.name}
                      </Typography>
                      {resolveSiteBaseNumber(site.id, site.name) === userBaseNum && (
                        <Chip
                          size="small"
                          label={`🌟 Nearest to Base ${userBaseNum}`}
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                          }}
                        />
                      )}
                      {userLocation && index === 0 && (
                        <Chip
                          size="small"
                          label="Nearest"
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                          }}
                        />
                      )}
                    </Box>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      const nextParams = new URLSearchParams(searchParams)
                      nextParams.set('siteId', site.id)
                      navigate(`/dropoff-schedule?${nextParams.toString()}`)
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGetDirections(site)
                    }}
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
        maxWidth="sm"
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
            onChange={(e) => handleAreaChange(e.target.value)}
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
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── GPS Toast ── */}
      <Snackbar
        open={Boolean(locationToast)}
        autoHideDuration={3500}
        onClose={() => setLocationToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
          {locationToast}
        </Alert>
      </Snackbar>
    </Box>
  )
}

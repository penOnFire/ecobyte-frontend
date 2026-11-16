import { useEffect, useRef, useState, type FC } from 'react'
import L from 'leaflet'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { useNavigate } from 'react-router-dom'
import type { DropOffSite } from '@/types'
import {
  COMMONWEALTH_BOUNDARY,
  COMMONWEALTH_PARTITIONS,
  WORLD_MASK_RING,
  type CommonwealthPartition,
} from './commonwealthData'

// 100% Free Public Tile Servers (Zero API Key Required)
const TILE_URLS = {
  streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
}

const BASE_SHORT_NAMES: Record<number, string> = {
  1: 'Brgy Hall',
  2: 'Pangako',
  3: 'Payatas',
  4: 'Litex',
  5: 'Market',
  6: 'Pilot',
  7: 'Batasan',
  8: 'Don Fabian',
  9: 'Veterans',
}

interface CommonwealthLeafletMapProps {
  sites: DropOffSite[]
  selectedSiteId: string
  onSelectSite: (siteId: string) => void
  onGetDirections: (site: DropOffSite) => void
  userLocation?: { lat: number; lng: number } | null
  onLocateUser?: () => void
  height?: number | string
}

export const CommonwealthLeafletMap: FC<CommonwealthLeafletMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  onGetDirections,
  userLocation,
  onLocateUser,
  height = 360,
}) => {
  const navigate = useNavigate()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const polygonsRef = useRef<Record<string, L.Polygon>>({})
  const labelMarkersRef = useRef<Record<string, L.Marker>>({})
  const userMarkerRef = useRef<L.Marker | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  const [mapStyle, setMapStyle] = useState<'streets' | 'topo'>('streets')
  const [hoveredPartitionId, setHoveredPartitionId] = useState<string | null>(null)

  const onSelectSiteRef = useRef(onSelectSite)
  const selectedSiteIdRef = useRef(selectedSiteId)

  useEffect(() => {
    onSelectSiteRef.current = onSelectSite
    selectedSiteIdRef.current = selectedSiteId
  }, [onSelectSite, selectedSiteId])

  const selectedSite = sites.find((s) => s.id === selectedSiteId)
  const selectedPartition = COMMONWEALTH_PARTITIONS.find((p) => p.id === selectedSiteId)

  // Reset strictly to Barangay Commonwealth boundary bounds
  const fitCommonwealthBounds = () => {
    const map = mapInstanceRef.current
    if (!map) return
    const bounds = L.latLngBounds(COMMONWEALTH_BOUNDARY)
    map.fitBounds(bounds, { padding: [16, 16], maxZoom: 16 })
  }

  // Initialize Map: Lightweight, 60fps Mobile-Optimized, Zero CPU overhead on drag
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const bounds = L.latLngBounds(COMMONWEALTH_BOUNDARY)
    // Wide SVG renderer (10x viewport coverage) ensures the solid mask never clips when dragging
    const wideMaskRenderer = L.svg({ padding: 10.0 })

    const map = L.map(mapContainerRef.current, {
      center: bounds.getCenter(),
      zoom: 15,
      minZoom: 14,
      maxZoom: 18,
      maxBounds: bounds.pad(0.02), // Strictly contained to Commonwealth territory
      maxBoundsViscosity: 1.0,     // Prevents dragging outside
      inertia: true,
      inertiaDeceleration: 3500,
      zoomControl: false,
      attributionControl: false,
    })

    // Base Street Layer (OpenStreetMap)
    const tileLayer = L.tileLayer(TILE_URLS.streets, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    tileLayerRef.current = tileLayer

    // Solid Inverted World Mask (100% Opaque matching page background #faf8f5)
    // Rendered via GPU-synchronized SVG overlay inside mapPane.
    // Zero outside tiles visible, zero edge leakage, zero main-thread JS calculations on drag.
    L.polygon([WORLD_MASK_RING, COMMONWEALTH_BOUNDARY], {
      fillColor: '#faf8f5',
      fillOpacity: 1.0,
      stroke: false,
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    // Render the 9 Base Partitions (Clean lines strictly within boundary — Zero green highlight)
    COMMONWEALTH_PARTITIONS.forEach((partition: CommonwealthPartition) => {
      const isSelected = partition.id === selectedSiteIdRef.current

      const poly = L.polygon(partition.polygon, {
        fill: false, // NO green or colored wash over the map
        color: isSelected ? '#0f172a' : '#475569',
        weight: isSelected ? 2.5 : 1.5,
        dashArray: isSelected ? undefined : '5, 5',
        interactive: true,
        renderer: wideMaskRenderer,
      }).addTo(map)

      // Hover behavior
      poly.on('mouseover', () => {
        setHoveredPartitionId(partition.id)
        if (partition.id !== selectedSiteIdRef.current) {
          poly.setStyle({
            color: '#0f172a',
            weight: 2.25,
          })
        }
      })

      poly.on('mouseout', () => {
        setHoveredPartitionId(null)
        if (partition.id !== selectedSiteIdRef.current) {
          poly.setStyle({
            color: '#475569',
            weight: 1.5,
          })
        }
      })

      // Click partition to select base
      poly.on('click', () => {
        onSelectSiteRef.current(partition.id)
      })

      // Clean Tooltip
      poly.bindTooltip(
        `<div style="font-family:'Quicksand',sans-serif;font-weight:700;font-size:12px;padding:2px 4px;">
           <span style="color:#0f172a;">Base ${partition.num} Partition</span>
           <div style="font-size:10px;font-weight:600;color:#475569;">${partition.name}</div>
         </div>`,
        { direction: 'center', sticky: true, className: 'partition-clean-tooltip' }
      )

      polygonsRef.current[partition.id] = poly

      // Partition number badge at centroid
      const labelIcon = L.divIcon({
        className: 'partition-number-badge',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            background: #0f172a;
            color: #ffffff;
            border: 2px solid #ffffff;
            border-radius: 6px;
            font-family: 'Quicksand', sans-serif;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            pointer-events: none;
          ">
            ${partition.num}
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      const labelMarker = L.marker(partition.center, {
        icon: labelIcon,
        interactive: false,
      }).addTo(map)

      labelMarkersRef.current[partition.id] = labelMarker
    })

    // Accurate, Clean & Bold Outer Outline of Barangay Commonwealth
    L.polygon(COMMONWEALTH_BOUNDARY, {
      color: '#0f172a',
      weight: 3.5,
      opacity: 1.0,
      fill: false,
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    mapInstanceRef.current = map

    // Fit Commonwealth boundary cleanly
    map.fitBounds(bounds, { padding: [16, 16] })

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
      polygonsRef.current = {}
      labelMarkersRef.current = {}
    }
  }, [])

  // Sync Partition Styling when Selection Changes (Lines Only — No Green Fill)
  useEffect(() => {
    COMMONWEALTH_PARTITIONS.forEach((partition: CommonwealthPartition) => {
      const poly = polygonsRef.current[partition.id]
      if (!poly) return

      const isSelected = partition.id === selectedSiteId
      poly.setStyle({
        fill: false, // Never apply green highlight
        color: isSelected ? '#0f172a' : '#475569',
        weight: isSelected ? 2.5 : 1.5,
        dashArray: isSelected ? undefined : '5, 5',
      })

      if (isSelected) {
        poly.bringToFront()
      }
    })
  }, [selectedSiteId])

  // Sync Base Markers for Sites
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    sites.forEach((site) => {
      if (!site.coordinates) return

      const isSelected = site.id === selectedSiteId
      const partition = COMMONWEALTH_PARTITIONS.find((p) => p.id === site.id)
      const baseNum = partition?.num ?? 1

      const markerHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isSelected
              ? `<div style="
                  position: absolute;
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: rgba(15, 23, 42, 0.25);
                  animation: pulseBaseRing 1.8s infinite;
                "></div>`
              : ''
          }
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            background-color: ${isSelected ? '#0f172a' : '#ffffff'};
            border: 2.5px solid #0f172a;
            color: ${isSelected ? '#abf06b' : '#0f172a'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            font-family: 'Quicksand', sans-serif;
            font-weight: 800;
            font-size: ${isSelected ? '14px' : '12px'};
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          ">
            ${baseNum}
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-base-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })

      const marker = L.marker([site.coordinates.lat, site.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1500 : 200,
      }).addTo(map)

      marker.on('click', () => {
        onSelectSite(site.id)
      })

      markersRef.current[site.id] = marker
    })
  }, [sites, selectedSiteId, onSelectSite])

  // Center & Fly to Selected Site
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedSiteId) return

    const site = sites.find((s) => s.id === selectedSiteId)
    if (site?.coordinates) {
      map.flyTo([site.coordinates.lat, site.coordinates.lng], 16, {
        duration: 0.8,
        easeLinearity: 0.25,
      })
    }
  }, [selectedSiteId, sites])

  // Sync User GPS Pin
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    if (userLocation) {
      const userHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(2, 132, 199, 0.35); animation: pulseBaseRing 2s infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>
        </div>
      `
      const icon = L.divIcon({
        html: userHtml,
        className: 'user-location-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon,
        zIndexOffset: 3000,
      }).addTo(map)
    }
  }, [userLocation])

  // Toggle Map Style
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return
    tileLayerRef.current.setUrl(TILE_URLS[mapStyle])
  }, [mapStyle])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      <style>{`
        @keyframes pulseBaseRing {
          0% { transform: scale(0.7); opacity: 0.8; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .partition-clean-tooltip {
          background-color: rgba(255, 255, 255, 0.98) !important;
          border: 1.5px solid #0f172a !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          color: #0f172a !important;
        }
      `}</style>

      {/* ── 1. Top Control Bar (OUTSIDE the map) ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          px: 0.5,
        }}
      >
        {/* Left: Title & Active Base Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              backgroundColor: '#ffffff',
              border: '1.5px solid #0f172a',
              borderRadius: 2,
              px: 1.25,
              py: 0.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 6px rgba(22,163,74,0.6)',
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: '0.8125rem',
                color: '#0f172a',
              }}
            >
              Barangay Commonwealth • 9 Bases
            </Typography>
          </Box>

          {selectedPartition && (
            <Chip
              size="small"
              label={`Base ${selectedPartition.num} Active`}
              sx={{
                height: 24,
                fontSize: '0.6875rem',
                fontWeight: 800,
                backgroundColor: '#0f172a',
                color: '#abf06b',
                fontFamily: "'Quicksand', sans-serif",
              }}
            />
          )}
        </Box>

        {/* Right: Map Control Buttons (All outside the map) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Tooltip title="Recenter Commonwealth View" arrow>
            <IconButton
              size="small"
              onClick={fitCommonwealthBounds}
              aria-label="Fit Commonwealth boundary"
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                '&:hover': { backgroundColor: '#f8fafc' },
              }}
            >
              <CropFreeRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {onLocateUser && (
            <Tooltip title="Locate Me in Commonwealth" arrow>
              <IconButton
                size="small"
                onClick={onLocateUser}
                aria-label="Locate me"
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#ffffff',
                  color: userLocation ? '#0284c7' : '#0f172a',
                  border: '1.5px solid #0f172a',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  '&:hover': { backgroundColor: '#f8fafc' },
                }}
              >
                <MyLocationRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={mapStyle === 'streets' ? 'Switch to Topographic' : 'Switch to Street Map'} arrow>
            <IconButton
              size="small"
              onClick={() => setMapStyle((prev) => (prev === 'streets' ? 'topo' : 'streets'))}
              aria-label="Toggle map view"
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                '&:hover': { backgroundColor: '#f8fafc' },
              }}
            >
              <LayersOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            aria-label="Zoom in"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #0f172a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <ZoomInRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            aria-label="Zoom out"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #0f172a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <ZoomOutRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── 2. The Map Frame: 60fps Native Leaflet, Zero Outside Leak, Perfectly Framed ── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height,
          borderRadius: 3,
          overflow: 'hidden',
          border: '2px solid #0f172a',
          backgroundColor: '#faf8f5',
          boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
        }}
      >
        <Box
          ref={mapContainerRef}
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#faf8f5',
          }}
        />
      </Box>

      {/* ── 3. Bottom Partition Selector (Non-scrollable, all 9 choices visible at once) ── */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 2.5,
          border: '1.5px solid #0f172a',
          p: { xs: 1, sm: 1.25 },
          boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {/* Header row: title and selected partition name */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.25 }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Base Partitions (All 9 Areas):
          </Typography>
          <Typography
            noWrap
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: selectedPartition ? '#166534' : '#64748b',
              maxWidth: { xs: '55%', sm: '70%' },
            }}
          >
            {selectedPartition ? `Active: Base ${selectedPartition.num} • ${selectedPartition.name}` : 'Tap a base to inspect'}
          </Typography>
        </Box>

        {/* 9-Column Choice Grid: All 9 choices fit simultaneously with ZERO horizontal scroll */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: { xs: 0.5, sm: 0.75 },
            width: '100%',
          }}
        >
          {COMMONWEALTH_PARTITIONS.map((partition) => {
            const isSelected = partition.id === selectedSiteId
            const isHovered = partition.id === hoveredPartitionId
            const shortName = BASE_SHORT_NAMES[partition.num] || `Base ${partition.num}`

            return (
              <Tooltip
                key={partition.id}
                title={`Base ${partition.num}: ${partition.name}`}
                arrow
                placement="top"
              >
                <Box
                  onClick={() => onSelectSite(partition.id)}
                  onMouseEnter={() => setHoveredPartitionId(partition.id)}
                  onMouseLeave={() => setHoveredPartitionId(null)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: { xs: 0.65, sm: 0.85 },
                    px: 0.25,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#0f172a' : isHovered ? '#f1f5f9' : '#ffffff',
                    color: isSelected ? '#abf06b' : '#0f172a',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(15,23,42,0.2)' : 'none',
                    '&:hover': {
                      borderColor: '#0f172a',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: { xs: '0.5625rem', sm: '0.625rem' },
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      lineHeight: 1,
                      opacity: isSelected ? 0.9 : 0.6,
                      mb: 0.25,
                    }}
                  >
                    Base
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 800,
                      lineHeight: 1.1,
                      color: isSelected ? '#abf06b' : '#0f172a',
                    }}
                  >
                    {partition.num}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.5625rem',
                      fontWeight: 600,
                      lineHeight: 1,
                      mt: 0.35,
                      color: isSelected ? '#ffffff' : '#64748b',
                      maxWidth: '100%',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {shortName}
                  </Typography>
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      </Box>

      {/* ── 4. Selected Base HUD Card (OUTSIDE the map) ── */}
      {selectedSite && (
        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #0f172a',
            borderRadius: 2,
            p: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Chip
                size="small"
                label={`Base ${selectedPartition?.num ?? 1}`}
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  backgroundColor: '#0f172a',
                  color: '#abf06b',
                  fontFamily: "'Quicksand', sans-serif",
                }}
              />
              <Typography
                noWrap
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.8125rem',
                  color: '#0f172a',
                }}
              >
                {selectedSite.name}
              </Typography>
            </Box>
            <Typography
              noWrap
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.6875rem',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              {selectedSite.address} • {selectedSite.hours}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<NavigationRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={() => onGetDirections(selectedSite)}
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                py: 0.4,
                px: 1,
                borderRadius: 1.75,
                textTransform: 'none',
                borderColor: '#0f172a',
                color: '#0f172a',
                '&:hover': { backgroundColor: '#f8fafc', borderColor: '#0f172a' },
              }}
            >
              Directions
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate(`/schedule-dropoff?siteId=${selectedSite.id}`)}
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                py: 0.4,
                px: 1,
                borderRadius: 1.75,
                textTransform: 'none',
                backgroundColor: '#0f172a',
                color: '#abf06b',
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              Schedule
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

import { useEffect, useRef, useState, type FC } from 'react'
import L from 'leaflet'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import type { DropOffSite } from '@/types'

// Barangay Commonwealth Center & Geofencing Bounds
const COMMONWEALTH_CENTER: [number, number] = [14.7042, 121.0963]
const COMMONWEALTH_BOUNDS: [[number, number], [number, number]] = [
  [14.685, 121.075], // South-West
  [14.725, 121.12], // North-East
]

// 100% Free, Public Tile Servers (ZERO API Key Required)
const TILE_URLS = {
  streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
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
  height = 240,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [mapStyle, setMapStyle] = useState<'streets' | 'topo'>('streets')
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Prevent re-initialization if map already exists
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: COMMONWEALTH_CENTER,
      zoom: 14,
      minZoom: 13,
      maxZoom: 18,
      maxBounds: COMMONWEALTH_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
    })

    // Official OpenStreetMap Tile Layer (No API Key Required)
    const tileLayer = L.tileLayer(TILE_URLS.streets, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    tileLayerRef.current = tileLayer
    mapInstanceRef.current = map

    // Invalidate size once rendered inside flex layout
    setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Toggle map tile style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return
    tileLayerRef.current.setUrl(TILE_URLS[mapStyle])
  }, [mapStyle])

  // Sync Markers for Sites
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    sites.forEach((site) => {
      const lat = site.coordinates?.lat || COMMONWEALTH_CENTER[0]
      const lng = site.coordinates?.lng || COMMONWEALTH_CENTER[1]
      const isSelected = site.id === selectedSiteId

      // Custom HTML Marker using DivIcon
      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50%;
            background-color: ${isSelected ? '#abf06b' : '#0f172a'};
            border: ${isSelected ? '3px solid #0f172a' : '2px solid #abf06b'};
            box-shadow: ${isSelected ? '0 0 0 5px rgba(171, 240, 107, 0.4), 0 4px 12px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.3)'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${isSelected ? '#0f172a' : '#abf06b'};
            transition: all 0.25s ease;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          ${
            isSelected
              ? `<div style="
                  background: #0f172a;
                  color: #abf06b;
                  font-family: 'Quicksand', sans-serif;
                  font-size: 10px;
                  font-weight: 800;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  margin-top: 3px;
                  white-space: nowrap;
                  border: 1px solid #334155;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">${site.name.split(' ')[0]} ${site.name.split(' ')[1] || ''}</div>`
              : ''
          }
        </div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'ecobyte-leaflet-marker',
        iconSize: [32, 44],
        iconAnchor: [16, isSelected ? 40 : 26],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

      // Popup Content
      const popupHtml = `
        <div style="font-family: 'Quicksand', sans-serif; padding: 2px; min-width: 170px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${site.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${site.address}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: ${site.isOpen ? '#16a34a' : '#64748b'};">
              ${site.isOpen ? '● Open Now' : '○ Closed'}
            </span>
            <span style="font-size: 11px; font-weight: 800; color: #0f172a;">
              ${site.distance || `${site.distanceKm || 0.8} km`}
            </span>
          </div>
          <div style="font-size: 10px; color: #475569; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">
            🕒 ${site.hours}
          </div>
          <button id="leaflet-btn-dir-${site.id}" style="
            width: 100%;
            background: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            font-family: 'Quicksand', sans-serif;
          ">
            Get Directions ↗
          </button>
        </div>
      `

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'ecobyte-map-popup',
      })

      marker.on('popupopen', () => {
        const btn = document.getElementById(`leaflet-btn-dir-${site.id}`)
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation()
            onGetDirections(site)
          }
        }
      })

      marker.on('click', () => {
        onSelectSite(site.id)
      })

      markersRef.current[site.id] = marker
    })
  }, [sites, selectedSiteId, onSelectSite, onGetDirections])

  // Fly to selected site when selectedSiteId changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const targetSite = sites.find((s) => s.id === selectedSiteId)
    if (targetSite?.coordinates) {
      map.flyTo([targetSite.coordinates.lat, targetSite.coordinates.lng], 15.5, {
        duration: 0.9,
      })

      const marker = markersRef.current[targetSite.id]
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup()
      }
    }
  }, [selectedSiteId, sites])

  // User GPS Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                background-color: rgba(56, 189, 248, 0.35);
                animation: pulse-ring 1.8s infinite;
              "></div>
              <div style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background-color: #0284c7;
                border: 3px solid #ffffff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>
            </div>
          `,
          className: 'ecobyte-user-location-pin',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        }).addTo(map)
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }
  }, [userLocation])

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #1e293b',
        boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
        backgroundColor: '#0f172a',
      }}
    >
      {/* Map Container */}
      <Box
        ref={mapContainerRef}
        sx={{
          width: '100%',
          height: '100%',
          '& .leaflet-popup-content-wrapper': {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
            padding: '2px',
          },
          '& .leaflet-popup-tip': {
            backgroundColor: '#ffffff',
          },
        }}
      />

      {/* Top Banner Tag */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(6px)',
          color: '#abf06b',
          px: 1.25,
          py: 0.4,
          borderRadius: 9999,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#abf06b' }} />
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 800,
            fontSize: '0.6875rem',
            color: '#abf06b',
          }}
        >
          Barangay Commonwealth Geofence (9 Hubs)
        </Typography>
      </Box>

      {/* Floating Controls (Top Right) */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {onLocateUser && (
          <Tooltip title="Locate Me in Commonwealth" placement="left">
            <IconButton
              size="small"
              onClick={onLocateUser}
              aria-label="Locate me"
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(4px)',
                color: userLocation ? '#38bdf8' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                '&:hover': { backgroundColor: '#0f172a' },
              }}
            >
              <MyLocationRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={mapStyle === 'streets' ? 'Switch to Topo Map' : 'Switch to Street Map'} placement="left">
          <IconButton
            size="small"
            onClick={() => setMapStyle((prev) => (prev === 'streets' ? 'topo' : 'streets'))}
            aria-label="Toggle map view"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              '&:hover': { backgroundColor: '#0f172a' },
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            '&:hover': { backgroundColor: '#0f172a' },
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            '&:hover': { backgroundColor: '#0f172a' },
          }}
        >
          <ZoomOutRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Bottom Hint */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          px: 1,
          py: 0.3,
          borderRadius: 1.5,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#ffffff',
            fontWeight: 700,
          }}
        >
          Tap any hub pin for hours &amp; directions
        </Typography>
      </Box>
    </Box>
  )
}

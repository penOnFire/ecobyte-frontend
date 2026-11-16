import { useEffect, useRef, useState, type FC } from 'react'
import L from 'leaflet'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded'
import type { DropOffSite } from '@/types'

// Precise boundary perimeter for Barangay Commonwealth, Quezon City
const COMMONWEALTH_POLYGON: [number, number][] = [
  [14.719, 121.104], // Litex Junction / North Apex
  [14.7175, 121.1085], // Payatas North Boundary
  [14.7145, 121.1115], // Payatas Road East
  [14.71, 121.113], // Area 3 Green Station Border
  [14.705, 121.112], // Kasunduan East
  [14.6995, 121.108], // Batasan-San Mateo Road
  [14.6965, 121.105], // Area 7 Depot Border
  [14.6935, 121.0995], // Batasan Hills Boundary
  [14.6925, 121.0945], // Area 9 Veterans Village (South)
  [14.6918, 121.0875], // Area 8 Holy Spirit (SW)
  [14.6945, 121.0845], // Don Fabian / Commonwealth Ave
  [14.699, 121.0865], // Commonwealth Ave
  [14.704, 121.0895], // Area 5 Market / MRT-7 Base
  [14.709, 121.0935], // Area 2 Lupang Pangako Entrance
  [14.7145, 121.0985], // Commonwealth Ave Upper
  [14.718, 121.102], // Litex Road Approach
  [14.719, 121.104], // Loop closure
]

// Web Mercator full world boundary ring for inverted masking
const WORLD_MASK_RING: [number, number][] = [
  [-85.0511, -180],
  [-85.0511, 180],
  [85.0511, 180],
  [85.0511, -180],
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
  height = 270,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [mapStyle, setMapStyle] = useState<'streets' | 'topo'>('streets')
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Fit strictly to Barangay Commonwealth bounds
  const fitCommonwealthBounds = () => {
    const map = mapInstanceRef.current
    if (!map) return
    const bounds = L.latLngBounds(COMMONWEALTH_POLYGON)
    map.fitBounds(bounds, { padding: [16, 16], maxZoom: 15.5 })
  }

  // Initialize Map with Boundary Isolation & Masking
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const bounds = L.latLngBounds(COMMONWEALTH_POLYGON)

    // Wide-padded SVG renderer ensures the mask polygon never clips when dragging
    const wideMaskRenderer = L.svg({ padding: 3.0 })

    const map = L.map(mapContainerRef.current, {
      center: bounds.getCenter(),
      zoom: 14.5,
      minZoom: 13.5,
      maxZoom: 18,
      maxBounds: bounds.pad(0.06), // Keep navigation strictly locked to Commonwealth
      maxBoundsViscosity: 0.85, // Smooth repulsion without jerky rubber-banding
      inertia: true,
      inertiaDeceleration: 3000,
      zoomControl: false,
      attributionControl: false,
    })

    // Base Street Layer
    const tileLayer = L.tileLayer(TILE_URLS.streets, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    tileLayerRef.current = tileLayer

    // Inverted Mask: light, clean, airy off-white/pale slate veil (#f1f5f9)
    // Masks everything outside Commonwealth without looking heavy or cramped
    L.polygon([WORLD_MASK_RING, COMMONWEALTH_POLYGON], {
      fillColor: '#f1f5f9',
      fillOpacity: 0.9,
      stroke: false,
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    // Clean, crisp boundary stroke for Barangay Commonwealth
    L.polygon(COMMONWEALTH_POLYGON, {
      color: '#0f172a',
      weight: 2.5,
      opacity: 0.8,
      fill: false,
      dashArray: '6, 6',
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    mapInstanceRef.current = map

    // Ensure initial fit
    map.fitBounds(bounds, { padding: [16, 16] })

    // Invalidate size once rendered inside flex layout
    setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(bounds, { padding: [16, 16] })
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
      const lat = site.coordinates?.lat || 14.7044
      const lng = site.coordinates?.lng || 121.0965
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
            box-shadow: ${isSelected ? '0 0 0 5px rgba(171, 240, 107, 0.45), 0 4px 12px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.25)'};
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
        <div style="font-family: 'Quicksand', sans-serif; padding: 2px; min-width: 175px;">
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
      map.flyTo([targetSite.coordinates.lat, targetSite.coordinates.lng], 16, {
        duration: 0.85,
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
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        backgroundColor: '#f1f5f9',
      }}
    >
      {/* Map Container */}
      <Box
        ref={mapContainerRef}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f1f5f9',
          '& .leaflet-popup-content-wrapper': {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
            padding: '2px',
          },
          '& .leaflet-popup-tip': {
            backgroundColor: '#ffffff',
          },
        }}
      />

      {/* Top Banner Tag: Clean White Badge with Green Dot */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          backgroundColor: '#ffffff',
          color: '#0f172a',
          px: 1.25,
          py: 0.45,
          borderRadius: 9999,
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            boxShadow: '0 0 6px rgba(22,163,74,0.5)',
          }}
        />
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 800,
            fontSize: '0.6875rem',
            color: '#0f172a',
            letterSpacing: '0.02em',
          }}
        >
          Barangay Commonwealth (9 Active Bases)
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
        <Tooltip title="Reset to Full Commonwealth Scope" placement="left">
          <IconButton
            size="small"
            onClick={fitCommonwealthBounds}
            aria-label="Fit Commonwealth boundary"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <CropFreeRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {onLocateUser && (
          <Tooltip title="Locate Me in Commonwealth" placement="left">
            <IconButton
              size="small"
              onClick={onLocateUser}
              aria-label="Locate me"
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#ffffff',
                color: userLocation ? '#0284c7' : '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                '&:hover': { backgroundColor: '#f8fafc' },
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
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
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
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
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
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            '&:hover': { backgroundColor: '#f8fafc' },
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
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(4px)',
          px: 1.1,
          py: 0.35,
          borderRadius: 1.5,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6875rem',
            color: '#475569',
            fontWeight: 700,
          }}
        >
          Barangay Commonwealth drop-off zone
        </Typography>
      </Box>
    </Box>
  )
}

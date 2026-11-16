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
import LayersClearRoundedIcon from '@mui/icons-material/LayersClearRounded'
import { useNavigate } from 'react-router-dom'
import type { DropOffSite } from '@/types'

// Complete boundary perimeter for Barangay Commonwealth, Quezon City
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

interface BasePartition {
  id: string
  siteId: string
  sectorNum: number
  name: string
  shortLabel: string
  polygon: [number, number][]
  center: [number, number]
  color: string
  borderColor: string
}

// 9 Base Catchment Partitions within Barangay Commonwealth
const BASE_PARTITIONS: BasePartition[] = [
  {
    id: 'partition-4',
    siteId: 'litex-commercial-hub',
    sectorNum: 4,
    name: 'Litex Market Green Exchange',
    shortLabel: 'Base 4: Litex',
    polygon: [
      [14.719, 121.104],
      [14.7175, 121.1085],
      [14.714, 121.1055],
      [14.7135, 121.1005],
      [14.7145, 121.0985],
      [14.718, 121.102],
    ],
    center: [14.7152, 121.103],
    color: '#15803d',
    borderColor: '#14532d',
  },
  {
    id: 'partition-3',
    siteId: 'area3-payatas-border',
    sectorNum: 3,
    name: 'Area 3 Payatas Border Green Station',
    shortLabel: 'Base 3: Payatas',
    polygon: [
      [14.7175, 121.1085],
      [14.7145, 121.1115],
      [14.71, 121.113],
      [14.708, 121.107],
      [14.711, 121.103],
      [14.714, 121.1055],
    ],
    center: [14.712, 121.108],
    color: '#16a34a',
    borderColor: '#166534',
  },
  {
    id: 'partition-2',
    siteId: 'area2-lupang-pangako',
    sectorNum: 2,
    name: 'Area 2 Lupang Pangako E-Collection',
    shortLabel: 'Base 2: Pangako',
    polygon: [
      [14.7145, 121.0985],
      [14.7135, 121.1005],
      [14.7075, 121.096],
      [14.7055, 121.093],
      [14.709, 121.0935],
    ],
    center: [14.7085, 121.091],
    color: '#4ade80',
    borderColor: '#15803d',
  },
  {
    id: 'partition-6',
    siteId: 'area6-pilot-depot',
    sectorNum: 6,
    name: 'Area 6 Pilot Area Community E-Depot',
    shortLabel: 'Base 6: Pilot Area',
    polygon: [
      [14.711, 121.103],
      [14.708, 121.107],
      [14.705, 121.112],
      [14.702, 121.108],
      [14.703, 121.102],
      [14.708, 121.1015],
    ],
    center: [14.706, 121.098],
    color: '#059669',
    borderColor: '#065f46',
  },
  {
    id: 'partition-1',
    siteId: 'commonwealth-mrf-area1',
    sectorNum: 1,
    name: 'Area 1 Eco-Hub (Brgy Hall Complex)',
    shortLabel: 'Base 1: Brgy Hall',
    polygon: [
      [14.7075, 121.096],
      [14.708, 121.1015],
      [14.703, 121.102],
      [14.7015, 121.096],
      [14.7055, 121.093],
    ],
    center: [14.7044, 121.0965],
    color: '#22c55e',
    borderColor: '#15803d',
  },
  {
    id: 'partition-5',
    siteId: 'area5-market-mrt7',
    sectorNum: 5,
    name: 'Area 5 Commonwealth Market / MRT-7',
    shortLabel: 'Base 5: Market / MRT-7',
    polygon: [
      [14.7055, 121.093],
      [14.7015, 121.096],
      [14.6985, 121.092],
      [14.6975, 121.088],
      [14.699, 121.0865],
      [14.704, 121.0895],
      [14.709, 121.0935],
    ],
    center: [14.701, 121.089],
    color: '#10b981',
    borderColor: '#047857',
  },
  {
    id: 'partition-7',
    siteId: 'batasan-border-depot',
    sectorNum: 7,
    name: 'Area 7 Batasan Border E-Depot',
    shortLabel: 'Base 7: Batasan',
    polygon: [
      [14.702, 121.108],
      [14.6995, 121.108],
      [14.6965, 121.105],
      [14.6955, 121.1005],
      [14.6985, 121.098],
      [14.7015, 121.0995],
      [14.703, 121.102],
    ],
    center: [14.6975, 121.1042],
    color: '#166534',
    borderColor: '#052e16',
  },
  {
    id: 'partition-9',
    siteId: 'area9-veterans-village',
    sectorNum: 9,
    name: 'Area 9 Veterans Village Hub',
    shortLabel: 'Base 9: Veterans',
    polygon: [
      [14.7015, 121.096],
      [14.6985, 121.098],
      [14.6955, 121.1005],
      [14.6935, 121.0995],
      [14.6925, 121.0945],
      [14.6925, 121.0895],
      [14.695, 121.09],
      [14.6985, 121.092],
    ],
    center: [14.694, 121.092],
    color: '#14532d',
    borderColor: '#052e16',
  },
  {
    id: 'partition-8',
    siteId: 'area8-holy-spirit',
    sectorNum: 8,
    name: 'Area 8 Holy Spirit Junction Bin',
    shortLabel: 'Base 8: Holy Spirit',
    polygon: [
      [14.699, 121.0865],
      [14.6975, 121.088],
      [14.695, 121.09],
      [14.6925, 121.0895],
      [14.6918, 121.0875],
      [14.6945, 121.0845],
    ],
    center: [14.695, 121.086],
    color: '#86efac',
    borderColor: '#22c55e',
  },
]

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
  height = 420,
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
  const [showPartitions, setShowPartitions] = useState(true)
  const [hoveredPartitionId, setHoveredPartitionId] = useState<string | null>(null)

  const selectedSite = sites.find((s) => s.id === selectedSiteId)
  const selectedPartition = BASE_PARTITIONS.find((p) => p.siteId === selectedSiteId)

  const onSelectSiteRef = useRef(onSelectSite)
  const selectedSiteIdRef = useRef(selectedSiteId)

  useEffect(() => {
    onSelectSiteRef.current = onSelectSite
    selectedSiteIdRef.current = selectedSiteId
  }, [onSelectSite, selectedSiteId])

  // Reset to full Barangay Commonwealth view
  const fitCommonwealthBounds = () => {
    const map = mapInstanceRef.current
    if (!map) return
    const bounds = L.latLngBounds(COMMONWEALTH_POLYGON)
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15.5 })
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const bounds = L.latLngBounds(COMMONWEALTH_POLYGON)
    const wideMaskRenderer = L.svg({ padding: 3.0 })

    const map = L.map(mapContainerRef.current, {
      center: bounds.getCenter(),
      zoom: 14.5,
      minZoom: 13,
      maxZoom: 18,
      maxBounds: bounds.pad(0.08),
      maxBoundsViscosity: 0.85,
      inertia: true,
      inertiaDeceleration: 3000,
      zoomControl: false,
      attributionControl: false,
    })

    // Standard Street Tile Layer (100% Free OpenStreetMap)
    const tileLayer = L.tileLayer(TILE_URLS.streets, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    tileLayerRef.current = tileLayer

    // Light airy mask outside Barangay Commonwealth
    L.polygon([WORLD_MASK_RING, COMMONWEALTH_POLYGON], {
      fillColor: '#f8fafc',
      fillOpacity: 0.88,
      stroke: false,
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    // Outer perimeter boundary of Barangay Commonwealth
    L.polygon(COMMONWEALTH_POLYGON, {
      color: '#0f172a',
      weight: 2.5,
      opacity: 0.9,
      fill: false,
      dashArray: '5, 5',
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    // Render 9 Base Catchment Partitions
    BASE_PARTITIONS.forEach((partition) => {
      const isSelected = partition.siteId === selectedSiteIdRef.current

      const poly = L.polygon(partition.polygon, {
        fillColor: partition.color,
        fillOpacity: isSelected ? 0.48 : 0.28,
        color: isSelected ? '#0f172a' : partition.borderColor,
        weight: isSelected ? 3.5 : 1.75,
        interactive: true,
        renderer: wideMaskRenderer,
      }).addTo(map)

      // Hover / Click behavior
      poly.on('mouseover', () => {
        setHoveredPartitionId(partition.id)
        if (partition.siteId !== selectedSiteIdRef.current) {
          poly.setStyle({
            fillOpacity: 0.42,
            weight: 2.75,
          })
        }
      })

      poly.on('mouseout', () => {
        setHoveredPartitionId(null)
        if (partition.siteId !== selectedSiteIdRef.current) {
          poly.setStyle({
            fillOpacity: 0.28,
            weight: 1.75,
          })
        }
      })

      poly.on('click', () => {
        onSelectSiteRef.current(partition.siteId)
      })

      // Informative Tooltip
      poly.bindTooltip(
        `<div style="font-family:'Quicksand',sans-serif;font-weight:700;font-size:12px;padding:2px 4px;">
           <span style="color:#0f172a;">${partition.shortLabel}</span>
           <div style="font-size:10px;font-weight:600;color:#475569;">${partition.name}</div>
         </div>`,
        { direction: 'center', sticky: true, className: 'partition-popup-tooltip' }
      )

      polygonsRef.current[partition.id] = poly

      // Partition Sector Badge Label at centroid (matches reference image numbering)
      const labelIcon = L.divIcon({
        className: 'partition-label-icon',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            background: #ffffff;
            color: #0f172a;
            border: 1.5px solid ${partition.borderColor};
            border-radius: 6px;
            font-family: 'Quicksand', sans-serif;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 2px 4px rgba(0,0,0,0.18);
            pointer-events: none;
          ">
            ${partition.sectorNum}
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

    mapInstanceRef.current = map

    // Fit on mount
    map.fitBounds(bounds, { padding: [24, 24] })

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
      polygonsRef.current = {}
      labelMarkersRef.current = {}
    }
  }, [])

  // Sync Partition Styling when Selection Changes
  useEffect(() => {
    BASE_PARTITIONS.forEach((partition) => {
      const poly = polygonsRef.current[partition.id]
      if (!poly) return

      const isSelected = partition.siteId === selectedSiteId
      poly.setStyle({
        fillColor: partition.color,
        fillOpacity: isSelected ? 0.48 : 0.28,
        color: isSelected ? '#0f172a' : partition.borderColor,
        weight: isSelected ? 3.5 : 1.75,
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

    // Clean up old markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    sites.forEach((site) => {
      if (!site.coordinates) return

      const isSelected = site.id === selectedSiteId
      const partition = BASE_PARTITIONS.find((p) => p.siteId === site.id)
      const sectorNum = partition?.sectorNum ?? 1
      const pinColor = partition?.color ?? '#16a34a'

      const markerHtml = `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isSelected
              ? `<div style="
                  position: absolute;
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: rgba(22, 163, 74, 0.35);
                  animation: pulseRing 1.8s infinite cubic-bezier(0.4, 0, 0.6, 1);
                "></div>`
              : ''
          }
          <div style="
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 50%;
            background: ${isSelected ? '#0f172a' : '#ffffff'};
            border: 2.5px solid ${isSelected ? '#22c55e' : pinColor};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.22);
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
          ">
            <span style="font-family: 'Quicksand', sans-serif; font-weight: 800; font-size: ${isSelected ? '12px' : '11px'};">
              ${sectorNum}
            </span>
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })

      const marker = L.marker([site.coordinates.lat, site.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(map)

      marker.on('click', () => {
        onSelectSite(site.id)
      })

      markersRef.current[site.id] = marker
    })
  }, [sites, selectedSiteId, onSelectSite])

  // Center/Fly to Selected Site
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedSiteId) return

    const site = sites.find((s) => s.id === selectedSiteId)
    if (site?.coordinates) {
      map.flyTo([site.coordinates.lat, site.coordinates.lng], 15.5, {
        duration: 0.8,
        easeLinearity: 0.25,
      })
    }
  }, [selectedSiteId, sites])

  // Sync User GPS Marker
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
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(2, 132, 199, 0.35); animation: pulseRing 2s infinite;"></div>
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
        zIndexOffset: 2000,
      }).addTo(map)
    }
  }, [userLocation])

  // Toggle Map Style
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return
    tileLayerRef.current.setUrl(TILE_URLS[mapStyle])
  }, [mapStyle])

  // Toggle Partitions Visibility
  useEffect(() => {
    Object.values(polygonsRef.current).forEach((poly) => {
      poly.setStyle({ opacity: showPartitions ? 1 : 0, fillOpacity: showPartitions ? undefined : 0 })
    })
    Object.values(labelMarkersRef.current).forEach((marker) => {
      if (mapInstanceRef.current) {
        if (showPartitions) {
          marker.addTo(mapInstanceRef.current)
        } else {
          marker.remove()
        }
      }
    })
  }, [showPartitions])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 3.5,
        overflow: 'hidden',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        backgroundColor: '#f8fafc',
      }}
    >
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.7); opacity: 0.8; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .partition-popup-tooltip {
          background-color: rgba(255, 255, 255, 0.96) !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
          color: #0f172a !important;
        }
        .partition-popup-tooltip::before {
          border-top-color: rgba(255, 255, 255, 0.96) !important;
        }
      `}</style>

      {/* ── Leaflet DOM Container ── */}
      <Box
        ref={mapContainerRef}
        sx={{
          width: '100%',
          height: '100%',
          '& .leaflet-tile': {
            filter: 'contrast(1.03) saturate(1.08)',
          },
        }}
      />

      {/* ── Floating Header: Territory & Sector Badge ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          color: '#0f172a',
          px: 1.5,
          py: 0.6,
          borderRadius: 2.5,
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            boxShadow: '0 0 8px rgba(22,163,74,0.7)',
          }}
        />
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 800,
            fontSize: '0.75rem',
            color: '#0f172a',
            letterSpacing: '0.01em',
          }}
        >
          Barangay Commonwealth • 9 Base Partitions
        </Typography>
        {selectedPartition && (
          <Chip
            size="small"
            label={`Sector ${selectedPartition.sectorNum}`}
            sx={{
              height: 20,
              fontSize: '0.625rem',
              fontWeight: 800,
              backgroundColor: '#dcfce7',
              color: '#166534',
              fontFamily: "'Quicksand', sans-serif",
            }}
          />
        )}
      </Box>

      {/* ── Floating Controls (Top Right) ── */}
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
        <Tooltip title="Reset to Commonwealth Overview" placement="left">
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

        <Tooltip title={showPartitions ? 'Hide Partition Boundaries' : 'Show Partition Boundaries'} placement="left">
          <IconButton
            size="small"
            onClick={() => setShowPartitions((prev) => !prev)}
            aria-label="Toggle partitions"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: showPartitions ? '#dcfce7' : '#ffffff',
              color: showPartitions ? '#166534' : '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              '&:hover': { backgroundColor: '#f0fdf4' },
            }}
          >
            {showPartitions ? <LayersOutlinedIcon sx={{ fontSize: 16 }} /> : <LayersClearRoundedIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>

        <Tooltip title={mapStyle === 'streets' ? 'Switch to Topographic' : 'Switch to Street Map'} placement="left">
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

      {/* ── Bottom Partition Legend (Choropleth Bar, Reference Style) ── */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          pointerEvents: 'none',
        }}
      >
        {/* Selected Base HUD Card */}
        {selectedSite && (
          <Box
            sx={{
              pointerEvents: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid #e2e8f0',
              borderRadius: 2.5,
              p: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              gap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <Chip
                  size="small"
                  label={`Base ${selectedPartition?.sectorNum ?? 1}`}
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    backgroundColor: selectedPartition?.color ?? '#16a34a',
                    color: '#ffffff',
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
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' },
                }}
              >
                Directions
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate(`/book-dropoff?siteId=${selectedSite.id}`)}
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
                Book
              </Button>
            </Box>
          </Box>
        )}

        {/* Choropleth Partition Strip */}
        <Box
          sx={{
            pointerEvents: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            py: 0.6,
            px: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.5,
            overflowX: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.625rem',
              fontWeight: 800,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              mr: 0.5,
            }}
          >
            Base Partitions:
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {BASE_PARTITIONS.map((partition) => {
              const isSelected = partition.siteId === selectedSiteId
              const isHovered = partition.id === hoveredPartitionId
              return (
                <Tooltip key={partition.id} title={`${partition.shortLabel} — ${partition.name}`} arrow>
                  <Box
                    onClick={() => onSelectSite(partition.siteId)}
                    onMouseEnter={() => setHoveredPartitionId(partition.id)}
                    onMouseLeave={() => setHoveredPartitionId(null)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.4,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1.25,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f1f5f9' : isHovered ? '#f8fafc' : '#ffffff',
                      transition: 'all 0.15s ease',
                      '&:hover': { transform: 'translateY(-1px)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '2px',
                        backgroundColor: partition.color,
                        border: `1px solid ${partition.borderColor}`,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.625rem',
                        fontWeight: isSelected ? 800 : 700,
                        color: isSelected ? '#0f172a' : '#475569',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {partition.sectorNum}
                    </Typography>
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

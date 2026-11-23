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
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded'
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { DropOffSite } from '@/types'
import { prefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import {
  COMMONWEALTH_BOUNDARY,
  COMMONWEALTH_PARTITIONS,
  COMMONWEALTH_FALLBACK_SITES,
  WORLD_MASK_RING,
  findPartitionForSite,
  resolveSiteBaseNumber,
  type CommonwealthPartition,
} from './commonwealthData'
import {
  fetchCommonwealthRoute,
  type DirectionRoute,
  COMMONWEALTH_ROUTE_WAYPOINTS,
} from '@/lib/directionsService'

// 100% Free Public Tile Servers (Zero API Key Required)
const TILE_URLS = {
  streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
}

export interface CommonwealthLeafletMapProps {
  sites: DropOffSite[]
  selectedSiteId: string
  onSelectSite: (siteId: string) => void
  onGetDirections?: (site: DropOffSite) => void
  activeRouteSite?: DropOffSite | null
  onClearRoute?: () => void
  userLocation?: { lat: number; lng: number } | null
  onLocateUser?: () => void
  height?: number | string
  hideScheduleButton?: boolean
}

export const CommonwealthLeafletMap: FC<CommonwealthLeafletMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  activeRouteSite,
  onClearRoute,
  userLocation,
  onLocateUser,
  height = 360,
}) => {
  const outerWrapperRef = useRef<HTMLDivElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const polygonsRef = useRef<Record<string, L.Polygon>>({})
  const labelMarkersRef = useRef<Record<string, L.Marker>>({})
  const userMarkerRef = useRef<L.Marker | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  const [mapStyle, setMapStyle] = useState<'streets' | 'topo'>('streets')
  const [hoveredPartitionId, setHoveredPartitionId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeRoute, setActiveRoute] = useState<DirectionRoute | null>(null)
  const [pointAId, setPointAId] = useState<string>('user_gps')
  const [pointBId, setPointBId] = useState<string>('base_1')
  const [routePlannerOpen, setRoutePlannerOpen] = useState<boolean>(false)

  const routeLayersRef = useRef<{
    casing?: L.Polyline
    core?: L.Polyline
    dash?: L.Polyline
    startMarker?: L.Marker
    endMarker?: L.Marker
  }>({})

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true)
      try {
        const el = outerWrapperRef.current
        if (el) {
          if (el.requestFullscreen) {
            await el.requestFullscreen()
          } else if ((el as any).webkitRequestFullscreen) {
            await (el as any).webkitRequestFullscreen()
          }
        }
      } catch (err) {
        console.warn('Native fullscreen not available, falling back to full-viewport modal:', err)
      }
    } else {
      setIsFullscreen(false)
      try {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen()
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen()
          }
        }
      } catch (err) {
        console.warn('Error exiting native fullscreen:', err)
      }
    }
  }

  // Handle native browser fullscreen change events (e.g. user pressed Esc key in browser)
  useEffect(() => {
    const handleNativeFullscreenChange = () => {
      const isNative = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement)
      setIsFullscreen(isNative)
    }
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleNativeFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleNativeFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleNativeFullscreenChange)
    }
  }, [])

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Lock body scroll and invalidate Leaflet map dimensions on fullscreen toggle
  useEffect(() => {
    const map = mapInstanceRef.current
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const t1 = setTimeout(() => {
        map?.invalidateSize()
      }, 50)
      const t2 = setTimeout(() => {
        map?.invalidateSize()
      }, 250)
      return () => {
        document.body.style.overflow = originalOverflow
        clearTimeout(t1)
        clearTimeout(t2)
      }
    } else {
      const t1 = setTimeout(() => {
        map?.invalidateSize()
      }, 50)
      const t2 = setTimeout(() => {
        map?.invalidateSize()
      }, 250)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [isFullscreen])

  const onSelectSiteRef = useRef(onSelectSite)
  const selectedSiteIdRef = useRef(selectedSiteId)
  const sitesRef = useRef(sites)

  useEffect(() => {
    onSelectSiteRef.current = onSelectSite
    selectedSiteIdRef.current = selectedSiteId
    sitesRef.current = sites
  }, [onSelectSite, selectedSiteId, sites])

  const selectedSiteIndex = sites.findIndex((s) => s.id === selectedSiteId)
  const selectedSite = selectedSiteIndex >= 0 ? sites[selectedSiteIndex] : undefined
  const selectedPartition = selectedSite
    ? findPartitionForSite(selectedSite.id, selectedSite.name, selectedSiteIndex)
    : findPartitionForSite(selectedSiteId)

  const resolveSiteIdForPartition = (partition: CommonwealthPartition): string => {
    const matched = sitesRef.current.find(
      (s, idx) => findPartitionForSite(s.id, s.name, idx)?.num === partition.num
    )
    return matched ? matched.id : partition.id
  }

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
      minZoom: 13,
      maxZoom: 18,
      maxBounds: bounds.pad(0.6), // Generous padding prevents perimeter bases from snapping/rubber-banding to center
      maxBoundsViscosity: 0.2,     // Soft viscosity eliminates jitter
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

    // Inverted World Mask with Dark Background & Dark Green Dots outside Commonwealth
    // Rendered via GPU-synchronized SVG overlay inside mapPane with noClip: true.
    // Zero outside tiles visible, zero edge leakage, zero main-thread JS calculations on drag.
    const maskPolygon = L.polygon([WORLD_MASK_RING, COMMONWEALTH_BOUNDARY], {
      className: 'commonwealth-outside-mask',
      fillColor: 'url(#darkGreenDotsPattern)',
      fillOpacity: 1.0,
      stroke: false,
      interactive: false,
      noClip: true,
      renderer: wideMaskRenderer,
    }).addTo(map)

    // Ensure pattern is injected and applied to the SVG path immediately upon renderer creation
    const applySvgPattern = () => {
      const svgElement = mapContainerRef.current?.querySelector('svg.leaflet-zoom-animated') as SVGSVGElement | null
      if (svgElement) {
        if (!svgElement.querySelector('#darkGreenDotsPattern')) {
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
          defs.innerHTML = `
            <pattern id="darkGreenDotsPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#071209" />
              <circle cx="8" cy="8" r="1.8" fill="#1b4d27" opacity="0.95" />
              <circle cx="0" cy="0" r="1.3" fill="#143d1e" opacity="0.85" />
              <circle cx="16" cy="0" r="1.3" fill="#143d1e" opacity="0.85" />
              <circle cx="0" cy="16" r="1.3" fill="#143d1e" opacity="0.85" />
              <circle cx="16" cy="16" r="1.3" fill="#143d1e" opacity="0.85" />
            </pattern>
          `
          svgElement.insertBefore(defs, svgElement.firstChild)
        }

        const maskPath = (maskPolygon as unknown as { _path?: SVGPathElement })._path
        if (maskPath) {
          maskPath.setAttribute('fill', 'url(#darkGreenDotsPattern)')
          maskPath.setAttribute('fill-opacity', '1')
          maskPath.setAttribute('style', 'fill: url(#darkGreenDotsPattern) !important; fill-opacity: 1 !important;')
        }
      }
    }

    applySvgPattern()
    map.on('zoomend moveend viewreset', applySvgPattern)

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

      // Click partition to select matching site
      poly.on('click', () => {
        onSelectSiteRef.current(resolveSiteIdForPartition(partition))
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
    })

    // 1. Subtle Outer Border Glow around Barangay Commonwealth boundary
    L.polygon(COMMONWEALTH_BOUNDARY, {
      className: 'commonwealth-boundary-glow',
      color: '#ABF06B',
      weight: 8,
      opacity: 0.6,
      fill: false,
      interactive: false,
      renderer: wideMaskRenderer,
    }).addTo(map)

    // 2. Accurate, Clean & Crisp Outer Border of Barangay Commonwealth
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

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize()
      })
      resizeObserver.observe(mapContainerRef.current)
    }

    const handleWindowResize = () => {
      map.invalidateSize()
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleWindowResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
      polygonsRef.current = {}
      labelMarkersRef.current = {}
    }
  }, [])

  // Sync Partition Styling when Selection Changes (Lines Only — No Green Fill)
  useEffect(() => {
    const activeNum = selectedPartition?.num
    COMMONWEALTH_PARTITIONS.forEach((partition: CommonwealthPartition) => {
      const poly = polygonsRef.current[partition.id]
      if (!poly) return

      const isSelected = activeNum !== undefined && partition.num === activeNum
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
  }, [selectedPartition?.num])

  // Sync Base Markers for Sites
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    sites.forEach((site, idx) => {
      if (!site.coordinates) return

      const isSelected = site.id === selectedSiteId
      const partition = findPartitionForSite(site.id, site.name, idx)
      const baseNum = partition?.num ?? idx + 1

      const markerHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isSelected
              ? `<div class="eco-map-pulse" style="
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
            transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1), background-color 180ms ease, color 180ms ease;
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

  const resolvePointCoordsAndLabel = (id: string): { coords: [number, number]; label: string } => {
    if (id === 'user_gps') {
      if (userLocation) {
        return {
          coords: [userLocation.lat, userLocation.lng],
          label: '📍 My Current Location (GPS)',
        }
      }
      return {
        coords: [14.697, 121.0882],
        label: '📍 Commonwealth Brgy. Hall Complex',
      }
    }

    const baseMatch = /^base_(\d+)$/i.exec(id)
    if (baseMatch) {
      const num = parseInt(baseMatch[1], 10)
      const site = COMMONWEALTH_FALLBACK_SITES[num - 1]
      if (site?.coordinates) {
        return {
          coords: [site.coordinates.lat, site.coordinates.lng],
          label: `Base ${num}: ${site.name}`,
        }
      }
    }

    const foundSite =
      sites.find((s) => s.id === id) || COMMONWEALTH_FALLBACK_SITES.find((s) => s.id === id)
    if (foundSite?.coordinates) {
      const num = resolveSiteBaseNumber(foundSite.id, foundSite.name) || 1
      return {
        coords: [foundSite.coordinates.lat, foundSite.coordinates.lng],
        label: `Base ${num}: ${foundSite.name}`,
      }
    }

    const wp = COMMONWEALTH_ROUTE_WAYPOINTS.find((w) => w.id === id)
    if (wp) {
      return { coords: wp.coordinates, label: wp.name }
    }

    return {
      coords: [14.697, 121.0882],
      label: 'Barangay Commonwealth',
    }
  }

  const plotRouteAB = async (idA: string, idB: string) => {
    const map = mapInstanceRef.current
    if (!map) return

    const infoA = resolvePointCoordsAndLabel(idA)
    const infoB = resolvePointCoordsAndLabel(idB)

    const route = await fetchCommonwealthRoute(
      { lat: infoA.coords[0], lng: infoA.coords[1] },
      { lat: infoB.coords[0], lng: infoB.coords[1] },
      infoA.label,
      infoB.label
    )
    setActiveRoute(route)
    setRoutePlannerOpen(true)

    // Clear previous route layers
    const layers = routeLayersRef.current
    if (layers.casing) layers.casing.remove()
    if (layers.core) layers.core.remove()
    if (layers.dash) layers.dash.remove()
    if (layers.startMarker) layers.startMarker.remove()
    if (layers.endMarker) layers.endMarker.remove()

    // 1. Dark Casing line for contrast
    const casing = L.polyline(route.coordinates, {
      color: '#0f172a',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map)

    // 2. High-visibility Electric Emerald line
    const core = L.polyline(route.coordinates, {
      color: '#10b981',
      weight: 4.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map)

    // 3. Highlight dashed line
    const dash = L.polyline(route.coordinates, {
      color: '#ffffff',
      weight: 2,
      opacity: 0.85,
      dashArray: '6, 14',
    }).addTo(map)

    // 4. Start Marker (A)
    const startIcon = L.divIcon({
      className: 'route-pin-start',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div class="eco-map-pulse" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(2, 132, 199, 0.35); animation: pulseBaseRing 1.8s infinite;"></div>
          <div style="width: 26px; height: 26px; border-radius: 50%; background: #0284c7; color: #ffffff; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; font-family: 'Quicksand', sans-serif; font-weight: 800; font-size: 11px; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
            A
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })
    const startMarker = L.marker([infoA.coords[0], infoA.coords[1]], {
      icon: startIcon,
      zIndexOffset: 3500,
    }).addTo(map)
    startMarker.bindTooltip(`<b>Point A (Start)</b>: ${infoA.label}`, {
      direction: 'top',
      className: 'partition-clean-tooltip',
    })

    // 5. Destination Marker (B)
    const endIcon = L.divIcon({
      className: 'route-pin-end',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div class="eco-map-pulse" style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: pulseBaseRing 1.8s infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; color: #abf06b; border: 2.5px solid #abf06b; display: flex; align-items: center; justify-content: center; font-family: 'Quicksand', sans-serif; font-weight: 800; font-size: 12px; box-shadow: 0 3px 8px rgba(0,0,0,0.35);">
            B
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    })
    const endMarker = L.marker([infoB.coords[0], infoB.coords[1]], {
      icon: endIcon,
      zIndexOffset: 3600,
    }).addTo(map)
    endMarker.bindTooltip(`<b>Point B (Destination)</b>: ${infoB.label}`, {
      direction: 'top',
      className: 'partition-clean-tooltip',
    })

    routeLayersRef.current = { casing, core, dash, startMarker, endMarker }

    // Smoothly zoom and frame the entire route path
    const routeBounds = L.latLngBounds(route.coordinates)
    map.fitBounds(routeBounds, {
      padding: isFullscreen ? [140, 80] : [60, 45],
      maxZoom: 17,
      animate: !prefersReducedMotion(),
    })
  }

  // Handle Directions Plotting & Cleanup
  const handleClearRoute = () => {
    const layers = routeLayersRef.current
    if (layers.casing) layers.casing.remove()
    if (layers.core) layers.core.remove()
    if (layers.dash) layers.dash.remove()
    if (layers.startMarker) layers.startMarker.remove()
    if (layers.endMarker) layers.endMarker.remove()
    routeLayersRef.current = {}
    setActiveRoute(null)
    setRoutePlannerOpen(false)
    if (onClearRoute) {
      onClearRoute()
    }
  }

  const handleSwapRoutePoints = () => {
    const nextA = pointBId
    const nextB = pointAId
    setPointAId(nextA)
    setPointBId(nextB)
    plotRouteAB(nextA, nextB)
  }

  // React to prop activeRouteSite
  useEffect(() => {
    if (activeRouteSite) {
      const baseNum = resolveSiteBaseNumber(activeRouteSite.id, activeRouteSite.name)
      const baseWpId = baseNum ? `base_${baseNum}` : activeRouteSite.id
      setPointBId(baseWpId)
      plotRouteAB(pointAId, baseWpId)
    } else {
      handleClearRoute()
    }
  }, [activeRouteSite])

  // Center & Focus on Selected Site (Zoom 17, zero jitter, stays firmly focused)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedSiteId || activeRoute) return

    let targetCoords: [number, number] | null = null
    const site = sites.find((s) => s.id === selectedSiteId)
    if (site?.coordinates) {
      targetCoords = [site.coordinates.lat, site.coordinates.lng]
    } else {
      const part = findPartitionForSite(selectedSiteId)
      if (part) {
        targetCoords = part.center
      }
    }

    if (targetCoords) {
      map.setView(targetCoords, 17, {
        animate: !prefersReducedMotion(),
        duration: 0.5,
      })
    }
  }, [selectedSiteId, sites, activeRoute])

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
          <div class="eco-map-pulse" style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(2, 132, 199, 0.35); animation: pulseBaseRing 2s infinite;"></div>
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
    <Box
      ref={outerWrapperRef}
      sx={{
        ...(isFullscreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1400,
              width: '100vw',
              height: '100vh',
              p: 0,
              m: 0,
              borderRadius: 0,
              border: 'none',
              overflow: 'hidden',
              backgroundColor: '#071209',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              width: '100%',
              position: 'relative',
            }),
      }}
    >
      <style>{`
        @keyframes pulseBaseRing {
          0% { transform: scale(0.7); opacity: 0.8; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .eco-map-pulse {
            animation: none !important;
            transform: none !important;
            opacity: 0.32 !important;
          }
        }
        .partition-clean-tooltip {
          background-color: rgba(255, 255, 255, 0.98) !important;
          border: 1.5px solid #0f172a !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          color: #0f172a !important;
        }
        /* Keep Leaflet internal pane z-indices strictly below AppShell fixed navbars */
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control {
          z-index: 10 !important;
        }
        .leaflet-control-container {
          position: relative;
          z-index: 10;
        }

        /* Dotted Dark Green Outside Boundary Mask */
        .commonwealth-outside-mask {
          fill: url(#darkGreenDotsPattern) !important;
          fill-opacity: 1 !important;
        }

        /* Luminous Border Glow on Commonwealth Boundary */
        .commonwealth-boundary-glow {
          filter: drop-shadow(0 0 6px rgba(171, 240, 107, 0.75)) drop-shadow(0 0 12px rgba(38, 99, 23, 0.45));
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>

      {/* ── 1. Top Control Bar ── */}
      <Box
        sx={{
          ...(isFullscreen
            ? {
                position: 'absolute',
                top: { xs: 10, sm: 14 },
                left: { xs: 10, sm: 14 },
                right: { xs: 10, sm: 14 },
                zIndex: 1100,
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2.5,
                p: { xs: 0.75, sm: 1 },
                border: '1.5px solid #0f172a',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                px: 0.5,
              }),
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

        {/* Right: Map Control Buttons */}
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

          <Tooltip title={routePlannerOpen ? 'Close Route Planner' : 'Route Planner (Point A & B)'} arrow>
            <IconButton
              size="small"
              onClick={() => {
                if (routePlannerOpen) {
                  handleClearRoute()
                } else {
                  const baseWpId = selectedPartition ? `base_${selectedPartition.num}` : 'base_1'
                  setPointBId(baseWpId)
                  plotRouteAB(pointAId, baseWpId)
                }
              }}
              aria-label="Route Planner"
              sx={{
                width: 32,
                height: 32,
                backgroundColor: routePlannerOpen ? '#0f172a' : '#ffffff',
                color: routePlannerOpen ? '#abf06b' : '#0f172a',
                border: '1.5px solid #0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                '&:hover': { backgroundColor: routePlannerOpen ? '#1e293b' : '#f8fafc' },
              }}
            >
              <NavigationRoundedIcon sx={{ fontSize: 16, transform: 'rotate(45deg)' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Full Screen Map'} arrow>
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen map'}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: isFullscreen ? '#0f172a' : '#ffffff',
                color: isFullscreen ? '#abf06b' : '#0f172a',
                border: '1.5px solid #0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                '&:hover': { backgroundColor: isFullscreen ? '#1e293b' : '#f8fafc' },
              }}
            >
              {isFullscreen ? (
                <FullscreenExitRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <FullscreenRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          {isFullscreen && (
            <Button
              variant="contained"
              size="small"
              onClick={toggleFullscreen}
              startIcon={<FullscreenExitRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                backgroundColor: '#0f172a',
                color: '#abf06b',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: 2,
                py: 0.5,
                px: 1.25,
                border: '1.5px solid #0f172a',
                boxShadow: '0 2px 6px rgba(15,23,42,0.18)',
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              Exit
            </Button>
          )}
        </Box>
      </Box>

      {/* ── 2. The Map Frame: Fills entire screen in Fullscreen Mode ── */}
      <Box
        sx={{
          ...(isFullscreen
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                borderRadius: 0,
                border: 'none',
                boxShadow: 'none',
                zIndex: 1,
              }
            : {
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height,
                borderRadius: 3,
                overflow: 'hidden',
                border: '2px solid #0f172a',
                backgroundColor: '#faf8f5',
                boxShadow: '0 8px 30px rgba(38, 99, 23, 0.18), 0 2px 10px rgba(15, 23, 42, 0.12)',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: '0 10px 36px rgba(171, 240, 107, 0.28), 0 4px 14px rgba(15, 23, 42, 0.16)',
                },
              }),
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

        {/* ── Compact Floating Route Planner & HUD Overlay (Point A to Point B) ── */}
        {(routePlannerOpen || activeRoute) && (
          <Box
            sx={{
              position: 'absolute',
              top: isFullscreen ? { xs: 72, sm: 80 } : 12,
              left: { xs: 10, sm: 14 },
              right: { xs: 10, sm: 'auto' },
              width: { xs: 'calc(100% - 20px)', sm: 340 },
              maxWidth: { xs: 'calc(100% - 20px)', sm: 340 },
              zIndex: 1000,
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2.5,
              p: 1.25,
              border: '1.5px solid #10b981',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {/* Header: Title, Swap & Close */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <NavigationRoundedIcon sx={{ fontSize: 16, color: '#abf06b', transform: 'rotate(45deg)' }} />
                <Typography
                  sx={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    color: '#abf06b',
                    letterSpacing: '0.02em',
                  }}
                >
                  Route Directions
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title="Swap Start & Destination (A ↔ B)" arrow>
                  <IconButton
                    size="small"
                    onClick={handleSwapRoutePoints}
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        color: '#abf06b',
                      },
                    }}
                  >
                    <SwapVertRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>

                <IconButton
                  size="small"
                  onClick={handleClearRoute}
                  aria-label="Close Route Planner"
                  sx={{
                    color: '#ffffff',
                    width: 24,
                    height: 24,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
                  }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Point A (Start) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                A
              </Box>
              <Select
                size="small"
                value={pointAId}
                onChange={(e) => {
                  const newA = e.target.value
                  setPointAId(newA)
                  plotRouteAB(newA, pointBId)
                }}
                sx={{
                  flex: 1,
                  height: 28,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  borderRadius: 1.5,
                  fontSize: '0.71875rem',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.18)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#38bdf8',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#38bdf8',
                  },
                  '& .MuiSvgIcon-root': { color: '#ffffff', fontSize: 16 },
                }}
                MenuProps={{
                  container: () => outerWrapperRef.current || document.body,
                  sx: { zIndex: 99999 },
                  slotProps: {
                    paper: {
                      sx: {
                        zIndex: 99999,
                        maxHeight: 260,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #334155',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.75rem',
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 600,
                          py: 0.6,
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(16,185,129,0.2)',
                            color: '#abf06b',
                            fontWeight: 800,
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {COMMONWEALTH_ROUTE_WAYPOINTS.map((wp) => (
                  <MenuItem key={wp.id} value={wp.id}>
                    {wp.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Point B (Destination) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                B
              </Box>
              <Select
                size="small"
                value={pointBId}
                onChange={(e) => {
                  const newB = e.target.value
                  setPointBId(newB)
                  plotRouteAB(pointAId, newB)
                }}
                sx={{
                  flex: 1,
                  height: 28,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  borderRadius: 1.5,
                  fontSize: '0.71875rem',
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.18)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#abf06b',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#abf06b',
                  },
                  '& .MuiSvgIcon-root': { color: '#ffffff', fontSize: 16 },
                }}
                MenuProps={{
                  container: () => outerWrapperRef.current || document.body,
                  sx: { zIndex: 99999 },
                  slotProps: {
                    paper: {
                      sx: {
                        zIndex: 99999,
                        maxHeight: 260,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #334155',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.75rem',
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 600,
                          py: 0.6,
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(16,185,129,0.2)',
                            color: '#abf06b',
                            fontWeight: 800,
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {COMMONWEALTH_ROUTE_WAYPOINTS.map((wp) => (
                  <MenuItem key={wp.id} value={wp.id}>
                    {wp.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Route Stats Chips */}
            {activeRoute && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`🚗 ${activeRoute.distanceText} • ~${activeRoute.durationText}`}
                  sx={{
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    backgroundColor: '#10b981',
                    color: '#0f172a',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                />
                <Chip
                  size="small"
                  label={`🚶 ~${activeRoute.walkText} walk`}
                  sx={{
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#f1f5f9',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ── 3. Bottom Partition Selector (Floating in Fullscreen, docked in windowed) ── */}
      <Box
        sx={{
          ...(isFullscreen
            ? {
                position: 'absolute',
                bottom: { xs: 12, sm: 16 },
                left: { xs: 12, sm: '50%' },
                transform: { xs: 'none', sm: 'translateX(-50%)' },
                width: { xs: 'calc(100% - 24px)', sm: 580 },
                zIndex: 1100,
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2.5,
                border: '1.5px solid #0f172a',
                p: { xs: 1, sm: 1.25 },
                boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }
            : {
                backgroundColor: '#ffffff',
                borderRadius: 2.5,
                border: '1.5px solid #0f172a',
                p: { xs: 1.25, sm: 1.5 },
                boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }),
        }}
      >
        {/* Header Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.25 }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Base Partitions
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#64748b',
            }}
          >
            Bases 1 to 9
          </Typography>
        </Box>

        {/* 9 Numbered Buttons: Spacious, uncluttered, easy to tap */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: { xs: 0.6, sm: 0.85 },
            width: '100%',
          }}
        >
          {COMMONWEALTH_PARTITIONS.map((partition) => {
            const isSelected = selectedPartition?.num === partition.num
            const isHovered = partition.id === hoveredPartitionId

            return (
              <Tooltip
                key={partition.id}
                title={`Base ${partition.num}: ${partition.name}`}
                arrow
                placement="top"
              >
                <Box
                  onClick={() => onSelectSite(resolveSiteIdForPartition(partition))}
                  onMouseEnter={() => setHoveredPartitionId(partition.id)}
                  onMouseLeave={() => setHoveredPartitionId(null)}
                  sx={{
                    height: { xs: 38, sm: 42 },
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                    backgroundColor: isSelected ? '#0f172a' : isHovered ? '#f1f5f9' : '#ffffff',
                    color: isSelected ? '#abf06b' : '#0f172a',
                    transition:
                      'background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 120ms cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow: isSelected ? '0 2px 8px rgba(15,23,42,0.2)' : 'none',
                    '&:active': { transform: 'scale(0.96)' },
                    '@media (hover: hover) and (pointer: fine)': {
                      '&:hover': {
                        borderColor: '#0f172a',
                        transform: 'translateY(-1px)',
                      },
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                      '&:active': { transform: 'none' },
                      '&:hover': { transform: 'none' },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
                      fontWeight: 800,
                      color: isSelected ? '#abf06b' : '#0f172a',
                      lineHeight: 1,
                    }}
                  >
                    {partition.num}
                  </Typography>
                </Box>
              </Tooltip>
            )
          })}
        </Box>

        {/* Active Base Status Subtitle with Directions Trigger */}
        <Box
          sx={{
            backgroundColor: '#f8fafc',
            borderRadius: 1.5,
            py: 0.6,
            px: 1,
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.75,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: selectedPartition ? '#16a34a' : '#94a3b8',
                flexShrink: 0,
              }}
            />
            <Typography
              noWrap
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: selectedPartition ? '#0f172a' : '#64748b',
              }}
            >
              {selectedPartition
                ? `Base ${selectedPartition.num}: ${selectedPartition.name}`
                : 'Tap any base number above to view its partition on the map'}
            </Typography>
          </Box>

          {selectedPartition && (
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                const baseWpId = `base_${selectedPartition.num}`
                setPointBId(baseWpId)
                plotRouteAB(pointAId, baseWpId)
              }}
              startIcon={<NavigationRoundedIcon sx={{ fontSize: 13, color: '#abf06b' }} />}
              sx={{
                py: 0.35,
                px: 1,
                fontSize: '0.6875rem',
                fontWeight: 800,
                fontFamily: "'Quicksand', sans-serif",
                textTransform: 'none',
                backgroundColor: '#0f172a',
                color: '#abf06b',
                borderRadius: 1.5,
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(15,23,42,0.15)',
                '&:hover': { backgroundColor: '#1e293b' },
              }}
            >
              Directions
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}

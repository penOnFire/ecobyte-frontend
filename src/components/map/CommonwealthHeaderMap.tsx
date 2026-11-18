import { useMemo, useState, type FC } from 'react'
import { Box, Chip, IconButton, Tooltip } from '@mui/material'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import { useNavigate } from 'react-router-dom'
import {
  COMMONWEALTH_BOUNDARY,
  COMMONWEALTH_PARTITIONS,
  COMMONWEALTH_FALLBACK_SITES,
} from './commonwealthData'

interface CommonwealthHeaderMapProps {
  userBaseNumber: number
  userName?: string
}

const SVG_WIDTH = 440
const SVG_HEIGHT = 440

// Real arterial roads and major thoroughfares in Barangay Commonwealth
const COMMONWEALTH_ROADS = [
  // Commonwealth Avenue (Major Arterial Highway Spine)
  {
    name: 'Commonwealth Ave.',
    type: 'arterial',
    points: [
      [14.692, 121.07],
      [14.6935, 121.0735],
      [14.695, 121.0775],
      [14.6965, 121.0815],
      [14.698, 121.085],
      [14.6995, 121.0872],
      [14.7015, 121.089],
      [14.7045, 121.0912],
      [14.7075, 121.093],
      [14.7105, 121.0945],
    ] as [number, number][],
  },
  // Batasan-San Mateo Road
  {
    name: 'Batasan Rd.',
    type: 'major',
    points: [
      [14.697, 121.0865],
      [14.6965, 121.089],
      [14.696, 121.092],
      [14.6965, 121.0945],
    ] as [number, number][],
  },
  // Litex Road
  {
    name: 'Litex Rd.',
    type: 'major',
    points: [
      [14.7005, 121.0875],
      [14.702, 121.09],
      [14.7035, 121.0925],
    ] as [number, number][],
  },
  // Payatas Road
  {
    name: 'Payatas Rd.',
    type: 'major',
    points: [
      [14.701, 121.0855],
      [14.704, 121.0875],
      [14.707, 121.089],
      [14.71, 121.0905],
    ] as [number, number][],
  },
  // Katuparan Street (Area 1 / Brgy Hall Complex access)
  {
    name: 'Katuparan St.',
    type: 'local',
    points: [
      [14.6955, 121.0865],
      [14.697, 121.0882],
      [14.6985, 121.09],
    ] as [number, number][],
  },
  // Don Fabian Street (Area 8)
  {
    name: 'Don Fabian St.',
    type: 'local',
    points: [
      [14.6965, 121.0815],
      [14.699, 121.083],
      [14.7015, 121.0835],
    ] as [number, number][],
  },
  // Riverside Street (Area 2 / Lupang Pangako)
  {
    name: 'Riverside St.',
    type: 'local',
    points: [
      [14.6935, 121.08],
      [14.6955, 121.0825],
      [14.6975, 121.084],
    ] as [number, number][],
  },
  // Pilot Area Main Drive (Area 6)
  {
    name: 'Pilot Main Dr.',
    type: 'local',
    points: [
      [14.695, 121.075],
      [14.6975, 121.0775],
      [14.6995, 121.079],
    ] as [number, number][],
  },
  // Veterans Village Access Road (Area 9)
  {
    name: 'Veterans Access',
    type: 'local',
    points: [
      [14.695, 121.0835],
      [14.6965, 121.085],
      [14.6975, 121.0865],
    ] as [number, number][],
  },
  // Kasunduan Street (Area 7)
  {
    name: 'Kasunduan St.',
    type: 'local',
    points: [
      [14.695, 121.089],
      [14.696, 121.091],
      [14.697, 121.0925],
    ] as [number, number][],
  },
  // MRT-7 Rail Corridor
  {
    name: 'MRT-7 Line',
    type: 'rail',
    points: [
      [14.6925, 121.0705],
      [14.6955, 121.078],
      [14.6975, 121.0835],
      [14.7, 121.0875],
      [14.704, 121.0915],
      [14.708, 121.0935],
    ] as [number, number][],
  },
  // Secondary neighborhood connectors
  {
    name: 'Martan St.',
    type: 'local',
    points: [
      [14.696, 121.0845],
      [14.6975, 121.086],
      [14.6985, 121.0875],
    ] as [number, number][],
  },
  {
    name: 'Upper Kamias',
    type: 'local',
    points: [
      [14.6945, 121.088],
      [14.6955, 121.0905],
      [14.6965, 121.093],
    ] as [number, number][],
  },
]

export const CommonwealthHeaderMap: FC<CommonwealthHeaderMapProps> = ({
  userBaseNumber,
}) => {
  const navigate = useNavigate()
  const [selectedBase, setSelectedBase] = useState<number>(userBaseNumber)
  const [isZoomed, setIsZoomed] = useState<boolean>(true)

  const activeBaseNum = selectedBase || userBaseNumber || 1
  const activePartition =
    COMMONWEALTH_PARTITIONS.find((p) => p.num === activeBaseNum) ?? COMMONWEALTH_PARTITIONS[0]
  const activeSite =
    COMMONWEALTH_FALLBACK_SITES[(activeBaseNum - 1) % COMMONWEALTH_FALLBACK_SITES.length]

  // Dynamic projection centered and zoomed on the user's respective base
  const { boundaryPath, partitionsWithPaths, roadsWithPaths, siteCoords } = useMemo(() => {
    let minLat: number
    let maxLat: number
    let minLng: number
    let maxLng: number

    if (isZoomed && activePartition?.center) {
      // Zoomed-in viewport centered on the user's base, zoomed out by just a tiny bit
      const zoomLatSpan = 0.0135
      const zoomLngSpan = 0.0195
      const centerLat = activePartition.center[0] - 0.001
      minLat = centerLat - zoomLatSpan / 2
      maxLat = centerLat + zoomLatSpan / 2
      minLng = activePartition.center[1] - zoomLngSpan / 2
      maxLng = activePartition.center[1] + zoomLngSpan / 2
    } else {
      // Overview mode: shows the ENTIRE Barangay Commonwealth with comfortable margins
      const cLat = 14.7025
      const cLng = 121.0821
      const spanLat = 0.026
      const spanLng = 0.03
      minLat = cLat - spanLat / 2
      maxLat = cLat + spanLat / 2
      minLng = cLng - spanLng / 2
      maxLng = cLng + spanLng / 2
    }

    const project = ([lat, lng]: [number, number]): [number, number] => {
      const x = ((lng - minLng) / (maxLng - minLng)) * SVG_WIDTH
      const y = ((maxLat - lat) / (maxLat - minLat)) * SVG_HEIGHT
      return [Number(x.toFixed(1)), Number(y.toFixed(1))]
    }

    const polyToD = (pts: [number, number][]): string =>
      pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p)[0]} ${project(p)[1]}`)
        .join(' ') + ' Z'

    const lineToD = (pts: [number, number][]): string =>
      pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p)[0]} ${project(p)[1]}`)
        .join(' ')

    const bPath = polyToD(COMMONWEALTH_BOUNDARY)

    const parts = COMMONWEALTH_PARTITIONS.map((p) => ({
      num: p.num,
      id: p.id,
      name: p.name,
      center: project(p.center),
      path: polyToD(p.polygon),
    }))

    const roads = COMMONWEALTH_ROADS.map((r) => ({
      name: r.name,
      type: r.type,
      d: lineToD(r.points),
      labelPos: project(r.points[Math.floor(r.points.length / 2)]),
    }))

    const sitePos = activeSite?.coordinates
      ? project([activeSite.coordinates.lat, activeSite.coordinates.lng])
      : project(activePartition.center)

    return {
      boundaryPath: bPath,
      partitionsWithPaths: parts,
      roadsWithPaths: roads,
      siteCoords: sitePos,
    }
  }, [isZoomed, activePartition, activeSite])

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a140d',
        overflow: 'hidden',
      }}
    >
      {/* ── Cartographic Grid & Detailed Vector Map ── */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
      >
        <defs>
          {/* Active base gradient fill */}
          <linearGradient id="activeBaseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#abf06b" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#529c0d" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1e3a15" stopOpacity="0.15" />
          </linearGradient>

          {/* Technical grid pattern */}
          <pattern id="cartoGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(171, 240, 107, 0.05)"
              strokeWidth="0.65"
            />
          </pattern>

          {/* Glow filter */}
          <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Technical Coordinate Grid */}
        <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#cartoGrid)" />

        {/* Commonwealth Administrative Outer Boundary */}
        <path
          d={boundaryPath}
          fill="#112215"
          stroke="rgba(171, 240, 107, 0.2)"
          strokeWidth="1.2"
        />

        {/* ── 9 Base Partitions ── */}
        {partitionsWithPaths.map((part) => {
          const isUserBase = part.num === userBaseNumber
          const isSelected = part.num === activeBaseNum

          return (
            <g
              key={part.id}
              onClick={() => setSelectedBase(part.num)}
              style={{ cursor: 'pointer', transition: 'all 0.25s ease' }}
            >
              <path
                d={part.path}
                fill={
                  isSelected
                    ? 'url(#activeBaseGlow)'
                    : isUserBase
                      ? 'rgba(171, 240, 107, 0.18)'
                      : 'rgba(20, 36, 24, 0.5)'
                }
                stroke={
                  isSelected
                    ? '#abf06b'
                    : isUserBase
                      ? '#bdff5b'
                      : 'rgba(220, 207, 192, 0.2)'
                }
                strokeWidth={isSelected ? 2.5 : isUserBase ? 1.75 : 0.8}
                strokeLinejoin="round"
              />

              {/* Sector Base Label */}
              <text
                x={part.center[0]}
                y={part.center[1] + (isSelected ? -10 : 3)}
                textAnchor="middle"
                fontSize={isSelected ? '10' : '8'}
                fontWeight={isSelected || isUserBase ? 'bold' : '600'}
                fontFamily="'Quicksand', sans-serif"
                fill={
                  isSelected
                    ? '#ffffff'
                    : isUserBase
                      ? '#abf06b'
                      : 'rgba(220, 207, 192, 0.45)'
                }
                pointerEvents="none"
              >
                BASE {part.num}
              </text>
            </g>
          )
        })}

        {/* ── Road Network (Detailed Streets & Arterials) ── */}
        {roadsWithPaths.map((road, idx) => {
          const isArterial = road.type === 'arterial'
          const isRail = road.type === 'rail'
          const isMajor = road.type === 'major'

          return (
            <g key={`${road.name}-${idx}`} pointerEvents="none">
              {/* Road casing / glow for major highway */}
              {isArterial && (
                <path
                  d={road.d}
                  fill="none"
                  stroke="rgba(82, 156, 13, 0.35)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Main road track */}
              <path
                d={road.d}
                fill="none"
                stroke={
                  isArterial
                    ? '#abf06b'
                    : isRail
                      ? '#60a5fa'
                      : isMajor
                        ? 'rgba(202, 255, 152, 0.55)'
                        : 'rgba(220, 207, 192, 0.3)'
                }
                strokeWidth={isArterial ? 2.5 : isRail ? 1.5 : isMajor ? 1.6 : 1}
                strokeDasharray={isRail ? '4 3' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isArterial ? 0.85 : 0.65}
              />

              {/* Street Name Label in Zoomed Mode */}
              {isZoomed && (isArterial || isMajor) && (
                <text
                  x={road.labelPos[0]}
                  y={road.labelPos[1] - 4}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="'Quicksand', sans-serif"
                  fontWeight="600"
                  fill="rgba(255, 255, 255, 0.75)"
                  stroke="#0a140d"
                  strokeWidth="2"
                  paintOrder="stroke"
                >
                  {road.name}
                </text>
              )}
            </g>
          )
        })}

        {/* ── Active Base Facility Drop-off Pin with Concentric Radar Ping ── */}
        <g transform={`translate(${siteCoords[0]}, ${siteCoords[1]})`} pointerEvents="none">
          {/* Animated Outer Radar Ring 1 */}
          <circle r="14" fill="none" stroke="#abf06b" strokeWidth="1.5" opacity="0.8">
            <animate attributeName="r" from="6" to="28" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.9" to="0" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Animated Outer Radar Ring 2 */}
          <circle r="14" fill="none" stroke="#bdff5b" strokeWidth="1" opacity="0.6">
            <animate attributeName="r" from="6" to="40" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
          </circle>

          {/* Solid Center Pin Marker */}
          <circle r="6" fill="#abf06b" stroke="#000000" strokeWidth="2" filter="url(#mapGlow)" />
          <circle r="2.5" fill="#000000" />

          {/* Drop-off Site Pin Name Callout in Zoomed View */}
          {isZoomed && activeSite && (
            <g transform="translate(0, 16)">
              <rect
                x="-58"
                y="0"
                width="116"
                height="16"
                rx="8"
                fill="rgba(10, 20, 12, 0.88)"
                stroke="#abf06b"
                strokeWidth="1"
              />
              <text
                x="0"
                y="11"
                textAnchor="middle"
                fontSize="6.5"
                fontFamily="'Quicksand', sans-serif"
                fontWeight="700"
                fill="#abf06b"
              >
                📍 Base {activeBaseNum} Eco-Hub
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* ── Dark Vignette & Fade Gradient (Ensures foreground text legibility) ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(8, 18, 10, 0.45) 0%, rgba(12, 24, 14, 0.2) 30%, rgba(10, 20, 12, 0.38) 60%, rgba(8, 16, 10, 0.88) 85%, rgba(6, 12, 8, 0.98) 100%)',
        }}
      />

      {/* ── Interactive Controls: Zoom Toggle Pill & Map Finder Button ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 60,
          right: 14,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.8,
        }}
      >
        <Chip
          icon={
            isZoomed ? (
              <ZoomOutRoundedIcon sx={{ fontSize: '13px !important', color: '#abf06b !important' }} />
            ) : (
              <ZoomInRoundedIcon sx={{ fontSize: '13px !important', color: '#abf06b !important' }} />
            )
          }
          label={isZoomed ? `Base ${activeBaseNum} Sector (Zoomed)` : 'Commonwealth Overview'}
          size="small"
          onClick={() => setIsZoomed(!isZoomed)}
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 700,
            fontSize: '0.625rem',
            backgroundColor: 'rgba(10, 20, 12, 0.78)',
            backdropFilter: 'blur(8px)',
            color: '#abf06b',
            border: '1px solid rgba(171, 240, 107, 0.35)',
            height: 22,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(18, 36, 20, 0.92)',
              borderColor: '#abf06b',
            },
            '& .MuiChip-label': { px: 0.7 },
          }}
        />

        {/* Small round map button below the zoom in/out button */}
        <Tooltip title="View All 9 Drop-off Locations" arrow placement="left">
          <IconButton
            size="small"
            aria-label="Drop-off Locations Map"
            onClick={() => navigate('/drop-offs')}
            sx={{
              width: 34,
              height: 34,
              backgroundColor: '#ffffff',
              color: '#266317',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
              border: '1.5px solid #266317',
              borderRadius: '50%',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
              '&:hover': {
                transform: 'scale(1.08)',
                backgroundColor: '#F8F6F2',
              },
            }}
          >
            <MapRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

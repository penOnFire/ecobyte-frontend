import { useState, type FC } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import { useNavigate } from 'react-router-dom'
import type { DropOffSite } from '@/types'

interface TerritorySector {
  id: string
  siteId: string
  sectorNum: number
  name: string
  shortLabel: string
  points: string
  pinX: number
  pinY: number
  labelX: number
  labelY: number
  color: string
  hoverColor: string
}

// 9 Tactical Interlocking Sectors forming the complete territory of Barangay Commonwealth
const COMMONWEALTH_SECTORS: TerritorySector[] = [
  {
    id: 'sector-4',
    siteId: 'litex-commercial-hub',
    sectorNum: 4,
    name: 'Litex Market Green Exchange',
    shortLabel: 'Litex / Don Fabian',
    points: '310,35 420,80 440,150 350,170 280,140 250,110',
    pinX: 340,
    pinY: 105,
    labelX: 375,
    labelY: 135,
    color: '#1b4332',
    hoverColor: '#2d6a4f',
  },
  {
    id: 'sector-3',
    siteId: 'area3-payatas-border',
    sectorNum: 3,
    name: 'Area 3 Payatas Border Green Station',
    shortLabel: 'Payatas Border',
    points: '420,80 505,140 535,220 440,240 350,170 440,150',
    pinX: 450,
    pinY: 180,
    labelX: 485,
    labelY: 160,
    color: '#245740',
    hoverColor: '#367b5c',
  },
  {
    id: 'sector-2',
    siteId: 'area2-lupang-pangako',
    sectorNum: 2,
    name: 'Area 2 Lupang Pangako E-Collection',
    shortLabel: 'Lupang Pangako',
    points: '250,110 280,140 350,170 320,260 220,220 220,170',
    pinX: 285,
    pinY: 190,
    labelX: 260,
    labelY: 155,
    color: '#2d6a4f',
    hoverColor: '#40916c',
  },
  {
    id: 'sector-1',
    siteId: 'commonwealth-mrf-area1',
    sectorNum: 1,
    name: 'Area 1 Eco-Hub (Brgy Hall Complex)',
    shortLabel: 'Brgy Hall / Katuparan',
    points: '350,170 440,240 420,320 310,320 320,260',
    pinX: 370,
    pinY: 260,
    labelX: 370,
    labelY: 215,
    color: '#40916c',
    hoverColor: '#52b788',
  },
  {
    id: 'sector-5',
    siteId: 'area5-market-mrt7',
    sectorNum: 5,
    name: 'Area 5 Commonwealth Market Base',
    shortLabel: 'Market / MRT-7',
    points: '220,220 320,260 310,320 240,360 170,320 180,250',
    pinX: 235,
    pinY: 285,
    labelX: 200,
    labelY: 300,
    color: '#52b788',
    hoverColor: '#74c69d',
  },
  {
    id: 'sector-6',
    siteId: 'area6-pilot-depot',
    sectorNum: 6,
    name: 'Area 6 Pilot Area E-Depot',
    shortLabel: 'Pilot Area',
    points: '440,240 535,220 500,320 460,400 370,410 310,320 420,320',
    pinX: 435,
    pinY: 345,
    labelX: 465,
    labelY: 315,
    color: '#74c69d',
    hoverColor: '#95d5b2',
  },
  {
    id: 'sector-8',
    siteId: 'area8-holy-spirit',
    sectorNum: 8,
    name: 'Area 8 Holy Spirit Junction Bin',
    shortLabel: 'Holy Spirit / Comm. Ave',
    points: '170,320 240,360 310,320 370,410 300,470 160,410 150,350',
    pinX: 230,
    pinY: 395,
    labelX: 195,
    labelY: 380,
    color: '#95d5b2',
    hoverColor: '#b7e4c7',
  },
  {
    id: 'sector-7',
    siteId: 'batasan-border-depot',
    sectorNum: 7,
    name: 'Area 7 Batasan Border E-Depot',
    shortLabel: 'Batasan Road',
    points: '460,400 400,470 350,480 370,410',
    pinX: 410,
    pinY: 440,
    labelX: 420,
    labelY: 430,
    color: '#b7e4c7',
    hoverColor: '#d8f3dc',
  },
  {
    id: 'sector-9',
    siteId: 'area9-veterans-village',
    sectorNum: 9,
    name: 'Area 9 Veterans Village Hub',
    shortLabel: 'Veterans / Sandigan',
    points: '160,410 300,470 350,480 400,470 350,560 260,580 200,550 150,480',
    pinX: 275,
    pinY: 515,
    labelX: 310,
    labelY: 535,
    color: '#d8f3dc',
    hoverColor: '#e9fbe9',
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
  height = 360,
}) => {
  const navigate = useNavigate()
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null)
  const [showNumbers, setShowNumbers] = useState(true)

  // Find currently active site and sector
  const activeSector =
    COMMONWEALTH_SECTORS.find((s) => s.siteId === selectedSiteId) || COMMONWEALTH_SECTORS[3]
  const activeSite =
    sites.find((s) => s.id === selectedSiteId) ||
    sites.find((s) => s.id === activeSector.siteId) ||
    sites[0]

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        backgroundColor: '#ffffff',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Tactical Header Bar ── */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          backgroundColor: '#fafbfc',
          borderBottom: '1px solid #eef2f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              boxShadow: '0 0 8px rgba(22,163,74,0.6)',
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: '0.8125rem',
              color: '#0f172a',
              letterSpacing: '0.02em',
            }}
          >
            Barangay Commonwealth Territory
          </Typography>
          <Chip
            size="small"
            label="9 Regional Bases"
            sx={{
              height: 20,
              fontSize: '0.625rem',
              fontWeight: 800,
              backgroundColor: '#e2e8f0',
              color: '#334155',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {onLocateUser && (
            <Tooltip title="Locate Me (GPS Beacon)" placement="top">
              <IconButton
                size="small"
                onClick={onLocateUser}
                sx={{
                  color: userLocation ? '#0284c7' : '#64748b',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  width: 30,
                  height: 30,
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                <MyLocationRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={showNumbers ? 'Hide Sector Codes' : 'Show Sector Codes'} placement="top">
            <IconButton
              size="small"
              onClick={() => setShowNumbers((prev) => !prev)}
              sx={{
                color: showNumbers ? '#16a34a' : '#64748b',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                width: 30,
                height: 30,
                '&:hover': { backgroundColor: '#f1f5f9' },
              }}
            >
              <LayersOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Main Interactive Territory Map Canvas ── */}
      <Box
        sx={{
          position: 'relative',
          height,
          backgroundColor: '#faf8f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage:
            'radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #faf8f5 0.75px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* SVG Video-Game Territory Map */}
        <Box
          component="svg"
          viewBox="120 20 440 580"
          sx={{
            width: '100%',
            height: '100%',
            maxHeight: height,
            filter: 'drop-shadow(0 6px 14px rgba(15,23,42,0.12))',
          }}
        >
          {/* Territory Outer Shadow Layer */}
          <path
            d="M 310,35 L 420,80 L 505,140 L 535,220 L 500,320 L 460,400 L 400,470 L 350,560 L 260,580 L 200,550 L 150,480 L 150,350 L 170,320 L 180,250 L 220,170 L 250,110 Z"
            fill="#0f172a"
            opacity={0.06}
            transform="translate(4, 6)"
          />

          {/* Render All 9 Contiguous Sectors */}
          {COMMONWEALTH_SECTORS.map((sector) => {
            const isSelected = sector.siteId === selectedSiteId
            const isHovered = sector.id === hoveredSectorId

            return (
              <g
                key={sector.id}
                onClick={() => onSelectSite(sector.siteId)}
                onMouseEnter={() => setHoveredSectorId(sector.id)}
                onMouseLeave={() => setHoveredSectorId(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                {/* Sector Polygon Surface */}
                <polygon
                  points={sector.points}
                  fill={isHovered ? sector.hoverColor : sector.color}
                  stroke={isSelected ? '#0f172a' : '#ffffff'}
                  strokeWidth={isSelected ? 3.5 : 1.75}
                  strokeLinejoin="round"
                  style={{
                    transition: 'fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease',
                    filter: isSelected
                      ? 'drop-shadow(0 0 8px rgba(15,23,42,0.35))'
                      : isHovered
                        ? 'brightness(1.08)'
                        : 'none',
                  }}
                />

                {/* Sector Code Number (Video Game Style) */}
                {showNumbers && (
                  <text
                    x={sector.labelX}
                    y={sector.labelY}
                    fill={sector.sectorNum <= 4 ? '#ffffff' : '#0f172a'}
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="'Quicksand', sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                    style={{
                      opacity: isSelected ? 1 : 0.85,
                      textShadow: sector.sectorNum <= 4 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                    }}
                  >
                    {sector.sectorNum}
                  </text>
                )}

                {/* Drop-off Base Beacon Pin */}
                <g transform={`translate(${sector.pinX}, ${sector.pinY})`}>
                  {isSelected && (
                    <circle
                      r="16"
                      fill="none"
                      stroke="#abf06b"
                      strokeWidth="3"
                      opacity="0.8"
                      className="radar-pulse-ring"
                    />
                  )}

                  {/* Outer Pin Body */}
                  <circle
                    r={isSelected ? '11' : '8.5'}
                    fill={isSelected ? '#0f172a' : '#ffffff'}
                    stroke={isSelected ? '#abf06b' : '#0f172a'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  />

                  {/* Inner Pin Dot */}
                  <circle
                    r={isSelected ? '4.5' : '3'}
                    fill={isSelected ? '#abf06b' : '#0f172a'}
                  />
                </g>
              </g>
            )
          })}
        </Box>

        {/* ── Top-Right: Video Game North Arrow (▲ N) ── */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            px: 0.9,
            py: 0.75,
            borderRadius: 1.5,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            pointerEvents: 'none',
          }}
        >
          <Box
            component="svg"
            width="18"
            height="22"
            viewBox="0 0 24 30"
            fill="none"
          >
            {/* Compass North Arrow Needle */}
            <path d="M12 2 L20 24 L12 18 L4 24 Z" fill="#0f172a" />
            <path d="M12 2 L12 18 L4 24 Z" fill="#334155" />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 800,
              fontSize: '0.625rem',
              color: '#0f172a',
              mt: 0.2,
            }}
          >
            N
          </Typography>
        </Box>

        {/* ── Bottom-Left: Tactical Game Scale Bar ── */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            px: 1.25,
            py: 0.6,
            borderRadius: 1.5,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 80, mb: 0.25 }}>
            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#64748b' }}>0</Typography>
            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#64748b' }}>0.5</Typography>
            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#64748b' }}>1 km</Typography>
          </Box>
          {/* Segmented bar */}
          <Box sx={{ display: 'flex', width: 80, height: 4, border: '1px solid #0f172a' }}>
            <Box sx={{ flex: 1, backgroundColor: '#0f172a' }} />
            <Box sx={{ flex: 1, backgroundColor: '#ffffff' }} />
            <Box sx={{ flex: 1, backgroundColor: '#0f172a' }} />
          </Box>
        </Box>
      </Box>

      {/* ── Active Hub Quick HUD Card ── */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #eef2f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              backgroundColor: activeSector.color,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            {activeSector.sectorNum}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeSite?.name || activeSector.name}
              </Typography>
              <Chip
                size="small"
                label={activeSite?.isOpen ? 'Open Now' : 'Closed'}
                sx={{
                  height: 18,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  backgroundColor: activeSite?.isOpen ? '#dcfce7' : '#f1f5f9',
                  color: activeSite?.isOpen ? '#15803d' : '#64748b',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.6875rem', color: '#64748b' }}>
                {activeSite?.address || 'Barangay Commonwealth'}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#0f172a' }}>
                • {activeSite?.distance || `${activeSite?.distanceKm || 0.8} km`}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/schedule-dropoff')}
            startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderColor: '#e2e8f0',
              color: '#0f172a',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'none',
              py: 0.4,
              px: 1,
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            Schedule
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => activeSite && onGetDirections(activeSite)}
            startIcon={<NavigationRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'none',
              py: 0.4,
              px: 1.25,
              '&:hover': { backgroundColor: '#1e293b' },
            }}
          >
            Directions
          </Button>
        </Box>
      </Box>

      {/* ── Sector Legend Strip (Reference Image Style) ── */}
      <Box
        sx={{
          px: 1.5,
          py: 0.85,
          backgroundColor: '#fafbfc',
          borderTop: '1px solid #eef2f6',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 800,
            fontSize: '0.625rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          Sectors:
        </Typography>
        {COMMONWEALTH_SECTORS.map((sector) => {
          const isSelected = sector.siteId === selectedSiteId
          return (
            <Box
              key={sector.id}
              onClick={() => onSelectSite(sector.siteId)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                px: 0.75,
                py: 0.3,
                borderRadius: 1,
                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                border: isSelected ? '1px solid #0f172a' : '1px solid transparent',
                boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.5,
                  backgroundColor: sector.color,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '0.6875rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? '#0f172a' : '#64748b',
                  whiteSpace: 'nowrap',
                }}
              >
                {sector.sectorNum}: {sector.shortLabel}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

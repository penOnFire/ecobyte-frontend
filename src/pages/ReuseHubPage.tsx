import { useState } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import MicRoundedIcon from '@mui/icons-material/MicRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

import thinkpadImg from '@/assets/ui/thinkpad.jpeg'
import galaxyImg from '@/assets/ui/galaxy_s10.jpeg'
import chargerImg from '@/assets/ui/charger.jpeg'
import ipadImg from '@/assets/ui/ipad.jpeg'

const CATEGORIES = ['All', 'Laptops', 'Phones', 'Chargers', 'Peripherals']

interface ReuseItem {
  id: string
  title: string
  image: string
  condition: string
  subcondition: string
  location: string
  distance: string
  category: string
  status: string
  price: string
}

const REUSE_ITEMS: ReuseItem[] = [
  {
    id: 'thinkpad-t480',
    title: 'Lenovo ThinkPad T480',
    image: thinkpadImg,
    condition: 'Inspected & Working',
    subcondition: 'Battery 85%',
    location: 'Pasig Green Hub',
    distance: '0.6 km',
    category: 'Laptops',
    status: 'Available',
    price: 'Free',
  },
  {
    id: 'galaxy-s10',
    title: 'Samsung Galaxy S10',
    image: galaxyImg,
    condition: 'Screen Replaced',
    subcondition: 'Clean Condition',
    location: 'Ortigas Drop-off Center',
    distance: '1.2 km',
    category: 'Phones',
    status: 'Available',
    price: 'Free',
  },
  {
    id: 'charger-65w',
    title: '65W USB-C Fast Charger',
    image: chargerImg,
    condition: 'Safe & Tested',
    subcondition: 'Braided Cable',
    location: 'Brgy Ugong Kiosk',
    distance: '2.4 km',
    category: 'Chargers',
    status: 'Available',
    price: 'Free',
  },
  {
    id: 'ipad-9th',
    title: 'iPad 9th Gen 64GB',
    image: ipadImg,
    condition: 'Minor Bezel Scratch',
    subcondition: '100% Functional',
    location: 'Brgy San Antonio',
    distance: '0.9 km',
    category: 'Phones',
    status: 'Available',
    price: 'Free',
  },
]

export const ReuseHubPage: FC = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = REUSE_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1, pb: 4 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.2,
            }}
          >
            Reuse Hub
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#64748b',
              mt: 0.5,
              lineHeight: 1.45,
            }}
          >
            Verified refurbished electronics and reusable hardware within your barangay.
          </Typography>
        </Box>
        <StatusBadge label="48 Verified" variant="electric" size="sm" />
      </Box>

      {/* Search Input Bar */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <OutlinedInput
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search devices (phones, laptops, chargers)..."
          startAdornment={
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: '#64748b', fontSize: 20 }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <MicRoundedIcon sx={{ color: '#64748b', fontSize: 20, cursor: 'pointer' }} />
            </InputAdornment>
          }
          sx={{
            borderRadius: 1.5,
            backgroundColor: '#ffffff',
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#cbd5e1' },
          }}
        />
        <Button
          variant="outlined"
          aria-label="Filter"
          sx={{
            minWidth: 46,
            width: 46,
            borderRadius: 1.5,
            borderColor: '#e2e8f0',
            color: '#0f172a',
            p: 1.25,
            flexShrink: 0,
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: '#f8fafc',
              borderColor: '#cbd5e1',
            },
          }}
        >
          <FilterListRoundedIcon sx={{ fontSize: 20 }} />
        </Button>
      </Box>

      {/* Category Filter Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          py: 0.25,
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSel = selectedCategory === cat
          return (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.8125rem',
                backgroundColor: isSel ? '#0f172a' : '#ffffff',
                color: isSel ? '#ffffff' : '#0f172a',
                border: isSel ? '1px solid #0f172a' : '1px solid #e2e8f0',
                cursor: 'pointer',
                borderRadius: 9999,
                px: 0.5,
                boxShadow: isSel ? '0 1px 3px rgba(15,23,42,0.15)' : 'none',
                '&:hover': {
                  backgroundColor: isSel ? '#1e293b' : '#f8fafc',
                },
              }}
            />
          )
        })}
      </Box>

      {/* Eco Impact Notice Banner */}
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: '1px solid #1e293b',
          p: 2,
          boxShadow: '0 2px 6px rgba(15,23,42,0.15)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#abf06b',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <EnergySavingsLeafOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              color: '#f8fafc',
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            Choosing reused electronics diverted <strong style={{ color: '#abf06b' }}>14.2 kg</strong> of toxic waste in Pasig this week.
          </Typography>
        </Box>
      </Card>

      {/* Items List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            sx={{
              p: 1.75,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#0f172a', transform: 'translateY(-1px)' },
            }}
            onClick={() => navigate(`/reuse/${item.id}`)}
          >
            <Box sx={{ display: 'flex', gap: 1.75 }}>
              {/* Product Thumbnail */}
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              {/* Item Info */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        pr: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <StatusBadge label={item.status} variant="electric" size="sm" />
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 600,
                      mt: 0.3,
                    }}
                  >
                    {item.condition} • {item.subcondition}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 13, color: '#64748b' }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.6875rem',
                        color: '#64748b',
                        fontWeight: 500,
                      }}
                    >
                      {item.location} • {item.distance}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      color: '#0f172a',
                    }}
                  >
                    {item.price}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/reuse/${item.id}`)
                    }}
                    sx={{
                      borderRadius: 9999,
                      py: 0.4,
                      px: 1.75,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      borderColor: '#e2e8f0',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderColor: '#0f172a',
                      },
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Circular Donation Callout Banner */}
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1.5px dashed #0f172a',
          p: 2.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolunteerActivismOutlinedIcon sx={{ color: '#0f172a', fontSize: 20 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              color: '#0f172a',
              textTransform: 'uppercase',
            }}
          >
            Circular Donation
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            color: '#0f172a',
          }}
        >
          Have idle electronics?
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.75rem',
            color: '#64748b',
            lineHeight: 1.45,
          }}
        >
          List your spare cables, unused screens, or old tablets to support your community and reduce e-waste.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/scan')}
          sx={{
            mt: 0.5,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            borderRadius: 9999,
            py: 1,
            boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
            '&:hover': { backgroundColor: '#1e293b' },
          }}
        >
          List an Item
        </Button>
      </Card>
    </Box>
  )
}

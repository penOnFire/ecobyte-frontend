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
              fontSize: '1.625rem',
              fontWeight: 700,
              color: '#384735',
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
              color: '#5a5751',
              mt: 0.5,
              lineHeight: 1.4,
            }}
          >
            Verified refurbished electronics and reusable hardware
            <br />
            within your barangay.
          </Typography>
        </Box>
        <StatusBadge label="48 Verified" variant="available" size="sm" />
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
              <SearchRoundedIcon sx={{ color: '#5a5751', fontSize: 20 }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <MicRoundedIcon sx={{ color: '#78716c', fontSize: 20, cursor: 'pointer' }} />
            </InputAdornment>
          }
          sx={{
            borderRadius: 3.5,
            backgroundColor: '#ffffff',
            fontSize: '0.8125rem',
            fontFamily: "'Quicksand', sans-serif",
            '& fieldset': { borderColor: '#e8f0e6' },
          }}
        />
        <Button
          variant="outlined"
          sx={{
            minWidth: 46,
            width: 46,
            borderRadius: 3.5,
            borderColor: '#e8f0e6',
            color: '#384735',
            p: 1.25,
            flexShrink: 0,
            backgroundColor: '#ffffff',
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
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setSelectedCategory(cat)}
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.8125rem',
              backgroundColor: selectedCategory === cat ? '#4f5f4b' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#4f5f4b',
              border: selectedCategory === cat ? 'none' : '1px solid #e8f0e6',
              cursor: 'pointer',
              borderRadius: 9999,
              px: 0.5,
            }}
          />
        ))}
      </Box>

      {/* Eco Impact Notice Banner */}
      <Card
        sx={{
          borderRadius: 4,
          backgroundColor: '#ebf2eb',
          border: '1px solid #ceebc4',
          p: 1.75,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#4f5f4b',
              color: '#ffffff',
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
              color: '#1e1b16',
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Choosing reused electronics diverted <strong>14.2 kg</strong> of toxic waste in Pasig this week.
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
              borderRadius: 4,
              border: '1px solid #ede8e1',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
            onClick={() => navigate(`/reuse/${item.id}`)}
          >
            <Box sx={{ display: 'flex', gap: 1.75 }}>
              {/* Product Thumbnail */}
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: '#f4ede4',
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
                        color: '#292524',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        pr: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <StatusBadge label={item.status} variant="available" size="sm" />
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: '0.75rem',
                      color: '#78716c',
                      fontWeight: 600,
                      mt: 0.3,
                    }}
                  >
                    {item.condition} • {item.subcondition}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 13, color: '#78716c' }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '0.6875rem',
                        color: '#78716c',
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
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#4f5f4b',
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
                      color: '#4f5f4b',
                      borderColor: '#4f5f4b',
                      '&:hover': {
                        backgroundColor: '#4f5f4b',
                        color: '#ffffff',
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
          borderRadius: 4,
          backgroundColor: '#ffffff',
          border: '1.5px dashed #4f5f4b',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolunteerActivismOutlinedIcon sx={{ color: '#4f5f4b', fontSize: 20 }} />
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              color: '#4f5f4b',
              textTransform: 'uppercase',
            }}
          >
            Circular Donation
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#292524',
          }}
        >
          Have idle electronics?
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.75rem',
            color: '#78716c',
            lineHeight: 1.4,
          }}
        >
          List your spare cables, unused screens, or old tablets to support your community and reduce e-waste.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/scan')}
          sx={{
            mt: 0.5,
            backgroundColor: '#4f5f4b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            borderRadius: 9999,
            py: 1,
            '&:hover': { backgroundColor: '#384735' },
          }}
        >
          List an Item
        </Button>
      </Card>
    </Box>
  )
}

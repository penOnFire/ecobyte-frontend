import { ViewTransition, useEffect, useState, type MouseEvent } from 'react'
import type { FC } from 'react'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import MicRoundedIcon from '@mui/icons-material/MicRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { resolveMediaUrl, reuseApi } from '@/lib/api'
import type { ReuseItem as ApiReuseItem } from '@/types'

import thinkpadImg from '@/assets/ui/thinkpad.jpeg'
import galaxyImg from '@/assets/ui/galaxy_s10.jpeg'
import chargerImg from '@/assets/ui/charger.jpeg'
import ipadImg from '@/assets/ui/ipad.jpeg'

const CATEGORIES = [
  'All',
  'mobile phones and tablets',
  'computers, laptops, and accessories',
  'batteries and power banks',
  'televisions and monitors',
  'small household electronic appliences',
  'cables, chargers, and other electronic accessories',
  'radios and audio devices',
]

function itemMatchesCategory(item: UIReuseItem, selectedCat: string): boolean {
  if (selectedCat === 'All') return true
  const lowerCat = selectedCat.toLowerCase()
  const lowerItem = (item.title + ' ' + item.category).toLowerCase()
  if (lowerCat.includes('phone') || lowerCat.includes('tablet')) {
    return lowerItem.includes('phone') || lowerItem.includes('tablet') || lowerItem.includes('galaxy') || lowerItem.includes('mobile') || lowerItem.includes('ipad')
  }
  if (lowerCat.includes('computer') || lowerCat.includes('laptop')) {
    return lowerItem.includes('laptop') || lowerItem.includes('computer') || lowerItem.includes('thinkpad') || lowerItem.includes('pc') || lowerItem.includes('desktop')
  }
  if (lowerCat.includes('battery') || lowerCat.includes('power bank')) {
    return lowerItem.includes('battery') || lowerItem.includes('power')
  }
  if (lowerCat.includes('television') || lowerCat.includes('monitor')) {
    return lowerItem.includes('television') || lowerItem.includes('monitor') || lowerItem.includes('tv') || lowerItem.includes('screen') || lowerItem.includes('display')
  }
  if (lowerCat.includes('household') || lowerCat.includes('applience') || lowerCat.includes('appliance')) {
    return lowerItem.includes('household') || lowerItem.includes('appliance') || lowerItem.includes('applience')
  }
  if (lowerCat.includes('cable') || lowerCat.includes('charger') || lowerCat.includes('accessories')) {
    return lowerItem.includes('cable') || lowerItem.includes('charger') || lowerItem.includes('usb') || lowerItem.includes('adapter') || lowerItem.includes('accessory') || lowerItem.includes('peripherals')
  }
  if (lowerCat.includes('radio') || lowerCat.includes('audio')) {
    return lowerItem.includes('radio') || lowerItem.includes('audio') || lowerItem.includes('speaker') || lowerItem.includes('sound') || lowerItem.includes('headphone')
  }
  return lowerItem.includes(lowerCat)
}

interface UIReuseItem {
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
  raw: ApiReuseItem
}

/*
 * ==============================================================================
 * STATIC MOCK DATA (COMMENTED FOR BACKEND TESTING)
 * ==============================================================================
 * Original static mockup data for reuse inventory has been replaced with live
 * data fetched from GET /api/v1/reuse/items.
 *
const REUSE_ITEMS: UIReuseItem[] = [
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
 * ==============================================================================
 */

function resolveItemImage(title: string, category: string, imageUrl?: string | null): string {
  if (imageUrl && !imageUrl.includes('placeholder')) return resolveMediaUrl(imageUrl)
  const lower = (title + ' ' + category).toLowerCase()
  if (lower.includes('thinkpad') || lower.includes('laptop')) return thinkpadImg
  if (lower.includes('galaxy') || lower.includes('phone') || lower.includes('s10')) return galaxyImg
  if (lower.includes('charger') || lower.includes('cable') || lower.includes('usb')) return chargerImg
  if (lower.includes('ipad') || lower.includes('tablet')) return ipadImg
  return thinkpadImg
}

export const ReuseHubPage: FC = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<UIReuseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalVerified: 48, divertedKgThisWeek: 18.5 })
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'nearest'>('all')
  const [nowMs] = useState(() => Date.now())

  useEffect(() => {
    let isMounted = true

    const params: { category?: string; query?: string } = {}
    if (selectedCategory !== 'All') params.category = selectedCategory
    if (searchQuery.trim()) params.query = searchQuery.trim()

    const fetchItems = () => {
      reuseApi
        .getItems(params)
        .then((res) => {
          if (!isMounted) return
          setStats({
            totalVerified: res.totalVerified || 48,
            divertedKgThisWeek: res.divertedKgThisWeek || 18.5,
          })

          const mapped: UIReuseItem[] = (res.items || [])
            .filter((it: ApiReuseItem) => !it.status || it.status.toLowerCase() === 'available')
            .map((it: ApiReuseItem) => ({
              id: it.id,
              title: it.title,
              image: resolveItemImage(it.title, it.category, it.imageUrl),
              condition: it.condition || 'Inspected & Working',
              subcondition: it.subcondition || 'Certified Safe',
              location: it.location || 'Commonwealth Eco-Hub (Area 1)',
              distance: it.distance || '0.6 km',
              category: it.category || 'Laptops',
              status: it.status || 'Available',
              price: it.price || 'Free Claim',
              raw: it,
            }))

          setItems(mapped)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Failed to fetch reuse items from backend:', err)
          if (isMounted) {
            setIsLoading(false)
          }
        })
    }

    fetchItems()
    window.addEventListener('storage', fetchItems)
    window.addEventListener('ecobyte:reservations-refresh', fetchItems)

    return () => {
      isMounted = false
      window.removeEventListener('storage', fetchItems)
      window.removeEventListener('ecobyte:reservations-refresh', fetchItems)
    }
  }, [selectedCategory, searchQuery])

  const displayedItems = items
    .filter((it) => {
      if (it.status && it.status.toLowerCase() !== 'available') return false
      if (!itemMatchesCategory(it, selectedCategory)) return false
      try {
        const stored = localStorage.getItem('ecobyte_user_reservations')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            const isReserved = parsed.some((r: any) => {
              if (String(r.itemId) !== String(it.id)) return false
              if (r.status !== 'RESERVED') return false
              if (r.expiresAt && new Date(r.expiresAt).getTime() <= nowMs) return false
              return true
            })
            if (isReserved) return false
          }
        }
      } catch {
        // ignore
      }
      return true
    })
    .sort((a, b) => {
      if (filterMode === 'nearest') {
        const distA = parseFloat(a.distance) || 99
        const distB = parseFloat(b.distance) || 99
        return distA - distB
      }
      return 0
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
            Verified refurbished electronics and reusable hardware within Barangay Commonwealth.
          </Typography>
        </Box>
        <StatusBadge label={`${stats.totalVerified} Verified`} variant="electric" size="sm" />
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
          onClick={(e: MouseEvent<HTMLElement>) => setFilterAnchor(e.currentTarget)}
          sx={{
            minWidth: 46,
            width: 46,
            borderRadius: 1.5,
            borderColor: filterMode !== 'all' ? '#0f172a' : '#e2e8f0',
            color: '#0f172a',
            p: 1.25,
            flexShrink: 0,
            backgroundColor: filterMode !== 'all' ? '#f1f5f9' : '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: '#f8fafc',
              borderColor: '#cbd5e1',
            },
          }}
        >
          <FilterListRoundedIcon sx={{ fontSize: 20 }} />
        </Button>

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                minWidth: 220,
                boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                fontFamily: "'Quicksand', sans-serif",
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setFilterMode('all')
              setFilterAnchor(null)
            }}
            selected={filterMode === 'all'}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              {filterMode === 'all' ? <CheckRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} /> : <Box sx={{ width: 18 }} />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: filterMode === 'all' ? 700 : 500, fontSize: '0.8125rem', color: '#0f172a' }}>
                  Show All Refurbished
                </Typography>
              }
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setFilterMode('available')
              setFilterAnchor(null)
            }}
            selected={filterMode === 'available'}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              {filterMode === 'available' ? <CheckRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} /> : <Box sx={{ width: 18 }} />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: filterMode === 'available' ? 700 : 500, fontSize: '0.8125rem', color: '#0f172a' }}>
                  Available to Claim Only
                </Typography>
              }
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setFilterMode('nearest')
              setFilterAnchor(null)
            }}
            selected={filterMode === 'nearest'}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              {filterMode === 'nearest' ? <CheckRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} /> : <Box sx={{ width: 18 }} />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: filterMode === 'nearest' ? 700 : 500, fontSize: '0.8125rem', color: '#0f172a' }}>
                  Nearest Base Hub First
                </Typography>
              }
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Category Dropdown Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: { xs: '100%', sm: 'auto' } }}>
          <Typography
            sx={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: '#475569',
              whiteSpace: 'nowrap',
            }}
          >
            Category:
          </Typography>
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 320 } }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
              sx={{
                height: 40,
                borderRadius: 2,
                backgroundColor: '#ffffff',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#0f172a',
                textTransform: 'capitalize',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: selectedCategory !== 'All' ? '#0f172a' : '#cbd5e1',
                  borderWidth: selectedCategory !== 'All' ? '1.5px' : '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0f172a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0f172a',
                },
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: 2,
                      maxHeight: 380,
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14)',
                      fontFamily: "'Quicksand', sans-serif",
                      '& .MuiMenuItem-root': {
                        fontSize: '0.8125rem',
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 600,
                        py: 1,
                        textTransform: 'capitalize',
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          fontWeight: 800,
                          color: '#0f172a',
                        },
                      },
                    },
                  },
                },
              }}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'All' ? 'All' : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedCategory !== 'All' && (
          <Button
            size="small"
            onClick={() => setSelectedCategory('All')}
            sx={{
              textTransform: 'none',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#64748b',
              '&:hover': { color: '#0f172a' },
            }}
          >
            Clear Filter
          </Button>
        )}
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
            Choosing reused electronics diverted <strong style={{ color: '#abf06b' }}>{stats.divertedKgThisWeek} kg</strong> of toxic e-waste in Commonwealth this week.
          </Typography>
        </Box>
      </Card>

      {/* Items List */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
        {isLoading ? (
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: '#0f172a' }} />
          </Box>
        ) : displayedItems.length === 0 ? (
          <Card sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, p: 3, textAlign: 'center', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              No items available in this category yet
            </Typography>
            <Typography sx={{ fontFamily: "'Quicksand', sans-serif", fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
              Check back soon as new verified refurbished hardware is added daily.
            </Typography>
          </Card>
        ) : (
          displayedItems.map((item) => (
            <Card
              key={item.id}
              sx={{
                p: 1.75,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition:
                  'border-color 180ms ease, transform 120ms cubic-bezier(0.23, 1, 0.32, 1)',
                '&:active': { transform: 'scale(0.98)' },
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': { borderColor: '#0f172a', transform: 'translateY(-1px)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                  '&:active': { transform: 'none' },
                  '&:hover': { transform: 'none' },
                },
              }}
              onClick={() =>
                navigate(`/reuse/${item.id}`, {
                  state: { reuseItem: item.raw, reuseImage: item.image },
                })
              }
            >
              <Box sx={{ display: 'flex', gap: 1.75 }}>
                {/* Product Thumbnail */}
                <ViewTransition
                  name={`reuse-item-image-${item.id}`}
                  share="eco-shared-morph"
                  default="none"
                >
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
                </ViewTransition>

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
          ))
        )}
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
          List your spare cables, unused screens, or old tablets to support your community in Barangay Commonwealth and reduce e-waste.
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

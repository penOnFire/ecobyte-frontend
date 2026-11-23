import type { FC, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import TabletMacRoundedIcon from '@mui/icons-material/TabletMacRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import PowerRoundedIcon from '@mui/icons-material/PowerRounded'
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import {
  ACCEPTED_CATEGORIES,
  DEVICE_CATEGORY_PILLS,
  MARQUEE_ROW_ONE,
  MARQUEE_ROW_TWO,
  getAuthHref,
} from '@/components/landing/landingData'
import type {
  AcceptedCategoryId,
  CategoryPillIconKey,
  CategoryPillItem,
} from '@/components/landing/landingData'
import type { ReuseItem } from '@/types'

interface DeviceShowcaseSectionProps {
  selectedCategoryId: AcceptedCategoryId
  onSelectCategory: (categoryId: AcceptedCategoryId) => void
  liveReuseItems: ReuseItem[]
}

const renderCategoryIcon = (icon: CategoryPillIconKey, size = 18): ReactNode => {
  switch (icon) {
    case 'laptop':
      return <LaptopMacRoundedIcon sx={{ fontSize: size, color: 'var(--eco-mint-ink)' }} />
    case 'smartphone':
      return <SmartphoneRoundedIcon sx={{ fontSize: size, color: 'var(--eco-mint-ink)' }} />
    case 'tablet':
      return <TabletMacRoundedIcon sx={{ fontSize: size, color: 'var(--eco-mint-ink)' }} />
    case 'keyboard':
      return <KeyboardRoundedIcon sx={{ fontSize: size, color: 'var(--eco-mint-ink)' }} />
    case 'charger':
      return <PowerRoundedIcon sx={{ fontSize: size, color: 'var(--eco-mint-ink)' }} />
    case 'battery':
      return <BatteryAlertRoundedIcon sx={{ fontSize: size, color: '#d97706' }} />
  }
}

export const DeviceShowcaseSection: FC<DeviceShowcaseSectionProps> = ({
  selectedCategoryId,
  onSelectCategory,
  liveReuseItems,
}) => {
  const selectedCategory =
    ACCEPTED_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? ACCEPTED_CATEGORIES[0]

  const matchingLiveItems = liveReuseItems.filter((item) => {
    const haystack = `${item.title} ${item.category}`.toLowerCase()
    return selectedCategory.matchKeywords.some((kw) => haystack.includes(kw))
  })

  const handleCategoryPillClick = (pill: CategoryPillItem) => {
    onSelectCategory(pill.categoryId)
    const targetEl = document.getElementById(pill.targetSectionId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Section 3: Horizontal Device Category Bar */}
      <section aria-label="Device categories" className="eco-category-bar">
        <div className="eco-container">
          <div className="eco-category-list">
            {DEVICE_CATEGORY_PILLS.map((pill) => {
              const isActive = pill.categoryId === selectedCategoryId
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleCategoryPillClick(pill)}
                  className={`eco-category-pill ${isActive ? 'is-active' : ''}`}
                  aria-pressed={isActive}
                >
                  {renderCategoryIcon(pill.icon)}
                  <span>{pill.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Quezon City & Commonwealth Marquee */}
      <section aria-labelledby="commonwealth-network-heading" className="eco-marquee-section">
        <div className="eco-container">
          <Box data-scroll-reveal="header" sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: 4 }}>
            <h2 id="commonwealth-network-heading" className="eco-display-h2">
              Active Across Commonwealth
            </h2>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: 'var(--eco-ink-muted)',
                mt: 1.25,
                lineHeight: 1.6,
              }}
            >
              Nine neighborhood bases, 24/7 Smart Bins, and MRF Central connected in one Barangay
              Commonwealth loop.
            </Typography>
          </Box>
        </div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {/* Row 1: Scrolls Left */}
          <div className="eco-marquee-row">
            <div className="eco-marquee-track eco-marquee-left">
              {MARQUEE_ROW_ONE.map((badge) => (
                <div key={badge.id} className="eco-marquee-badge">
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: 'var(--eco-mint-pill)',
                      color: 'var(--eco-mint-ink)',
                      border: '1px solid var(--eco-border)',
                      borderRadius: '8px',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {badge.zoneTag}
                  </Box>
                  <span>{badge.label}</span>
                </div>
              ))}
              {MARQUEE_ROW_ONE.map((badge) => (
                <div
                  key={`${badge.id}-clone`}
                  className="eco-marquee-badge eco-marquee-clone"
                  aria-hidden="true"
                >
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: 'var(--eco-mint-pill)',
                      color: 'var(--eco-mint-ink)',
                      border: '1px solid var(--eco-border)',
                      borderRadius: '8px',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {badge.zoneTag}
                  </Box>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Scrolls Right */}
          <div className="eco-marquee-row">
            <div className="eco-marquee-track eco-marquee-right">
              {MARQUEE_ROW_TWO.map((badge) => (
                <div key={badge.id} className="eco-marquee-badge">
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'var(--eco-mint-ink)',
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      color: 'var(--eco-ink-muted)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                  >
                    {badge.zoneTag}:
                  </Box>
                  <span>{badge.label}</span>
                </div>
              ))}
              {MARQUEE_ROW_TWO.map((badge) => (
                <div
                  key={`${badge.id}-clone`}
                  className="eco-marquee-badge eco-marquee-clone"
                  aria-hidden="true"
                >
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'var(--eco-mint-ink)',
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      color: 'var(--eco-ink-muted)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                  >
                    {badge.zoneTag}:
                  </Box>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Box>
      </section>

      {/* Section 5: Interactive Accepted E-Waste Categories + 2-Angle Intake Guide */}
      <Box
        component="section"
        id="device-switcher"
        aria-labelledby="device-switcher-heading"
        sx={{
          backgroundColor: 'var(--eco-alabaster)',
          py: { xs: 7, md: 10 },
        }}
      >
        <div id="reuse-hub" />
        <div className="eco-container">
          <Box
            data-scroll-reveal="header"
            sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: { xs: 4.5, md: 6 } }}
          >
            <h2 id="device-switcher-heading" className="eco-display-h2">
              Built for Every Device in Your Drawer
            </h2>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: { xs: '0.975rem', md: '1.0625rem' },
                color: 'var(--eco-ink-muted)',
                mt: 1.5,
                lineHeight: 1.6,
              }}
            >
              Select an accepted e-waste category to see what the 2-angle scan checks, safety
              handling guidance, and available Barangay MRF pathways.
            </Typography>
          </Box>

          <div className="eco-switcher-grid">
            {/* Left Column: 6 Accepted E-Waste Category Selector Cards */}
            <Box
              data-scroll-reveal="stagger-group"
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.35 }}
            >
              {ACCEPTED_CATEGORIES.map((category) => {
                const isSelected = category.id === selectedCategory.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelectCategory(category.id)}
                    aria-pressed={isSelected}
                    className={`eco-card eco-card-interactive eco-stagger-item ${isSelected ? 'is-active' : ''}`}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        border: '1.5px solid var(--eco-border)',
                        flexShrink: 0,
                        backgroundColor: category.isHazardPriority ? '#fef3c7' : '#eef3ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {renderCategoryIcon(category.icon, 24)}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '1.02rem',
                            color: 'var(--eco-ink)',
                          }}
                        >
                          {category.name}
                        </Typography>
                        <StatusBadge
                          label={category.routingOptions}
                          variant={category.badgeVariant}
                          size="sm"
                        />
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: 'var(--eco-ink-muted)',
                          mt: 0.35,
                        }}
                      >
                        {category.examples}
                      </Typography>
                    </Box>
                  </button>
                )
              })}
            </Box>

            {/* Right Column: Re-keyed PhoneFrame showing Real 2-Angle Intake Criteria */}
            <div data-scroll-reveal="phone">
              <PhoneFrame>
                <div
                  key={selectedCategory.id}
                  className="eco-screen-slide-up lang-screen-slide-up"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}
                >
                  {/* Top Status Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#266317' }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#0f172a',
                        }}
                      >
                        2-Angle Intake Guide
                      </Typography>
                    </Box>
                    <StatusBadge
                      label={selectedCategory.isHazardPriority ? 'Hazard Priority' : 'Accepted'}
                      variant={selectedCategory.badgeVariant}
                      size="sm"
                    />
                  </Box>

                  {/* Category Header Card */}
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #dce4dc',
                      borderRadius: '14px',
                      p: 1.35,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: '12px',
                        backgroundColor: selectedCategory.isHazardPriority ? '#fef3c7' : '#eef3ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {renderCategoryIcon(selectedCategory.icon, 24)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Rethink Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.98rem',
                          color: '#0f172a',
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedCategory.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          color: '#475569',
                          mt: 0.25,
                        }}
                      >
                        {selectedCategory.examples}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 2-Angle Scan Checks Card (Front & Back only) */}
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #dce4dc',
                      borderRadius: '14px',
                      p: 1.3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.9,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <CameraAltRoundedIcon sx={{ fontSize: 15, color: '#266317' }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: '#266317',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        2-Angle Scan Checks
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#f6f8f4',
                        borderRadius: '10px',
                        p: 0.9,
                        border: '1px solid #dbe3d6',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          color: '#0F2417',
                        }}
                      >
                        1. Front Angle
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.68rem',
                          color: '#425243',
                          mt: 0.15,
                          lineHeight: 1.35,
                        }}
                      >
                        {selectedCategory.frontScanFocus}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#f6f8f4',
                        borderRadius: '10px',
                        p: 0.9,
                        border: '1px solid #dbe3d6',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          color: '#0F2417',
                        }}
                      >
                        2. Back Angle
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.68rem',
                          color: '#425243',
                          mt: 0.15,
                          lineHeight: 1.35,
                        }}
                      >
                        {selectedCategory.backScanFocus}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Handling & Safety Note */}
                  <Box
                    sx={{
                      backgroundColor: selectedCategory.isHazardPriority ? '#fef3c7' : '#f1f4f0',
                      border: selectedCategory.isHazardPriority
                        ? '1.5px solid #fde68a'
                        : '1.5px solid #c5dcba',
                      borderRadius: '12px',
                      p: 1.15,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.85,
                    }}
                  >
                    <WarningAmberRoundedIcon
                      sx={{
                        fontSize: 16,
                        color: selectedCategory.isHazardPriority ? '#d97706' : '#266317',
                        mt: 0.1,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: '0.6875rem',
                        color: selectedCategory.isHazardPriority ? '#78350f' : '#26431e',
                        lineHeight: 1.35,
                      }}
                    >
                      {selectedCategory.safetyNote}
                    </Typography>
                  </Box>

                  {/* Live Reuse Hub Match Indicator (Real API count only) */}
                  {matchingLiveItems.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dbe3d6',
                        borderRadius: '12px',
                        px: 1.15,
                        py: 0.85,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                        <StorefrontRoundedIcon sx={{ fontSize: 15, color: '#266317' }} />
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            color: '#0F2417',
                          }}
                        >
                          Live in Reuse Hub
                        </Typography>
                      </Box>
                      <Typography
                        className="eco-mono"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          color: '#266317',
                          backgroundColor: '#CEEBC4',
                          px: 0.75,
                          py: 0.15,
                          borderRadius: '6px',
                        }}
                      >
                        {matchingLiveItems.length} available
                      </Typography>
                    </Box>
                  )}

                  {/* In-Phone Action CTA */}
                  <Box sx={{ mt: 'auto', pt: 0.5 }}>
                    <RouterLink
                      to={getAuthHref(selectedCategory.ctaRoute)}
                      className="eco-btn eco-btn-moss eco-btn-sm"
                      style={{ width: '100%' }}
                    >
                      <span>{selectedCategory.ctaLabel}</span>
                      <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </RouterLink>
                  </Box>
                </div>
              </PhoneFrame>
            </div>
          </div>
        </div>
      </Box>
    </>
  )
}

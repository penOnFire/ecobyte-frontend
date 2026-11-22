import type { FC, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import TabletMacRoundedIcon from '@mui/icons-material/TabletMacRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import PowerRoundedIcon from '@mui/icons-material/PowerRounded'
import BatteryAlertRoundedIcon from '@mui/icons-material/BatteryAlertRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import {
  DEVICE_CATEGORY_PILLS,
  MARQUEE_ROW_ONE,
  MARQUEE_ROW_TWO,
  SHOWCASE_DEVICES,
  getAuthHref,
} from '@/components/landing/landingData'
import type {
  CategoryPillIconKey,
  CategoryPillItem,
  ShowcaseDeviceId,
} from '@/components/landing/landingData'

interface DeviceShowcaseSectionProps {
  selectedDeviceId: ShowcaseDeviceId
  onSelectDevice: (deviceId: ShowcaseDeviceId) => void
}

const renderCategoryIcon = (icon: CategoryPillIconKey): ReactNode => {
  switch (icon) {
    case 'laptop':
      return <LaptopMacRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
    case 'smartphone':
      return <SmartphoneRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
    case 'tablet':
      return <TabletMacRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
    case 'keyboard':
      return <KeyboardRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
    case 'charger':
      return <PowerRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
    case 'battery':
      return <BatteryAlertRoundedIcon sx={{ fontSize: 18, color: '#d97706' }} />
  }
}

export const DeviceShowcaseSection: FC<DeviceShowcaseSectionProps> = ({
  selectedDeviceId,
  onSelectDevice,
}) => {
  const selectedDevice =
    SHOWCASE_DEVICES.find((d) => d.id === selectedDeviceId) ?? SHOWCASE_DEVICES[0]

  const handleCategoryPillClick = (pill: CategoryPillItem) => {
    if (pill.deviceId) {
      onSelectDevice(pill.deviceId)
    }
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
              const isActive = pill.deviceId === selectedDeviceId
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleCategoryPillClick(pill)}
                  className={`eco-category-pill ${isActive ? 'is-active' : ''}`}
                  aria-pressed={pill.deviceId ? isActive : undefined}
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

      {/* Section 5: Interactive 5-Device Switcher + Live PhoneFrame */}
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
              Select a household device to preview how EcoByte grades condition, checks battery
              safety, and routes it locally.
            </Typography>
          </Box>

          <div className="eco-switcher-grid">
            {/* Left Column: 5 Tactile Device Selector Cards */}
            <Box
              data-scroll-reveal="stagger-group"
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              {SHOWCASE_DEVICES.map((device) => {
                const isSelected = device.id === selectedDevice.id
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => onSelectDevice(device.id)}
                    aria-pressed={isSelected}
                    className={`eco-card eco-card-interactive eco-stagger-item ${isSelected ? 'is-active' : ''}`}
                  >
                    <Box
                      component="img"
                      src={device.image}
                      alt={device.name}
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '1.5px solid var(--eco-border)',
                        flexShrink: 0,
                        backgroundColor: 'var(--eco-alabaster)',
                      }}
                    />

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
                            fontSize: '1.05rem',
                            color: 'var(--eco-ink)',
                          }}
                        >
                          {device.name}
                        </Typography>
                        <StatusBadge
                          label={device.routingVerdict}
                          variant={device.badgeVariant}
                          size="sm"
                        />
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: 'var(--eco-ink-muted)',
                          mt: 0.25,
                        }}
                      >
                        {device.categoryLabel}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            backgroundColor: isSelected ? 'var(--eco-white)' : 'var(--eco-alabaster)',
                            border: '1px solid var(--eco-border)',
                            borderRadius: '8px',
                            px: 1,
                            py: 0.25,
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: 'var(--eco-ink)',
                          }}
                        >
                          {device.conditionGrade}
                        </Box>
                        <Box
                          component="span"
                          className="eco-mono"
                          sx={{
                            backgroundColor: 'var(--eco-mint-pill)',
                            border: '1px solid var(--eco-border)',
                            borderRadius: '8px',
                            px: 1,
                            py: 0.25,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: 'var(--eco-mint-ink)',
                          }}
                        >
                          {device.ecoPoints}
                        </Box>
                      </Box>
                    </Box>
                  </button>
                )
              })}
            </Box>

            {/* Right Column: Live Re-keyed PhoneFrame */}
            <div data-scroll-reveal="phone">
              <PhoneFrame>
              <div
                key={selectedDevice.id}
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
                    <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#0f172a',
                      }}
                    >
                      Inspection Result
                    </Typography>
                  </Box>
                  <StatusBadge
                    label={selectedDevice.routingVerdict}
                    variant={selectedDevice.badgeVariant}
                    size="sm"
                  />
                </Box>

                {/* Device Photo Viewport */}
                <Box
                  sx={{
                    position: 'relative',
                    height: 152,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '2px solid #dce4dc',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <Box
                    component="img"
                    src={selectedDevice.image}
                    alt={selectedDevice.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {selectedDevice.detailImage && (
                    <Box
                      component="img"
                      src={selectedDevice.detailImage}
                      alt={`${selectedDevice.name} close-up`}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '2px solid #ffffff',
                        boxShadow: '0 4px 10px rgba(15,23,42,0.22)',
                      }}
                    />
                  )}
                </Box>

                {/* Device Title & Condition Card */}
                <Box
                  sx={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #dce4dc',
                    borderRadius: '14px',
                    p: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Rethink Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: '#0f172a',
                    }}
                  >
                    {selectedDevice.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: '#eef3ed',
                        color: '#2d3e2c',
                        borderRadius: '6px',
                        px: 0.9,
                        py: 0.2,
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    >
                      {selectedDevice.conditionGrade}
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: '#475569',
                      }}
                    >
                      {selectedDevice.conditionNote}
                    </Typography>
                  </Box>
                </Box>

                {/* 2-Column Telemetry Tiles */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #dce4dc',
                      borderRadius: '12px',
                      p: 1.25,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        color: '#64748b',
                      }}
                    >
                      Battery Health
                    </Typography>
                    <Typography
                      className="eco-mono"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        color: '#0f172a',
                        mt: 0.4,
                      }}
                    >
                      {selectedDevice.batteryHealth}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        height: 5,
                        borderRadius: 9999,
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        className="eco-battery-fill"
                        sx={{
                          width: `${selectedDevice.batteryPercent}%`,
                          height: '100%',
                          backgroundColor: '#266317',
                          borderRadius: 9999,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: '#f1f4f0',
                      border: '1.5px solid #c5dcba',
                      borderRadius: '12px',
                      p: 1.25,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        color: '#266317',
                      }}
                    >
                      Reward Estimate
                    </Typography>
                    <Typography
                      className="eco-mono"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: '#0F2417',
                        mt: 0.5,
                      }}
                    >
                      {selectedDevice.ecoPoints}
                    </Typography>
                  </Box>
                </Box>

                {/* Recommended Drop-Off Hub Strip */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #dbe3d6',
                    borderRadius: '12px',
                    px: 1.25,
                    py: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#266317' }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#0F2417',
                      }}
                    >
                      {selectedDevice.recommendedHub}
                    </Typography>
                  </Box>
                  <Typography
                    className="eco-mono"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      color: '#266317',
                      backgroundColor: '#CEEBC4',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: '6px',
                    }}
                  >
                    {selectedDevice.hubDistance}
                  </Typography>
                </Box>

                {/* In-Phone Action CTA */}
                <Box sx={{ mt: 'auto', pt: 0.5 }}>
                  <RouterLink
                    to={getAuthHref(selectedDevice.ctaRoute)}
                    className="eco-btn eco-btn-moss eco-btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>{selectedDevice.ctaLabel}</span>
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

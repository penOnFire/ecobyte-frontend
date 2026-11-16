import { useState } from 'react'
import type { FC } from 'react'
import { Box, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink } from 'react-router-dom'
import { StepperTracker } from '@/components/ui/StepperTracker'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import {
  COMMONWEALTH_SHOWCASE_SITES,
  LANDING_ASSETS,
  LANDING_TRACKER_STEPS,
  RECOVERY_LOOP_STEPS,
  SHOWCASE_ANGLE_THUMBS,
  WALKTHROUGH_MODES,
  getAuthHref,
} from '@/components/landing/landingData'
import type { WalkthroughModeId } from '@/components/landing/landingData'

export const FeatureShowcases: FC = () => {
  const [activeWalkthroughTab, setActiveWalkthroughTab] = useState<WalkthroughModeId>('diagnostic')

  const activeMode =
    WALKTHROUGH_MODES.find((m) => m.id === activeWalkthroughTab) ?? WALKTHROUGH_MODES[0]

  return (
    <>
      {/* Section 6: 3 Alternating Feature Showcases with Phone Mockups */}
      <Box
        component="section"
        aria-labelledby="feature-showcases-heading"
        sx={{
          backgroundColor: '#ffffff',
          borderTop: '2px solid #dce4dc',
          py: { xs: 8, md: 11 },
        }}
      >
        <div className="eco-container">
          <Box
            data-scroll-reveal="header"
            sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: { xs: 6, md: 9 } }}
          >
            <h2 id="feature-showcases-heading" className="eco-display-h2">
              Circular Lifecycle as an Experience
            </h2>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: { xs: '0.975rem', md: '1.0625rem' },
                color: '#475569',
                mt: 1.5,
                lineHeight: 1.6,
              }}
            >
              Every stage of EcoByte is built around physical accountability, from guided camera
              diagnostics to neighborhood locker handoffs.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 7, md: 10 } }}>
            {/* Showcase A: 6-Angle AI Device Diagnostic (Phone Left | Copy Right) */}
            <div id="ai-triage" className="eco-showcase-block eco-showcase-block--phone-left">
              <div className="eco-showcase-phone-col" data-scroll-reveal="phone">
                <PhoneFrame>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        className="eco-mono"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#0f172a',
                          backgroundColor: '#eef3ed',
                          px: 1,
                          py: 0.35,
                          borderRadius: '6px',
                        }}
                      >
                        #SCAN-9042
                      </Typography>
                      <StatusBadge label="98.4% Confidence" variant="available" size="sm" />
                    </Box>

                    {/* Dark AI Camera Viewport */}
                    <Box
                      className="eco-reveal-clip"
                      sx={{
                        position: 'relative',
                        height: 138,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        backgroundColor: '#0f172a',
                        border: '1.5px solid #1e293b',
                      }}
                    >
                      <Box
                        component="img"
                        src={LANDING_ASSETS.diagnosticViewImg}
                        alt="6-angle diagnostic camera frame"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.62,
                          display: 'block',
                        }}
                      />
                      <Box
                        component="img"
                        src={LANDING_ASSETS.cameraViewfinderSvg}
                        alt=""
                        aria-hidden="true"
                        sx={{
                          position: 'absolute',
                          inset: '12%',
                          width: '76%',
                          height: '76%',
                          objectFit: 'contain',
                          opacity: 0.85,
                          pointerEvents: 'none',
                        }}
                      />
                      <Box
                        className="eco-mono"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: '#abf06b',
                          color: '#0f172a',
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          px: 1,
                          py: 0.25,
                          borderRadius: '6px',
                        }}
                      >
                        6/6 ANGLES
                      </Box>
                    </Box>

                    {/* 4-Photo Angle Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
                      {SHOWCASE_ANGLE_THUMBS.map((angle) => (
                        <Box
                          key={angle.label}
                          className="eco-stagger-item"
                          sx={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #dce4dc',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            p: 0.4,
                            textAlign: 'center',
                          }}
                        >
                          <Box
                            component="img"
                            src={angle.src}
                            alt={`${angle.label} angle capture`}
                            sx={{
                              width: '100%',
                              height: 44,
                              objectFit: 'cover',
                              borderRadius: '6px',
                              display: 'block',
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 700,
                              fontSize: '0.625rem',
                              color: '#2d3e2c',
                              mt: 0.3,
                            }}
                          >
                            {angle.label} ✓
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Additional Verified Slots Strip */}
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      {['Top View ✓', 'Bottom Serial ✓'].map((slot) => (
                        <Box
                          key={slot}
                          sx={{
                            flex: 1,
                            backgroundColor: '#eef3ed',
                            border: '1px solid #c4d9c0',
                            borderRadius: '8px',
                            py: 0.5,
                            textAlign: 'center',
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.6875rem',
                            color: '#2d3e2c',
                          }}
                        >
                          {slot}
                        </Box>
                      ))}
                    </Box>

                    {/* Amber Lithium Battery Diagnostic Alert */}
                    <Box
                      sx={{
                        mt: 'auto',
                        backgroundColor: '#fef3c7',
                        border: '1.5px solid #fde68a',
                        borderRadius: '12px',
                        p: 1.25,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <WarningAmberRoundedIcon
                        sx={{ fontSize: 18, color: '#d97706', mt: 0.1, flexShrink: 0 }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            color: '#92400e',
                          }}
                        >
                          Lithium Battery Check
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.6875rem',
                            color: '#78350f',
                            lineHeight: 1.35,
                            mt: 0.2,
                          }}
                        >
                          <span className="eco-mono" style={{ fontWeight: 700 }}>
                            68%
                          </span>{' '}
                          capacity detected. Isolate cell before MRF transport.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </PhoneFrame>
              </div>

              <div className="eco-showcase-copy-col" data-scroll-reveal="header">
                <h3 className="eco-display-h3">6-Angle AI Device Diagnostic</h3>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: '0.975rem', md: '1.05rem' },
                    color: '#475569',
                    mt: 1.75,
                    lineHeight: 1.65,
                  }}
                >
                  Snap Front, Back, Left, Right, Top, and Bottom views using guided camera framing.
                  EcoByte checks casing stress, screen integrity, and lithium battery swelling
                  before you walk to a drop-off bin.
                </Typography>

                <Box
                  data-scroll-reveal="stagger-group"
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2.5, mb: 3 }}
                >
                  {[
                    'Guided 6-slot capture covering Front, Back, Left, Right, Top, and Bottom',
                    'Lithium battery swelling and thermal hazard screening',
                    'Instant route recommendation for Reuse, Repair, or Safe Recovery',
                  ].map((item) => (
                    <Box
                      key={item}
                      className="eco-stagger-item"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#4f5f4b', flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: '#0f172a',
                        }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <RouterLink to={getAuthHref('/scan')} className="eco-btn eco-btn-moss">
                  <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Try 6-Angle Scanner</span>
                </RouterLink>
              </div>
            </div>

            {/* Showcase B: Verified Recovery Loop (Copy Left | Phone Right) */}
            <div id="how-it-works" className="eco-showcase-block eco-showcase-block--phone-right">
              <div className="eco-showcase-copy-col">
                <div data-scroll-reveal="header">
                  <h3 className="eco-display-h3">Verified Recovery Loop</h3>
                  <Typography
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      fontSize: { xs: '0.975rem', md: '1.05rem' },
                      color: '#475569',
                      mt: 1.75,
                      lineHeight: 1.65,
                    }}
                  >
                    Every device follows one accountable path from your desk to a verified Barangay
                    Commonwealth facility.
                  </Typography>
                </div>

                <Box
                  data-scroll-reveal="stagger-group"
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}
                >
                  {RECOVERY_LOOP_STEPS.map((step) => (
                    <Box
                      key={step.stepNumber}
                      className="eco-card eco-stagger-item"
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.75,
                      }}
                    >
                      <Box
                        className="eco-mono"
                        sx={{
                          backgroundColor: '#eef3ed',
                          color: '#2d3e2c',
                          border: '1.5px solid #c4d9c0',
                          borderRadius: '10px',
                          px: 1.1,
                          py: 0.6,
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          flexShrink: 0,
                        }}
                      >
                        {step.stepNumber}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '1.025rem',
                            color: '#0f172a',
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#475569',
                            mt: 0.4,
                            lineHeight: 1.55,
                          }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </div>

              <div className="eco-showcase-phone-col" data-scroll-reveal="phone">
                <PhoneFrame>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                    {/* Active Request Header */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '14px',
                        p: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                      }}
                    >
                      <Box
                        component="img"
                        src={LANDING_ASSETS.thinkpadImg}
                        alt="Lenovo ThinkPad T480"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid #dce4dc',
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            className="eco-mono"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#4f5f4b' }}
                          >
                            Req #2041
                          </Typography>
                          <StatusBadge label="Scheduled" variant="active" size="sm" />
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: '#0f172a',
                            mt: 0.2,
                          }}
                        >
                          Lenovo ThinkPad T480
                        </Typography>
                      </Box>
                    </Box>

                    {/* Real StepperTracker Component */}
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
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: '#64748b',
                          mb: 1.25,
                        }}
                      >
                        Recovery Chain Progress
                      </Typography>
                      <StepperTracker steps={LANDING_TRACKER_STEPS} currentStep={3} />
                    </Box>

                    {/* Digital Locker Pass Card */}
                    <Box
                      sx={{
                        mt: 'auto',
                        backgroundColor: '#eef3ed',
                        border: '2px dashed #4f5f4b',
                        borderRadius: '16px',
                        p: 1.75,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            color: '#2d3e2c',
                          }}
                        >
                          Digital Locker Pass
                        </Typography>
                        <StatusBadge label="Reserved" variant="available" size="sm" />
                      </Box>
                      <Typography
                        className="eco-mono"
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.35rem',
                          color: '#0f172a',
                          mt: 0.6,
                          letterSpacing: '0.04em',
                        }}
                      >
                        #ECO-4821
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1,
                          pt: 1,
                          borderTop: '1px solid #c4d9c0',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#2d3e2c',
                          }}
                        >
                          Area 1 Eco-Hub Desk 2
                        </Typography>
                        <Typography
                          className="eco-mono"
                          sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#1a3311' }}
                        >
                          +180 pts
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </PhoneFrame>
              </div>
            </div>

            {/* Showcase C: Commonwealth 9-Area Drop-Off Finder (Phone Left | Copy Right) */}
            <div id="commonwealth-map" className="eco-showcase-block eco-showcase-block--phone-left">
              <div className="eco-showcase-phone-col" data-scroll-reveal="phone">
                <PhoneFrame>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.15, flex: 1 }}>
                    <Box
                      className="eco-reveal-clip"
                      sx={{
                        position: 'relative',
                        height: 118,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1.5px solid #dce4dc',
                        backgroundColor: '#e8f0e6',
                      }}
                    >
                      <Box
                        component="img"
                        src={LANDING_ASSETS.dropoffMapSvg}
                        alt="Barangay Commonwealth 9-Area Drop-Off Map"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>

                    {COMMONWEALTH_SHOWCASE_SITES.map((site) => (
                      <Box
                        key={site.id}
                        className="eco-stagger-item"
                        sx={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #dce4dc',
                          borderRadius: '12px',
                          p: 1.15,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'Rethink Sans', sans-serif",
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                              color: '#0f172a',
                              lineHeight: 1.25,
                            }}
                          >
                            {site.name}
                          </Typography>
                          <Box
                            component="span"
                            className="eco-mono"
                            sx={{
                              backgroundColor: '#eef3ed',
                              color: '#2d3e2c',
                              borderRadius: '6px',
                              px: 0.75,
                              py: 0.2,
                              fontWeight: 700,
                              fontSize: '0.6875rem',
                              flexShrink: 0,
                            }}
                          >
                            {site.distance}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6, flexWrap: 'wrap' }}>
                          <Typography
                            sx={{
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 600,
                              fontSize: '0.6875rem',
                              color: '#475569',
                            }}
                          >
                            {site.hours}
                          </Typography>
                          <Box
                            component="span"
                            sx={{
                              backgroundColor: '#e8ffbf',
                              color: '#1a3311',
                              borderRadius: '6px',
                              px: 0.75,
                              py: 0.15,
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 700,
                              fontSize: '0.65rem',
                            }}
                          >
                            {site.accessType}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </PhoneFrame>
              </div>

              <div className="eco-showcase-copy-col" data-scroll-reveal="header">
                <h3 className="eco-display-h3">Commonwealth 9-Area Drop-Off Finder</h3>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: '0.975rem', md: '1.05rem' },
                    color: '#475569',
                    mt: 1.75,
                    mb: 3,
                    lineHeight: 1.65,
                  }}
                >
                  Filter staffed Material Recovery Facilities and 24/7 Smart Bins across all nine
                  Barangay Commonwealth clusters, sorted by distance and hazardous-battery
                  accreditation.
                </Typography>

                <RouterLink to={getAuthHref('/drop-offs')} className="eco-btn eco-btn-white">
                  <MapRoundedIcon sx={{ fontSize: 18, color: '#4f5f4b' }} />
                  <span>Open Live Drop-Off Map</span>
                </RouterLink>
              </div>
            </div>
          </Box>
        </div>
      </Box>

      {/* Section 7: Interactive In-Phone Walkthrough */}
      <Box
        component="section"
        aria-labelledby="walkthrough-heading"
        sx={{
          backgroundColor: '#eef3ed',
          borderTop: '2px solid #dce4dc',
          borderBottom: '2px solid #dce4dc',
          py: { xs: 8, md: 10 },
        }}
      >
        <div className="eco-container">
          <Box data-scroll-reveal="header" sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: 4 }}>
            <h2 id="walkthrough-heading" className="eco-display-h2">
              Everything Happens in One Neighborhood Loop
            </h2>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: { xs: '0.975rem', md: '1.05rem' },
                color: '#475569',
                mt: 1.5,
                lineHeight: 1.6,
              }}
            >
              Switch views to inspect the diagnostic report, digital pickup pass, and nearest
              Commonwealth drop-off station.
            </Typography>
          </Box>

          {/* 3 Interactive Mode Tabs */}
          <div
            data-scroll-reveal="header"
            className="eco-walkthrough-tabs"
            role="tablist"
            aria-label="Walkthrough screens"
          >
            {WALKTHROUGH_MODES.map((mode) => {
              const isSelected = mode.id === activeWalkthroughTab
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveWalkthroughTab(mode.id)}
                  className={`eco-walkthrough-tab ${isSelected ? 'is-active' : ''}`}
                >
                  {mode.tabLabel}
                </button>
              )
            })}
          </div>

          <div className="eco-walkthrough-grid" data-scroll-reveal="phone">
            {/* Re-keyed PhoneFrame */}
            <PhoneFrame>
              <div
                key={activeWalkthroughTab}
                className="eco-screen-slide-up lang-screen-slide-up"
                style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}
              >
                {activeWalkthroughTab === 'diagnostic' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        className="eco-mono"
                        sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}
                      >
                        #SCAN-9042
                      </Typography>
                      <StatusBadge label="6/6 Angles Verified" variant="available" size="sm" />
                    </Box>

                    <Box
                      component="img"
                      src={LANDING_ASSETS.diagnosticViewImg}
                      alt="Diagnostic scan preview"
                      sx={{
                        width: '100%',
                        height: 156,
                        objectFit: 'cover',
                        borderRadius: '14px',
                        border: '1.5px solid #dce4dc',
                      }}
                    />

                    <Box
                      sx={{
                        backgroundColor: '#fef3c7',
                        border: '1.5px solid #fde68a',
                        borderRadius: '12px',
                        p: 1.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#92400e',
                        }}
                      >
                        Battery Telemetry Alert
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.72rem',
                          color: '#78350f',
                          mt: 0.4,
                        }}
                      >
                        Cell capacity at{' '}
                        <span className="eco-mono" style={{ fontWeight: 700 }}>
                          68%
                        </span>
                        . Assigned to isolated MRF battery tray.
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <RouterLink
                        to={getAuthHref('/diagnostic')}
                        className="eco-btn eco-btn-moss eco-btn-sm"
                        style={{ width: '100%' }}
                      >
                        Route to Safe Recovery
                      </RouterLink>
                    </Box>
                  </>
                )}

                {activeWalkthroughTab === 'pass' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#0f172a',
                        }}
                      >
                        Reuse Claim Pass
                      </Typography>
                      <StatusBadge label="Reserved" variant="available" size="sm" />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '14px',
                        p: 1.15,
                      }}
                    >
                      <Box
                        component="img"
                        src={LANDING_ASSETS.keychronImg}
                        alt="Keychron K2 V2"
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: '10px',
                          objectFit: 'cover',
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: '#0f172a',
                          }}
                        >
                          Keychron K2 V2
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            color: '#475569',
                          }}
                        >
                          Barangay Commonwealth MRF Desk 2
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#eef3ed',
                        border: '2px dashed #4f5f4b',
                        borderRadius: '16px',
                        p: 1.75,
                        textAlign: 'center',
                      }}
                    >
                      <QrCode2RoundedIcon sx={{ fontSize: 56, color: '#0f172a' }} />
                      <Typography
                        className="eco-mono"
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.35rem',
                          color: '#0f172a',
                          letterSpacing: '0.06em',
                          mt: 0.4,
                        }}
                      >
                        ECO-4821
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <RouterLink
                        to={getAuthHref('/reservation-code')}
                        className="eco-btn eco-btn-moss eco-btn-sm"
                        style={{ width: '100%' }}
                      >
                        Open Reservation Pass
                      </RouterLink>
                    </Box>
                  </>
                )}

                {activeWalkthroughTab === 'dropoff' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <StatusBadge label="All Sites (9)" variant="slate" size="sm" />
                      <StatusBadge label="24/7 Smart Bin" variant="green-pill" size="sm" />
                    </Box>

                    <Box
                      component="img"
                      src={LANDING_ASSETS.dropoffMapSvg}
                      alt="Commonwealth drop-off stations map"
                      sx={{
                        width: '100%',
                        height: 132,
                        objectFit: 'cover',
                        borderRadius: '14px',
                        border: '1.5px solid #dce4dc',
                      }}
                    />

                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '12px',
                        p: 1.15,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            color: '#0f172a',
                          }}
                        >
                          Area 1 Eco-Hub
                        </Typography>
                        <StatusBadge label="Open Now" variant="available" size="sm" />
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          color: '#475569',
                          mt: 0.3,
                        }}
                      >
                        Katuparan St, Barangay Hall Complex
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '12px',
                        p: 1.15,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#4f5f4b' }} />
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#0f172a',
                          }}
                        >
                          Area 4 Litex Smart Bin
                        </Typography>
                      </Box>
                      <Typography
                        className="eco-mono"
                        sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#4f5f4b' }}
                      >
                        24/7
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <RouterLink
                        to={getAuthHref('/drop-offs')}
                        className="eco-btn eco-btn-moss eco-btn-sm"
                        style={{ width: '100%' }}
                      >
                        Browse All 9 Areas
                      </RouterLink>
                    </Box>
                  </>
                )}
              </div>
            </PhoneFrame>

            {/* Companion Context Card */}
            <Box className="eco-card" sx={{ p: { xs: 3, md: 4 } }}>
              <h3 className="eco-display-h3">{activeMode.title}</h3>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.975rem',
                  color: '#475569',
                  mt: 1.5,
                  lineHeight: 1.65,
                }}
              >
                {activeMode.summary}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2.5, mb: 3 }}>
                {activeMode.highlights.map((pt) => (
                  <Box key={pt} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 19, color: '#4f5f4b', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#0f172a',
                      }}
                    >
                      {pt}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <RouterLink to={getAuthHref(activeMode.ctaRoute)} className="eco-btn eco-btn-moss">
                <span>{activeMode.ctaLabel}</span>
                <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
              </RouterLink>
            </Box>
          </div>
        </div>
      </Box>
    </>
  )
}

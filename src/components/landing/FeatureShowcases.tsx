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
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import { Link as RouterLink } from 'react-router-dom'
import { StepperTracker } from '@/components/ui/StepperTracker'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { CommonwealthHeaderMap } from '@/components/map/CommonwealthHeaderMap'
import {
  LANDING_TRACKER_STEPS,
  RECOVERY_LOOP_STEPS,
  SCAN_TWO_ANGLES,
  WALKTHROUGH_MODES,
  getAuthHref,
} from '@/components/landing/landingData'
import type { LandingSiteSummary, WalkthroughModeId } from '@/components/landing/landingData'
import { resolveMediaUrl } from '@/lib/api'
import type { ReuseItem } from '@/types'

interface FeatureShowcasesProps {
  liveReuseItems: ReuseItem[]
  liveSites: LandingSiteSummary[]
}

export const FeatureShowcases: FC<FeatureShowcasesProps> = ({ liveReuseItems, liveSites }) => {
  const [activeWalkthroughTab, setActiveWalkthroughTab] = useState<WalkthroughModeId>('diagnostic')

  const activeMode =
    WALKTHROUGH_MODES.find((m) => m.id === activeWalkthroughTab) ?? WALKTHROUGH_MODES[0]

  const previewSites = liveSites.slice(0, 3)
  const featuredLiveItem = liveReuseItems[0] ?? null
  const featuredLiveImg = featuredLiveItem?.imageUrl
    ? resolveMediaUrl(featuredLiveItem.imageUrl)
    : undefined

  return (
    <>
      {/* Section 6: 3 Alternating Feature Showcases with Phone Mockups */}
      <Box
        component="section"
        aria-labelledby="feature-showcases-heading"
        sx={{
          backgroundColor: 'var(--eco-white)',
          borderTop: '2px solid var(--eco-border)',
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
                color: 'var(--eco-ink-muted)',
                mt: 1.5,
                lineHeight: 1.6,
              }}
            >
              Every stage of EcoByte is built around physical accountability, from guided 2-angle
              diagnostics to neighborhood hub handoffs.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 7, md: 10 } }}>
            {/* Showcase A: 2-Angle AI Device Diagnostic (Phone Left | Copy Right) */}
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
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#0f172a',
                          backgroundColor: '#eef3ed',
                          px: 1,
                          py: 0.35,
                          borderRadius: '6px',
                        }}
                      >
                        Guided Scanner
                      </Typography>
                      <StatusBadge label="2-Angle Scan" variant="available" size="sm" />
                    </Box>

                    {/* Clean Dark Camera Viewfinder Mock (no fake photo or fake score) */}
                    <Box
                      className="eco-reveal-clip"
                      sx={{
                        position: 'relative',
                        height: 136,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #0F2417 0%, #183321 100%)',
                        border: '1.5px solid #24462f',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.75,
                      }}
                    >
                      {/* Viewfinder Corner Reticles */}
                      <Box
                        aria-hidden="true"
                        sx={{
                          position: 'absolute',
                          inset: 14,
                          border: '1.5px dashed rgba(171, 240, 107, 0.45)',
                          borderRadius: '10px',
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
                        2 ANGLES
                      </Box>
                      <CameraAltRoundedIcon sx={{ fontSize: 30, color: '#abf06b' }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: '#ffffff',
                        }}
                      >
                        Align Front &amp; Back Inside Frame
                      </Typography>
                    </Box>

                    {/* 2-Angle Capture Grid (Front & Back ONLY) */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                      {SCAN_TWO_ANGLES.map((angle, idx) => (
                        <Box
                          key={angle.id}
                          className="eco-stagger-item"
                          sx={{
                            backgroundColor: '#ffffff',
                            border: '1.5px solid #dce4dc',
                            borderRadius: '12px',
                            p: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 0.4,
                            }}
                          >
                            <Typography
                              className="eco-mono"
                              sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#266317' }}
                            >
                              0{idx + 1}
                            </Typography>
                            <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#266317' }} />
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: "'Rethink Sans', sans-serif",
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              color: '#0F2417',
                            }}
                          >
                            {angle.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: '0.64rem',
                              color: '#596556',
                              lineHeight: 1.3,
                              mt: 0.2,
                            }}
                          >
                            {angle.detail}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Battery Hazard Screening Banner (no fake percentage) */}
                    <Box
                      sx={{
                        mt: 'auto',
                        backgroundColor: '#fef3c7',
                        border: '1.5px solid #fde68a',
                        borderRadius: '12px',
                        p: 1.2,
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
                          Lithium Battery Safety Check
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
                          Swollen or leaking cells are flagged early for isolated Barangay MRF
                          drop-off.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </PhoneFrame>
              </div>

              <div className="eco-showcase-copy-col" data-scroll-reveal="header">
                <h3 className="eco-display-h3">2-Angle AI Device Diagnostic</h3>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: '0.975rem', md: '1.05rem' },
                    color: 'var(--eco-ink-muted)',
                    mt: 1.75,
                    lineHeight: 1.65,
                  }}
                >
                  Snap Front and Back views using guided camera framing and answer a quick
                  condition checklist. EcoByte screens for visible damage and lithium battery
                  swelling before you head to a drop-off base.
                </Typography>

                <Box
                  data-scroll-reveal="stagger-group"
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2.5, mb: 3 }}
                >
                  {[
                    'Guided 2-angle capture covering Front and Back views',
                    'Lithium battery swelling and thermal hazard screening',
                    'Stage 1 route recommendation for Reuse, Repair, or Safe Drop-Off',
                  ].map((item) => (
                    <Box
                      key={item}
                      className="eco-stagger-item"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'var(--eco-mint-ink)', flexShrink: 0 }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--eco-ink)',
                        }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <RouterLink to={getAuthHref('/scan')} className="eco-btn eco-btn-moss">
                  <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Try 2-Angle Scanner</span>
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
                      color: 'var(--eco-ink-muted)',
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
                          backgroundColor: 'var(--eco-mint-pill)',
                          color: 'var(--eco-mint-ink)',
                          border: '1.5px solid var(--eco-border)',
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
                            color: 'var(--eco-ink)',
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: 'var(--eco-ink-muted)',
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
                    {/* Structural Request Tracking Header (zero fake request ID or fake device) */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '14px',
                        p: 1.35,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.15,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          backgroundColor: '#eef3ed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AssignmentTurnedInRoundedIcon sx={{ fontSize: 21, color: '#266317' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            sx={{
                              fontFamily: "'Rethink Sans', sans-serif",
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              color: '#0f172a',
                            }}
                          >
                            Tracked Drop-Off Record
                          </Typography>
                          <StatusBadge label="Verified" variant="active" size="sm" />
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            color: '#475569',
                            mt: 0.35,
                            lineHeight: 1.4,
                          }}
                        >
                          Every scheduled turn-over is logged under your resident account with base
                          and schedule details.
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
                        5-Stage Recovery Chain
                      </Typography>
                      <StepperTracker steps={LANDING_TRACKER_STEPS} currentStep={1} />
                    </Box>

                    {/* Structural Digital Pickup Pass Card (no fake pass ID or fake points) */}
                    <Box
                      sx={{
                        mt: 'auto',
                        backgroundColor: '#f1f4f0',
                        border: '2px dashed #266317',
                        borderRadius: '16px',
                        p: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 0.75,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            color: '#266317',
                          }}
                        >
                          Digital Pickup Pass
                        </Typography>
                        <StatusBadge label="48-Hour Hold" variant="available" size="sm" />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15 }}>
                        <QrCode2RoundedIcon sx={{ fontSize: 38, color: '#0F2417', flexShrink: 0 }} />
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            color: '#26431e',
                            lineHeight: 1.4,
                          }}
                        >
                          A unique verification code is issued when you reserve an available Reuse
                          Hub item for barangay desk pickup.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </PhoneFrame>
              </div>
            </div>

            {/* Showcase C: Commonwealth 9-Base Drop-Off Finder (Phone Left | Copy Right) */}
            <div id="commonwealth-map" className="eco-showcase-block eco-showcase-block--phone-left">
              <div className="eco-showcase-phone-col" data-scroll-reveal="phone">
                <PhoneFrame>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.15, flex: 1 }}>
                    {/* Real Interactive Barangay Commonwealth Vector Map */}
                    <Box
                      className="eco-reveal-clip"
                      sx={{
                        position: 'relative',
                        height: 132,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1.5px solid #dce4dc',
                        backgroundColor: '#0a140d',
                      }}
                    >
                      <CommonwealthHeaderMap userBaseNumber={1} variant="card" />
                    </Box>

                    {previewSites.map((site) => (
                      <Box
                        key={site.id}
                        className="eco-stagger-item"
                        sx={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #dce4dc',
                          borderRadius: '12px',
                          p: 1.1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            color: '#0f172a',
                            lineHeight: 1.25,
                          }}
                        >
                          {site.name}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 0.75,
                            mt: 0.55,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 600,
                              fontSize: '0.68rem',
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
                              fontSize: '0.64rem',
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
                <h3 className="eco-display-h3">Commonwealth 9-Base Drop-Off Finder</h3>
                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: '0.975rem', md: '1.05rem' },
                    color: 'var(--eco-ink-muted)',
                    mt: 1.75,
                    mb: 3,
                    lineHeight: 1.65,
                  }}
                >
                  Explore staffed Material Recovery Facilities and 24/7 Smart Bins across all nine
                  Barangay Commonwealth bases, filtered by Open Now, Staffed desk, or 24/7 Smart
                  Bin access.
                </Typography>

                <RouterLink to={getAuthHref('/drop-offs')} className="eco-btn eco-btn-white">
                  <MapRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
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
          backgroundColor: 'var(--eco-moss-tint)',
          borderTop: '2px solid var(--eco-border)',
          borderBottom: '2px solid var(--eco-border)',
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
                color: 'var(--eco-ink-muted)',
                mt: 1.5,
                lineHeight: 1.6,
              }}
            >
              Switch views to preview the 2-angle diagnostic workflow, digital pickup pass, and
              Barangay Commonwealth drop-off directory.
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
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: '#0f172a',
                        }}
                      >
                        Stage 1 Triage
                      </Typography>
                      <StatusBadge label="2 Angles: Front & Back" variant="available" size="sm" />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      {SCAN_TWO_ANGLES.map((angle) => (
                        <Box
                          key={angle.id}
                          sx={{
                            backgroundColor: '#ffffff',
                            border: '1.5px solid #dce4dc',
                            borderRadius: '12px',
                            p: 1.15,
                            textAlign: 'center',
                          }}
                        >
                          <CameraAltRoundedIcon sx={{ fontSize: 22, color: '#266317', mb: 0.4 }} />
                          <Typography
                            sx={{
                              fontFamily: "'Rethink Sans', sans-serif",
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              color: '#0F2417',
                            }}
                          >
                            {angle.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.64rem',
                              color: '#596556',
                              mt: 0.2,
                            }}
                          >
                            {angle.detail}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '12px',
                        p: 1.15,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: '#0F2417',
                          mb: 0.5,
                        }}
                      >
                        Guided Condition Checklist
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.68rem',
                          color: '#475569',
                          lineHeight: 1.4,
                        }}
                      >
                        Power state, display glass, port condition, visible damage, and missing
                        parts are combined for your triage result.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#fef3c7',
                        border: '1.5px solid #fde68a',
                        borderRadius: '12px',
                        p: 1.15,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          color: '#92400e',
                        }}
                      >
                        Battery Safety Routing
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          color: '#78350f',
                          mt: 0.3,
                          lineHeight: 1.35,
                        }}
                      >
                        Flags high-risk lithium damage for isolated MRF drop-off before transport.
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <RouterLink
                        to={getAuthHref('/scan')}
                        className="eco-btn eco-btn-moss eco-btn-sm"
                        style={{ width: '100%' }}
                      >
                        Start 2-Angle Scan
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
                      <StatusBadge label="Resident-Locked" variant="available" size="sm" />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.15,
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '14px',
                        p: 1.15,
                      }}
                    >
                      {featuredLiveImg ? (
                        <Box
                          component="img"
                          src={featuredLiveImg}
                          alt={featuredLiveItem?.title || 'Verified Reuse Item'}
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '10px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '10px',
                            backgroundColor: '#eef3ed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <StorefrontRoundedIcon sx={{ fontSize: 22, color: '#266317' }} />
                        </Box>
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            color: '#0f172a',
                          }}
                        >
                          {featuredLiveItem ? featuredLiveItem.title : 'MRF-Verified Hardware'}
                        </Typography>
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            color: '#425243',
                          }}
                        >
                          {featuredLiveItem?.location || 'Barangay Commonwealth Eco-Hubs'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#f1f4f0',
                        border: '2px dashed #266317',
                        borderRadius: '16px',
                        p: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <QrCode2RoundedIcon sx={{ fontSize: 52, color: '#0F2417' }} />
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: '#0F2417',
                          mt: 0.4,
                        }}
                      >
                        Unique Code Issued on Reservation
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.68rem',
                          color: '#425243',
                          mt: 0.2,
                        }}
                      >
                        48-hour hold window with desk identity check
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <RouterLink
                        to={getAuthHref('/reuse')}
                        className="eco-btn eco-btn-moss eco-btn-sm"
                        style={{ width: '100%' }}
                      >
                        Browse Reuse Hub
                      </RouterLink>
                    </Box>
                  </>
                )}

                {activeWalkthroughTab === 'dropoff' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <StatusBadge label={`All Sites (${liveSites.length})`} variant="slate" size="sm" />
                      <StatusBadge label="24/7 Smart Bin" variant="green-pill" size="sm" />
                    </Box>

                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 132,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1.5px solid #dbe3d6',
                        backgroundColor: '#0a140d',
                      }}
                    >
                      <CommonwealthHeaderMap userBaseNumber={1} variant="card" />
                    </Box>

                    {liveSites.slice(0, 2).map((site) => (
                      <Box
                        key={site.id}
                        sx={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #dbe3d6',
                          borderRadius: '12px',
                          p: 1.05,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                            <LocationOnRoundedIcon
                              sx={{ fontSize: 15, color: '#266317', flexShrink: 0 }}
                            />
                            <Typography
                              noWrap
                              sx={{
                                fontFamily: "'Rethink Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                color: '#0F2417',
                              }}
                            >
                              {site.name}
                            </Typography>
                          </Box>
                          <Typography
                            className="eco-mono"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.64rem',
                              color: '#266317',
                              flexShrink: 0,
                            }}
                          >
                            {site.accessType === '24/7 Smart Bin' ? '24/7' : 'Staffed'}
                          </Typography>
                        </Box>
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            color: '#425243',
                            mt: 0.25,
                          }}
                        >
                          {site.address}
                        </Typography>
                      </Box>
                    ))}

                    <Box sx={{ mt: 'auto' }}>
                      <RouterLink
                        to={getAuthHref('/drop-offs')}
                        className="eco-btn eco-btn-moss eco-btn-sm"
                        style={{ width: '100%' }}
                      >
                        Browse All {liveSites.length} Bases
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
                  color: 'var(--eco-ink-muted)',
                  mt: 1.5,
                  lineHeight: 1.65,
                }}
              >
                {activeMode.summary}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2.5, mb: 3 }}>
                {activeMode.highlights.map((pt) => (
                  <Box key={pt} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 19, color: 'var(--eco-mint-ink)', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--eco-ink)',
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

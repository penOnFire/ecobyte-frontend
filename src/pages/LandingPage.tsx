import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Box, Typography } from '@mui/material'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import { Link as RouterLink } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StepperTracker } from '@/components/ui/StepperTracker'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroScenicIllustration } from '@/components/landing/HeroScenicIllustration'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { DeviceShowcaseSection } from '@/components/landing/DeviceShowcaseSection'
import { FeatureShowcases } from '@/components/landing/FeatureShowcases'
import { PilotAndFooterSection } from '@/components/landing/PilotAndFooterSection'
import {
  DEFAULT_COMMONWEALTH_SITES,
  LANDING_ASSETS,
  LANDING_TRACKER_STEPS,
  SCAN_TWO_ANGLES,
  getAuthHref,
} from '@/components/landing/landingData'
import type { AcceptedCategoryId, LandingSiteSummary } from '@/components/landing/landingData'
import { dropoffsApi, resolveMediaUrl, reuseApi } from '@/lib/api'
import type { ReuseItem } from '@/types'
import '@/components/landing/landing.css'

export const LandingPage: FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<AcceptedCategoryId>('laptops')
  const [liveReuseItems, setLiveReuseItems] = useState<ReuseItem[]>([])
  const [liveSites, setLiveSites] = useState<LandingSiteSummary[]>(DEFAULT_COMMONWEALTH_SITES)

  // Fetch public live Reuse Hub listings and Barangay drop-off stations (no fake fallback records)
  useEffect(() => {
    let active = true

    reuseApi
      .getItems()
      .then((res) => {
        if (!active || !res) return
        if (Array.isArray(res.items)) {
          setLiveReuseItems(res.items)
        }
      })
      .catch(() => {
        // Keep empty state cleanly if API is unreachable
      })

    dropoffsApi
      .getSites()
      .then((sites) => {
        if (!active || !Array.isArray(sites) || sites.length === 0) return
        setLiveSites(
          sites.map((site) => ({
            id: site.id,
            name: site.name,
            address: site.address,
            hours: site.hours,
            accessType: site.type,
            isOpen: site.isOpen,
          })),
        )
      })
      .catch(() => {
        // Retain official Barangay Commonwealth base directory
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.eco-landing-root')
    const remaining = new Set(
      Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-reveal]')),
    )
    if (remaining.size === 0) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      remaining.forEach((el) => el.setAttribute('data-visible', 'true'))
      return
    }

    // Opt into scroll-reveal hiding only when JS + IntersectionObserver are active
    root?.classList.add('eco-reveal-ready')

    let observer: IntersectionObserver | null = null

    const markVisible = (el: HTMLElement) => {
      el.setAttribute('data-visible', 'true')
      remaining.delete(el)
      observer?.unobserve(el)
      if (remaining.size === 0) {
        window.removeEventListener('scroll', onScroll)
        observer?.disconnect()
      }
    }

    const revealPassedElements = () => {
      const triggerY = window.innerHeight - 40
      remaining.forEach((el) => {
        if (el.getBoundingClientRect().top <= triggerY) {
          markVisible(el)
        }
      })
    }

    let rafId = 0
    const onScroll = () => {
      if (rafId !== 0) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        revealPassedElements()
      })
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight - 40) {
            markVisible(entry.target as HTMLElement)
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      },
    )

    remaining.forEach((el) => observer?.observe(el))
    window.addEventListener('scroll', onScroll, { passive: true })
    revealPassedElements()

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
      root?.classList.remove('eco-reveal-ready')
    }
  }, [])

  const featuredLiveItem = liveReuseItems[0] ?? null
  const featuredLiveImg = featuredLiveItem?.imageUrl
    ? resolveMediaUrl(featuredLiveItem.imageUrl)
    : undefined

  return (
    <Box className="eco-landing-root">
      <LandingNavbar />

      <Box component="main">
        {/* Section 2: Scenic Illustrated Hero + Rising Phone Mockup */}
        <header id="top" className="eco-hero">
          <HeroScenicIllustration />

          <div className="eco-container">
            <div className="eco-hero-grid">
              {/* Left Column: Headline, Subcopy, Tactile 3D CTAs & Barangay Badge */}
              <div className="eco-hero-copy">
                <h1 className="eco-display-h1 eco-hero-enter-1">
                  Give Old Tech
                  <br />A Second Life.
                </h1>

                <Typography
                  className="eco-hero-enter-2 eco-hero-description"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: 'clamp(1rem, 1.5vw, 1.1875rem)',
                    lineHeight: 1.6,
                    color: 'var(--eco-ink-muted)',
                    maxWidth: 540,
                    mt: 2.5,
                  }}
                >
                  Scan your device in two guided angles (Front and Back), screen for battery
                  safety in seconds, and drop it off or claim verified working gear across Barangay
                  Commonwealth.
                </Typography>

                {/* Primary 3D Action Row & Inline Sign In Link */}
                <div className="eco-hero-enter-3">
                  <Box
                    className="eco-hero-actions"
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1.75,
                      mt: 3.5,
                    }}
                  >
                    <RouterLink to={getAuthHref('/scan')} className="eco-btn eco-btn-lime eco-btn-lg">
                      <CameraAltRoundedIcon sx={{ fontSize: 20 }} />
                      <span>Start 2-Angle Scan</span>
                    </RouterLink>
                    <RouterLink to={getAuthHref('/reuse')} className="eco-btn eco-btn-white eco-btn-lg">
                      <StorefrontRoundedIcon sx={{ fontSize: 20, color: 'var(--eco-mint-ink)' }} />
                      <span>Browse Reuse Hub</span>
                    </RouterLink>
                  </Box>

                  {/* Secondary Inline Sign In Link */}
                  <Box className="eco-hero-signin" sx={{ mt: 2 }}>
                    <RouterLink
                      to="/signin"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--eco-mint-ink)',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Already have an account? Sign In</span>
                      <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </RouterLink>
                  </Box>
                </div>

                {/* Official Barangay Coverage Pill (no fake device thumbnails) */}
                <Box
                  className="eco-hero-enter-4 eco-hero-coverage"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 3.5,
                    px: 1.75,
                    py: 0.9,
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    border: '1.5px solid var(--eco-border)',
                  }}
                >
                  <LocationOnRoundedIcon sx={{ fontSize: 18, color: 'var(--eco-mint-ink)' }} />
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'var(--eco-ink)',
                    }}
                  >
                    9 Barangay Bases serving Barangay Commonwealth, Quezon City
                  </Typography>
                </Box>
              </div>

              {/* Right Column: Rising Phone Mockup (Workflow + Live Reuse Hub, zero fake records) */}
              <div className="eco-hero-phone">
                <PhoneFrame dockedBottom animateRise>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                    {/* Phone Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pb: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9 }}>
                        <Box
                          component="img"
                          src={LANDING_ASSETS.ecobyteLogo}
                          alt="EcoByte"
                          sx={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#0F2417',
                          }}
                        >
                          Commonwealth Hub
                        </Typography>
                      </Box>
                      <StatusBadge
                        label={
                          liveReuseItems.length > 0
                            ? `${liveReuseItems.length} Live in Hub`
                            : 'Bases 1–9'
                        }
                        variant="green-pill"
                        size="sm"
                      />
                    </Box>

                    {/* Card 1: 2-Angle Scan Workflow Card */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dbe3d6',
                        borderRadius: '14px',
                        p: 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#0F2417',
                          }}
                        >
                          2-Angle Guided Scan
                        </Typography>
                        <StatusBadge label="Front & Back" variant="available" size="sm" />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                        {SCAN_TWO_ANGLES.map((slot) => (
                          <Box
                            key={slot.id}
                            sx={{
                              backgroundColor: '#f6f8f4',
                              border: '1px dashed #b6c6af',
                              borderRadius: '10px',
                              p: 0.9,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75,
                            }}
                          >
                            <CameraAltRoundedIcon
                              sx={{ fontSize: 16, color: '#266317', flexShrink: 0 }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontFamily: "'Quicksand', sans-serif",
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  color: '#0F2417',
                                  lineHeight: 1.15,
                                }}
                              >
                                {slot.label}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: 500,
                                  fontSize: '0.62rem',
                                  color: '#596556',
                                  lineHeight: 1.2,
                                }}
                              >
                                Required
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Card 2: Live Community Reuse Hub Card (Real API item or honest empty state) */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dbe3d6',
                        borderRadius: '14px',
                        p: 1.25,
                      }}
                    >
                      {featuredLiveItem ? (
                        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                          {featuredLiveImg ? (
                            <Box
                              component="img"
                              src={featuredLiveImg}
                              alt={featuredLiveItem.title}
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: '10px',
                                objectFit: 'cover',
                                border: '1px solid #dbe3d6',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: '10px',
                                backgroundColor: '#eef3ed',
                                border: '1px solid #dbe3d6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <StorefrontRoundedIcon sx={{ fontSize: 22, color: '#266317' }} />
                            </Box>
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Typography
                                noWrap
                                sx={{
                                  fontFamily: "'Rethink Sans', sans-serif",
                                  fontWeight: 800,
                                  fontSize: '0.86rem',
                                  color: '#0F2417',
                                }}
                              >
                                {featuredLiveItem.title}
                              </Typography>
                              <StatusBadge label="Available" variant="available" size="sm" />
                            </Box>
                            <Typography
                              noWrap
                              sx={{
                                fontFamily: "'Quicksand', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                color: '#425243',
                                mt: 0.25,
                              }}
                            >
                              {featuredLiveItem.condition || featuredLiveItem.category}
                              {featuredLiveItem.location ? ` • ${featuredLiveItem.location}` : ''}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1.15, alignItems: 'flex-start' }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              backgroundColor: '#eef3ed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <VerifiedRoundedIcon sx={{ fontSize: 20, color: '#266317' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: "'Rethink Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                color: '#0F2417',
                              }}
                            >
                              Community Reuse Hub
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "'Quicksand', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                color: '#425243',
                                mt: 0.25,
                                lineHeight: 1.4,
                              }}
                            >
                              MRF-verified electronics appear here as residents turn in working
                              devices.
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Card 3: 5-Stage Drop-Off Lifecycle Legend */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dbe3d6',
                        borderRadius: '14px',
                        p: 1.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          color: '#596556',
                          mb: 1,
                        }}
                      >
                        5-Stage Drop-Off Lifecycle
                      </Typography>
                      <StepperTracker steps={LANDING_TRACKER_STEPS} currentStep={1} />
                    </Box>
                  </Box>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </header>

        {/* Sections 3, 4 & 5: Category Pills, Commonwealth Marquee & Accepted E-Waste Guide */}
        <DeviceShowcaseSection
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          liveReuseItems={liveReuseItems}
        />

        {/* Sections 6 & 7: 3 Alternating Feature Showcases & 3-Tab Walkthrough */}
        <FeatureShowcases liveReuseItems={liveReuseItems} liveSites={liveSites} />

        {/* Sections 8 & 9: Barangay Commonwealth Program, Bottom CTA Banner & 4-Column Footer */}
        <PilotAndFooterSection />
      </Box>
    </Box>
  )
}

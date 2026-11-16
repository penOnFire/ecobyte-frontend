import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Box, Typography } from '@mui/material'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
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
  HERO_PROOF_THUMBNAILS,
  LANDING_ASSETS,
  LANDING_TRACKER_STEPS,
  getAuthHref,
} from '@/components/landing/landingData'
import type { ShowcaseDeviceId } from '@/components/landing/landingData'
import '@/components/landing/landing.css'

export const LandingPage: FC = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<ShowcaseDeviceId>('thinkpad-t480')

  useEffect(() => {
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
    }
  }, [])

  return (
    <Box className="eco-landing-root">
      <LandingNavbar />

      <Box component="main">
        {/* Section 2: Scenic Illustrated Hero + Rising Phone Mockup */}
        <header id="top" className="eco-hero">
          <HeroScenicIllustration />

          <div className="eco-container">
            <div className="eco-hero-grid">
              {/* Left Column: Headline, Subcopy, Tactile 3D CTAs & Proof Strip */}
              <div className="eco-hero-copy">
                <h1 className="eco-display-h1 eco-hero-enter-1">
                  Give Old Tech
                  <br />A Second Life.
                </h1>

                <Typography
                  className="eco-hero-enter-2"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: 'clamp(1rem, 1.5vw, 1.1875rem)',
                    lineHeight: 1.6,
                    color: '#334155',
                    maxWidth: 540,
                    mt: 2.5,
                  }}
                >
                  Scan a laptop, phone, or charger in six angles, verify battery safety in seconds,
                  and drop it off or claim working gear across Barangay Commonwealth.
                </Typography>

                {/* Primary 3D Action Row & Inline Sign In Link */}
                <div className="eco-hero-enter-3">
                  <Box
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
                      <span>Start 6-Angle Scan</span>
                    </RouterLink>
                    <RouterLink to={getAuthHref('/reuse')} className="eco-btn eco-btn-white eco-btn-lg">
                      <StorefrontRoundedIcon sx={{ fontSize: 20, color: '#4f5f4b' }} />
                      <span>Browse Reuse Hub</span>
                    </RouterLink>
                  </Box>

                  {/* Secondary Inline Sign In Link */}
                  <Box sx={{ mt: 2 }}>
                    <RouterLink
                      to="/signin"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#2d3e2c',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Already have a resident or MRF account? Sign In</span>
                      <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </RouterLink>
                  </Box>
                </div>

                {/* Resident & Device Proof Strip */}
                <Box
                  className="eco-hero-enter-4"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.75,
                    mt: 3.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                    {HERO_PROOF_THUMBNAILS.map((thumb, idx) => (
                      <Box
                        key={thumb.alt}
                        component="img"
                        src={thumb.src}
                        alt={thumb.alt}
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
                          ml: idx === 0 ? -1 : -1.25,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    ))}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#2d3e2c',
                    }}
                  >
                    9 Barangay Eco-Depots serving Commonwealth, Quezon City
                  </Typography>
                </Box>
              </div>

              {/* Right Column: Rising Phone Mockup */}
              <div>
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
                            borderRadius: '6px',
                            border: '1px solid #dce4dc',
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "'Rethink Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#0f172a',
                          }}
                        >
                          Commonwealth Hub
                        </Typography>
                      </Box>
                      <StatusBadge label="Hub Live" variant="live" size="sm" />
                    </Box>

                    {/* Active Locker Pass Card */}
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
                        src={LANDING_ASSETS.keychronImg}
                        alt="Keychron K2 V2"
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid #dce4dc',
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            className="eco-mono"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#2d3e2c' }}
                          >
                            #ECO-4821
                          </Typography>
                          <StatusBadge label="Active Pass" variant="green-pill" size="sm" />
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
                          Keychron K2 V2
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Quicksand', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            color: '#475569',
                          }}
                        >
                          Area 1 Eco-Hub Locker
                        </Typography>
                      </Box>
                    </Box>

                    {/* Latest Verified Reuse Item Card */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '14px',
                        p: 1.25,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={LANDING_ASSETS.ipadImg}
                          alt="iPad Air 64GB"
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '1px solid #dce4dc',
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Rethink Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                color: '#0f172a',
                              }}
                            >
                              iPad Air 64GB
                            </Typography>
                            <Box
                              component="span"
                              className="eco-mono"
                              sx={{
                                backgroundColor: '#e8ffbf',
                                color: '#1a3311',
                                borderRadius: '6px',
                                px: 0.75,
                                py: 0.2,
                                fontWeight: 700,
                                fontSize: '0.6875rem',
                              }}
                            >
                              +150 EcoPoints
                            </Box>
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              color: '#475569',
                              mt: 0.35,
                            }}
                          >
                            100% Functional, ready for resident claim
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Mini StepperTracker Card */}
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #dce4dc',
                        borderRadius: '14px',
                        p: 1.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          color: '#64748b',
                          mb: 1,
                        }}
                      >
                        Drop-Off Status
                      </Typography>
                      <StepperTracker steps={LANDING_TRACKER_STEPS} currentStep={3} />
                    </Box>
                  </Box>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </header>

        {/* Sections 3, 4 & 5: Category Pills, Commonwealth Marquee & 5-Device Switcher */}
        <DeviceShowcaseSection
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
        />

        {/* Sections 6 & 7: 3 Alternating Feature Showcases & 3-Tab Walkthrough */}
        <FeatureShowcases />

        {/* Sections 8 & 9: Barangay Commonwealth Program, Bottom CTA Banner & 4-Column Footer */}
        <PilotAndFooterSection />
      </Box>
    </Box>
  )
}

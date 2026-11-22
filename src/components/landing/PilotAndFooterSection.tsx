import type { FC } from 'react'
import { Box, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import { Link as RouterLink } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import {
  FOOTER_COLUMNS,
  LANDING_ASSETS,
  getAuthHref,
  hasActiveSession,
} from '@/components/landing/landingData'

export const PilotAndFooterSection: FC = () => {
  return (
    <>
      {/* Section 8: 2-Column Barangay Commonwealth Program Cards */}
      <Box
        component="section"
        id="pilot"
        aria-labelledby="pilot-heading"
        sx={{
          backgroundColor: 'var(--eco-alabaster)',
          py: { xs: 8, md: 10 },
        }}
      >
        <div className="eco-container">
          <Box
            data-scroll-reveal="header"
            sx={{ textAlign: 'center', maxWidth: 680, mx: 'auto', mb: { xs: 5, md: 6 } }}
          >
            <h2 id="pilot-heading" className="eco-display-h2">
              Built Exclusively for Barangay Commonwealth
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
              Operating exclusively for households across Areas 1 to 9 and Barangay Commonwealth
              Material Recovery Facility operations.
            </Typography>
          </Box>

          <div className="eco-pilot-grid" data-scroll-reveal="stagger-group">
            {/* Card 1: Barangay Commonwealth MRF Operations */}
            <Box
              className="eco-stagger-item"
              sx={{
                backgroundColor: 'var(--eco-moss-tint)',
                border: '2px solid var(--eco-border)',
                borderBottom: '4px solid var(--eco-border-lip)',
                borderRadius: '22px',
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <StatusBadge label="LGU & MRF Operations" variant="green-pill" size="md" />
              </Box>
              <h3 className="eco-display-h3">Barangay Commonwealth MRF Operations</h3>
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
                Equip MRF Central and barangay desk officers with intake inspection queues, lithium
                hazard segregation logs, and live drop-off tracking across Bases 1 to 9.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 2.5, mb: 3.5 }}>
                {[
                  'Physical Inspection Queue for MRF desk officers',
                  'DENR-EMB aligned hazardous battery disposal manifests',
                  'Base 1 to 9 intake and Reuse Hub reservation tracking',
                ].map((item) => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 19, color: 'var(--eco-mint-ink)', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--eco-ink)',
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <RouterLink to={getAuthHref('/admin')} className="eco-btn eco-btn-moss">
                  <span>Open Operator Portal</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
                </RouterLink>
              </Box>
            </Box>

            {/* Card 2: Commonwealth Resident Program (Bases 1-9) */}
            <Box
              className="eco-stagger-item"
              sx={{
                backgroundColor: 'var(--eco-white)',
                border: '2px solid var(--eco-border)',
                borderBottom: '4px solid var(--eco-border-lip)',
                borderRadius: '22px',
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <StatusBadge label="Verified Barangay Residents" variant="available" size="md" />
              </Box>
              <h3 className="eco-display-h3">Commonwealth Resident Program (Bases 1–9)</h3>
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
                Exclusive household access across Brgy. Hall Complex, Martan St., Don Fabian,
                Katuparan, Riverside, Kristong Hari, Upper Kamias, Pilot Area, and Lupang Pangako.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 2.5, mb: 3.5 }}>
                {[
                  '4-angle device triage before drop-off or hub scheduling',
                  'Verified Reuse Hub claims with Reservation Pass #ECO-4821',
                  'Household EcoPoints ledger credited at MRF turn-over',
                ].map((item) => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 19, color: 'var(--eco-mint-ink)', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--eco-ink)',
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <RouterLink
                  to={hasActiveSession() ? '/dashboard' : '/signin'}
                  className="eco-btn eco-btn-lime"
                >
                  <span>Sign In as Resident</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
                </RouterLink>
              </Box>
            </Box>
          </div>
        </div>
      </Box>

      {/* Section 9A: Full-Width Forest Moss Bottom CTA Banner */}
      <section aria-labelledby="bottom-cta-heading" className="eco-cta-banner">
        <div className="eco-container">
          <div className="eco-cta-grid">
            <Box data-scroll-reveal="header" sx={{ pb: { xs: 0, lg: 8 } }}>
              <h2
                id="bottom-cta-heading"
                className="eco-display-h2"
                style={{ color: '#ffffff' }}
              >
                Empty the Tech Drawer Today.
              </h2>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  color: '#dce4dc',
                  mt: 2,
                  maxWidth: 540,
                  lineHeight: 1.6,
                }}
              >
                Turn unused laptops, phones, and cables into verified community hardware or safe
                material recovery in Barangay Commonwealth.
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.75, mt: 3.5 }}>
                <RouterLink to={getAuthHref('/scan')} className="eco-btn eco-btn-lime eco-btn-lg">
                  <CameraAltRoundedIcon sx={{ fontSize: 20 }} />
                  <span>Start 4-Angle Scan</span>
                </RouterLink>
                <RouterLink
                  to={getAuthHref('/drop-offs')}
                  className="eco-btn eco-btn-outline-light eco-btn-lg"
                >
                  <MapRoundedIcon sx={{ fontSize: 20 }} />
                  <span>View Drop-Off Map</span>
                </RouterLink>
              </Box>
            </Box>

            {/* Right Docked PhoneFrame */}
            <div data-scroll-reveal="phone">
              <PhoneFrame dockedBottom>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      Turn-Over Complete
                    </Typography>
                  </Box>
                  <StatusBadge label="+180 EcoPoints" variant="electric" size="sm" />
                </Box>

                <Box
                  component="img"
                  src={LANDING_ASSETS.thinkpadDetailImg}
                  alt="Lenovo ThinkPad T480 hardware inspection"
                  sx={{
                    width: '100%',
                    height: 164,
                    objectFit: 'cover',
                    borderRadius: '14px',
                    border: '2px solid #dce4dc',
                    display: 'block',
                  }}
                />

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
                      fontSize: '1rem',
                      color: '#0F2417',
                    }}
                  >
                    Lenovo ThinkPad T480
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: '#425243',
                      mt: 0.3,
                    }}
                  >
                    Turned over at Base 1 - Brgy. Hall Complex Eco-Hub
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid #dbe3d6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      className="eco-mono"
                      sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#266317' }}
                    >
                      Pass #ECO-4821
                    </Typography>
                    <StatusBadge label="Verified" variant="available" size="sm" />
                  </Box>
                </Box>
              </Box>
            </PhoneFrame>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9B: 4-Column Tactile Footer */}
      <Box
        component="footer"
        aria-label="Footer"
        sx={{
          backgroundColor: 'var(--eco-white)',
          borderTop: '2px solid var(--eco-border)',
          pt: { xs: 6, md: 7 },
          pb: 5,
        }}
      >
        <div className="eco-container">
          <div className="eco-footer-grid">
            {/* Column 1: Brand & Civic Context */}
            <Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  component="img"
                  src={LANDING_ASSETS.ecobyteLogo}
                  alt="EcoByte"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    border: '1.5px solid var(--eco-border)',
                    backgroundColor: '#ffffff',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'Rethink Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    color: 'var(--eco-ink)',
                  }}
                >
                  EcoByte
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: 'var(--eco-ink-muted)',
                  mt: 1.5,
                  maxWidth: 300,
                  lineHeight: 1.6,
                }}
              >
                Circular electronics diagnostics, reuse, and safe recovery in Barangay
                Commonwealth, Quezon City.
              </Typography>
            </Box>

            {/* Columns 2-4: Verified Route Links */}
            {FOOTER_COLUMNS.map((col) => (
              <Box key={col.heading}>
                <Typography
                  sx={{
                    fontFamily: "'Rethink Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.975rem',
                    color: 'var(--eco-ink)',
                    mb: 1.75,
                  }}
                >
                  {col.heading}
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    m: 0,
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.15,
                  }}
                >
                  {col.links.map((link) => {
                    const isPublicAuth = link.to === '/signin' || link.to === '/register'
                    const resolvedTo = isPublicAuth ? link.to : getAuthHref(link.to)
                    return (
                      <li key={link.to}>
                        <RouterLink to={resolvedTo} className="eco-footer-link">
                          {link.label}
                        </RouterLink>
                      </li>
                    )
                  })}
                </Box>
              </Box>
            ))}
          </div>

          {/* Bottom Legal & Alignment Strip */}
          <Box
            sx={{
              borderTop: '1px solid var(--eco-border)',
              mt: 5,
              pt: 3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'var(--eco-ink-subtle)',
              }}
            >
              EcoByte Circular Electronics Lifecycle, Barangay Commonwealth, Quezon City
            </Typography>
            <StatusBadge label="MRF & DENR-EMB Aligned Workflow" variant="green-pill" size="sm" />
          </Box>
        </div>
      </Box>
    </>
  )
}

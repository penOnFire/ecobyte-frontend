import { useEffect, useState } from 'react'
import type { FC, MouseEvent } from 'react'
import { Box, Typography } from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import { Link as RouterLink } from 'react-router-dom'
import { LANDING_ASSETS, NAV_LINKS, getAuthHref } from '@/components/landing/landingData'

export const LandingNavbar: FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAnchorClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const targetId = href.slice(1)
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        e.preventDefault()
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <Box
      component="nav"
      aria-label="Main"
      className={`eco-navbar ${scrolled || mobileMenuOpen ? 'is-scrolled' : ''}`}
    >
      <div className="eco-container">
        <div className="eco-navbar-inner">
          {/* Left Brand Mark */}
          <Box
            component="a"
            href="#top"
            onClick={(e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, '#top')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              color: '#0f172a',
              borderRadius: '10px',
              py: 0.5,
              pr: 1,
            }}
          >
            <Box
              component="img"
              src={LANDING_ASSETS.ecobyteLogo}
              alt="EcoByte logo"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                border: '1.5px solid #dce4dc',
                backgroundColor: '#ffffff',
              }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily: "'Rethink Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}
            >
              EcoByte
            </Typography>
          </Box>

          {/* Center Anchor Links (Desktop >= 1024px) */}
          <div className="eco-nav-links-desktop">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="eco-nav-link"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right CTAs + Mobile Hamburger */}
          <div className="eco-nav-actions">
            <RouterLink to="/signin" className="eco-nav-signin-desktop">
              Sign In
            </RouterLink>
            <RouterLink
              to={getAuthHref('/scan')}
              className="eco-btn eco-btn-moss eco-btn-sm eco-nav-scan-desktop"
            >
              <CameraAltRoundedIcon sx={{ fontSize: 16 }} />
              Scan a Device
            </RouterLink>

            <button
              type="button"
              className="eco-hamburger-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="eco-mobile-nav"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <CloseRoundedIcon sx={{ fontSize: 22 }} />
              ) : (
                <MenuRoundedIcon sx={{ fontSize: 22 }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Collapsible Mobile Drawer */}
      <div
        id="eco-mobile-nav"
        className={`eco-mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        inert={!mobileMenuOpen}
      >
        <div className="eco-mobile-drawer-inner">
          <Box
            sx={{
              px: 2.5,
               pt: 1.5,
              pb: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {NAV_LINKS.map((item) => (
              <Box
                key={item.href}
                component="a"
                href={item.href}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href)}
                sx={{
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 1.1,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#eef3ed',
                    color: '#4f5f4b',
                  },
                }}
              >
                {item.label}
              </Box>
            ))}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.25,
                mt: 1,
                pt: 1.5,
                borderTop: '1px solid #dce4dc',
              }}
            >
              <RouterLink
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="eco-btn eco-btn-white eco-btn-sm"
              >
                Sign In
              </RouterLink>
              <RouterLink
                to={getAuthHref('/scan')}
                onClick={() => setMobileMenuOpen(false)}
                className="eco-btn eco-btn-moss eco-btn-sm"
              >
                Scan a Device
              </RouterLink>
            </Box>
          </Box>
        </div>
      </div>
    </Box>
  )
}

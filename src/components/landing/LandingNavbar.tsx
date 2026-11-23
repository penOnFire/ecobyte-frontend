import { useEffect, useRef, useState } from 'react'
import type { FC, MouseEvent } from 'react'
import { Box, Typography } from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import { Link as RouterLink } from 'react-router-dom'
import { LANDING_ASSETS, NAV_LINKS, getAuthHref } from '@/components/landing/landingData'
import { prefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export const LandingNavbar: FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleAnchorClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false)
    if (href.startsWith('#')) {
      const targetId = href.slice(1)
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        e.preventDefault()
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    }
  }

  return (
    <Box
      ref={navRef}
      component="nav"
      aria-label="Main"
      className={`eco-navbar ${scrolled || menuOpen ? 'is-scrolled' : ''}`}
    >
      <div className="eco-container" style={{ position: 'relative' }}>
        <div className="eco-navbar-inner">
          {/* Left: Menu Toggle Button + Brand Mark */}
          <Box className="eco-nav-brand-group" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
            <button
              type="button"
              className="eco-hamburger-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="eco-nav-menu"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {menuOpen ? (
                <CloseRoundedIcon sx={{ fontSize: 22 }} />
              ) : (
                <MenuRoundedIcon sx={{ fontSize: 22 }} />
              )}
            </button>

            <Box
              component="a"
              className="eco-nav-brand"
              href="#top"
              onClick={(e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, '#top')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.15,
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
                  objectFit: 'contain',
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontFamily: "'Rethink Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--eco-ink)',
                }}
              >
                EcoByte
              </Typography>
            </Box>
          </Box>

          {/* Right CTAs */}
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
          </div>
        </div>

        {/* Left-anchored Navigation Menu (ordered top-to-bottom matching page sections) */}
        <div
          id="eco-nav-menu"
          className={`eco-nav-menu ${menuOpen ? 'is-open' : ''}`}
          inert={!menuOpen}
        >
          <div className="eco-nav-menu-inner">
            <Box
              sx={{
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {NAV_LINKS.map((item, idx) => (
                <Box
                  key={item.href}
                  component="a"
                  href={item.href}
                  onClick={(e: MouseEvent<HTMLAnchorElement>) => handleAnchorClick(e, item.href)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: 'var(--eco-ink)',
                    textDecoration: 'none',
                    px: 1.5,
                    py: 1,
                    borderRadius: '11px',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'var(--eco-moss-tint)',
                      color: 'var(--eco-mint-ink)',
                    },
                  }}
                >
                  <Box
                    component="span"
                    className="eco-mono"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--eco-mint-ink)',
                      backgroundColor: 'var(--eco-mint-pill)',
                      px: 0.65,
                      py: 0.15,
                      borderRadius: '6px',
                      lineHeight: 1.3,
                    }}
                  >
                    0{idx + 1}
                  </Box>
                  <span>{item.label}</span>
                </Box>
              ))}

              <Box
                className="eco-nav-menu-mobile-ctas"
                sx={{
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1.25,
                  mt: 1,
                  pt: 1.25,
                  borderTop: '1px solid var(--eco-border)',
                }}
              >
                <RouterLink
                  to="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="eco-btn eco-btn-white eco-btn-sm"
                >
                  Sign In
                </RouterLink>
                <RouterLink
                  to={getAuthHref('/scan')}
                  onClick={() => setMenuOpen(false)}
                  className="eco-btn eco-btn-moss eco-btn-sm"
                >
                  Scan a Device
                </RouterLink>
              </Box>
            </Box>
          </div>
        </div>
      </div>
    </Box>
  )
}

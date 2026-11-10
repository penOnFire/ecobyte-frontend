import type { FC, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

export type BadgeVariant =
  | 'live'
  | 'active'
  | 'pending'
  | 'in-transit'
  | 'available'
  | 'grade'
  | 'warning'
  | 'error'
  | 'muted'
  | 'green-pill'

interface StatusBadgeProps {
  label: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; dot?: string; border?: string }> = {
  live: { bg: '#ebf2eb', color: '#2d3e2c', dot: '#38a882' },
  active: { bg: '#ebf2eb', color: '#384735' },
  'in-transit': { bg: '#ebf2eb', color: '#384735' },
  available: { bg: '#e8f0e6', color: '#384735' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  grade: { bg: '#f4ede4', color: '#44403c' },
  warning: { bg: '#fef3c7', color: '#b45309' },
  error: { bg: '#fee2e2', color: '#b91c1c' },
  muted: { bg: '#f4f0eb', color: '#78716c' },
  'green-pill': { bg: '#e8f0e6', color: '#2d3e2c', border: '#c4d9c0' },
}

export const StatusBadge: FC<StatusBadgeProps> = ({ label, variant = 'active', size = 'md' }) => {
  const s = VARIANT_STYLES[variant]

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: s.bg,
        color: s.color,
        px: size === 'sm' ? 1 : 1.25,
        py: size === 'sm' ? 0.25 : 0.4,
        borderRadius: 9999,
        border: s.border ? `1px solid ${s.border}` : 'none',
        flexShrink: 0,
      }}
    >
      {s.dot && (
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.dot, flexShrink: 0 }} />
      )}
      <Typography
        sx={{
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 700,
          fontSize: size === 'sm' ? '0.625rem' : '0.6875rem',
          color: 'inherit',
          lineHeight: 1,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

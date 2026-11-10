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
  | 'electric'
  | 'hazard'
  | 'slate'

interface StatusBadgeProps {
  label: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; dot?: string; border?: string }> = {
  live: { bg: '#e8f0e6', color: '#1e293b', dot: '#abf06b', border: '#c4d9c0' },
  active: { bg: '#ebf2eb', color: '#384735', border: '#d5e0d2' },
  'in-transit': { bg: '#abf06b', color: '#0f172a', dot: '#0f172a' },
  available: { bg: '#e8ffbf', color: '#1a3311', border: '#bde59e' },
  pending: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  grade: { bg: '#f1f5f9', color: '#0f172a', border: '#e2e8f0' },
  warning: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  error: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  muted: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
  'green-pill': { bg: '#e8f0e6', color: '#2d3e2c', border: '#c4d9c0' },
  electric: { bg: '#abf06b', color: '#0f172a', dot: '#1e293b', border: '#8fc25f' },
  hazard: { bg: '#fef3c7', color: '#b45309', dot: '#dc2626', border: '#fde68a' },
  slate: { bg: '#0f172a', color: '#ffffff', border: '#1e293b' },
}

export const StatusBadge: FC<StatusBadgeProps> = ({ label, variant = 'active', size = 'md' }) => {
  const s = VARIANT_STYLES[variant] || VARIANT_STYLES.active

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        backgroundColor: s.bg,
        color: s.color,
        px: size === 'sm' ? 1 : 1.25,
        py: size === 'sm' ? 0.3 : 0.45,
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

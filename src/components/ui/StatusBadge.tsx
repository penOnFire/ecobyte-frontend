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
  live: { bg: '#FF0004', color: '#ffffff', dot: '#ffffff' },
  active: { bg: '#ABF06B', color: '#264E11' },
  'in-transit': { bg: '#E8F0E6', color: '#4F5F4B', border: 'rgba(220, 207, 192, 0.6)' },
  available: { bg: '#CEEBC4', color: '#266317' },
  pending: { bg: '#E8F0E6', color: '#596556', border: 'rgba(220, 207, 192, 0.6)' },
  grade: { bg: '#f1f5f9', color: '#1F2937', border: '#DCCFC0' },
  warning: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  error: { bg: '#FFCBCB', color: '#A91111', border: '#fecaca' },
  muted: { bg: '#f1f5f9', color: '#596556', border: '#DCCFC0' },
  'green-pill': { bg: '#CEEBC4', color: '#266317' },
  electric: { bg: '#ABF06B', color: '#264E11', dot: '#264E11', border: '#8fc25f' },
  hazard: { bg: '#FFCBCB', color: '#A91111', dot: '#FF0505', border: '#fca5a5' },
  slate: { bg: '#1F2937', color: '#ffffff', border: '#4F5F4B' },
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

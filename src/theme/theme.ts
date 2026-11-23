import { createTheme } from '@mui/material/styles'

export const MOTION = {
  press: 120,
  fast: 180,
  overlay: 240,
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const

// EcoByte Design System — Figma Overhaul & Shadcn UI Aesthetic
export const theme = createTheme({
  palette: {
    primary: {
      main: '#4f5f4b',
      light: '#78957a',
      dark: '#2d3e2c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#abf06b',
      light: '#beeb64',
      dark: '#8fc25f',
      contrastText: '#0f172a',
    },
    background: {
      default: '#faf8f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    warning: {
      main: '#d97706',
      light: '#fef3c7',
      dark: '#b45309',
      contrastText: '#78350f',
    },
    error: {
      main: '#dc2626',
      light: '#fee2e2',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#34d399',
      light: '#ecfdf5',
      dark: '#065f46',
      contrastText: '#ffffff',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2, color: '#0f172a' },
    h2: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.25, color: '#0f172a' },
    h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25, color: '#0f172a' },
    h4: { fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.3, color: '#0f172a' },
    h5: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.35, color: '#0f172a' },
    h6: { fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, color: '#0f172a' },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.5 },
    body1: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: 'none', fontSize: '0.875rem', letterSpacing: 0 },
    caption: { fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.03em' },
    overline: { fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.08em' },
  },
  shape: {
    borderRadius: 12,
  },
  transitions: {
    easing: {
      easeOut: MOTION.easeOut,
      easeInOut: MOTION.easeOut,
      sharp: MOTION.easeOut,
    },
    duration: {
      shortest: MOTION.press,
      shorter: MOTION.fast,
      short: MOTION.fast,
      standard: MOTION.overlay,
      enteringScreen: MOTION.overlay,
      leavingScreen: MOTION.fast,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          margin: 0,
          padding: 0,
          backgroundColor: '#faf8f5',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*': { boxSizing: 'border-box' },
        'main[tabindex="-1"]:focus': {
          outline: 'none',
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #266317',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `transform ${MOTION.press}ms ${MOTION.easeOut}, background-color ${MOTION.fast}ms ease, color ${MOTION.fast}ms ease, border-color ${MOTION.fast}ms ease`,
          '&:active:not(:disabled)': { transform: 'scale(0.95)' },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:active:not(:disabled)': { transform: 'none' },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 700,
          letterSpacing: 0,
          boxShadow: 'none',
          transition: `transform ${MOTION.press}ms ${MOTION.easeOut}, background-color ${MOTION.fast}ms ease, border-color ${MOTION.fast}ms ease, color ${MOTION.fast}ms ease, opacity ${MOTION.fast}ms ease`,
          '&:active:not(:disabled)': { transform: 'scale(0.97)' },
          '&:hover': { boxShadow: 'none' },
          '&.Mui-disabled': { opacity: 0.56 },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:active:not(:disabled)': { transform: 'none' },
          },
        },
        sizeLarge: { padding: '14px 24px', fontSize: '0.9375rem' },
        sizeMedium: { padding: '10px 20px', fontSize: '0.875rem' },
        sizeSmall: { padding: '6px 14px', fontSize: '0.8125rem' },
        contained: {
          backgroundColor: '#4f5f4b',
          color: '#ffffff',
          '@media (hover: hover) and (pointer: fine)': {
            '&:hover': {
              backgroundColor: '#384735',
            },
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          '@media (hover: hover) and (pointer: fine)': {
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc',
            },
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        transitionDuration: { enter: MOTION.overlay, exit: MOTION.fast },
      },
    },
    MuiDrawer: {
      defaultProps: {
        transitionDuration: { enter: MOTION.overlay, exit: MOTION.fast },
      },
    },
    MuiPopover: {
      defaultProps: {
        transitionDuration: { enter: MOTION.overlay, exit: MOTION.fast },
      },
    },
    MuiMenu: {
      defaultProps: {
        transitionDuration: { enter: MOTION.overlay, exit: MOTION.fast },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        transitionDuration: { enter: MOTION.overlay, exit: MOTION.fast },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 14 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#0f172a',
          '& fieldset': { borderColor: '#e2e8f0', transition: `border-color ${MOTION.fast}ms ease` },
          '&:hover fieldset': { borderColor: '#cbd5e1' },
          '&.Mui-focused fieldset': {
            borderColor: '#0f172a',
            borderWidth: '1.5px',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& fieldset': { transition: 'none' },
          },
        },
        input: { padding: '12px 14px' },
        sizeSmall: {
          '& .MuiOutlinedInput-input': { padding: '8px 12px' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#64748b',
          '&.Mui-focused': { color: '#0f172a' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 700,
          fontSize: '0.75rem',
          height: 28,
          border: '1px solid transparent',
        },
        label: { paddingLeft: 10, paddingRight: 10 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#e2e8f0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.875rem',
          letterSpacing: 0,
          minHeight: 42,
          color: '#64748b',
          '&.Mui-selected': { color: '#0f172a' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#0f172a', height: 2.5 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          height: 6,
          backgroundColor: '#e2e8f0',
        },
        bar: { borderRadius: 9999 },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#cbd5e1',
          '&.Mui-checked': { color: '#4f5f4b' },
          borderRadius: 6,
        },
      },
    },
  },
})

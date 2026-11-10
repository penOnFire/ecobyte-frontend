import { createTheme } from '@mui/material/styles'

// EcoByte Design System — extracted directly from Figma (yXeghlyy3FMUfKe788RniD)
export const theme = createTheme({
  palette: {
    primary: {
      main: '#4f5f4b',
      light: '#78957a',
      dark: '#2d3e2c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#78957a',
      light: '#e8f0e6',
      dark: '#384735',
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf8f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#292524',
      secondary: '#78716c',
      disabled: '#a8a29e',
    },
    warning: {
      main: '#d97706',
      light: '#fffbeb',
      dark: '#78350f',
      contrastText: '#78350f',
    },
    error: {
      main: '#d9534f',
      light: '#fee2e2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#38a882',
      light: '#ebf2eb',
      dark: '#0f352e',
      contrastText: '#ffffff',
    },
    divider: '#f0ebe4',
  },
  typography: {
    fontFamily: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.25 },
    h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25 },
    h4: { fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.3 },
    h5: { fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.35 },
    h6: { fontWeight: 700, fontSize: '1rem', lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.5 },
    body1: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: 'none', fontSize: '0.9375rem', letterSpacing: 0 },
    caption: { fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.03em' },
    overline: { fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.08em' },
  },
  shape: {
    borderRadius: 16,
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
          transition: 'all 0.15s ease',
          '&:hover': { boxShadow: 'none' },
        },
        sizeLarge: { padding: '14px 24px', fontSize: '0.9375rem' },
        sizeMedium: { padding: '10px 20px', fontSize: '0.875rem' },
        sizeSmall: { padding: '6px 14px', fontSize: '0.8125rem' },
        contained: {
          backgroundColor: '#4f5f4b',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#384735',
            opacity: 0.95,
          },
        },
        outlined: {
          borderColor: '#ddd8d0',
          color: '#292524',
          '&:hover': {
            borderColor: '#78957a',
            backgroundColor: 'rgba(120, 149, 122, 0.06)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: '#ffffff',
          border: '1px solid #ede8e1',
          boxShadow: 'none',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 20 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#ffffff',
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 500,
          fontSize: '0.875rem',
          '& fieldset': { borderColor: '#ddd8d0' },
          '&:hover fieldset': { borderColor: '#78957a' },
          '&.Mui-focused fieldset': {
            borderColor: '#4f5f4b',
            borderWidth: '1.5px',
          },
        },
        input: { padding: '13px 14px' },
        sizeSmall: {
          '& .MuiOutlinedInput-input': { padding: '9px 12px' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'Quicksand', sans-serif",
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: '#78716c',
          '&.Mui-focused': { color: '#4f5f4b' },
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
        },
        label: { paddingLeft: 10, paddingRight: 10 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#ede8e1' },
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
          minHeight: 44,
          color: '#78716c',
          '&.Mui-selected': { color: '#292524' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#4f5f4b', height: 2.5 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          height: 6,
          backgroundColor: '#ede8e1',
        },
        bar: { borderRadius: 9999 },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#a8a29e',
          '&.Mui-checked': { color: '#4f5f4b' },
          borderRadius: 6,
        },
      },
    },
  },
})

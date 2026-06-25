/**
 * WHY: Centralized theme makes global UI changes in ONE file. Brand colors,
 *      typography, component overrides — all here.
 * WHAT: Creates both light and dark MUI themes with glassmorphism aesthetic.
 * HOW: createTheme() from MUI with custom palette, typography, shape, and
 *      component overrides (MuiCard, MuiButton, MuiAppBar, etc.).
 * PRODUCTION STANDARD: Use CSS variables in theme for smooth dark mode transitions.
 *      Never hard-code hex colors in components — always reference theme.palette.*.
 * PERFORMANCE: Theme object is memoized in App.jsx via useMemo().
 * INTERVIEW Q: How to implement dark mode in MUI?
 *   Pass { palette: { mode: 'dark' } } to createTheme(), then switch based on user pref.
 */

import { createTheme, alpha } from '@mui/material/styles';

const BRAND = {
  primary: '#6C63FF',    // Violet — trust, creativity
  secondary: '#FF6584',  // Pink-red — warmth, love
  accent: '#43D4B0',     // Teal — freshness, reminder
  warning: '#FFB347',    // Orange — attention
  error: '#FF5252',
  success: '#4CAF50',
};

// ── Shared typography ─────────────────────────────────────────────────────────
const typography = {
  fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
  h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
  h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
  h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
  h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  button: { fontWeight: 600, letterSpacing: '0.02em' },
};

// ── Shared shape ──────────────────────────────────────────────────────────────
const shape = { borderRadius: 12 };

// ── Shared component overrides ────────────────────────────────────────────────
const getComponents = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
    },
  },

  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 16,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(108, 99, 255, 0.12)',
        },
        ...(mode === 'dark' && {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }),
        ...(mode === 'light' && {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }),
      }),
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
        padding: '10px 24px',
        transition: 'all 0.2s ease',
      },
      containedPrimary: {
        background: `linear-gradient(135deg, ${BRAND.primary} 0%, #8B5CF6 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, #5A52E0 0%, #7C3AED 100%)`,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 20px ${alpha(BRAND.primary, 0.4)}`,
        },
      },
      containedSecondary: {
        background: `linear-gradient(135deg, ${BRAND.secondary} 0%, #FF8E9E 100%)`,
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 20px ${alpha(BRAND.secondary, 0.4)}`,
        },
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': { borderWidth: '1.5px', transform: 'translateY(-1px)' },
      },
    },
  },

  MuiTextField: {
    defaultProps: { variant: 'outlined', size: 'small' },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          transition: 'all 0.2s ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.primary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.primary,
            borderWidth: '2px',
          },
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 500 },
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        border: `2px solid ${alpha(BRAND.primary, 0.3)}`,
        fontWeight: 700,
      },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: 10, height: 8 },
      bar: { borderRadius: 10 },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 500,
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        ...(mode === 'dark' && {
          backgroundImage: 'none',
        }),
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        ...(mode === 'dark' && {
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
        }),
        ...(mode === 'light' && {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }),
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        ...(mode === 'dark' && {
          background: 'rgba(15, 15, 35, 0.9)',
          backdropFilter: 'blur(20px)',
        }),
        ...(mode === 'light' && {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
        }),
      },
    },
  },
});

// ── Light Theme ───────────────────────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: BRAND.primary, light: '#9D97FF', dark: '#5A52E0' },
    secondary: { main: BRAND.secondary, light: '#FF8E9E', dark: '#E04060' },
    success: { main: BRAND.success },
    warning: { main: BRAND.warning },
    error: { main: BRAND.error },
    background: {
      default: '#F0EFFF',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
    },
    divider: 'rgba(108, 99, 255, 0.12)',
    action: {
      hover: alpha(BRAND.primary, 0.06),
      selected: alpha(BRAND.primary, 0.12),
    },
  },
  typography,
  shape,
  components: getComponents('light'),
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 4px 6px rgba(0,0,0,0.07)',
    '0 8px 15px rgba(0,0,0,0.08)',
    '0 12px 25px rgba(0,0,0,0.10)',
    '0 16px 35px rgba(0,0,0,0.12)',
    ...Array(19).fill('none'),
  ],
});

// ── Dark Theme ────────────────────────────────────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: BRAND.primary, light: '#9D97FF', dark: '#5A52E0' },
    secondary: { main: BRAND.secondary, light: '#FF8E9E', dark: '#E04060' },
    success: { main: BRAND.success },
    warning: { main: BRAND.warning },
    error: { main: BRAND.error },
    background: {
      default: '#0A0A1A',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      hover: alpha(BRAND.primary, 0.12),
      selected: alpha(BRAND.primary, 0.20),
    },
  },
  typography,
  shape,
  components: getComponents('dark'),
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.3)',
    '0 4px 6px rgba(0,0,0,0.4)',
    '0 8px 15px rgba(0,0,0,0.5)',
    '0 12px 25px rgba(0,0,0,0.6)',
    '0 16px 35px rgba(0,0,0,0.7)',
    ...Array(19).fill('none'),
  ],
});

export const COLORS = BRAND;

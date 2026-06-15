import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { arSA, enUS } from '@mui/material/locale';
import { tokens } from './tokens';

function palette(mode: 'light' | 'dark'): ThemeOptions['palette'] {
  if (mode === 'light') {
    return {
      mode: 'light',
      primary: { main: tokens.primary, dark: tokens.primaryDark, light: tokens.secondary },
      secondary: { main: tokens.secondary },
      success: { main: tokens.success },
      warning: { main: tokens.warning },
      error: { main: tokens.error },
      info: { main: '#3B82F6' },
      background: { default: tokens.background, paper: tokens.card },
      text: { primary: '#111827', secondary: '#6B7280' },
      divider: '#E5E7EB',
    };
  }
  return {
    mode: 'dark',
    primary: { main: tokens.primary, dark: tokens.primaryDark, light: tokens.secondary },
    secondary: { main: tokens.secondary },
    success: { main: tokens.success },
    warning: { main: tokens.warning },
    error: { main: tokens.error },
    info: { main: '#60A5FA' },
    background: { default: tokens.dark.background, paper: tokens.dark.card },
    text: { primary: '#F8FAFC', secondary: '#94A3B8' },
    divider: tokens.dark.border,
  };
}

function components(mode: 'light' | 'dark'): ThemeOptions['components'] {
  const isLight = mode === 'light';
  const paperBg = isLight ? tokens.card : tokens.dark.card;
  const inputBg = isLight ? '#F1F5F9' : '#111535';

  return {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: isLight ? '#CBD5E1' : '#2A4058',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: isLight ? '#F1F5F9' : tokens.dark.background,
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: tokens.radius.md,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${isLight ? '#E2E8F0' : tokens.dark.border}`,
          backgroundColor: paperBg,
          boxShadow: isLight ? tokens.shadow.card : 'none',
          borderRadius: tokens.radius.md,
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: tokens.radius.sm,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: tokens.gradient.primary,
          '&:hover': { background: tokens.gradient.primary, filter: 'brightness(1.05)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          backgroundColor: inputBg,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&.Mui-focused': {
            boxShadow: isLight ? '0 0 0 3px rgba(72, 78, 213, 0.15)' : '0 0 0 3px rgba(72, 78, 213, 0.25)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 8 } },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.sm },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.mode === 'dark' ? '#3D5166' : undefined,
          '&.Mui-checked': {
            color: theme.palette.mode === 'dark' ? tokens.dark.checkbox : tokens.primary,
          },
          '&.Mui-disabled': {
            opacity: theme.palette.mode === 'dark' ? 0.85 : 0.5,
          },
        }),
      },
    },
  };
}

export function createAppTheme(mode: 'light' | 'dark', lang: 'ar' | 'en') {
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  const locale = lang === 'ar' ? arSA : enUS;
  return createTheme(
    {
      direction,
      palette: palette(mode),
      typography: {
        fontFamily: lang === 'ar' ? '"Cairo", sans-serif' : '"Inter", sans-serif',
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        overline: { letterSpacing: '0.08em', fontWeight: 600 },
      },
      shape: { borderRadius: tokens.radius.md },
      components: components(mode),
    },
    locale
  );
}

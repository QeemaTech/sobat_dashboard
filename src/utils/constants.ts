export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const ADMIN_PREFIX = '/admin';
export const STORAGE_ACCESS = 'sobat_access_token';
export const STORAGE_REFRESH = 'sobat_refresh_token';
export const STORAGE_ADMIN = 'sobat_admin_profile';
export const STORAGE_REMEMBER = 'sobat_remember_me';
export const STORAGE_REMEMBER_EMAIL = 'sobat_remember_email';
export const STORAGE_THEME = 'sobat_theme';

export const CHART_COLORS = {
  primary: '#484ED5',
  primaryHover: '#3B41B8',
  secondary: '#6366F1',
  grid: '#E2E8F0',
  card: '#FFFFFF',
  zones: {
    PEAK: '#22C55E',
    COMFORT: '#84CC16',
    CAUTION: '#F59E0B',
    DANGER: '#EF4444',
  },
  subscription: {
    ACTIVE: '#22C55E',
    TRIAL: '#6366F1',
    EXPIRED: '#94A3B8',
    CANCELLED: '#EF4444',
    PENDING: '#F59E0B',
  },
} as const;

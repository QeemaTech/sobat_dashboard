/** Design tokens — premium SaaS dashboard */
export const tokens = {
  primary: '#484ED5',
  primaryDark: '#3B41B8',
  secondary: '#6366F1',
  background: '#F9FAFB',
  card: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
  },
  shadow: {
    card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)',
    cardSubtle: '0 1px 3px rgba(0, 0, 0, 0.07)',
    cardHover: '0 4px 20px rgba(72, 78, 213, 0.12), 0 12px 32px rgba(15, 23, 42, 0.08)',
    sidebarActive: '0 4px 14px rgba(72, 78, 213, 0.45)',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #484ED5 0%, #6366F1 100%)',
    primarySoft: 'linear-gradient(135deg, rgba(72, 78, 213, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
  },
  dark: {
    background: '#0D1B2A',
    card: '#132238',
    sidebar: '#0A1520',
    border: '#1E3044',
    rowAlt: '#111E2E',
    stickyCol: '#0A1520',
    checkbox: '#4F6EF7',
  },
} as const;

import type { SxProps, Theme } from '@mui/material';

export const adminTableWrapperClass = 'admin-data-table-wrapper';
export const adminTableClass = 'admin-data-table';

export const adminTableHeadCellSx: SxProps<Theme> = {
  fontWeight: 600,
  color: 'text.secondary',
  py: 1.5,
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
};

export const adminTableAlign = {
  start: { textAlign: 'start', verticalAlign: 'middle' } as const,
  center: { textAlign: 'center', verticalAlign: 'middle' } as const,
};

export const adminTableShellSx: SxProps<Theme> = {
  border: 1,
  borderColor: 'divider',
  borderRadius: 3,
  overflowX: 'auto',
};

export const adminTableSx: SxProps<Theme> = {
  minWidth: 760,
  tableLayout: 'fixed',
  width: '100%',
};

export const adminTableTitleTextSx = {
  fontWeight: 700,
  textAlign: 'start',
  width: '100%',
  display: 'block',
} as const;

export function pickLocalizedField(
  lang: string,
  ar: string,
  en?: string | null,
) {
  return lang === 'en' ? (en?.trim() || ar) : ar;
}

export function contentTextDir(lang: string): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export const adminTableActionsSx: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  justifyContent: 'center',
  alignItems: 'center',
};

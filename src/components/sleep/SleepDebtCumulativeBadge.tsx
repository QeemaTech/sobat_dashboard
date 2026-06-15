import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type SleepDebtZoneLevel = 'optimal' | 'moderate' | 'poor' | 'critical';

export const ZONE_STYLES: Record<
  SleepDebtZoneLevel,
  { stroke: string; bg: string; border: string }
> = {
  optimal: {
    stroke: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    border: '#22c55e',
  },
  moderate: {
    stroke: '#eab308',
    bg: 'rgba(234,179,8,0.15)',
    border: '#eab308',
  },
  poor: {
    stroke: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    border: '#f97316',
  },
  critical: {
    stroke: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: '#ef4444',
  },
};

/** Zone derived from cumulative sleep debt (hours). */
export function cumulativeDebtZone(cumulativeMinutes: number): SleepDebtZoneLevel {
  const hours = cumulativeMinutes / 60;
  if (hours >= 55) return 'critical';
  if (hours >= 25) return 'poor';
  if (hours >= 12) return 'moderate';
  return 'optimal';
}

export function SleepDebtCumulativeBadge({ cumulativeMinutes }: { cumulativeMinutes?: number | null }) {
  const { t } = useTranslation();
  const minutes = Number(cumulativeMinutes) || 0;
  const level = cumulativeDebtZone(minutes);
  const { bg, border, stroke } = ZONE_STYLES[level];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        borderRadius: '9999px',
        px: '14px',
        py: '4px',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.4,
        bgcolor: bg,
        color: stroke,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {t(`sleepDebt.zone.${level}`)}
    </Box>
  );
}

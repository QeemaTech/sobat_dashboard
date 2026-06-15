import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SleepZone } from '@/types';
import { CHART_COLORS } from '@/utils/constants';

const zoneColor: Record<SleepZone, 'success' | 'info' | 'warning' | 'error'> = {
  PEAK: 'success',
  COMFORT: 'info',
  CAUTION: 'warning',
  DANGER: 'error',
};

export function ZoneBadge({ zone }: { zone: SleepZone | null | undefined }) {
  const { t } = useTranslation();
  if (!zone) {
    return <span style={{ color: 'var(--mui-palette-text-disabled, #94a3b8)' }}>—</span>;
  }
  return (
    <Chip
      size="small"
      label={t(`zones.${zone}`)}
      color={zoneColor[zone]}
      variant="outlined"
      sx={{ borderColor: `${CHART_COLORS.zones[zone]}88` }}
    />
  );
}

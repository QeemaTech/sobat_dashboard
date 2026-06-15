import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SyncLogStatus } from '@/utils/syncLogUtils';
import { SYNC_STATUS_STYLE } from '@/utils/syncLogUtils';

export function SyncLogStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const key = (status in SYNC_STATUS_STYLE ? status : 'FAILED') as SyncLogStatus;
  const style = SYNC_STATUS_STYLE[key];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.25,
        py: 0.35,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {t(`syncLogs.status.${key}`)}
    </Box>
  );
}

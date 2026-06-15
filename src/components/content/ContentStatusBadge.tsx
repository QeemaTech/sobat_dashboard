import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ContentStatus } from '@/types';

const STATUS_STYLE: Record<ContentStatus, { color: string; bg: string; border: string }> = {
  PUBLISHED: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' },
  DRAFT: { color: '#eab308', bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)' },
  ARCHIVED: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;

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
      {t(`contentStatus.${status}`, { defaultValue: status })}
    </Box>
  );
}

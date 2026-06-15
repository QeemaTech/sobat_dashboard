import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  REMINDER: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  SYSTEM: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  SLEEP_DEBT: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  GOAL_ACHIEVED: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  SUBSCRIPTION: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)' },
  SUPPORT: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' },
};

export function NotificationTypeBadge({ type }: { type: string }) {
  const { t } = useTranslation();
  const style = TYPE_STYLE[type] ?? TYPE_STYLE.SUPPORT;

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
      {t(`notifications.types.${type}`, { defaultValue: type })}
    </Box>
  );
}


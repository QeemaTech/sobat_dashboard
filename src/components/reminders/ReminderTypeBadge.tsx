import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  BEDTIME: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)' },
  WAKE_UP: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  FAJR: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  NAP: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  CUSTOM: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' },
};

export function ReminderTypeBadge({ type }: { type: string }) {
  const { t } = useTranslation();
  const style = TYPE_STYLE[type] ?? TYPE_STYLE.CUSTOM;

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
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {t(`reminders.types.${type}`, { defaultValue: type })}
    </Box>
  );
}

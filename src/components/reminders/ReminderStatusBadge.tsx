import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  ACTIVE: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  PAUSED: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  DISABLED: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' },
};

export function ReminderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.DISABLED;

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
      {t(`reminders.status.${status}`, { defaultValue: status })}
    </Box>
  );
}

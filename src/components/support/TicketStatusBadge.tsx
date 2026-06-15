import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TicketStatus } from '@/types';

const STATUS_STYLE: Record<TicketStatus, { color: string; bg: string; border: string }> = {
  OPEN: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  IN_PROGRESS: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  WAITING_USER: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  RESOLVED: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  CLOSED: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' },
};

export function TicketStatusBadge({ status, compact }: { status: TicketStatus; compact?: boolean }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: compact ? 1 : 1.25,
        py: 0.35,
        borderRadius: 9999,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {t(`ticketStatus.${status}`, status)}
    </Box>
  );
}

export { STATUS_STYLE as TICKET_STATUS_STYLE };

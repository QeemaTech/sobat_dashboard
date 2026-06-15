import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TicketPriority } from '@/types';

const PRIORITY_STYLE: Record<TicketPriority, { color: string; bg: string; border: string }> = {
  URGENT: { color: '#ef4444', bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.4)' },
  HIGH: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  MEDIUM: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  LOW: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
};

export function TicketPriorityBadge({ priority, compact }: { priority: TicketPriority; compact?: boolean }) {
  const { t } = useTranslation();
  const style = PRIORITY_STYLE[priority];

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
      {t(`ticketPriority.${priority}`, priority)}
    </Box>
  );
}

export { PRIORITY_STYLE as TICKET_PRIORITY_STYLE };

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TicketPriorityBadge } from '@/components/support/TicketPriorityBadge';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { SupportTicket } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';
import { ticketIsUnread } from '@/utils/supportUtils';

interface TicketListCardProps {
  ticket: SupportTicket;
  selected: boolean;
  onSelect: () => void;
  onAssignToMe?: (e: React.MouseEvent) => void;
}

export function TicketListCard({ ticket, selected, onSelect, onAssignToMe }: TicketListCardProps) {
  const { t } = useTranslation();
  const unread = ticketIsUnread(ticket);
  const timeLabel = formatRelativeTime(ticket.updatedAt ?? ticket.createdAt);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        borderBottom: 1,
        borderColor: 'divider',
        borderLeft: 3,
        borderLeftColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? 'action.selected' : 'transparent',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
        '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <TicketPriorityBadge priority={ticket.priority} compact />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {unread && <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />}
          <TicketStatusBadge status={ticket.status} compact />
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontWeight: unread ? 700 : 600,
          lineHeight: 1.4,
          mb: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {ticket.subject}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {ticket.user && <UserAvatar name={ticket.user.fullName} size="sm" />}
          <Typography variant="caption" color="text.secondary" noWrap>
            {ticket.user?.fullName ?? t('support.unknownUser')}
            <Box component="span" sx={{ mx: 0.75, opacity: 0.5 }}>
              ·
            </Box>
            {timeLabel}
          </Typography>
        </Box>
        {onAssignToMe && ticket.status === 'OPEN' && (
          <Tooltip title={t('support.assignToMe')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAssignToMe(e);
              }}
              sx={{ flexShrink: 0 }}
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

function TicketListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ width: 56, height: 22, borderRadius: 9999, bgcolor: 'action.hover' }} />
            <Box sx={{ width: 64, height: 22, borderRadius: 9999, bgcolor: 'action.hover' }} />
          </Box>
          <Box sx={{ width: '90%', height: 16, borderRadius: 1, bgcolor: 'action.hover', mb: 1 }} />
          <Box sx={{ width: '60%', height: 12, borderRadius: 1, bgcolor: 'action.hover' }} />
        </Box>
      ))}
    </>
  );
}

TicketListCard.Skeleton = TicketListSkeleton;

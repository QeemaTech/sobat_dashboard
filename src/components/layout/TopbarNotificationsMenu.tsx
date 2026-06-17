import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';
import { supportService } from '@/services/support.service';
import { formatRelativeTime } from '@/utils/formatters';
import type { SupportTicket, TicketStatus } from '@/types';

const ALERT_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_USER'];

export function TopbarNotificationsMenu() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { data, isLoading } = useQuery({
    queryKey: ['topbar-notifications'],
    queryFn: () => supportService.list({ limit: 30 }),
    staleTime: 30_000,
  });

  const tickets = useMemo(() => {
    const rows = [...(data?.data ?? [])];
    rows.sort((a, b) => {
      const aAlert = ALERT_STATUSES.includes(a.status) ? 0 : 1;
      const bAlert = ALERT_STATUSES.includes(b.status) ? 0 : 1;
      if (aAlert !== bAlert) return aAlert - bAlert;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return rows.slice(0, 8);
  }, [data?.data]);

  const alertCount = useMemo(
    () => (data?.data ?? []).filter((ticket) => ALERT_STATUSES.includes(ticket.status)).length,
    [data?.data]
  );

  function handleOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleTicketClick(ticket: SupportTicket) {
    handleClose();
    navigate('/admin/support', { state: { ticketId: ticket.id } });
  }

  return (
    <>
      <Tooltip title={t('topbar.notifications')}>
        <IconButton size="small" onClick={handleOpen} aria-label={t('topbar.notifications')}>
          <Badge
            variant={alertCount > 0 ? 'standard' : 'dot'}
            color="error"
            overlap="circular"
            badgeContent={alertCount > 0 ? (alertCount > 9 ? '9+' : alertCount) : undefined}
            invisible={!alertCount}
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: theme.direction === 'rtl' ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: theme.direction === 'rtl' ? 'left' : 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'min(360px, calc(100vw - 24px))', sm: 380 },
              mt: 1,
              borderRadius: 3,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: theme.palette.mode === 'light' ? 4 : 8,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('topbar.notifications')}
            </Typography>
            {alertCount > 0 ? (
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                {t('topbar.unreadCount', { count: alertCount })}
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : tickets.length === 0 ? (
            <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
              <NotificationsNoneRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('topbar.noNotifications')}
              </Typography>
            </Box>
          ) : (
            tickets.map((ticket, index) => (
              <Box key={ticket.id}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => handleTicketClick(ticket)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    border: 0,
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'start',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      bgcolor: ALERT_STATUSES.includes(ticket.status) ? 'error.light' : 'action.selected',
                      color: ALERT_STATUSES.includes(ticket.status) ? 'error.main' : 'text.secondary',
                    }}
                  >
                    <SupportAgentOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ticket.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      {ticket.user?.fullName ?? t('support.unknownUser')}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.75, flexWrap: 'wrap' }}>
                      <TicketStatusBadge status={ticket.status} compact />
                      <Typography variant="caption" color="text.disabled">
                        {formatRelativeTime(ticket.createdAt)}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
                {index < tickets.length - 1 ? <Divider /> : null}
              </Box>
            ))
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button
            component={RouterLink}
            to="/admin/support"
            fullWidth
            size="small"
            onClick={handleClose}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {t('topbar.viewAllSupport')}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            <Link component={RouterLink} to="/admin/notifications" underline="hover" onClick={handleClose}>
              {t('topbar.viewNotificationsLog')}
            </Link>
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

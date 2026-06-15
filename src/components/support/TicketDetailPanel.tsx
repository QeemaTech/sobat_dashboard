import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { TicketPriorityBadge } from '@/components/support/TicketPriorityBadge';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { SupportTicketDetail, TicketPriority, TicketStatus } from '@/types';
import { formatRelativeTime, formatTime } from '@/utils/formatters';
import { ticketDisplayId } from '@/utils/supportUtils';

const STATUS_OPTIONS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const QUICK_REPLY_KEYS = ['acknowledge', 'investigating', 'resolved', 'followUp'] as const;

interface TicketDetailPanelProps {
  detail: SupportTicketDetail | undefined;
  loading: boolean;
  reply: string;
  onReplyChange: (v: string) => void;
  onSendReply: () => void;
  onCloseTicket: () => void;
  onStatusChange: (status: TicketStatus) => void;
  onPriorityChange: (priority: TicketPriority) => void;
  assignedAdminName: string | null;
  onAssignChange: (assignee: string) => void;
  sending: boolean;
  updating: boolean;
  toast: string | null;
  onToastClose: () => void;
}

export function TicketDetailPanel({
  detail,
  loading,
  reply,
  onReplyChange,
  onSendReply,
  onCloseTicket,
  onStatusChange,
  onPriorityChange,
  assignedAdminName,
  onAssignChange,
  sending,
  updating,
  toast,
  onToastClose,
}: TicketDetailPanelProps) {
  const { t } = useTranslation();
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [detail?.replies.length, detail?.id]);

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  if (!detail) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
        <ConfirmationNumberOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
          {t('support.emptySelectTitle')}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
          {t('support.emptySelectHint')}
        </Typography>
      </Box>
    );
  }

  const lastStaffAdmin = [...detail.replies].reverse().find((r) => r.isStaff)?.admin?.fullName;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
              {detail.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              #{ticketDisplayId(detail.id)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }} disabled={updating}>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                label={t('common.status')}
                value={detail.status}
                onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
                renderValue={(v) => <TicketStatusBadge status={v as TicketStatus} compact />}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    <TicketStatusBadge status={s} compact />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }} disabled={updating}>
              <InputLabel>{t('support.priority')}</InputLabel>
              <Select
                label={t('support.priority')}
                value={detail.priority}
                onChange={(e) => onPriorityChange(e.target.value as TicketPriority)}
                renderValue={(v) => <TicketPriorityBadge priority={v as TicketPriority} compact />}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    <TicketPriorityBadge priority={p} compact />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }} disabled={updating}>
              <InputLabel>{t('support.assignedTo')}</InputLabel>
              <Select
                label={t('support.assignedTo')}
                value={assignedAdminName ?? ''}
                onChange={(e) => onAssignChange(e.target.value)}
              >
                <MenuItem value="">{t('support.unassigned')}</MenuItem>
                {assignedAdminName && <MenuItem value={assignedAdminName}>{assignedAdminName}</MenuItem>}
                {lastStaffAdmin && lastStaffAdmin !== assignedAdminName && (
                  <MenuItem value={lastStaffAdmin}>{lastStaffAdmin}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip size="small" label={t('support.metaCreated', { time: formatRelativeTime(detail.createdAt) })} variant="outlined" />
          {detail.user && (
            <Chip
              size="small"
              avatar={<UserAvatar name={detail.user.fullName} size="sm" />}
              label={t('support.metaUser', { name: detail.user.fullName })}
              component={Link}
              to={`/admin/users/${detail.user.id}`}
              clickable
              variant="outlined"
            />
          )}
          <Chip size="small" label={t('support.metaChannel', { channel: t('support.channelInApp') })} variant="outlined" />
          <Chip size="small" label={t('support.metaCategory', { category: t('support.categoryGeneral') })} variant="outlined" />
        </Box>
      </Box>

      <Box ref={threadRef} sx={{ flex: 1, overflow: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MessageBubble
          name={detail.user?.fullName ?? t('support.unknownUser')}
          message={detail.message}
          time={detail.createdAt}
          isStaff={false}
        />
        {detail.replies.map((r) => (
          <MessageBubble
            key={r.id}
            name={r.isStaff ? r.admin?.fullName ?? t('support.staff') : detail.user?.fullName ?? t('support.unknownUser')}
            message={r.message}
            time={r.createdAt}
            isStaff={r.isStaff}
          />
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('support.quickReplies')}</InputLabel>
            <Select
              label={t('support.quickReplies')}
              value=""
              displayEmpty
              onChange={(e) => {
                const key = e.target.value as (typeof QUICK_REPLY_KEYS)[number];
                if (key) onReplyChange(t(`support.quickReplyTemplates.${key}`));
              }}
            >
              <MenuItem value="" disabled>
                {t('support.selectTemplate')}
              </MenuItem>
              {QUICK_REPLY_KEYS.map((k) => (
                <MenuItem key={k} value={k}>
                  {t(`support.quickReplyTemplates.${k}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AttachFileOutlinedIcon />}
            disabled
            sx={{ alignSelf: 'center' }}
          >
            {t('support.attach')}
          </Button>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          placeholder={t('support.replyPlaceholder')}
          value={reply}
          onChange={(e) => onReplyChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && reply.trim()) {
              e.preventDefault();
              onSendReply();
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
          <Button variant="outlined" size="small" onClick={onCloseTicket} disabled={updating || detail.status === 'CLOSED'}>
            {t('support.closeTicket')}
          </Button>
          <Button
            variant="contained"
            size="small"
            endIcon={<SendOutlinedIcon />}
            disabled={!reply.trim() || sending}
            onClick={onSendReply}
          >
            {t('support.sendReply')}
          </Button>
        </Box>
      </Box>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={onToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={onToastClose}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function MessageBubble({
  name,
  message,
  time,
  isStaff,
}: {
  name: string;
  message: string;
  time: string;
  isStaff: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isStaff ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1.5,
        alignSelf: isStaff ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: isStaff ? 'primary.main' : 'grey.700', fontSize: 12 }}>
        {name.slice(0, 2).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
            flexDirection: isStaff ? 'row-reverse' : 'row',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {formatTime(time)}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: isStaff ? 'rgba(59,130,246,0.15)' : 'background.paper',
            border: 1,
            borderColor: isStaff ? 'rgba(59,130,246,0.25)' : 'divider',
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {message}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

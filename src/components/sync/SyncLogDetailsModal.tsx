import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { SyncLogSourceCell } from '@/components/sync/SyncLogSourceCell';
import { SyncLogStatusBadge } from '@/components/sync/SyncLogStatusBadge';
import type { SyncLog } from '@/types';
import { formatDateTime, shortId } from '@/utils/formatters';
import { syncLogCompletedAt, syncLogUser } from '@/utils/syncLogUtils';

interface SyncLogDetailsModalProps {
  log: SyncLog | null;
  onClose: () => void;
  onRetry?: (log: SyncLog) => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' }, gap: 1, py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}

export function SyncLogDetailsModal({ log, onClose, onRetry }: SyncLogDetailsModalProps) {
  const { t } = useTranslation();
  if (!log) return null;

  const user = syncLogUser(log);
  const completed = syncLogCompletedAt(log);

  return (
    <Modal
      open={!!log}
      title={t('syncLogs.detailsTitle', { id: shortId(log.id) })}
      onClose={onClose}
      size="lg"
      footer={
        log.status === 'FAILED' && onRetry ? (
          <Button variant="contained" color="warning" onClick={() => onRetry(log)}>
            {t('syncLogs.retrySync')}
          </Button>
        ) : undefined
      }
    >
      <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        <DetailRow label={t('syncLogs.colJob')}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {log.id}
          </Typography>
        </DetailRow>
        <DetailRow label={t('syncLogs.colSource')}>
          <SyncLogSourceCell log={log} />
        </DetailRow>
        <DetailRow label={t('syncLogs.colStatus')}>
          <SyncLogStatusBadge status={log.status} />
        </DetailRow>
        <DetailRow label={t('syncLogs.colRecords')}>
          <Typography variant="body2">{t('syncLogs.recordsCount', { count: log.recordsCount })}</Typography>
        </DetailRow>
        {user && (
          <DetailRow label={t('common.name')}>
            <Typography variant="body2">{user.fullName}</Typography>
          </DetailRow>
        )}
        <DetailRow label={t('syncLogs.colStarted')}>
          <Typography variant="body2">{formatDateTime(log.startedAt)}</Typography>
        </DetailRow>
        {completed && (
          <DetailRow label={t('syncLogs.colCompleted')}>
            <Typography variant="body2">{formatDateTime(completed)}</Typography>
          </DetailRow>
        )}
        <DetailRow label={t('syncLogs.colErrors')}>
          <Typography variant="body2" color={log.errorMessage ? 'error.main' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
            {log.errorMessage || t('syncLogs.noErrors')}
          </Typography>
        </DetailRow>
      </Stack>
    </Modal>
  );
}

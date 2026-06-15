import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Drawer,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AuditActionBadge } from '@/components/audit/AuditActionBadge';
import { AuditModuleCell } from '@/components/audit/AuditModuleCell';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { AuditLogEntry } from '@/types';
import { formatDateTime, shortId } from '@/utils/formatters';
import { adminPrimaryRole, diffRows, parseIpLocation, parseUserAgent } from '@/utils/auditUtils';

interface AuditDetailDrawerProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

export function AuditDetailDrawer({ entry, onClose }: AuditDetailDrawerProps) {
  const { t } = useTranslation();
  const open = !!entry;
  const rows = entry ? diffRows(entry.oldValues, entry.newValues) : [];
  const ipMeta = parseIpLocation(entry?.ipAddress);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 }, bgcolor: 'background.paper' } } }}
    >
      {entry && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
              {t('audit.detailTitle')}
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <AuditActionBadge action={entry.action} module={entry.module} />
              <AuditModuleCell module={entry.module} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formatDateTime(entry.createdAt)}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <MetaRow label={t('audit.colAdmin')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {entry.admin && <UserAvatar name={entry.admin.fullName} size="sm" />}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {entry.admin?.fullName ?? '—'}
                    </Typography>
                    {adminPrimaryRole(entry.admin) && (
                      <Typography variant="caption" color="text.secondary">
                        {adminPrimaryRole(entry.admin)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MetaRow>
              <MetaRow label={t('audit.colEntityId')}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {entry.entityId ?? '—'}
                </Typography>
              </MetaRow>
              <MetaRow label={t('audit.colIp')}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {ipMeta.flag} {entry.ipAddress ?? '—'}
                </Typography>
              </MetaRow>
              <MetaRow label={t('audit.device')}>
                <Typography variant="body2">{parseUserAgent(entry.userAgent)}</Typography>
              </MetaRow>
              <MetaRow label={t('audit.logId')}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  #{shortId(entry.id, 12)}
                </Typography>
              </MetaRow>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              {t('audit.changes')}
            </Typography>
            {rows.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('audit.noChanges')}
              </Typography>
            ) : (
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>{t('audit.field')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('audit.before')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('audit.after')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.field}>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{row.field}</TableCell>
                        <TableCell
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            bgcolor: row.changed ? 'rgba(239,68,68,0.08)' : 'transparent',
                          }}
                        >
                          {row.before}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            bgcolor: row.changed ? 'rgba(34,197,94,0.08)' : 'transparent',
                          }}
                        >
                          {row.after}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 1, alignItems: 'start' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, pt: 0.25 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

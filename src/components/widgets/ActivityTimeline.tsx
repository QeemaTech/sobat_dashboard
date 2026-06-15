import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Link, Tooltip, Typography } from '@mui/material';
import type { TFunction } from 'i18next';
import type { AuditAction, AuditLogEntry } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

export interface ActivityItem {
  id: string;
  action: AuditAction | 'USER_REGISTERED';
  title: string;
  adminName?: string;
  context: string;
  timestamp: string;
}

const ACTION_DOT: Record<string, string> = {
  CREATE: '#22c55e',
  UPDATE: '#eab308',
  DELETE: '#ef4444',
  LOGIN: '#3b82f6',
  LOGOUT: '#64748b',
  EXPORT: '#eab308',
  IMPORT: '#f97316',
  OTHER: '#94a3b8',
  USER_REGISTERED: '#22c55e',
};

interface ActivityTimelineProps {
  items: ActivityItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  const { t } = useTranslation();

  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        {t('common.noData')}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, index) => {
        const dotColor = ACTION_DOT[item.action] ?? ACTION_DOT.OTHER;
        const isLast = index === items.length - 1;

        return (
          <Box key={item.id} sx={{ display: 'flex', gap: 1.5, position: 'relative', pb: isLast ? 0 : 2 }}>
            {!isLast && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 22,
                  left: 7,
                  bottom: 0,
                  width: 2,
                  bgcolor: 'divider',
                  '[dir="rtl"] &': { left: 'auto', right: 7 },
                }}
              />
            )}
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: dotColor,
                flexShrink: 0,
                mt: 0.5,
                boxShadow: `0 0 0 3px ${dotColor}22`,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Tooltip title={formatDateTime(item.timestamp)} arrow>
                  <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                    {formatRelativeTime(item.timestamp)}
                  </Typography>
                </Tooltip>
              </Box>
              {item.adminName && (
                <Typography variant="body2" color="text.primary" sx={{ mt: 0.35, fontWeight: 500 }}>
                  {item.adminName}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, lineHeight: 1.5 }}>
                {item.context}
              </Typography>
            </Box>
          </Box>
        );
      })}

      <Link
        component={RouterLink}
        to="/admin/audit-log"
        variant="body2"
        underline="hover"
        sx={{ mt: 2, fontWeight: 600, display: 'inline-block' }}
      >
        {t('dashboard.viewAllActivity')}
      </Link>
    </Box>
  );
}

function moduleLabel(module: string, t: TFunction) {
  const key = `audit.modules.${module}`;
  const label = t(key);
  return label.startsWith('audit.modules.') ? module : label;
}

function auditContext(entry: AuditLogEntry, t: TFunction): string {
  const mod = moduleLabel(entry.module, t);
  switch (entry.action) {
    case 'LOGIN':
      return entry.ipAddress
        ? t('dashboard.activity.signedInFrom', { ip: entry.ipAddress })
        : t('dashboard.activity.signedInDashboard');
    case 'LOGOUT':
      return t('dashboard.activity.signedOut', { module: mod });
    case 'UPDATE': {
      const nv = entry.newValues ?? {};
      const name =
        (typeof nv.fullName === 'string' && nv.fullName) ||
        (typeof nv.titleAr === 'string' && nv.titleAr) ||
        (typeof nv.subject === 'string' && nv.subject) ||
        null;
      if (name) return t('dashboard.activity.updatedTarget', { name });
      if (entry.entityType) return t('dashboard.activity.updatedEntityType', { type: entry.entityType, module: mod });
      return t('dashboard.activity.updatedModule', { module: mod });
    }
    case 'CREATE':
      return t('dashboard.activity.createdInModule', { module: mod });
    case 'DELETE':
      return t('dashboard.activity.deletedInModule', { module: mod });
    case 'EXPORT':
      return t('dashboard.activity.exportedModule', { module: mod });
    default:
      return mod;
  }
}

export function buildActivityItems(
  recentUsers: { id: string; fullName: string; createdAt: string }[],
  auditEntries: AuditLogEntry[],
  t: TFunction
): ActivityItem[] {
  const userEvents: ActivityItem[] = recentUsers.slice(0, 2).map((u) => ({
    id: `user-${u.id}`,
    action: 'USER_REGISTERED' as const,
    title: t('dashboard.activity.userRegistered'),
    adminName: u.fullName,
    context: t('dashboard.activity.newUserJoined'),
    timestamp: u.createdAt,
  }));

  const auditEvents: ActivityItem[] = auditEntries.map((e) => {
    const mod = moduleLabel(e.module, t);
    const actionLabel = t(`auditAction.${e.action}`, e.action);
    return {
      id: e.id,
      action: e.action,
      title: `${actionLabel} · ${mod}`,
      adminName: e.admin?.fullName,
      context: auditContext(e, t),
      timestamp: e.createdAt,
    };
  });

  return [...userEvents, ...auditEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

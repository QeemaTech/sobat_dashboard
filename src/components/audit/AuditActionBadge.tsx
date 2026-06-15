import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AuditAction } from '@/types';

const ACTION_STYLE: Record<string, { color: string; bg: string }> = {
  CREATE: { color: '#ffffff', bg: '#22c55e' },
  UPDATE: { color: '#ffffff', bg: '#3b82f6' },
  DELETE: { color: '#ffffff', bg: '#ef4444' },
  EXPORT: { color: '#1e293b', bg: '#eab308' },
  LOGIN: { color: '#ffffff', bg: '#64748b' },
  LOGOUT: { color: '#ffffff', bg: '#475569' },
  IMPORT: { color: '#ffffff', bg: '#f97316' },
  OTHER: { color: '#ffffff', bg: '#94a3b8' },
};

export function AuditActionBadge({ action, module }: { action: AuditAction | string; module?: string }) {
  const { t } = useTranslation();
  const key = action in ACTION_STYLE ? action : 'OTHER';
  let style = ACTION_STYLE[key];
  if (module === 'settings' && action === 'UPDATE') {
    style = { color: '#ffffff', bg: '#f97316' };
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.25,
        py: 0.35,
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: style.color,
        bgcolor: style.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {t(`auditAction.${action}`, String(action))}
    </Box>
  );
}

export { ACTION_STYLE as AUDIT_ACTION_STYLE };

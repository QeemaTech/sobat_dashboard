import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { UserStatus } from '@/types';

const STATUS_STYLE: Record<UserStatus, { color: string; border: string; bg?: string }> = {
  ACTIVE: { color: '#16a34a', border: 'rgba(22,163,74,0.5)' },
  PENDING_VERIFICATION: { color: '#d97706', border: 'rgba(217,119,6,0.5)' },
  SUSPENDED: { color: '#dc2626', border: 'rgba(220,38,38,0.65)', bg: 'rgba(220,38,38,0.08)' },
  INACTIVE: { color: '#64748b', border: 'rgba(100,116,139,0.45)' },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.INACTIVE;
  const isSuspended = status === 'SUSPENDED';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.25,
        py: 0.25,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color: style.color,
        border: `1px solid ${style.border}`,
        bgcolor: isSuspended ? style.bg : 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {t(`status.${status}`, status)}
    </Box>
  );
}

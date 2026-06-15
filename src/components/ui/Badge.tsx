import { Chip, type ChipProps } from '@mui/material';
import type { UserStatus } from '@/types';

const statusColor: Record<UserStatus, ChipProps['color']> = {
  ACTIVE: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'error',
  INACTIVE: 'default',
};

interface BadgeProps {
  label: string;
  status?: UserStatus;
  color?: ChipProps['color'];
  className?: string;
}

export function Badge({ label, status, color, className }: BadgeProps) {
  return (
    <Chip
      size="small"
      label={label}
      color={color ?? (status ? statusColor[status] : 'default')}
      variant="outlined"
      className={className}
    />
  );
}

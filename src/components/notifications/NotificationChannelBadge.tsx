import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CHANNEL_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  IN_APP: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)' },
  PUSH: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  EMAIL: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  SMS: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
};

const CHANNEL_ICON: Record<string, typeof SmartphoneOutlinedIcon> = {
  IN_APP: SmartphoneOutlinedIcon,
  PUSH: NotificationsActiveOutlinedIcon,
  EMAIL: EmailOutlinedIcon,
  SMS: SmsOutlinedIcon,
};

export function NotificationChannelBadge({ channel }: { channel: string }) {
  const { t } = useTranslation();
  const style = CHANNEL_STYLE[channel] ?? CHANNEL_STYLE.IN_APP;
  const Icon = CHANNEL_ICON[channel] ?? SmartphoneOutlinedIcon;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.35,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
        color: style.color,
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon sx={{ fontSize: 14 }} />
      {t(`notifications.channels.${channel}`, { defaultValue: channel })}
    </Box>
  );
}


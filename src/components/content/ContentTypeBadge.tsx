import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  PAGE: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)' },
  FAQ: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' },
  TIP: { color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.4)' },
  ANNOUNCEMENT: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' },
};

export function ContentTypeBadge({ type }: { type: string }) {
  const { t } = useTranslation();
  const key = type === 'tip' ? 'TIP' : type.toUpperCase();
  const style = TYPE_STYLE[key] ?? TYPE_STYLE.PAGE;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
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
      {t(`content.types.${key}`, { defaultValue: key })}
    </Box>
  );
}

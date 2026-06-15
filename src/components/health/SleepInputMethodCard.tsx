import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Paper, Switch, Typography, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/utils/formatters';

export type InputMethodVariant = 'auto' | 'manual';

const VARIANT_THEME: Record<
  InputMethodVariant,
  { accent: string; badgeBg: string; badgeColor: string; badgeKey: string }
> = {
  auto: {
    accent: '#22c55e',
    badgeBg: 'rgba(34,197,94,0.15)',
    badgeColor: '#22c55e',
    badgeKey: 'healthSources.badgeAuto',
  },
  manual: {
    accent: '#f97316',
    badgeBg: 'rgba(249,115,22,0.15)',
    badgeColor: '#f97316',
    badgeKey: 'healthSources.badgeManual',
  },
};

interface SleepInputMethodCardProps {
  variant: InputMethodVariant;
  icon: SvgIconComponent;
  name: string;
  description: string;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  toggleDisabled?: boolean;
  recordCount: number;
  sharePercent: number;
  lastUpdatedAt: string | null;
}

export function SleepInputMethodCard({
  variant,
  icon: Icon,
  name,
  description,
  isActive,
  onToggle,
  toggleDisabled,
  recordCount,
  sharePercent,
  lastUpdatedAt,
}: SleepInputMethodCardProps) {
  const { t } = useTranslation();
  const theme = VARIANT_THEME[variant];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        borderInlineStart: `4px solid ${theme.accent}`,
        opacity: isActive ? 1 : 0.72,
        transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: (muiTheme) =>
            muiTheme.palette.mode === 'light' ? '0 4px 16px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.25)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.accent, 0.12),
              color: theme.accent,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 26 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap={false}>
                {name}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  bgcolor: theme.badgeBg,
                  color: theme.badgeColor,
                  border: `1px solid ${theme.badgeColor}`,
                }}
              >
                {t(theme.badgeKey)}
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
          <Switch
            checked={isActive}
            onChange={(_, checked) => onToggle(checked)}
            disabled={toggleDisabled}
            color={variant === 'auto' ? 'success' : 'warning'}
            slotProps={{ input: { 'aria-label': t('healthSources.toggleStatus', { name }) } }}
          />
          <Typography variant="caption" color="text.secondary">
            {isActive ? t('healthSources.statusActive') : t('healthSources.statusDisabled')}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            {t('healthSources.recordCount')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {recordCount.toLocaleString()}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            {t('healthSources.contribution')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.accent }}>
            {sharePercent}%
          </Typography>
        </Box>
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            {t('healthSources.lastUpdate')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {lastUpdatedAt ? formatDateTime(lastUpdatedAt) : t('healthSources.noUpdates')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

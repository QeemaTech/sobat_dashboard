import type { SvgIconComponent } from '@mui/icons-material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import { Box, Paper, Typography, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Sparkline } from '@/components/charts/Sparkline';
import type { TrendDirection } from '@/types';
import { formatPercent } from '@/utils/formatters';

interface KpiCardProps {
  title: string;
  value: string;
  icon: SvgIconComponent;
  iconColor?: string;
  trend?: { value: number; direction: TrendDirection };
  sparklineData?: { value: number }[];
}

export function KpiCard({ title, value, icon: Icon, iconColor = '#6366F1', trend, sparklineData }: KpiCardProps) {
  const { t } = useTranslation();
  const up = trend?.direction === 'up';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'light' ? '#E5E7EB' : 'divider'),
        borderRadius: '12px',
        boxShadow: (theme) => (theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.07)' : 'none'),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(iconColor, 0.12),
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', lineHeight: 1.4, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.25,
                borderRadius: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: (theme) => alpha(up ? theme.palette.success.main : theme.palette.error.main, 0.12),
                color: up ? 'success.main' : 'error.main',
              }}
            >
              {up ? <ArrowUpwardRoundedIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 14 }} />}
              {formatPercent(trend.value)}
            </Box>
            <Typography variant="caption" color="text.disabled">
              {t('overview.vsLastMonth')}
            </Typography>
          </Box>
        )}
      </Box>

      {sparklineData && sparklineData.length > 0 && (
        <Box sx={{ width: '100%', height: 48, minWidth: 0, overflow: 'hidden', mt: 'auto' }}>
          <Sparkline data={sparklineData} color={iconColor} />
        </Box>
      )}
    </Paper>
  );
}

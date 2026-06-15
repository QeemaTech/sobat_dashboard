import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TrendDirection } from '@/types';
import { formatPercent } from '@/utils/formatters';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; direction: TrendDirection };
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  const { t } = useTranslation();
  const up = trend?.direction === 'up';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            {value}
          </Typography>
          {trend && (
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.75rem',
                color: up ? 'success.main' : 'error.main',
              }}
            >
              {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{formatPercent(trend.value)}</span>
              <Typography component="span" variant="caption" color="text.disabled">
                {t('overview.vsLastMonth')}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            p: 1.25,
            bgcolor: (theme) => `${theme.palette.primary.main}22`,
            color: 'primary.main',
            display: 'flex',
            '& svg': { width: 20, height: 20 },
          }}
        >
          <Icon />
        </Box>
      </Box>
    </Paper>
  );
}

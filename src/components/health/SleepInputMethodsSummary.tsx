import WatchRoundedIcon from '@mui/icons-material/WatchRounded';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import { Box, Grid, Paper, Typography, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SleepInputMethodStats } from '@/types/sleepInputMethods';

interface SleepInputMethodsSummaryProps {
  stats: SleepInputMethodStats;
}

export function SleepInputMethodsSummary({ stats }: SleepInputMethodsSummaryProps) {
  const { t } = useTranslation();
  const applePct = stats.apple.sharePercent;
  const manualPct = stats.manual.sharePercent;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, height: '100%' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <BedtimeOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('healthSources.summaryTotalRecords')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {stats.totalRecords.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('healthSources.summarySplit')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              height: 10,
              borderRadius: 9999,
              overflow: 'hidden',
              bgcolor: 'action.hover',
              mb: 1.5,
            }}
          >
            {applePct > 0 && (
              <Box sx={{ width: `${applePct}%`, bgcolor: '#22c55e', minWidth: applePct > 0 ? 4 : 0 }} />
            )}
            {manualPct > 0 && (
              <Box sx={{ width: `${manualPct}%`, bgcolor: '#f97316', minWidth: manualPct > 0 ? 4 : 0 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WatchRoundedIcon sx={{ fontSize: 18, color: '#22c55e' }} />
              <Typography variant="body2">
                {t('healthSources.summaryAppleShare', { pct: applePct })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditNoteOutlinedIcon sx={{ fontSize: 18, color: '#f97316' }} />
              <Typography variant="body2">
                {t('healthSources.summaryManualShare', { pct: manualPct })}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

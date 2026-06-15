import { Box, Grid, Paper, Skeleton } from '@mui/material';
import { tokens } from '@/theme/tokens';

function KpiSkeleton() {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: tokens.radius.md }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={40} sx={{ mt: 1 }} />
          <Skeleton width="50%" height={18} sx={{ mt: 1 }} />
        </Box>
        <Skeleton variant="rounded" width={48} height={48} />
      </Box>
      <Skeleton height={48} sx={{ mt: 2 }} />
    </Paper>
  );
}

function ChartSkeleton() {
  return (
    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: tokens.radius.md, height: '100%' }}>
      <Skeleton width="40%" height={24} />
      <Skeleton height={280} sx={{ mt: 2 }} />
    </Paper>
  );
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton width={200} height={36} sx={{ mb: 3 }} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiSkeleton />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartSkeleton />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartSkeleton />
        </Grid>
      </Grid>
    </Box>
  );
}

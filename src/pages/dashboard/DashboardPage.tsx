import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import { Box, Button, Grid, Typography } from '@mui/material';
import { RevenueLineChart } from '@/components/charts/RevenueLineChart';
import { SleepDonutChart } from '@/components/charts/SleepDonutChart';
import { SubscriptionPieChart } from '@/components/charts/SubscriptionPieChart';
import { UserGrowthAreaChart } from '@/components/charts/UserGrowthAreaChart';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentUsersPanel } from '@/components/dashboard/RecentUsersPanel';
import { PageContainer } from '@/components/layout/PageContainer';
import { ActivityTimeline, buildActivityItems } from '@/components/widgets/ActivityTimeline';
import { DashboardSkeleton } from '@/components/widgets/DashboardSkeleton';
import { QuickStatWidget } from '@/components/widgets/QuickStatWidget';
import { adminService } from '@/services/admin.service';
import { auditService } from '@/services/audit.service';
import { financeService } from '@/services/finance.service';
import type { SleepZone, SubscriptionStatus } from '@/types';
import {
  formatCurrency,
  formatDurationMinutes,
  formatNumber,
  formatPercent,
  formatShortDate,
  formatSleepHours,
} from '@/utils/formatters';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartStyles } from '@/utils/chartTheme';
import { CHART_COLORS } from '@/utils/constants';
import { tokens } from '@/theme/tokens';

const ANALYTICS_DAYS = 30;

function toSparkline(data: { value: number }[]) {
  return data.length ? data : [{ value: 0 }];
}

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { tooltipStyle, axisStyle, gridProps, legendStyle } = useChartStyles();

  const overviewQuery = useQuery({
    queryKey: ['overview', i18n.language],
    queryFn: () => adminService.getOverview(),
  });

  const analyticsQuery = useQuery({
    queryKey: ['analytics', i18n.language, ANALYTICS_DAYS],
    queryFn: () => adminService.getAnalytics(ANALYTICS_DAYS),
  });

  const subscriptionStatsQuery = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: () => financeService.subscriptionStats(),
  });

  const auditQuery = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => auditService.list({ limit: 12, page: 1 }),
  });

  const { data, isLoading, isError, refetch } = overviewQuery;
  const analytics = analyticsQuery.data;
  const subStats = subscriptionStatsQuery.data;

  const activityItems = useMemo(() => {
    if (!data) return [];
    return buildActivityItems(data.recentUsers ?? [], auditQuery.data?.data ?? [], t);
  }, [data, auditQuery.data, t]);

  const newUsersThisWeek = useMemo(() => {
    const chart = data?.userGrowthChart ?? [];
    return chart.slice(-7).reduce((sum, d) => sum + d.count, 0);
  }, [data?.userGrowthChart]);

  const subscriptionLabels = useMemo(
    () =>
      (['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PENDING'] as SubscriptionStatus[]).reduce(
        (acc, s) => ({ ...acc, [s]: t(`subscription.${s}`) }),
        {} as Record<SubscriptionStatus, string>
      ),
    [t]
  );

  if (isLoading) {
    return (
      <PageContainer title={t('nav.dashboard')} subtitle={t('dashboard.subtitle')}>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer title={t('nav.dashboard')}>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {t('common.error')}
          </Typography>
          <Button variant="contained" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </Box>
      </PageContainer>
    );
  }

  const zoneData = (['PEAK', 'COMFORT', 'CAUTION', 'DANGER'] as SleepZone[]).map((zone) => ({
    name: t(`zones.${zone}`),
    zone,
    value: data.usersByZone[zone] ?? 0,
  }));

  const userSpark = toSparkline(data.userGrowthChart.map((d) => ({ value: d.count })));
  const revenueSpark = toSparkline(data.revenueChart.map((d) => ({ value: d.revenue })));
  const sleepSpark = toSparkline(
    (analytics?.dailySleepHours ?? []).slice(-14).map((d) => ({ value: d.hours }))
  );
  const subsSpark = toSparkline(
    data.revenueChart.length
      ? data.revenueChart.map((_, i, arr) => ({ value: arr.slice(0, i + 1).reduce((s, x) => s + x.revenue, 0) }))
      : [{ value: data.activeSubscriptions }]
  );

  const sleepGoalPct =
    data.totalUsers > 0 && analytics
      ? Math.round((analytics.stats.usersHitTargetToday / data.totalUsers) * 100)
      : 0;

  const newSubsCount = subStats ? (subStats.TRIAL ?? 0) + (subStats.PENDING ?? 0) : 0;

  return (
    <PageContainer title={t('nav.dashboard')} subtitle={t('dashboard.subtitle')}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <KpiCard
          title={t('overview.totalUsers')}
          value={formatNumber(data.totalUsers)}
          icon={GroupRoundedIcon}
          trend={data.trends?.totalUsers}
          sparklineData={userSpark}
        />
        <KpiCard
          title={t('overview.activeSubscriptions')}
          value={formatNumber(data.activeSubscriptions)}
          icon={AutorenewRoundedIcon}
          iconColor={tokens.secondary}
          trend={data.trends?.activeSubscriptions}
          sparklineData={subsSpark}
        />
        <KpiCard
          title={t('overview.monthlyRevenue')}
          value={formatCurrency(data.monthlyRevenue)}
          icon={AttachMoneyRoundedIcon}
          iconColor={tokens.success}
          trend={data.trends?.monthlyRevenue}
          sparklineData={revenueSpark}
        />
        <KpiCard
          title={t('overview.avgSleepHours')}
          value={formatSleepHours(data.avgSleepHours, t('overview.hoursUnit'))}
          icon={BedtimeRoundedIcon}
          iconColor="#8B5CF6"
          trend={data.trends?.avgSleepHours}
          sparklineData={sleepSpark}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <QuickStatWidget
          label={t('dashboard.quick.newUsersToday')}
          value={formatNumber(data.newUsersToday ?? 0)}
          icon={PersonAddRoundedIcon}
          color={tokens.success}
        />
        <QuickStatWidget
          label={t('dashboard.quick.newSubscriptions')}
          value={formatNumber(newSubsCount)}
          icon={AutorenewRoundedIcon}
          color={tokens.secondary}
        />
        <QuickStatWidget
          label={t('dashboard.quick.avgSessionDuration')}
          value={
            analytics
              ? formatDurationMinutes(analytics.stats.avgNapDurationMinutes, t('analytics.minutes'))
              : '—'
          }
          icon={TimerRoundedIcon}
          color={tokens.primary}
        />
        <QuickStatWidget
          label={t('dashboard.quick.sleepGoalCompletion')}
          value={analytics ? formatPercent(sleepGoalPct) : '—'}
          icon={TrackChangesRoundedIcon}
          color={tokens.warning}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
          <UserGrowthAreaChart title={t('overview.userGrowth')} data={data.userGrowthChart} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
          <SleepDonutChart
            title={t('overview.zoneDistribution')}
            subtitle={t('overview.zoneDistributionHint')}
            data={zoneData}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
          <RevenueLineChart title={t('overview.monthlyRevenueChart')} data={data.revenueChart} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
          {subStats ? (
            <SubscriptionPieChart
              title={t('dashboard.subscriptionStatus')}
              stats={subStats}
              labels={subscriptionLabels}
            />
          ) : (
            <ChartCard title={t('dashboard.subscriptionStatus')}>
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('common.loading')}</Typography>
              </Box>
            </ChartCard>
          )}
        </Grid>
      </Grid>

      {analytics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
            <ChartCard title={t('analytics.dailySleepHours')} subtitle={t('analytics.dailySleepHoursHint', { days: ANALYTICS_DAYS })}>
              <ChartContainer height={320}>
                <AreaChart data={analytics.dailySleepHours} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="sleep-hours-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} {...axisStyle} />
                  <YAxis {...axisStyle} width={48} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatShortDate(String(l))} />
                  <Area type="monotone" dataKey="hours" stroke={CHART_COLORS.primary} fill="url(#sleep-hours-grad)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </ChartCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', minWidth: 0, width: '100%' }}>
            <ChartCard title={t('analytics.debtComparison')} subtitle={t('analytics.debtComparisonHint', { days: ANALYTICS_DAYS })}>
              <ChartContainer height={320}>
                <LineChart data={analytics.debtComparison} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid {...gridProps} vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} {...axisStyle} />
                  <YAxis {...axisStyle} width={48} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatShortDate(String(l))} />
                  <Legend wrapperStyle={legendStyle} />
                  <Line type="monotone" dataKey="avgDebtHours" name={t('analytics.avgDebt')} stroke={CHART_COLORS.zones.DANGER} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="targetHours" name={t('analytics.targetHours')} stroke={CHART_COLORS.zones.PEAK} strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ minWidth: 0 }}>
          <RecentUsersPanel users={data.recentUsers ?? []} newThisWeek={newUsersThisWeek} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex', minWidth: 0 }}>
          <ChartCard title={t('dashboard.recentActivity')} sx={{ flex: 1, width: '100%' }}>
            <ActivityTimeline items={activityItems} />
          </ChartCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

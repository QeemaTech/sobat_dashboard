import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Badge } from '@/components/ui/Badge';
import { ZoneBadge } from '@/components/ui/ZoneBadge';
import { TabBar } from '@/components/ui/TabBar';
import { DataTable } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Select } from '@/components/ui/Select';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { usersService } from '@/services/users.service';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';
import type { UserStatus } from '@/types';
import { formatDate, formatDateTime, formatDurationMinutes, formatCurrency, formatDebtHHMM } from '@/utils/formatters';
import { useChartStyles } from '@/utils/chartTheme';
import { CHART_COLORS } from '@/utils/constants';
import { useLanguage } from '@/hooks/useLanguage';

function subscriptionPeriod(sub: { startDate?: string; endDate?: string | null; startsAt?: string; endsAt?: string | null }) {
  const from = sub.startDate ?? sub.startsAt;
  const to = sub.endDate ?? sub.endsAt;
  return `${formatDate(from)} — ${to ? formatDate(to) : '—'}`;
}

export function UserDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { tooltipStyle, axisStyle } = useChartStyles();
  const qc = useQueryClient();
  const [tab, setTab] = useState('sleep');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.get(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id || !data?.user.fullName) return;
    const path = `/admin/users/${id}`;
    useBreadcrumbStore.getState().setLabel(path, data.user.fullName);
    return () => useBreadcrumbStore.getState().clearLabel(path);
  }, [id, data?.user.fullName]);

  const updateMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => usersService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', id] });
      setEditing(false);
    },
  });

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  const { user, sleepProfile, recentSleepDebt, subscriptions, payments, reminders, notifications, auditLog, todaySleep } = data;
  const profile = sleepProfile as Record<string, unknown> | null;

  const sleepChart = (recentSleepDebt ?? []).map((d) => ({
    date: formatDate(d.date),
    hours: Math.round(((d.weightedDebtMinutes ?? d.cumulativeDebt ?? 0) / 60) * 10) / 10,
  }));

  const tabs = [
    { id: 'sleep', label: t('userDetail.tabSleep') },
    { id: 'subscription', label: t('userDetail.tabSubscription') },
    { id: 'notifications', label: t('userDetail.tabNotifications') },
    { id: 'activity', label: t('userDetail.tabActivity') },
  ];

  return (
    <Box>
      <PageHeader title={user.fullName} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ThemedCard sx={{ p: 3 }}>
            <Stack sx={{ textAlign: 'center', alignItems: 'center' }}>
              <UserAvatar name={user.fullName} size="lg" />
              {editing ? (
                <Stack spacing={1.5} sx={{ mt: 2, width: '100%' }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={name || user.fullName}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    value={email || user.email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      onClick={() => updateMut.mutate({ fullName: name || user.fullName, email: email || user.email })}
                    >
                      {t('common.save')}
                    </Button>
                    <Button variant="outlined" fullWidth size="small" onClick={() => setEditing(false)}>
                      {t('common.cancel')}
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                    {user.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Button
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setEditing(true);
                      setName(user.fullName);
                      setEmail(user.email || '');
                    }}
                  >
                    {t('common.edit')}
                  </Button>
                </>
              )}
            </Stack>
            <Stack spacing={1.5} sx={{ mt: 3 }} component="dl">
              <Box>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('common.phone')}
                </Typography>
                <Typography component="dd" variant="body2">
                  {user.phone || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('users.colGender')}
                </Typography>
                <Typography component="dd" variant="body2">
                  {user.gender ? t(`gender.${user.gender}`) : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('userDetail.timezone')}
                </Typography>
                <Typography component="dd" variant="body2">
                  {user.timezone}
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('userDetail.locale')}
                </Typography>
                <Typography component="dd" variant="body2">
                  {user.locale}
                </Typography>
              </Box>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('common.status')}
                </Typography>
                <Badge label={t(`status.${user.status}`)} status={user.status as UserStatus} />
              </Stack>
              <Select
                label={t('userDetail.changeStatus')}
                value={user.status}
                onChange={(v) => updateMut.mutate({ status: v })}
                options={['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING_VERIFICATION'].map((s) => ({
                  value: s,
                  label: t(`status.${s}`),
                }))}
              />
              <Box>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('common.registeredAt')}
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(user.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" variant="body2" color="text.secondary">
                  {t('users.colLastActive')}
                </Typography>
                <Typography component="dd" variant="body2">
                  {user.lastActiveAt ? formatDateTime(user.lastActiveAt) : '—'}
                </Typography>
              </Box>
            </Stack>
          </ThemedCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <ThemedCard sx={{ p: 3 }}>
            <TabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === 'sleep' && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <ZoneBadge zone={todaySleep?.zone} />
                  {profile?.sleepGoalType != null && (
                    <Badge label={t(`sleepGoals.${String(profile.sleepGoalType)}`)} />
                  )}
                  {profile?.mainGoal != null && <Badge label={t(`mainGoals.${String(profile.mainGoal)}`)} />}
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('userDetail.todaySleep')}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {todaySleep ? formatDurationMinutes(todaySleep.actualMinutes) : '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('userDetail.debtRemaining')}
                      </Typography>
                      <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>
                        {todaySleep
                          ? todaySleep.weightedDebtFormatted ??
                            formatDebtHHMM(todaySleep.cumulativeDebt ?? 0)
                          : '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500,  mb: 1 }}>
                    {t('userDetail.sleepChart')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={sleepChart}>
                      <XAxis dataKey="date" {...axisStyle} />
                      <YAxis {...axisStyle} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="hours" stroke={CHART_COLORS.primary} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            )}

            {tab === 'subscription' && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {(subscriptions ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('common.noData')}
                  </Typography>
                ) : (
                  (subscriptions ?? []).map((sub) => (
                    <Paper key={sub.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 500 }}>
                        {(isRtl ? sub.plan?.nameAr : sub.plan?.nameEn) ?? sub.plan?.nameAr ?? '—'}
                      </Typography>
                      <Badge label={t(`subscription.${sub.status}`, sub.status)} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subscriptionPeriod(sub)}
                      </Typography>
                    </Paper>
                  ))
                )}
                <DataTable
                  columns={[
                    { key: 'date', header: t('userDetail.paymentDate'), render: (r) => formatDate(r.createdAt) },
                    {
                      key: 'amount',
                      header: t('userDetail.amount'),
                      render: (r) => formatCurrency(Number(r.amount), r.currency),
                    },
                    {
                      key: 'method',
                      header: t('userDetail.method'),
                      render: (r) => t(`paymentMethod.${r.method}`, r.method),
                    },
                    {
                      key: 'status',
                      header: t('common.status'),
                      render: (r) => <Badge label={t(`paymentStatus.${r.status}`, r.status)} />,
                    },
                  ]}
                  data={payments ?? []}
                  keyExtractor={(r) => r.id}
                />
              </Stack>
            )}

            {tab === 'notifications' && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 500,  mb: 1 }}>
                    {t('userDetail.reminders')}
                  </Typography>
                  <DataTable
                    columns={[
                      { key: 'type', header: t('reminders.colType'), render: (r) => <Badge label={r.type} /> },
                      { key: 'time', header: t('reminders.colTime'), render: (r) => r.time },
                      { key: 'status', header: t('common.status'), render: (r) => r.status },
                    ]}
                    data={reminders ?? []}
                    keyExtractor={(r) => r.id}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 500,  mb: 1 }}>
                    {t('userDetail.recentNotifications')}
                  </Typography>
                  <DataTable
                    columns={[
                      { key: 'type', header: t('notifications.colType'), render: (r) => r.type },
                      { key: 'title', header: t('notifications.colTitle'), render: (r) => r.titleAr },
                      {
                        key: 'read',
                        header: t('notifications.colRead'),
                        render: (r) => (r.isRead ? t('common.yes') : t('common.no')),
                      },
                      { key: 'at', header: t('notifications.colSent'), render: (r) => formatDateTime(r.createdAt) },
                    ]}
                    data={notifications ?? []}
                    keyExtractor={(r) => r.id}
                  />
                </Box>
              </Stack>
            )}

            {tab === 'activity' && (
              <Box sx={{ mt: 2 }}>
                <DataTable
                  columns={[
                    { key: 'action', header: t('audit.colAction'), render: (r) => r.action },
                    { key: 'module', header: t('audit.colModule'), render: (r) => r.module },
                    { key: 'admin', header: t('audit.colAdmin'), render: (r) => r.admin?.fullName ?? '—' },
                    { key: 'at', header: t('audit.colDate'), render: (r) => formatDateTime(r.createdAt) },
                  ]}
                  data={auditLog ?? []}
                  keyExtractor={(r) => r.id}
                />
              </Box>
            )}
          </ThemedCard>
        </Grid>
      </Grid>
    </Box>
  );
}

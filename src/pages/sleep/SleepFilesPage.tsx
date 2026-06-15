import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { ZoneBadge } from '@/components/ui/ZoneBadge';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { sleepService, type SleepProfileRow } from '@/services/sleep.service';
import { usersService } from '@/services/users.service';
import type { SleepLog } from '@/types';
import { formatDurationMinutes } from '@/utils/formatters';

export function SleepFilesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const debounced = useDebouncedValue(search, 400);

  const listParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(debounced.length >= 2 ? { searchUser: debounced } : {}),
    }),
    [page, debounced]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sleep-profiles', listParams],
    queryFn: () => sleepService.sleepProfiles(listParams),
  });

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['sleep-plan', userId, date],
    queryFn: () => usersService.sleepPlan(userId, date),
    enabled: !!userId,
  });

  const profile = planData?.profile as Record<string, unknown> | null;
  const plan = planData?.plan;
  const records = planData?.records ?? [];

  function hourPos(iso: string) {
    const d = new Date(iso);
    return ((d.getHours() * 60 + d.getMinutes()) / (24 * 60)) * 100;
  }

  function barWidth(start: string, end: string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(2, ((e - s) / (24 * 60 * 60 * 1000)) * 100);
  }

  function selectUser(id: string) {
    setUserId(id);
  }

  const columns = [
    {
      key: 'user',
      header: t('filters.user'),
      render: (r: SleepProfileRow) =>
        r.user ? (
          <Link
            component={RouterLink}
            to={`/admin/users/${r.user.id}`}
            color="primary"
            underline="hover"
            onClick={(e) => e.stopPropagation()}
          >
            {r.user.fullName}
          </Link>
        ) : (
          '—'
        ),
    },
    {
      key: 'goal',
      header: t('filters.goal'),
      render: (r: SleepProfileRow) =>
        r.sleepGoalType ? <Badge label={t(`sleepGoals.${r.sleepGoalType}`, r.sleepGoalType)} /> : '—',
    },
    {
      key: 'bed',
      header: t('sleepFiles.targetBed'),
      render: (r: SleepProfileRow) => r.targetBedtime ?? '—',
    },
    {
      key: 'wake',
      header: t('sleepFiles.targetWake'),
      render: (r: SleepProfileRow) => r.targetWakeTime ?? '—',
    },
    {
      key: 'streak',
      header: t('sleepFiles.colStreak'),
      render: (r: SleepProfileRow) => (r.currentStreak != null ? t('sleepFiles.streak', { n: String(r.currentStreak) }) : '—'),
    },
    {
      key: 'onboarding',
      header: t('sleepFiles.colOnboarding'),
      render: (r: SleepProfileRow) => (
        <Badge label={r.onboardingCompleted ? t('sleepFiles.onboardingDone') : t('sleepFiles.onboardingPending')} />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('sleep.filesTitle')}
        actions={
          data?.meta?.total != null ? (
            <Chip label={data.meta.total} color="primary" variant="outlined" size="small" />
          ) : undefined
        }
      />

      <FilterPanel>
        <TextField
          size="small"
          fullWidth
          sx={{ maxWidth: 448 }}
          label={t('filters.userSearch')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('filters.userSearch')}
        />
      </FilterPanel>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <LoadingSpinner />
        </Box>
      ) : isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {(error as Error).message}
        </Alert>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => selectUser(r.userId)}
          />
          {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </>
      )}

      {userId && (
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Typography variant="h6">{t('sleepFiles.detailTitle')}</Typography>
            <TextField
              size="small"
              type="date"
              label={t('sleepFiles.date')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          {planLoading ? (
            <LoadingSpinner />
          ) : (
            <Stack spacing={2}>
              <ThemedCard>
                <Typography variant="subtitle1" sx={{ fontWeight: 600,  mb: 1.5 }}>
                  {t('sleepFiles.profile')}
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {profile?.sleepGoalType != null && (
                    <Badge label={t(`sleepGoals.${String(profile.sleepGoalType)}`)} />
                  )}
                  {profile?.currentStreak != null && (
                    <Badge label={t('sleepFiles.streak', { n: String(profile.currentStreak) })} />
                  )}
                </Stack>
                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    typography: 'body2',
                  }}
                >
                  <Box>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      {t('sleepFiles.targetBed')}
                    </Typography>
                    <Typography component="dd">{String(profile?.targetBedtime ?? '—')}</Typography>
                  </Box>
                  <Box>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      {t('sleepFiles.targetWake')}
                    </Typography>
                    <Typography component="dd">{String(profile?.targetWakeTime ?? '—')}</Typography>
                  </Box>
                </Box>
              </ThemedCard>

              {plan ? (
                <ThemedCard>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('sleepFiles.dailyPlan')}
                    </Typography>
                    <ZoneBadge zone={plan.zone} />
                    {plan.fajrTime && <Badge label={`${t('sleepFiles.fajr')}: ${plan.fajrTime}`} />}
                  </Stack>
                  {Boolean(profile?.fajrMode) && (
                    <Box
                      sx={{
                        display: 'grid',
                        gap: 1,
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        typography: 'body2',
                      }}
                    >
                      <Typography variant="body2">
                        {t('sleepFiles.phase1')}: {plan.phase1Start} — {plan.phase1End}
                      </Typography>
                      <Typography variant="body2">
                        {t('sleepFiles.phase2')}: {plan.phase2Start} — {plan.phase2End}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('sleepFiles.target')}: {formatDurationMinutes(plan.targetMinutes)}
                  </Typography>
                </ThemedCard>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('sleepFiles.noPlan')}
                </Typography>
              )}

              <ThemedCard>
                <Typography variant="subtitle1" sx={{ fontWeight: 600,  mb: 2 }}>
                  {t('sleepFiles.timeline')}
                </Typography>
                {records.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('common.noData')}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      position: 'relative',
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    {records.map((r: SleepLog) => (
                      <Box
                        key={r.id}
                        title={formatDurationMinutes(r.durationMinutes)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          opacity: 0.7,
                          left: `${hourPos(r.sleepStart)}%`,
                          width: `${barWidth(r.sleepStart, r.sleepEnd)}%`,
                        }}
                      />
                    ))}
                    <Box
                      sx={{
                        position: 'absolute',
                        insetInline: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        px: 0.5,
                        typography: 'caption',
                        color: 'text.disabled',
                      }}
                    >
                      {[0, 6, 12, 18, 24].map((h) => (
                        <span key={h}>{h}</span>
                      ))}
                    </Box>
                  </Box>
                )}
              </ThemedCard>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}

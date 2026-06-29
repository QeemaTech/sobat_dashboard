import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Link, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { DebtSparkline } from '@/components/sleep/DebtSparkline';
import {
  SleepDebtCumulativeBadge,
  cumulativeDebtZone,
} from '@/components/sleep/SleepDebtCumulativeBadge';
import { SleepFilterBar, type SleepFilters } from '@/components/sleep/SleepFilterBar';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { sleepService } from '@/services/sleep.service';
import type { SleepDebtRow } from '@/types';
import { formatDate, formatDebtHHMM } from '@/utils/formatters';

const DEFAULTS: SleepFilters = { userId: '', dateFrom: '', dateTo: '', type: '', zone: '', source: '' };
const PAGE_SIZE = 20;
const FETCH_LIMIT = 100;
const SPARKLINE_DAYS = 7;

interface UserDebtRow {
  id: string;
  userId: string;
  user?: SleepDebtRow['user'];
  latest: SleepDebtRow;
  debtHistoryMinutes: number[];
}

function resolveWeightedFormatted(row: SleepDebtRow): string {
  return row.weightedDebtFormatted ?? formatDebtHHMM(row.cumulativeDebt ?? 0);
}

function resolveWeightedMinutes(row: SleepDebtRow): number {
  return row.weightedDebtMinutes ?? row.cumulativeDebt ?? 0;
}

function groupByUser(rows: SleepDebtRow[]): UserDebtRow[] {
  const map = new Map<string, SleepDebtRow[]>();
  for (const row of rows) {
    if (!map.has(row.userId)) map.set(row.userId, []);
    map.get(row.userId)!.push(row);
  }

  return [...map.entries()]
    .map(([userId, history]) => {
      const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const last7 = sorted.slice(0, SPARKLINE_DAYS).reverse();
      return {
        id: userId,
        userId,
        user: sorted[0].user,
        latest: sorted[0],
        debtHistoryMinutes: last7.map((r) => resolveWeightedMinutes(r)),
      };
    })
    .sort((a, b) => resolveWeightedMinutes(b.latest) - resolveWeightedMinutes(a.latest));
}

async function fetchAllSleepDebt(params: Record<string, string | number | undefined>) {
  const first = await sleepService.sleepDebt({ ...params, page: 1, limit: FETCH_LIMIT });
  const totalPages = first.meta.totalPages ?? 1;
  if (totalPages <= 1) return first;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      sleepService.sleepDebt({ ...params, page: i + 2, limit: FETCH_LIMIT })
    )
  );
  return {
    data: rest.reduce((rows, page) => rows.concat(page.data), first.data),
    meta: first.meta,
  };
}

function formatTrend(minutes: number | undefined, t: (key: string) => string): string {
  if (!minutes) return '—';
  if (minutes > 0) return `${t('sleepDebt.trendDown')} (${minutes} ${t('common.minutes')})`;
  if (minutes < 0) return `${t('sleepDebt.trendUp')} (${Math.abs(minutes)} ${t('common.minutes')})`;
  return t('sleepDebt.trendStable');
}

export function SleepDebtPage() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters } = useUrlFilters(DEFAULTS);
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      sortBy: 'date',
      sortOrder: 'desc',
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    }),
    [filters]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sleep-debt', queryParams],
    queryFn: () => fetchAllSleepDebt(queryParams),
  });

  const userRows = useMemo(() => groupByUser(data?.data ?? []), [data]);
  const totalPages = Math.max(1, Math.ceil(userRows.length / PAGE_SIZE));
  const pagedRows = userRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    {
      key: 'user',
      header: t('common.name'),
      render: (r: UserDebtRow) =>
        r.user ? (
          <Link component={RouterLink} to={`/admin/users/${r.userId}`} color="primary" underline="hover">
            {r.user.fullName}
          </Link>
        ) : (
          r.userId
        ),
    },
    { key: 'date', header: t('sleepDebt.colDate'), render: (r: UserDebtRow) => formatDate(r.latest.date) },
    {
      key: 'weighted',
      header: t('sleepDebt.colWeightedDebt'),
      render: (r: UserDebtRow) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {resolveWeightedFormatted(r.latest)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {resolveWeightedMinutes(r.latest)} {t('common.minutes')}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'zone',
      header: t('sleepDebt.colSleepZone'),
      className: 'sleep-debt-zone-col',
      render: (r: UserDebtRow) => (
        <SleepDebtCumulativeBadge cumulativeMinutes={resolveWeightedMinutes(r.latest)} />
      ),
    },
    {
      key: 'trend',
      header: t('sleepDebt.colTrend'),
      className: 'sleep-debt-trend-col',
      render: (r: UserDebtRow) => (
        <Box>
          <Typography variant="body2">{formatTrend(r.latest.trendMinutes, t)}</Typography>
          <DebtSparkline
            data={r.debtHistoryMinutes.map((m) => m / 60)}
            zone={cumulativeDebtZone(resolveWeightedMinutes(r.latest))}
          />
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('sleep.debtTitle')}
        actions={
          data?.meta?.total != null ? (
            <Chip label={data.meta.total} color="primary" variant="outlined" size="small" />
          ) : undefined
        }
      />

      <SleepFilterBar
        filters={filters}
        onChange={(patch) => {
          setPage(1);
          setFilters(patch);
        }}
        onReset={() => {
          setPage(1);
          resetFilters();
        }}
      />

      {isError ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {(error as Error).message}
        </Alert>
      ) : null}

      <DataTable columns={columns} data={pagedRows} loading={isLoading} keyExtractor={(r) => r.id} />

      {userRows.length > PAGE_SIZE && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </Box>
  );
}

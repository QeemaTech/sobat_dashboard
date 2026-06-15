import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Link } from '@mui/material';
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
import { formatDate, formatDurationMinutes } from '@/utils/formatters';

const DEFAULTS: SleepFilters = { userId: '', dateFrom: '', dateTo: '', type: '', zone: '', source: '' };
const PAGE_SIZE = 20;
const FETCH_LIMIT = 100;
const SPARKLINE_DAYS = 7;

interface UserDebtRow {
  id: string;
  userId: string;
  user?: SleepDebtRow['user'];
  latest: SleepDebtRow;
  debtHistoryHours: number[];
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
        debtHistoryHours: last7.map((r) => Math.max(0, Number(r.debtMinutes) || 0) / 60),
      };
    })
    .sort((a, b) => a.latest.cumulativeDebt - b.latest.cumulativeDebt);
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
    { key: 'target', header: t('sleepDebt.colTarget'), render: (r: UserDebtRow) => formatDurationMinutes(r.latest.targetMinutes) },
    { key: 'actual', header: t('sleepDebt.colActual'), render: (r: UserDebtRow) => formatDurationMinutes(r.latest.actualMinutes) },
    { key: 'debt', header: t('sleepDebt.colDebt'), render: (r: UserDebtRow) => formatDurationMinutes(r.latest.debtMinutes) },
    {
      key: 'cum',
      header: t('sleepDebt.colCumulative'),
      render: (r: UserDebtRow) => formatDurationMinutes(r.latest.cumulativeDebt),
    },
    {
      key: 'zone',
      header: t('sleepDebt.colSleepZone'),
      className: 'sleep-debt-zone-col',
      render: (r: UserDebtRow) => (
        <SleepDebtCumulativeBadge cumulativeMinutes={Number(r.latest.cumulativeDebt) || 0} />
      ),
    },
    {
      key: 'trend',
      header: t('sleepDebt.colTrend'),
      className: 'sleep-debt-trend-col',
      render: (r: UserDebtRow) => {
        const zone = cumulativeDebtZone(Number(r.latest.cumulativeDebt) || 0);
        return <DebtSparkline data={r.debtHistoryHours} zone={zone} />;
      },
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

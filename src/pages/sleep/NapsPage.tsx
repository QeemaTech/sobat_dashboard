import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { SleepFilterBar, type SleepFilters } from '@/components/sleep/SleepFilterBar';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { sleepService } from '@/services/sleep.service';
import type { NapRecord } from '@/types';
import { formatDateTime, formatDurationMinutes, exportCsv } from '@/utils/formatters';

const DEFAULTS: SleepFilters = { userId: '', dateFrom: '', dateTo: '', type: '', zone: '', source: '' };

export function NapsPage() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    }),
    [filters, page]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['naps', params],
    queryFn: () => sleepService.naps(params),
  });

  const columns = [
    {
      key: 'user',
      header: t('common.name'),
      render: (r: NapRecord) =>
        r.user ? (
          <Box component={Link} to={`/admin/users/${r.userId}`} sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            {r.user.fullName}
          </Box>
        ) : (
          r.userId
        ),
    },
    { key: 'start', header: t('naps.colStart'), render: (r: NapRecord) => formatDateTime(r.napStart) },
    { key: 'end', header: t('naps.colEnd'), render: (r: NapRecord) => formatDateTime(r.napEnd) },
    { key: 'dur', header: t('naps.colDuration'), render: (r: NapRecord) => formatDurationMinutes(r.durationMinutes) },
    { key: 'source', header: t('filters.source'), render: (r: NapRecord) => <Badge label={r.source} /> },
    { key: 'notes', header: t('naps.colNotes'), render: (r: NapRecord) => r.notes || '—' },
    { key: 'created', header: t('sleepLogs.col.created'), render: (r: NapRecord) => formatDateTime(r.createdAt) },
  ];

  function handleExport() {
    exportCsv(
      'naps.csv',
      [
        t('common.name'),
        t('naps.colStart'),
        t('naps.colEnd'),
        t('naps.colDuration'),
        t('filters.source'),
        t('naps.colNotes'),
        t('sleepLogs.col.created'),
      ],
      (data?.data ?? []).map((r) => [
        r.user?.fullName ?? r.userId,
        formatDateTime(r.napStart),
        formatDateTime(r.napEnd),
        formatDurationMinutes(r.durationMinutes),
        r.source,
        r.notes ?? '',
        formatDateTime(r.createdAt),
      ])
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('sleep.napsTitle')}
        actions={<ExportCsvButton onClick={handleExport} disabled={!(data?.data?.length)} />}
      />
      <SleepFilterBar filters={filters} onChange={setFilters} onReset={resetFilters} showSourceFilter />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </Box>
  );
}

import { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SleepFilterBar, type SleepFilters } from '@/components/sleep/SleepFilterBar';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { sleepService } from '@/services/sleep.service';
import type { SessionType, SleepLog } from '@/types';
import { formatDateTime, formatDurationMinutes } from '@/utils/formatters';

const DEFAULTS: SleepFilters = { userId: '', dateFrom: '', dateTo: '', type: '', zone: '', source: '' };

const COL_KEYS = ['user', 'type', 'start', 'end', 'duration', 'source', 'quality', 'created'] as const;

export function SleepLogsPage() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.zone ? { zone: filters.zone } : {}),
      ...(filters.source ? { source: filters.source } : {}),
    }),
    [filters, page]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['sleep-logs', params],
    queryFn: () => sleepService.sleepLogs(params),
  });

  return (
    <Box>
      <PageHeader
        title={t('sleep.logsTitle')}
        actions={
          data?.meta?.total != null ? (
            <Chip label={data.meta.total} color="primary" variant="outlined" size="small" />
          ) : undefined
        }
      />
      <SleepFilterBar filters={filters} onChange={setFilters} onReset={resetFilters} showTypeFilter showZoneFilter showSourceFilter />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                {COL_KEYS.map((k) => (
                  <TableCell key={k} sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {t(`sleepLogs.col.${k}`)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.data ?? []).map((row: SleepLog) => (
                <Fragment key={row.id}>
                  <TableRow
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                  >
                    <TableCell>
                      {row.user ? (
                        <Link
                          component={RouterLink}
                          to={`/admin/users/${row.userId}`}
                          color="primary"
                          underline="hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.user.fullName}
                        </Link>
                      ) : (
                        row.userId
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge label={t(`session.${row.sessionType as SessionType}`)} />
                    </TableCell>
                    <TableCell>{formatDateTime(row.sleepStart)}</TableCell>
                    <TableCell>{formatDateTime(row.sleepEnd)}</TableCell>
                    <TableCell>{formatDurationMinutes(row.durationMinutes)}</TableCell>
                    <TableCell>
                      <Badge label={row.source} />
                    </TableCell>
                    <TableCell>{row.quality ?? '—'}</TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  </TableRow>
                  {expanded === row.id && (
                    <TableRow sx={{ bgcolor: 'action.selected' }}>
                      <TableCell colSpan={8}>
                        <Typography variant="body2" color="text.secondary">
                          {t('sleepLogs.notes')}: {row.notes || '—'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sleepLogs.externalId')}: {row.externalId || '—'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sleepLogs.healthSource')}: {row.healthSource?.nameAr || row.healthSource?.nameEn || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </Box>
  );
}

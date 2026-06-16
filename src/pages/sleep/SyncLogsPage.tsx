import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SyncJobIdCell } from '@/components/sync/SyncJobIdCell';
import { SyncLogDetailsModal } from '@/components/sync/SyncLogDetailsModal';
import { SyncLogSourceCell } from '@/components/sync/SyncLogSourceCell';
import { SyncLogStatusBadge } from '@/components/sync/SyncLogStatusBadge';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { sleepService } from '@/services/sleep.service';
import type { SyncLog } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';
import {
  adminTableActionsSx,
  adminTableAlign,
  adminTableClass,
  adminTableHeadCellSx,
  adminTableShellSx,
  adminTableSx,
  adminTableWrapperClass,
} from '@/utils/tableStyles';

const DEFAULTS = { status: '', search: '' };
const STATUS_CHIPS = ['', 'SUCCESS', 'PARTIAL', 'FAILED'] as const;
const COL_COUNT = 6;

type TableColAlign = 'start' | 'center';

const SYNC_COLUMNS: { key: string; labelKey: string; width: string; align: TableColAlign }[] = [
  { key: 'job', labelKey: 'syncLogs.colJob', width: '16%', align: 'start' },
  { key: 'source', labelKey: 'syncLogs.colSource', width: '22%', align: 'start' },
  { key: 'status', labelKey: 'syncLogs.colStatus', width: '12%', align: 'center' },
  { key: 'records', labelKey: 'syncLogs.colRecords', width: '12%', align: 'center' },
  { key: 'started', labelKey: 'syncLogs.colStarted', width: '18%', align: 'start' },
  { key: 'actions', labelKey: 'common.actions', width: '12%', align: 'center' },
];

function headCellSx(width: string, align: TableColAlign) {
  return { ...adminTableHeadCellSx, ...adminTableAlign[align], width };
}

function bodyCellSx(align: TableColAlign) {
  return adminTableAlign[align];
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: COL_COUNT }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 0 ? 88 : j === 4 ? 140 : 72} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function SyncLogsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const qc = useQueryClient();
  const { filters, setFilter, page, setPage } = useUrlFilters(DEFAULTS);
  const [details, setDetails] = useState<SyncLog | null>(null);
  const [toast, setToast] = useState('');

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      sortOrder: 'desc' as const,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    }),
    [filters, page]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sync-logs', params],
    queryFn: () => sleepService.syncLogs(params),
  });

  const handleRetry = (log: SyncLog) => {
    setToast(t('syncLogs.retryQueued', { id: log.id.slice(0, 8) }));
    setDetails(null);
    void qc.invalidateQueries({ queryKey: ['sync-logs'] });
  };

  return (
    <Box>
      <PageHeader title={t('sleep.syncTitle')} description={t('syncLogs.pageSubtitle')} />

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 3 }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {STATUS_CHIPS.map((status) => (
              <Chip
                key={status || 'all'}
                label={status ? t(`syncLogs.status.${status}`) : t('syncLogs.filterAll')}
                clickable
                color={filters.status === status ? 'primary' : 'default'}
                variant={filters.status === status ? 'filled' : 'outlined'}
                onClick={() => {
                  setPage(1);
                  setFilter('status', status);
                }}
                size="small"
              />
            ))}
          </Box>

          <TextField
            size="small"
            placeholder={t('syncLogs.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => {
              setPage(1);
              setFilter('search', e.target.value);
            }}
            slotProps={{
              input: {
                startAdornment: <SearchOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />,
              },
            }}
            sx={{ maxWidth: 360 }}
          />
        </Stack>
      </Paper>

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

      <TableContainer
        component={Paper}
        elevation={0}
        className={adminTableWrapperClass}
        sx={adminTableShellSx}
      >
        <Table size="small" className={adminTableClass} dir={theme.direction} sx={{ ...adminTableSx, minWidth: 880 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              {SYNC_COLUMNS.map((col) => (
                <TableCell
                  key={col.key}
                  className={col.align === 'center' ? 'cell-center' : col.key === 'actions' ? 'cell-actions' : undefined}
                  sx={headCellSx(col.width, col.align)}
                >
                  {t(col.labelKey)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell colSpan={COL_COUNT} sx={{ border: 0 }}>
                  <EmptyState message={t('syncLogs.empty')} />
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={bodyCellSx('start')}>
                    <SyncJobIdCell id={row.id} onViewDetails={() => setDetails(row)} />
                  </TableCell>
                  <TableCell sx={bodyCellSx('start')}>
                    <SyncLogSourceCell log={row} />
                  </TableCell>
                  <TableCell className="cell-center" sx={bodyCellSx('center')}>
                    <SyncLogStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="cell-center" sx={{ ...bodyCellSx('center'), whiteSpace: 'nowrap' }}>
                    <Typography variant="body2">{t('syncLogs.recordsCount', { count: row.recordsCount })}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx('start'), whiteSpace: 'nowrap' }}>
                    <Tooltip title={formatDateTime(row.startedAt)}>
                      <Typography variant="body2">{formatRelativeTime(row.startedAt)}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="cell-actions" sx={bodyCellSx('center')}>
                    <Box sx={adminTableActionsSx}>
                      <Tooltip title={t('syncLogs.viewDetails')}>
                        <IconButton size="small" color="primary" onClick={() => setDetails(row)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {row.status === 'FAILED' && (
                        <Tooltip title={t('syncLogs.retrySync')}>
                          <IconButton size="small" color="warning" onClick={() => handleRetry(row)}>
                            <RefreshOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data?.meta && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}

      <SyncLogDetailsModal log={details} onClose={() => setDetails(null)} onRetry={handleRetry} />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

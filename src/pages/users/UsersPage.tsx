import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usersService } from '@/services/users.service';
import type { SleepGoalType, SleepZone, UserListItem, UserStatus } from '@/types';
import { formatDate, formatDateTime, exportCsv } from '@/utils/formatters';

const DEFAULTS = {
  search: '',
  status: '',
  goal: '',
  subscription: '',
  dateFrom: '',
  dateTo: '',
};

const statusColor: Record<UserStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'error',
  INACTIVE: 'default',
};

const zoneColor: Record<SleepZone, 'success' | 'info' | 'warning' | 'error'> = {
  PEAK: 'success',
  COMFORT: 'info',
  CAUTION: 'warning',
  DANGER: 'error',
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function UsersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { filters, setFilter, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.goal ? { goal: filters.goal } : {}),
      ...(filters.subscription ? { subscription: filters.subscription } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    }),
    [page, debouncedSearch, filters]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => usersService.list(queryParams),
  });

  const banMut = useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) => (ban ? usersService.ban(id) : usersService.unban(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteId(null);
    },
  });

  function handleExport() {
    const rows = (data?.data ?? []).map((u) => [
      u.fullName,
      u.email ?? '',
      t(`status.${u.status}`),
      u.sleepProfile?.sleepGoalType ? t(`sleepGoals.${u.sleepProfile.sleepGoalType as SleepGoalType}`) : '',
      u.subscriptionStatus ? t(`subscription.${u.subscriptionStatus}`) : '',
      formatDate(u.createdAt),
    ]);
    exportCsv(
      'users.csv',
      [t('common.name'), t('common.email'), t('common.status'), t('filters.goal'), t('filters.subscription'), t('common.registeredAt')],
      rows
    );
  }

  const users = data?.data ?? [];

  return (
    <Box sx={{ minWidth: 0, width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Typography variant="h5">{t('users.title')}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          {data?.meta?.total != null && (
            <Chip label={data.meta.total} color="primary" variant="outlined" size="small" />
          )}
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small">
            {t('users.exportCsv')}
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' },
          }}
        >
          <TextField
            sx={{ gridColumn: { xl: 'span 2' } }}
            size="small"
            label={t('common.search')}
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setFilter('search', e.target.value);
            }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              label={t('common.status')}
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value="ACTIVE">{t('status.ACTIVE')}</MenuItem>
              <MenuItem value="PENDING_VERIFICATION">{t('status.PENDING_VERIFICATION')}</MenuItem>
              <MenuItem value="SUSPENDED">{t('status.SUSPENDED')}</MenuItem>
              <MenuItem value="INACTIVE">{t('status.INACTIVE')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>{t('filters.goal')}</InputLabel>
            <Select label={t('filters.goal')} value={filters.goal} onChange={(e) => setFilter('goal', e.target.value)}>
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value="FAJR_WAKE">{t('sleepGoals.FAJR_WAKE')}</MenuItem>
              <MenuItem value="SHIFT_SYSTEM">{t('sleepGoals.SHIFT_SYSTEM')}</MenuItem>
              <MenuItem value="DEBT_RECOVERY">{t('sleepGoals.DEBT_RECOVERY')}</MenuItem>
              <MenuItem value="FOCUS_BOOST">{t('sleepGoals.FOCUS_BOOST')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>{t('filters.subscription')}</InputLabel>
            <Select
              label={t('filters.subscription')}
              value={filters.subscription}
              onChange={(e) => setFilter('subscription', e.target.value)}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value="ACTIVE">{t('subscription.ACTIVE')}</MenuItem>
              <MenuItem value="TRIAL">{t('subscription.TRIAL')}</MenuItem>
              <MenuItem value="EXPIRED">{t('subscription.EXPIRED')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={t('filters.dateFrom')}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            size="small"
            label={t('filters.dateTo')}
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <Button
          size="small"
          sx={{ mt: 2 }}
          onClick={() => {
            resetFilters();
            setSearchInput('');
          }}
        >
          {t('filters.reset')}
        </Button>
      </Paper>

      <TableContainer component={Paper} className="admin-data-table-wrapper" sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small" className="admin-data-table" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '22%', textAlign: 'start' }}>{t('users.colUser')}</TableCell>
              <TableCell sx={{ width: '13%' }}>{t('users.colGoal')}</TableCell>
              <TableCell sx={{ width: '9%' }}>{t('users.colZone')}</TableCell>
              <TableCell sx={{ width: '11%' }}>{t('users.colSubscription')}</TableCell>
              <TableCell sx={{ width: '10%' }}>{t('common.registeredAt')}</TableCell>
              <TableCell sx={{ width: '11%' }}>{t('users.colLastActive')}</TableCell>
              <TableCell sx={{ width: 120, minWidth: 120, maxWidth: 120 }}>{t('common.status')}</TableCell>
              <TableCell sx={{ width: 100, minWidth: 100, maxWidth: 100 }} align="center">
                {t('common.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('common.loading')}</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('common.noData')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((row) => <UserRow key={row.id} row={row} onBan={banMut.mutate} onDelete={setDeleteId} t={t} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!deleteId}
        title={t('users.deleteTitle')}
        message={t('users.deleteMessage')}
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </Box>
  );
}

const cellEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

function UserRow({
  row,
  onBan,
  onDelete,
  t,
}: {
  row: UserListItem;
  onBan: (v: { id: string; ban: boolean }) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}) {
  const suspended = row.status === 'SUSPENDED';

  return (
    <TableRow hover>
      <TableCell sx={cellEllipsis}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, flexShrink: 0 }}>
            {initials(row.fullName)}
          </Avatar>
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, ...cellEllipsis }}>
              {row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={cellEllipsis}>
              {row.email}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell sx={cellEllipsis}>
        {row.sleepProfile?.sleepGoalType ? (
          <Chip
            size="small"
            label={t(`sleepGoals.${row.sleepProfile.sleepGoalType as SleepGoalType}`)}
            variant="outlined"
            sx={{ maxWidth: '100%', '& .MuiChip-label': { ...cellEllipsis } }}
          />
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell sx={cellEllipsis}>
        {row.sleepZone ? (
          <Chip size="small" label={t(`zones.${row.sleepZone}`)} color={zoneColor[row.sleepZone]} variant="outlined" />
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell sx={cellEllipsis}>
        {row.subscriptionStatus ? (
          <Chip
            size="small"
            label={t(`subscription.${row.subscriptionStatus}`)}
            variant="outlined"
            sx={{ maxWidth: '100%', '& .MuiChip-label': { ...cellEllipsis } }}
          />
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell sx={cellEllipsis}>{formatDate(row.createdAt)}</TableCell>
      <TableCell sx={cellEllipsis}>
        {row.lastActiveAt || row.lastLoginAt ? formatDateTime(row.lastActiveAt || row.lastLoginAt!) : '—'}
      </TableCell>
      <TableCell sx={{ ...cellEllipsis, width: 120, minWidth: 120, maxWidth: 120 }}>
        <Chip
          size="small"
          label={t(`status.${row.status}`)}
          color={statusColor[row.status as UserStatus]}
          sx={{ maxWidth: '100%', '& .MuiChip-label': { ...cellEllipsis } }}
        />
      </TableCell>
      <TableCell align="center" sx={{ width: 100, minWidth: 100, maxWidth: 100, px: 0.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'center', gap: 0.25 }}>
          <Tooltip title={t('common.view')}>
            <IconButton component={RouterLink} to={`/admin/users/${row.id}`} size="small" color="primary">
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={suspended ? t('users.unban') : t('users.ban')}>
            <IconButton
              size="small"
              color="warning"
              onClick={() => onBan({ id: row.id, ban: !suspended })}
            >
              {suspended ? <HowToRegOutlinedIcon fontSize="small" /> : <BlockOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

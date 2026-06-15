import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { ReminderStatusBadge } from '@/components/reminders/ReminderStatusBadge';
import { ReminderTypeBadge } from '@/components/reminders/ReminderTypeBadge';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { sleepService } from '@/services/sleep.service';
import type { Reminder } from '@/types';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const REMINDER_TYPES = ['BEDTIME', 'WAKE_UP', 'FAJR', 'NAP', 'CUSTOM'] as const;
const REMINDER_STATUSES = ['ACTIVE', 'PAUSED', 'DISABLED'] as const;
const DEFAULTS = { type: '', status: '' };

function normalizeDays(days: Reminder['daysOfWeek']): number[] {
  if (!days) return [];
  if (Array.isArray(days)) return days.map((d) => Number(d)).filter((d) => !Number.isNaN(d));
  return [];
}

function formatDaysLabel(days: number[], t: (key: string) => string) {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return t('reminders.allDays');
  return sorted.map((d) => t(`days.${DAY_KEYS[d] ?? 'sun'}`)).join('، ');
}

export function RemindersPage() {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      sortBy: 'time',
      sortOrder: 'asc',
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    }),
    [filters, page]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['reminders', params],
    queryFn: () => sleepService.reminders(params),
  });

  const columns = [
    {
      key: 'user',
      header: t('common.name'),
      minWidth: 140,
      render: (r: Reminder) =>
        r.user ? (
          <Link component={RouterLink} to={`/admin/users/${r.userId}`} color="primary" underline="hover">
            {r.user.fullName}
          </Link>
        ) : (
          r.userId
        ),
    },
    {
      key: 'type',
      header: t('reminders.colType'),
      minWidth: 100,
      width: 108,
      render: (r: Reminder) => <ReminderTypeBadge type={r.type} />,
    },
    {
      key: 'time',
      header: t('reminders.colTime'),
      minWidth: 72,
      width: 80,
      align: 'center' as const,
      render: (r: Reminder) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, textAlign: 'center' }}>
          {r.time}
        </Typography>
      ),
    },
    {
      key: 'days',
      header: t('reminders.colDays'),
      minWidth: 200,
      render: (r: Reminder) => {
        const days = normalizeDays(r.daysOfWeek);
        if (!days.length) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        const label = formatDaysLabel(days, t);
        return (
          <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.6, textAlign: 'start' }} title={label}>
            {label}
          </Typography>
        );
      },
    },
    {
      key: 'status',
      header: t('common.status'),
      minWidth: 96,
      width: 96,
      render: (r: Reminder) => <ReminderStatusBadge status={r.status} />,
    },
    {
      key: 'fajr',
      header: t('reminders.colFajrOffset'),
      minWidth: 108,
      width: 120,
      render: (r: Reminder) => {
        const offset = r.fajrOffset ?? r.fajrOffsetMinutes;
        if (r.type !== 'FAJR' || offset == null) return '—';
        return (
          <Typography variant="body2" sx={{ textAlign: 'start' }}>
            {t('reminders.fajrOffsetValue', { minutes: offset })}
          </Typography>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader title={t('reminders.title')} description={t('reminders.pageSubtitle')} />

      <FilterPanel sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <Select
            label={t('reminders.colType')}
            value={filters.type}
            onChange={(v) => setFilter('type', v)}
            options={[
              { value: '', label: t('filters.all') },
              ...REMINDER_TYPES.map((type) => ({
                value: type,
                label: t(`reminders.types.${type}`),
              })),
            ]}
            className="min-w-[160px]"
          />
          <Select
            label={t('common.status')}
            value={filters.status}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: '', label: t('filters.all') },
              ...REMINDER_STATUSES.map((status) => ({
                value: status,
                label: t(`reminders.status.${status}`),
              })),
            ]}
            className="min-w-[140px]"
          />
          {(filters.type || filters.status) && (
            <Button size="small" onClick={resetFilters}>
              {t('filters.reset')}
            </Button>
          )}
        </Box>
      </FilterPanel>

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      {data?.meta && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </Box>
  );
}

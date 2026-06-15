import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, Users, Clock, Ban, AlertCircle } from 'lucide-react';
import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Drawer } from '@/components/ui/Drawer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { financeService } from '@/services/finance.service';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { formatDate, formatCurrency, formatDateTime } from '@/utils/formatters';
import type { SubscriptionListItem } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

const DEFAULTS = { planId: '', status: '', dateFrom: '', dateTo: '', method: '' };

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { filters, setFilter, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: () => financeService.subscriptionStats(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => financeService.listPlans(),
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.planId ? { planId: filters.planId } : {}),
    }),
    [page, filters]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', queryParams],
    queryFn: () => financeService.listSubscriptions(queryParams),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['subscription', selectedId],
    queryFn: () => financeService.getSubscription(selectedId!),
    enabled: !!selectedId,
  });

  const filtered = useMemo(() => {
    let rows = data?.data ?? [];
    if (filters.dateFrom) {
      rows = rows.filter((r) => new Date(r.startDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      rows = rows.filter((r) => new Date(r.startDate) <= new Date(filters.dateTo));
    }
    return rows;
  }, [data?.data, filters.dateFrom, filters.dateTo]);

  const columns = [
    {
      key: 'user',
      header: t('subscriptions.colUser'),
      render: (r: SubscriptionListItem) =>
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
      key: 'plan',
      header: t('subscriptions.colPlan'),
      render: (r: SubscriptionListItem) => (isRtl ? r.plan?.nameAr : r.plan?.nameEn) ?? '—',
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (r: SubscriptionListItem) => <Badge label={t(`subscriptionStatus.${r.status}`, r.status)} />,
    },
    { key: 'start', header: t('subscriptions.colStart'), render: (r: SubscriptionListItem) => formatDate(r.startDate) },
    { key: 'end', header: t('subscriptions.colEnd'), render: (r: SubscriptionListItem) => (r.endDate ? formatDate(r.endDate) : '—') },
    {
      key: 'autoRenew',
      header: t('subscriptions.colAutoRenew'),
      render: (r: SubscriptionListItem) =>
        r.autoRenew ? <Check size={16} color="var(--mui-palette-success-main)" /> : <X size={16} />,
    },
    {
      key: 'cancelled',
      header: t('subscriptions.colCancelled'),
      render: (r: SubscriptionListItem) => (r.cancelledAt ? formatDate(r.cancelledAt) : '—'),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('finance.subscriptionsTitle')} />

      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        <StatCard title={t('subscriptions.statsActive')} value={String(stats?.ACTIVE ?? 0)} icon={Users} />
        <StatCard title={t('subscriptions.statsTrial')} value={String(stats?.TRIAL ?? 0)} icon={Clock} />
        <StatCard title={t('subscriptions.statsExpired')} value={String(stats?.EXPIRED ?? 0)} icon={AlertCircle} />
        <StatCard title={t('subscriptions.statsCancelled')} value={String(stats?.CANCELLED ?? 0)} icon={Ban} />
      </Box>

      <FilterPanel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <Select
            label={t('subscriptions.filterPlan')}
            value={filters.planId}
            onChange={(v) => setFilter('planId', v)}
            options={[
              { value: '', label: t('filters.all') },
              ...plans.map((p) => ({ value: p.id, label: isRtl ? p.nameAr : p.nameEn })),
            ]}
            className="min-w-[160px]"
          />
          <Select
            label={t('common.status')}
            value={filters.status}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: '', label: t('filters.all') },
              ...(['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PENDING'] as const).map((s) => ({
                value: s,
                label: t(`subscriptionStatus.${s}`, s),
              })),
            ]}
            className="min-w-[140px]"
          />
          <TextField
            size="small"
            type="date"
            label={t('filters.dateFrom')}
            value={filters.dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label={t('filters.dateTo')}
            value={filters.dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button variant="outlined" size="small" onClick={resetFilters}>
            {t('filters.reset')}
          </Button>
        </Box>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => setSelectedId(r.id)}
      />
      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <Drawer open={!!selectedId} title={t('subscriptions.detailTitle')} onClose={() => setSelectedId(null)} width="max-w-2xl">
        {detailLoading ? (
          <LoadingSpinner />
        ) : detail ? (
          <Stack spacing={2} sx={{ typography: 'body2' }}>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('subscriptions.colUser')}
                </Typography>
                {detail.user && (
                  <Link component={RouterLink} to={`/admin/users/${detail.user.id}`} color="primary" underline="hover" sx={{ mt: 0.5, display: 'block' }}>
                    {detail.user.fullName}
                  </Link>
                )}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('subscriptions.colPlan')}
                </Typography>
                <Typography sx={{ mt: 0.5 }}>{isRtl ? detail.plan?.nameAr : detail.plan?.nameEn}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('common.status')}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Badge label={t(`subscriptionStatus.${detail.status}`, detail.status)} />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('subscriptions.colAutoRenew')}
                </Typography>
                <Typography sx={{ mt: 0.5 }}>{detail.autoRenew ? t('common.yes') : t('common.no')}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('subscriptions.colStart')}
                </Typography>
                <Typography sx={{ mt: 0.5 }}>{formatDate(detail.startDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('subscriptions.colEnd')}
                </Typography>
                <Typography sx={{ mt: 0.5 }}>{detail.endDate ? formatDate(detail.endDate) : '—'}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 500,  mb: 1 }}>
                {t('subscriptions.paymentHistory')}
              </Typography>
              {(detail.payments ?? []).length === 0 ? (
                <Typography color="text.secondary">{t('common.noData')}</Typography>
              ) : (
                <Stack spacing={1}>
                  {detail.payments!.map((p) => (
                    <Paper key={p.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 1.5, py: 1, borderRadius: 2 }}>
                      <span>{formatCurrency(Number(p.amount), p.currency)}</span>
                      <Badge label={t(`paymentStatus.${p.status}`, p.status)} />
                      <Typography variant="body2" color="text.secondary">
                        {p.paidAt ? formatDateTime(p.paidAt) : formatDateTime(p.createdAt)}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </Box>
  );
}

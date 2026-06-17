import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, User, RotateCcw } from 'lucide-react';
import { Box, Button, Link, TableCell, TableRow, TextField } from '@mui/material';
import { PaymentMethodBadge } from '@/components/finance/PaymentMethodBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { financeService } from '@/services/finance.service';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency, formatDateTime, exportCsv } from '@/utils/formatters';
import type { PaymentListItem } from '@/types';

const DEFAULTS = { status: '', method: '', dateFrom: '', dateTo: '', userSearch: '' };

export function PaymentsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { filters, setFilter, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);
  const [searchInput, setSearchInput] = useState(filters.userSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [refundId, setRefundId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => financeService.paymentStats(),
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.method ? { method: filters.method } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    }),
    [page, filters]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['payments', queryParams],
    queryFn: () => financeService.listPayments(queryParams),
  });

  const refundMut = useMutation({
    mutationFn: (id: string) => financeService.refundPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-stats'] });
      setRefundId(null);
    },
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch) return data?.data ?? [];
    const q = debouncedSearch.toLowerCase();
    return (data?.data ?? []).filter(
      (p) =>
        p.user?.fullName.toLowerCase().includes(q) ||
        (p.user?.email?.toLowerCase().includes(q) ?? false)
    );
  }, [data?.data, debouncedSearch]);

  const pageTotal = filtered.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? Number(p.amount) : 0), 0);
  const currency = filtered[0]?.currency ?? 'SAR';

  function handleExport() {
    exportCsv(
      'payments.csv',
      [
        t('payments.colRef'),
        t('filters.user'),
        t('common.email'),
        t('payments.colAmount'),
        t('payments.colCurrency'),
        t('payments.colMethod'),
        t('common.status'),
        t('payments.colPaidAt'),
      ],
      filtered.map((p) => [
        p.providerRef ?? p.id,
        p.user?.fullName ?? '',
        p.user?.email ?? '',
        String(p.amount),
        p.currency,
        p.method ? t(`paymentMethod.${p.method}`, p.method) : '',
        t(`paymentStatus.${p.status}`, p.status),
        formatDateTime(p.paidAt ?? p.createdAt),
      ])
    );
  }

  const columns = [
    {
      key: 'ref',
      header: t('payments.colRef'),
      render: (r: PaymentListItem) => (
        <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {r.providerRef ? `${r.providerRef.slice(0, 12)}…` : r.id.slice(0, 8)}
        </Box>
      ),
    },
    {
      key: 'user',
      header: t('filters.user'),
      render: (r: PaymentListItem) =>
        r.user ? (
          <Link component={RouterLink} to={`/admin/users/${r.user.id}`} color="primary" underline="hover">
            {r.user.fullName}
          </Link>
        ) : (
          '—'
        ),
    },
    {
      key: 'amount',
      header: t('payments.colAmount'),
      render: (r: PaymentListItem) => formatCurrency(Number(r.amount), r.currency),
    },
    { key: 'currency', header: t('payments.colCurrency'), render: (r: PaymentListItem) => r.currency },
    {
      key: 'method',
      header: t('payments.colMethod'),
      render: (r: PaymentListItem) =>
        r.method ? <PaymentMethodBadge method={r.method} /> : '—',
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (r: PaymentListItem) => <Badge label={t(`paymentStatus.${r.status}`, r.status)} />,
    },
    {
      key: 'paidAt',
      header: t('payments.colPaidAt'),
      render: (r: PaymentListItem) => formatDateTime(r.paidAt ?? r.createdAt),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (r: PaymentListItem) =>
        r.status === 'COMPLETED' ? (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              setRefundId(r.id);
              setRefundAmount(String(r.amount));
            }}
          >
            {t('payments.refund')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('finance.paymentsTitle')}
        actions={<ExportCsvButton onClick={handleExport} disabled={!filtered.length} />}
      />

      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        <StatCard title={t('payments.statsTotal')} value={formatCurrency(stats?.totalRevenue ?? 0)} icon={DollarSign} />
        <StatCard title={t('payments.statsMonth')} value={formatCurrency(stats?.monthRevenue ?? 0)} icon={Calendar} />
        <StatCard title={t('payments.statsAvg')} value={formatCurrency(stats?.avgPerUser ?? 0)} icon={User} />
        <StatCard title={t('payments.statsRefunds')} value={String(stats?.refundsCount ?? 0)} icon={RotateCcw} />
      </Box>

      <FilterPanel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <Select
            label={t('common.status')}
            value={filters.status}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: '', label: t('filters.all') },
              ...(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'] as const).map((s) => ({
                value: s,
                label: t(`paymentStatus.${s}`, s),
              })),
            ]}
            className="min-w-[140px]"
          />
          <Select
            label={t('payments.colMethod')}
            value={filters.method}
            onChange={(v) => setFilter('method', v)}
            options={[
              { value: '', label: t('filters.all') },
              ...(['CREDIT_CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'BANK_TRANSFER', 'OTHER'] as const).map((m) => ({
                value: m,
                label: t(`paymentMethod.${m}`, m),
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
          <TextField
            size="small"
            sx={{ minWidth: 180, flex: 1 }}
            label={t('filters.userSearch')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('filters.userSearch')}
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
        footer={
          <TableRow sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>
            <TableCell colSpan={2}>{t('payments.pageTotal')}</TableCell>
            <TableCell colSpan={5}>{formatCurrency(pageTotal, currency)}</TableCell>
          </TableRow>
        }
      />
      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!refundId}
        title={t('payments.refundTitle')}
        message={t('payments.refundMessage', { amount: formatCurrency(Number(refundAmount), currency) })}
        destructive
        onCancel={() => setRefundId(null)}
        onConfirm={() => refundId && refundMut.mutate(refundId)}
      />
    </Box>
  );
}

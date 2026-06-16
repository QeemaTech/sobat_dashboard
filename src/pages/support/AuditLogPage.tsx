import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
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
import { useTheme } from '@mui/material/styles';
import { Activity, AlertTriangle, Calendar, Download, Trash2 } from 'lucide-react';
import { AuditActionBadge } from '@/components/audit/AuditActionBadge';
import { AuditDetailDrawer } from '@/components/audit/AuditDetailDrawer';
import { AuditModuleCell } from '@/components/audit/AuditModuleCell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { auditService } from '@/services/audit.service';
import { supervisorsService } from '@/services/supervisors.service';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDateTime, formatNumber, formatRelativeTime } from '@/utils/formatters';
import {
  adminTableAlign,
  adminTableClass,
  adminTableHeadCellSx,
  adminTableShellSx,
  adminTableSx,
  adminTableWrapperClass,
} from '@/utils/tableStyles';
import {
  adminPrimaryRole,
  buildSuspiciousMap,
  entityLabel,
  parseIpLocation,
  type SuspiciousFlag,
} from '@/utils/auditUtils';
import type { AuditAction, AuditLogEntry } from '@/types';

const DEFAULTS = { adminId: '', module: '', action: '', dateFrom: '', dateTo: '', search: '', limit: '25' };

const MODULES = ['users', 'subscriptions', 'payments', 'content', 'settings', 'support', 'sleep', 'roles', 'admins', 'plans', 'notifications'];
const ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'OTHER'];
const PAGE_SIZES = [25, 50, 100] as const;

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 0 ? 88 : 72} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export function AuditLogPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { filters, setFilter, resetFilters, page, setPage } = useUrlFilters(DEFAULTS);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [drawerEntry, setDrawerEntry] = useState<AuditLogEntry | null>(null);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const limit = parseInt(filters.limit || '25', 10) || 25;

  const filterParams = useMemo(
    () => ({
      ...(filters.adminId ? { adminId: filters.adminId } : {}),
      ...(filters.module ? { module: filters.module } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [filters, debouncedSearch]
  );

  const queryParams = useMemo(
    () => ({ page, limit, sortOrder: 'desc', ...filterParams }),
    [page, limit, filterParams]
  );

  const { data: supervisors } = useQuery({
    queryKey: ['supervisors-audit'],
    queryFn: () => supervisorsService.list({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', queryParams],
    queryFn: () => auditService.list(queryParams),
  });

  const { data: stats } = useQuery({
    queryKey: ['audit-log-stats', filterParams],
    queryFn: () => auditService.stats(filterParams),
  });

  const rows = data?.data ?? [];
  const suspicious = useMemo(() => buildSuspiciousMap(rows), [rows]);

  const meta = data?.meta;
  const from = meta ? (page - 1) * limit + 1 : 0;
  const to = meta ? Math.min(page * limit, meta.total) : 0;

  async function handleExport(filteredOnly: boolean) {
    setExportAnchor(null);
    await auditService.exportCsv(filteredOnly ? (filterParams as Record<string, string>) : {});
  }

  function rowHighlight(flag: SuspiciousFlag | undefined) {
    if (flag === 'delete_burst') return 'rgba(239,68,68,0.06)';
    if (flag === 'new_ip_login') return 'rgba(234,179,8,0.08)';
    return 'transparent';
  }

  return (
    <Box>
      <PageHeader
        title={t('support.auditTitle')}
        description={t('audit.subtitle')}
        actions={
          <>
            <Button variant="outlined" startIcon={<DownloadIcon />} endIcon={<ArrowDropDownIcon />} onClick={(e) => setExportAnchor(e.currentTarget)}>
              {t('audit.export')}
            </Button>
            <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)}>
              <MenuItem onClick={() => handleExport(false)}>
                <Download size={16} style={{ marginInlineEnd: 8 }} />
                {t('audit.exportAll')}
              </MenuItem>
              <MenuItem onClick={() => handleExport(true)}>
                <Download size={16} style={{ marginInlineEnd: 8 }} />
                {t('audit.exportFiltered')}
              </MenuItem>
            </Menu>
          </>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        <StatCard title={t('audit.statsTotal')} value={formatNumber(stats?.total ?? 0)} icon={Activity} />
        <StatCard title={t('audit.statsToday')} value={formatNumber(stats?.today ?? 0)} icon={Calendar} />
        <StatCard title={t('audit.statsDeletes')} value={formatNumber(stats?.deletes ?? 0)} icon={Trash2} />
        <StatCard title={t('audit.statsExports')} value={formatNumber(stats?.exports ?? 0)} icon={AlertTriangle} />
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, p: 2, mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={t('audit.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setFilter('search', e.target.value);
          }}
          sx={{ mb: 1.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
            gap: 1.5,
            alignItems: 'flex-end',
          }}
        >
          <Box sx={{ flex: { lg: '1 1 160px' }, minWidth: 140 }}>
            <Select
              label={t('audit.filterAdmin')}
              value={filters.adminId}
              onChange={(v) => setFilter('adminId', v)}
              options={[
                { value: '', label: t('filters.all') },
                ...(supervisors?.data ?? []).map((a) => ({ value: a.id, label: a.fullName })),
              ]}
            />
          </Box>
          <Box sx={{ flex: { lg: '1 1 140px' }, minWidth: 130 }}>
            <Select
              label={t('audit.colModule')}
              value={filters.module}
              onChange={(v) => setFilter('module', v)}
              options={[{ value: '', label: t('filters.all') }, ...MODULES.map((m) => ({ value: m, label: t(`audit.modules.${m}`, m) }))]}
            />
          </Box>
          <Box sx={{ flex: { lg: '1 1 130px' }, minWidth: 120 }}>
            <Select
              label={t('audit.colAction')}
              value={filters.action}
              onChange={(v) => setFilter('action', v)}
              options={[
                { value: '', label: t('filters.all') },
                ...ACTIONS.map((a) => ({ value: a, label: t(`auditAction.${a}`, a) })),
              ]}
            />
          </Box>
          <Box sx={{ flex: { lg: '2 1 240px' }, display: 'flex', gap: 1, alignItems: 'flex-end', minWidth: 200 }}>
            <TextField
              size="small"
              type="date"
              label={t('filters.dateFrom')}
              value={filters.dateFrom}
              onChange={(e) => setFilter('dateFrom', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="text.disabled" sx={{ pb: 1 }}>
              →
            </Typography>
            <TextField
              size="small"
              type="date"
              label={t('filters.dateTo')}
              value={filters.dateTo}
              onChange={(e) => setFilter('dateTo', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
          </Box>
          <Button variant="text" size="small" onClick={() => { resetFilters(); setSearchInput(''); }} sx={{ flexShrink: 0, mb: 0.25 }}>
            {t('filters.reset')}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} className={adminTableWrapperClass} sx={adminTableShellSx}>
        <Table size="small" className={adminTableClass} dir={theme.direction} sx={adminTableSx}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.start, width: '14%' }}>{t('audit.colDate')}</TableCell>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.start, width: '18%' }}>{t('audit.colAdmin')}</TableCell>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center, width: '12%' }} className="cell-center">{t('audit.colAction')}</TableCell>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center, width: '12%' }} className="cell-center">{t('audit.colModule')}</TableCell>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.start, width: '18%' }}>{t('audit.colEntity')}</TableCell>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.start, width: '14%' }}>{t('audit.colIp')}</TableCell>
              <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center, width: '12%' }} className="cell-actions">{t('audit.colDetails')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState message={t('audit.empty')} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
                    <Button size="small" onClick={() => { resetFilters(); setSearchInput(''); }}>
                      {t('filters.reset')}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const ipMeta = parseIpLocation(row.ipAddress);
                const flag = suspicious[row.id];
                const role = adminPrimaryRole(row.admin);

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      bgcolor: rowHighlight(flag),
                      '&:hover': { bgcolor: flag ? rowHighlight(flag) : 'action.hover' },
                    }}
                  >
                    <TableCell sx={adminTableAlign.start}>
                      <Tooltip title={formatDateTime(row.createdAt)} arrow>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatRelativeTime(row.createdAt)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={adminTableAlign.start}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.admin && <UserAvatar name={row.admin.fullName} size="sm" />}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {row.admin?.fullName ?? '—'}
                          </Typography>
                          {role && (
                            <Typography variant="caption" color="text.secondary">
                              {role}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell className="cell-center" sx={adminTableAlign.center}>
                      <AuditActionBadge action={row.action} module={row.module} />
                    </TableCell>
                    <TableCell className="cell-center" sx={adminTableAlign.center}>
                      <AuditModuleCell module={row.module} />
                    </TableCell>
                    <TableCell sx={adminTableAlign.start}>
                      {row.entityId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {entityLabel(row.entityType, row.entityId)}
                          </Typography>
                          <Tooltip title={copiedId === row.id ? t('audit.copied') : t('audit.copyId')}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                copyText(row.entityId!);
                                setCopiedId(row.id);
                                window.setTimeout(() => setCopiedId(null), 1500);
                              }}
                            >
                              <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell sx={adminTableAlign.start}>
                      <Tooltip title={ipMeta.tooltip} arrow>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {ipMeta.flag} {row.ipAddress ?? '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="cell-actions" sx={adminTableAlign.center}>
                      <Button size="small" variant="text" onClick={() => setDrawerEntry(row)}>
                        {t('audit.viewDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {meta ? t('audit.showing', { from, to, total: formatNumber(meta.total) }) : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Select
            label={t('audit.perPage')}
            value={String(limit)}
            onChange={(v) => setFilter('limit', v)}
            options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t('audit.prev')}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {meta ? t('pagination.page', { page, total: meta.totalPages }) : ''}
            </Typography>
            <Button size="small" variant="outlined" disabled={!meta || page >= meta.totalPages} onClick={() => setPage(page + 1)}>
              {t('audit.next')}
            </Button>
          </Box>
        </Box>
      </Box>

      <AuditDetailDrawer entry={drawerEntry} onClose={() => setDrawerEntry(null)} />
    </Box>
  );
}

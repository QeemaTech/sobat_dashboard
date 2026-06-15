import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select as MuiSelect,
  Skeleton,
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
import { useTheme } from '@mui/material/styles';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabBar } from '@/components/ui/TabBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { ContentOrderCell } from '@/components/content/ContentOrderCell';
import { ContentPreviewModal } from '@/components/content/ContentPreviewModal';
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { PageEditor } from '@/components/content/PageEditor';
import { contentService } from '@/services/content.service';
import type { ContentPageItem, ContentStatus, SleepTipItem } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const STATUS_FILTERS = ['', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const;

function pagePayload(p: ContentPageItem, sortOrder?: number) {
  return {
    slug: p.slug,
    titleAr: p.titleAr,
    titleEn: p.titleEn ?? '',
    contentAr: p.contentAr,
    contentEn: p.contentEn ?? '',
    status: p.status,
    sortOrder: sortOrder ?? p.sortOrder,
  };
}

function tipPayload(t: SleepTipItem, sortOrder?: number) {
  return {
    titleAr: t.titleAr,
    titleEn: t.titleEn ?? '',
    contentAr: t.contentAr,
    contentEn: t.contentEn ?? '',
    category: t.category ?? '',
    imageUrl: t.imageUrl ?? '',
    status: t.status,
    sortOrder: sortOrder ?? t.sortOrder,
  };
}

function matchesSearch(titleAr: string, titleEn: string | null | undefined, q: string) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  return titleAr.toLowerCase().includes(needle) || (titleEn?.toLowerCase().includes(needle) ?? false);
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 0 ? 140 : 72} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function ContentPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const qc = useQueryClient();
  const [tab, setTab] = useState('pages');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pageModal, setPageModal] = useState<ContentPageItem | null>(null);
  const [tipModal, setTipModal] = useState<SleepTipItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: 'page' | 'tip';
    id: string;
    slug?: string;
    title: string;
  } | null>(null);
  const [preview, setPreview] = useState<
    (ContentPageItem & { kind: 'page' }) | (SleepTipItem & { kind: 'tip' }) | null
  >(null);

  const [tipForm, setTipForm] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    category: '',
    imageUrl: '',
    status: 'DRAFT' as ContentStatus,
    sortOrder: '0',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => contentService.list(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['content'] });

  const saveTipMut = useMutation({
    mutationFn: () =>
      tipModal?.id
        ? contentService.updateTip(tipModal.id, { ...tipForm, sortOrder: Number(tipForm.sortOrder) })
        : contentService.createTip({ ...tipForm, sortOrder: Number(tipForm.sortOrder) }),
    onSuccess: () => {
      invalidate();
      setTipModal(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (target: NonNullable<typeof deleteTarget>) =>
      target.kind === 'page'
        ? contentService.deletePage(target.slug ?? target.id)
        : contentService.deleteTip(target.id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const reorderPageMut = useMutation({
    mutationFn: async ({ a, b }: { a: ContentPageItem; b: ContentPageItem }) => {
      await Promise.all([
        contentService.updatePage(a.id, pagePayload(a, b.sortOrder)),
        contentService.updatePage(b.id, pagePayload(b, a.sortOrder)),
      ]);
    },
    onSuccess: invalidate,
  });

  const reorderTipMut = useMutation({
    mutationFn: async ({ a, b }: { a: SleepTipItem; b: SleepTipItem }) => {
      await Promise.all([
        contentService.updateTip(a.id, tipPayload(a, b.sortOrder)),
        contentService.updateTip(b.id, tipPayload(b, a.sortOrder)),
      ]);
    },
    onSuccess: invalidate,
  });

  const pages = useMemo(() => {
    let rows = [...(data?.pages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
    if (search.trim()) rows = rows.filter((r) => matchesSearch(r.titleAr, r.titleEn, search));
    return rows;
  }, [data?.pages, statusFilter, search]);

  const tips = useMemo(() => {
    let rows = [...(data?.tips ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
    if (search.trim()) rows = rows.filter((r) => matchesSearch(r.titleAr, r.titleEn, search));
    return rows;
  }, [data?.tips, statusFilter, search]);

  function openPageEdit(page?: ContentPageItem) {
    setPageModal(page ?? ({} as ContentPageItem));
  }

  function openTipEdit(tip?: SleepTipItem) {
    if (tip) {
      setTipForm({
        titleAr: tip.titleAr,
        titleEn: tip.titleEn ?? '',
        contentAr: tip.contentAr,
        contentEn: tip.contentEn ?? '',
        category: tip.category ?? '',
        imageUrl: tip.imageUrl ?? '',
        status: tip.status,
        sortOrder: String(tip.sortOrder),
      });
      setTipModal(tip);
    } else {
      setTipForm({
        titleAr: '',
        titleEn: '',
        contentAr: '',
        contentEn: '',
        category: '',
        imageUrl: '',
        status: 'DRAFT',
        sortOrder: '0',
      });
      setTipModal({} as SleepTipItem);
    }
  }

  function movePage(id: string, direction: 'up' | 'down') {
    const idx = pages.findIndex((p) => p.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= pages.length) return;
    reorderPageMut.mutate({ a: pages[idx], b: pages[targetIdx] });
  }

  function moveTip(id: string, direction: 'up' | 'down') {
    const idx = tips.findIndex((p) => p.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= tips.length) return;
    reorderTipMut.mutate({ a: tips[idx], b: tips[targetIdx] });
  }

  const reordering = reorderPageMut.isPending || reorderTipMut.isPending;
  const pageColCount = 6;
  const tipColCount = 6;
  const colorMode = theme.palette.mode;

  if (pageModal !== null) {
    return (
      <PageEditor
        page={pageModal.id ? pageModal : null}
        onClose={() => setPageModal(null)}
        onSaved={invalidate}
      />
    );
  }

  return (
    <Box data-color-mode={colorMode}>
      <PageHeader
        title={t('content.title')}
        description={t('content.pageSubtitle')}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => (tab === 'pages' ? openPageEdit() : openTipEdit())}
          >
            {tab === 'pages' ? t('content.addPage') : t('content.addTip')}
          </Button>
        }
      />

      <TabBar
        tabs={[
          { id: 'pages', label: t('content.tabPages') },
          { id: 'tips', label: t('content.tabTips') },
        ]}
        active={tab}
        onChange={(id) => {
          setTab(id);
          setStatusFilter('');
          setSearch('');
        }}
      />

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              {t('common.status')}:
            </Typography>
            {STATUS_FILTERS.map((status) => (
              <Chip
                key={status || 'all'}
                label={status ? t(`contentStatus.${status}`) : t('content.filterAll')}
                clickable
                size="small"
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
                onClick={() => setStatusFilter(status)}
              />
            ))}
            <Chip
              size="small"
              variant="outlined"
              color="primary"
              label={
                tab === 'pages'
                  ? t('content.rowCountPages', { count: pages.length })
                  : t('content.rowCountTips', { count: tips.length })
              }
              sx={{ ml: 'auto' }}
            />
          </Box>

          <TextField
            size="small"
            placeholder={t('content.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />,
              },
            }}
            sx={{ maxWidth: 360 }}
          />
        </Stack>
      </Paper>

      {tab === 'pages' ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}
        >
          <Table size="small" sx={{ minWidth: 760, tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                {[
                  { label: t('content.colTitleAr'), width: '30%' },
                  { label: t('content.colType'), width: '12%' },
                  { label: t('common.status'), width: '12%' },
                  { label: t('content.colOrder'), width: '14%' },
                  { label: t('content.colUpdated'), width: '16%' },
                  { label: t('common.actions'), width: '16%' },
                ].map((col) => (
                  <TableCell
                    key={col.label}
                    sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5, width: col.width, whiteSpace: 'nowrap' }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton cols={pageColCount} />
              ) : !pages.length ? (
                <TableRow>
                  <TableCell colSpan={pageColCount} sx={{ border: 0 }}>
                    <EmptyState message={t('content.emptyPages')} />
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((row, idx) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} dir="auto" noWrap title={row.titleAr}>
                        {row.titleAr}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ContentTypeBadge type={row.type} />
                    </TableCell>
                    <TableCell>
                      <ContentStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <ContentOrderCell
                        sortOrder={row.sortOrder}
                        canMoveUp={idx > 0}
                        canMoveDown={idx < pages.length - 1}
                        onMoveUp={() => movePage(row.id, 'up')}
                        onMoveDown={() => movePage(row.id, 'down')}
                        disabled={reordering}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title={formatDateTime(row.updatedAt)}>
                        <Typography variant="body2">{formatRelativeTime(row.updatedAt)}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={t('common.edit')}>
                          <IconButton size="small" color="primary" onClick={() => openPageEdit(row)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('content.preview')}>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setPreview({ ...row, kind: 'page' })}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteTarget({ kind: 'page', id: row.id, slug: row.slug, title: row.titleAr })
                            }
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}
        >
          <Table size="small" sx={{ minWidth: 760, tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                {[
                  { label: t('content.colTitleAr'), width: '28%' },
                  { label: t('content.colCategory'), width: '14%' },
                  { label: t('common.status'), width: '12%' },
                  { label: t('content.colOrder'), width: '14%' },
                  { label: t('content.colUpdated'), width: '16%' },
                  { label: t('common.actions'), width: '16%' },
                ].map((col) => (
                  <TableCell
                    key={col.label}
                    sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5, width: col.width, whiteSpace: 'nowrap' }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton cols={tipColCount} />
              ) : !tips.length ? (
                <TableRow>
                  <TableCell colSpan={tipColCount} sx={{ border: 0 }}>
                    <EmptyState message={t('content.emptyTips')} />
                  </TableCell>
                </TableRow>
              ) : (
                tips.map((row, idx) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
                        <ContentTypeBadge type="TIP" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }} dir="auto" noWrap title={row.titleAr}>
                          {row.titleAr}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" dir="auto" noWrap>
                        {row.category ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ContentStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <ContentOrderCell
                        sortOrder={row.sortOrder}
                        canMoveUp={idx > 0}
                        canMoveDown={idx < tips.length - 1}
                        onMoveUp={() => moveTip(row.id, 'up')}
                        onMoveDown={() => moveTip(row.id, 'down')}
                        disabled={reordering}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.updatedAt ? (
                        <Tooltip title={formatDateTime(row.updatedAt)}>
                          <Typography variant="body2">{formatRelativeTime(row.updatedAt)}</Typography>
                        </Tooltip>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={t('common.edit')}>
                          <IconButton size="small" color="primary" onClick={() => openTipEdit(row)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('content.preview')}>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setPreview({ ...row, kind: 'tip' })}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteTarget({ kind: 'tip', id: row.id, title: row.titleAr })
                            }
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ContentPreviewModal item={preview} onClose={() => setPreview(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('content.deleteTitle')}
        message={
          deleteTarget?.kind === 'page'
            ? t('content.deletePageMessage', { title: deleteTarget.title })
            : t('content.deleteTipMessage', { title: deleteTarget?.title ?? '' })
        }
        destructive
        confirmLoading={deleteMut.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget)}
      />

      <Modal
        open={!!tipModal}
        title={tipModal?.id ? t('content.editTip') : t('content.addTip')}
        onClose={() => setTipModal(null)}
        size="lg"
        footer={
          <Button variant="contained" onClick={() => saveTipMut.mutate()} disabled={saveTipMut.isPending}>
            {t('common.save')}
          </Button>
        }
      >
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            size="small"
            sx={{ gridColumn: { sm: 'span 2' } }}
            label={t('content.titleAr')}
            value={tipForm.titleAr}
            onChange={(e) => setTipForm({ ...tipForm, titleAr: e.target.value })}
          />
          <TextField
            size="small"
            sx={{ gridColumn: { sm: 'span 2' } }}
            label={t('content.titleEn')}
            value={tipForm.titleEn}
            onChange={(e) => setTipForm({ ...tipForm, titleEn: e.target.value })}
          />
          <TextField
            size="small"
            sx={{ gridColumn: { sm: 'span 2' } }}
            multiline
            rows={3}
            label={t('content.contentAr')}
            value={tipForm.contentAr}
            onChange={(e) => setTipForm({ ...tipForm, contentAr: e.target.value })}
          />
          <TextField
            size="small"
            sx={{ gridColumn: { sm: 'span 2' } }}
            multiline
            rows={3}
            label={t('content.contentEn')}
            value={tipForm.contentEn}
            onChange={(e) => setTipForm({ ...tipForm, contentEn: e.target.value })}
          />
          <TextField
            size="small"
            label={t('content.colCategory')}
            value={tipForm.category}
            onChange={(e) => setTipForm({ ...tipForm, category: e.target.value })}
          />
          <TextField
            size="small"
            label={t('content.imageUrl')}
            value={tipForm.imageUrl}
            onChange={(e) => setTipForm({ ...tipForm, imageUrl: e.target.value })}
          />
          <FormControl size="small" fullWidth sx={{ gridColumn: { sm: 'span 2' } }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <MuiSelect
              label={t('common.status')}
              value={tipForm.status}
              onChange={(e) => setTipForm({ ...tipForm, status: e.target.value as ContentStatus })}
            >
              {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
                <MenuItem key={s} value={s}>
                  {t(`contentStatus.${s}`, s)}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        </Box>
      </Modal>
    </Box>
  );
}

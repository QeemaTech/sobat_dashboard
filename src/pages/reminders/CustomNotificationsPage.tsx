import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import {
  notificationTemplatesService,
  type NotificationTemplate,
  type NotificationTemplateCategory,
  type NotificationTriggerType,
} from '@/services/notificationTemplates.service';
import { useLanguage } from '@/hooks/useLanguage';

const CATEGORIES: NotificationTemplateCategory[] = ['SLEEP', 'WORSHIP', 'HEALTH', 'CUSTOM'];
const TRIGGER_TYPES: NotificationTriggerType[] = [
  'FIXED_TIME',
  'RELATIVE_TO_SLEEP',
  'RELATIVE_TO_WAKE',
  'RELATIVE_TO_FAJR',
];

const CATEGORY_COLORS: Record<NotificationTemplateCategory, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  SLEEP: 'primary',
  WORSHIP: 'success',
  HEALTH: 'warning',
  CUSTOM: 'default',
};

const emptyForm = () => ({
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  descriptionEn: '',
  category: 'HEALTH' as NotificationTemplateCategory,
  triggerType: 'RELATIVE_TO_SLEEP' as NotificationTriggerType,
  offsetMinutes: '-300',
  fixedTime: '18:30',
  isActive: true,
});

function formatDurationParts(hours: number, mins: number, lang: 'ar' | 'en', t: (key: string, opts?: Record<string, unknown>) => string) {
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(t(`customNotifications.duration.hours_${lang === 'ar' ? arabicCountKey(hours) : hours === 1 ? 'one' : 'other'}`, { count: hours }));
  }
  if (mins > 0) {
    parts.push(t(`customNotifications.duration.minutes_${lang === 'ar' ? arabicCountKey(mins) : mins === 1 ? 'one' : 'other'}`, { count: mins }));
  }

  return parts.join(lang === 'ar' ? ' و ' : ` ${t('customNotifications.duration.and')} `);
}

function arabicCountKey(n: number): 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' {
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (n >= 3 && n <= 10) return 'few';
  if (n >= 11 && n <= 99) return 'many';
  return 'other';
}

function formatOffsetLabel(
  triggerType: NotificationTriggerType,
  offsetMinutes: number,
  lang: 'ar' | 'en',
  t: (key: string, opts?: Record<string, unknown>) => string
) {
  if (triggerType === 'FIXED_TIME') return '—';

  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  const duration = formatDurationParts(hours, mins, lang, t);

  const direction = offsetMinutes < 0 ? 'before' : offsetMinutes > 0 ? 'after' : 'at';
  return t(`customNotifications.offset.${triggerType}.${direction}`, { duration });
}

function templateTitle(row: NotificationTemplate, lang: 'ar' | 'en') {
  return lang === 'ar' ? row.titleAr : row.titleEn;
}

export function CustomNotificationsPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const params = useMemo(() => ({ page, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' as const }), [page]);

  const { data, isLoading } = useQuery({
    queryKey: ['notification-templates', params],
    queryFn: () => notificationTemplatesService.list(params),
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const body = {
        titleAr: form.titleAr,
        titleEn: form.titleEn,
        descriptionAr: form.descriptionAr || null,
        descriptionEn: form.descriptionEn || null,
        category: form.category,
        triggerType: form.triggerType,
        offsetMinutes: form.triggerType === 'FIXED_TIME' ? 0 : Number(form.offsetMinutes),
        fixedTime: form.triggerType === 'FIXED_TIME' ? form.fixedTime : null,
        isActive: form.isActive,
      };
      return editId
        ? notificationTemplatesService.update(editId, body)
        : notificationTemplatesService.create(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm());
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      notificationTemplatesService.toggle(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-templates'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => notificationTemplatesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
      setDeleteId(null);
    },
  });

  function openCreate() {
    setEditId(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(template: NotificationTemplate) {
    setEditId(template.id);
    setForm({
      titleAr: template.titleAr,
      titleEn: template.titleEn,
      descriptionAr: template.descriptionAr ?? '',
      descriptionEn: template.descriptionEn ?? '',
      category: template.category,
      triggerType: template.triggerType,
      offsetMinutes: String(template.offsetMinutes),
      fixedTime: template.fixedTime ?? '18:30',
      isActive: template.isActive,
    });
    setOpen(true);
  }

  const locale = lang as 'ar' | 'en';

  const columns = [
    {
      key: 'title',
      header: t('customNotifications.colTitle'),
      minWidth: 200,
      render: (row: NotificationTemplate) => (
        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'start' }}>
          {templateTitle(row, locale)}
        </Typography>
      ),
    },
    {
      key: 'category',
      header: t('customNotifications.colCategory'),
      minWidth: 96,
      width: 96,
      align: 'start' as const,
      render: (row: NotificationTemplate) => (
        <Badge label={t(`customNotifications.categories.${row.category}`)} color={CATEGORY_COLORS[row.category]} />
      ),
    },
    {
      key: 'trigger',
      header: t('customNotifications.colTrigger'),
      minWidth: 88,
      width: 96,
      render: (row: NotificationTemplate) => (
        <Typography variant="body2" sx={{ textAlign: 'start' }}>
          {row.triggerType === 'FIXED_TIME'
            ? t('customNotifications.triggerFixed')
            : t('customNotifications.triggerRelative')}
        </Typography>
      ),
    },
    {
      key: 'offset',
      header: t('customNotifications.colOffset'),
      minWidth: 168,
      render: (row: NotificationTemplate) => (
        <Typography variant="body2" sx={{ lineHeight: 1.6, textAlign: 'start' }}>
          {row.triggerType === 'FIXED_TIME'
            ? row.fixedTime
            : formatOffsetLabel(row.triggerType, row.offsetMinutes, locale, t)}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      minWidth: 88,
      width: 88,
      align: 'center' as const,
      render: (row: NotificationTemplate) => (
        <Checkbox
          size="small"
          checked={row.isActive}
          onChange={(e) => toggleMut.mutate({ id: row.id, isActive: e.target.checked })}
          slotProps={{ input: { 'aria-label': row.isActive ? t('customNotifications.active') : t('customNotifications.inactive') } }}
        />
      ),
    },
    {
      key: 'enabledCount',
      header: t('customNotifications.colEnabledUsers'),
      minWidth: 112,
      width: 112,
      align: 'center' as const,
      render: (row: NotificationTemplate) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {row.enabledUsersCount ?? 0}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      minWidth: 88,
      width: 88,
      align: 'center' as const,
      render: (row: NotificationTemplate) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
          <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
            <Pencil size={16} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
            <Trash2 size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const showOffset = form.triggerType !== 'FIXED_TIME';
  const showFixedTime = form.triggerType === 'FIXED_TIME';

  return (
    <Box>
      <PageHeader
        title={t('customNotifications.pageTitle')}
        description={t('customNotifications.pageSubtitle')}
        actions={
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}>
            {t('customNotifications.add')}
          </Button>
        }
      />

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(row) => row.id} />
      {data?.meta && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}

      <Modal
        open={open}
        title={editId ? t('customNotifications.edit') : t('customNotifications.add')}
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <Button variant="contained" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {t('common.save')}
          </Button>
        }
      >
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            required
            size="small"
            label={t('customNotifications.titleAr')}
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
          />
          <TextField
            required
            size="small"
            label={t('customNotifications.titleEn')}
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
          />
          <TextField
            size="small"
            sx={{ gridColumn: { sm: 'span 2' } }}
            multiline
            rows={2}
            label={t('customNotifications.descriptionAr')}
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          />
          <TextField
            size="small"
            sx={{ gridColumn: { sm: 'span 2' } }}
            multiline
            rows={2}
            label={t('customNotifications.descriptionEn')}
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>{t('customNotifications.category')}</InputLabel>
            <MuiSelect
              label={t('customNotifications.category')}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as NotificationTemplateCategory })}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {t(`customNotifications.categories.${c}`)}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('customNotifications.triggerType')}</InputLabel>
            <MuiSelect
              label={t('customNotifications.triggerType')}
              value={form.triggerType}
              onChange={(e) => setForm({ ...form, triggerType: e.target.value as NotificationTriggerType })}
            >
              {TRIGGER_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`customNotifications.triggerTypes.${type}`)}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          {showOffset && (
            <TextField
              size="small"
              type="number"
              sx={{ gridColumn: { sm: 'span 2' } }}
              label={t(`customNotifications.offsetLabel.${form.triggerType}`)}
              helperText={t('customNotifications.offsetHint')}
              value={form.offsetMinutes}
              onChange={(e) => setForm({ ...form, offsetMinutes: e.target.value })}
            />
          )}
          {showFixedTime && (
            <TextField
              size="small"
              type="time"
              sx={{ gridColumn: { sm: 'span 2' } }}
              label={t('customNotifications.fixedTime')}
              value={form.fixedTime}
              onChange={(e) => setForm({ ...form, fixedTime: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
          <FormControlLabel
            sx={{ gridColumn: { sm: 'span 2' } }}
            control={
              <Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            }
            label={<Typography variant="body2">{t('customNotifications.active')}</Typography>}
          />
        </Box>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={t('customNotifications.deleteTitle')}
        message={t('customNotifications.deleteMessage')}
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </Box>
  );
}
